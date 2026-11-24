import fs from "node:fs/promises";
import path from "node:path";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { StorageConfig } from "@cellsinbox/schema";

export class StorageService {
  private static createClient(config: StorageConfig): S3Client {
    return new S3Client({
      region: config.region || "auto",
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: config.provider === "minio" || config.provider === "custom_s3",
    });
  }

  public static getStorageRoot(config?: StorageConfig): string {
    // 1. Explicit global environment variable takes highest precedence
    if (process.env.STORAGE_LOCAL_DIR && process.env.STORAGE_LOCAL_DIR.trim().length > 0) {
      return path.resolve(process.env.STORAGE_LOCAL_DIR.trim());
    }
    // 2. Tenant storageConfig endpoint if explicitly configured as an absolute path
    if (config?.endpoint && path.isAbsolute(config.endpoint)) {
      return path.resolve(config.endpoint);
    }
    // 3. Documented fallback storage root (single authoritative directory)
    const fallbackBase = process.env.CELLSINBOX_STORAGE_ROOT || path.resolve(process.cwd(), "storage/blobs");
    return path.resolve(fallbackBase);
  }

  public static resolveSecureLocalPath(config: StorageConfig, key: string): string {
    const root = this.getStorageRoot(config);
    // Disallow absolute paths or keys containing directory traversal segments
    const normalized = path.normalize(key);
    if (
      path.isAbsolute(key) ||
      path.isAbsolute(normalized) ||
      normalized.startsWith("..") ||
      normalized.split(path.sep).includes("..")
    ) {
      throw new Error(`Security Violation: Storage path escape detected for key: ${key}`);
    }

    const targetPath = path.resolve(root, normalized);

    // Enforce strict containment within the configured storage root
    const relative = path.relative(root, targetPath);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      throw new Error(`Security Violation: Storage path escape detected for key: ${key}`);
    }
    return targetPath;
  }

  static async testConnection(config: StorageConfig): Promise<boolean> {
    if (config.provider === "local_fallback") {
      try {
        const dir = this.getStorageRoot(config);
        await fs.mkdir(dir, { recursive: true });
        return true;
      } catch (err) {
        console.error("[StorageService] Local storage test failed:", err);
        return false;
      }
    }

    const client = this.createClient(config);
    try {
      await client.send(new HeadBucketCommand({ Bucket: config.bucket }));
      return true;
    } catch (err) {
      console.error("[StorageService] S3 Connection test failed:", err);
      return false;
    }
  }

  static async uploadRawMime(
    config: StorageConfig,
    key: string,
    body: Buffer | Uint8Array | string,
  ): Promise<string> {
    if (!config.provider || config.provider === "local_fallback") {
      const fullPath = this.resolveSecureLocalPath(config, key);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, body);
      return key;
    }

    const client = this.createClient(config);
    await client.send(
      new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        Body: body,
        ContentType: "message/rfc822",
      }),
    );
    return key;
  }

  static async uploadAttachment(
    config: StorageConfig,
    key: string,
    body: Buffer | Uint8Array,
    contentType: string,
  ): Promise<string> {
    if (!config.provider || config.provider === "local_fallback") {
      const fullPath = this.resolveSecureLocalPath(config, key);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, body);
      return key;
    }

    const client = this.createClient(config);
    await client.send(
      new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
    return key;
  }

  static async getAttachmentSignedUrl(
    config: StorageConfig,
    key: string,
    expiresInSeconds: number = 3600,
  ): Promise<string> {
    if (!config.provider || config.provider === "local_fallback") {
      // In local fallback mode, there is no remote presigned S3/R2 URL.
      // Returning file:// is blocked by browser security sandboxes.
      return "";
    }

    const client = this.createClient(config);
    const command = new GetObjectCommand({
      Bucket: config.bucket,
      Key: key,
    });
    return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
  }

  static async getRawFile(config: StorageConfig, key: string): Promise<Buffer> {
    if (!config.provider || config.provider === "local_fallback") {
      const targetPath = this.resolveSecureLocalPath(config, key);
      try {
        return await fs.readFile(targetPath);
      } catch (err: any) {
        if (err?.code === "ENOENT") {
          // Explicit documented legacy lookup: If LEGACY_STORAGE_DIR is set, check legacy root once
          if (process.env.LEGACY_STORAGE_DIR && process.env.LEGACY_STORAGE_DIR.trim().length > 0) {
            const legacyRoot = path.resolve(process.env.LEGACY_STORAGE_DIR.trim());
            const safeKey = path.normalize(key).replace(/^(\.\.(\/|\\|$))+/, "").replace(/^[/\\]+/, "");
            const legacyPath = path.resolve(legacyRoot, safeKey);
            const relLegacy = path.relative(legacyRoot, legacyPath);
            if (!relLegacy.startsWith("..") && !path.isAbsolute(relLegacy)) {
              try {
                const legacyBuf = await fs.readFile(legacyPath);
                // Migrate to primary root so future reads are direct
                await fs.mkdir(path.dirname(targetPath), { recursive: true });
                await fs.writeFile(targetPath, legacyBuf);
                return legacyBuf;
              } catch {
                // Not found in legacy location either
              }
            }
          }
          throw new Error(`Attachment file not found at storage location: ${key}`);
        }
        throw err;
      }
    }

    const client = this.createClient(config);
    const response = await client.send(
      new GetObjectCommand({
        Bucket: config.bucket,
        Key: key,
      }),
    );
    const stream = response.Body as any;
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
  }
}
