import { createWriteStream } from "node:fs";
import { mkdir, unlink, stat, readFile } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { randomBytes } from "node:crypto";

/**
 * Private technique video storage.
 * Local disk for development; interface ready for object storage later.
 * Objects are never served as static public files.
 */

function storageRoot(): string {
  return (
    process.env.TECHNIQUE_STORAGE_DIR ??
    path.join(process.cwd(), "storage", "technique")
  );
}

export function buildStorageKey(
  athleteProfileId: string,
  analysisId: string,
  extension: string,
): string {
  const safeExt = extension.replace(/[^a-z0-9.]/gi, "") || "bin";
  const nonce = randomBytes(8).toString("hex");
  return path.posix.join(
    athleteProfileId,
    `${analysisId}-${nonce}.${safeExt}`,
  );
}

export function absolutePathForKey(storageKey: string): string {
  const root = path.resolve(storageRoot());
  const absolute = path.resolve(root, storageKey);
  if (!absolute.startsWith(root + path.sep) && absolute !== root) {
    throw new Error("Invalid storage key.");
  }
  return absolute;
}

export async function saveTechniqueVideo(
  storageKey: string,
  data: Buffer | ReadableStream<Uint8Array> | Readable,
): Promise<{ bytesWritten: number }> {
  const absolute = absolutePathForKey(storageKey);
  await mkdir(path.dirname(absolute), { recursive: true });

  if (Buffer.isBuffer(data)) {
    const { writeFile } = await import("node:fs/promises");
    await writeFile(absolute, data);
    return { bytesWritten: data.byteLength };
  }

  const nodeStream =
    data instanceof Readable
      ? data
      : Readable.fromWeb(data as import("stream/web").ReadableStream);
  await pipeline(nodeStream, createWriteStream(absolute));
  const info = await stat(absolute);
  return { bytesWritten: info.size };
}

export async function readTechniqueVideo(
  storageKey: string,
): Promise<{ buffer: Buffer; size: number }> {
  const absolute = absolutePathForKey(storageKey);
  const buffer = await readFile(absolute);
  return { buffer, size: buffer.byteLength };
}

export async function deleteTechniqueVideo(
  storageKey: string,
): Promise<void> {
  const absolute = absolutePathForKey(storageKey);
  try {
    await unlink(absolute);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") throw error;
  }
}

export function extensionForMime(mimeType: string): string {
  switch (mimeType) {
    case "video/webm":
      return "webm";
    case "video/quicktime":
      return "mov";
    case "video/mp4":
    default:
      return "mp4";
  }
}
