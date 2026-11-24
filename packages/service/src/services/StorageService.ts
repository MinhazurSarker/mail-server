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

  private static getLocalDir(config: StorageConfig): string {
    return path.resolve(config.endpoint || "./storage/blobs");
  }

  static async testConnection(config: StorageConfig): Promise<boolean> {
    if (config.provider === "local_fallback") {
      try {
        const dir = this.getLocalDir(config);
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
      const fullPath = path.join(this.getLocalDir(config), key);
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
      const fullPath = path.join(this.getLocalDir(config), key);
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
      const primaryDir = this.getLocalDir(config);
      const primaryPath = path.join(primaryDir, key);
      try {
        await fs.access(primaryPath);
        return await fs.readFile(primaryPath);
      } catch {
        // Check candidate fallback directories if running across different package cwds
        const candidateBases = [
          path.resolve(process.cwd(), "storage/blobs"),
          path.resolve(process.cwd(), "../storage/blobs"),
          path.resolve(process.cwd(), "../../storage/blobs"),
          path.resolve(process.cwd(), "../server/storage/blobs"),
          path.resolve(process.cwd(), "../../apps/server/storage/blobs"),
          path.resolve(process.cwd(), "../api-server/storage/blobs"),
          path.resolve(process.cwd(), "../../apps/api-server/storage/blobs"),
        ];

        for (const base of candidateBases) {
          const candidatePath = path.join(base, key);
          try {
            await fs.access(candidatePath);
            return await fs.readFile(candidatePath);
          } catch {
            // continue search
          }
        }

        return await fs.readFile(primaryPath);
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
