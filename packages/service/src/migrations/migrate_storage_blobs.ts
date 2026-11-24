import fs from "node:fs/promises";
import path from "node:path";

export interface StorageMigrationResult {
  migratedCount: number;
  skippedCount: number;
  errors: Array<{ path: string; error: string }>;
}

/**
 * Explicit migration utility to consolidate legacy blobs from previous
 * deployment directory structures into the single authoritative STORAGE_LOCAL_DIR.
 */
export async function migrateLegacyStorageBlobs(
  legacySourceDir: string,
  targetStorageRoot: string,
): Promise<StorageMigrationResult> {
  const result: StorageMigrationResult = {
    migratedCount: 0,
    skippedCount: 0,
    errors: [],
  };

  const resolvedSource = path.resolve(legacySourceDir);
  const resolvedTarget = path.resolve(targetStorageRoot);

  try {
    await fs.access(resolvedSource);
  } catch {
    // Legacy source directory does not exist, nothing to migrate
    return result;
  }

  async function walkAndCopy(currentDir: string) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walkAndCopy(fullPath);
      } else if (entry.isFile()) {
        const relativePath = path.relative(resolvedSource, fullPath);
        const destinationPath = path.resolve(resolvedTarget, relativePath);

        // Security check: ensure destination strictly resides in resolvedTarget
        const destRel = path.relative(resolvedTarget, destinationPath);
        if (destRel.startsWith("..") || path.isAbsolute(destRel)) {
          result.errors.push({
            path: relativePath,
            error: "Path traversal escape prevented during migration",
          });
          continue;
        }

        try {
          // Check if file already exists at target
          let alreadyExists = false;
          try {
            await fs.access(destinationPath);
            alreadyExists = true;
          } catch {
            alreadyExists = false;
          }

          if (alreadyExists) {
            result.skippedCount++;
            continue;
          }

          await fs.mkdir(path.dirname(destinationPath), { recursive: true });
          await fs.copyFile(fullPath, destinationPath);
          result.migratedCount++;
        } catch (err: any) {
          result.errors.push({
            path: relativePath,
            error: err.message || "Unknown migration error",
          });
        }
      }
    }
  }

  await walkAndCopy(resolvedSource);
  return result;
}
