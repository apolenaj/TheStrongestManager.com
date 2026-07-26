/**
 * Private messaging attachment storage (Prompt 132).
 * Never served as public static files — auth-gated download only.
 */

import { createWriteStream } from "node:fs";
import { mkdir, unlink, stat, readFile } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { randomBytes } from "node:crypto";

function storageRoot(): string {
  return (
    process.env.MESSAGING_STORAGE_DIR ??
    path.join(process.cwd(), "storage", "messaging")
  );
}

export function buildMessageStorageKey(input: {
  athleteProfileId: string;
  threadId: string;
  messageId: string;
  extension: string;
}): string {
  const safeExt = input.extension.replace(/[^a-z0-9.]/gi, "") || "bin";
  const nonce = randomBytes(8).toString("hex");
  return path.posix.join(
    input.athleteProfileId,
    input.threadId,
    `${input.messageId}-${nonce}.${safeExt}`,
  );
}

export function absolutePathForMessageKey(storageKey: string): string {
  const root = path.resolve(storageRoot());
  const absolute = path.resolve(root, storageKey);
  if (!absolute.startsWith(root + path.sep) && absolute !== root) {
    throw new Error("Invalid storage key.");
  }
  return absolute;
}

export async function saveMessageAttachment(
  storageKey: string,
  data: Buffer | Readable,
): Promise<{ bytesWritten: number }> {
  const absolute = absolutePathForMessageKey(storageKey);
  await mkdir(path.dirname(absolute), { recursive: true });

  if (Buffer.isBuffer(data)) {
    const { writeFile } = await import("node:fs/promises");
    await writeFile(absolute, data);
    return { bytesWritten: data.byteLength };
  }

  await pipeline(data, createWriteStream(absolute));
  const info = await stat(absolute);
  return { bytesWritten: info.size };
}

export async function readMessageAttachment(
  storageKey: string,
): Promise<{ buffer: Buffer; size: number }> {
  const absolute = absolutePathForMessageKey(storageKey);
  const buffer = await readFile(absolute);
  return { buffer, size: buffer.byteLength };
}

export async function deleteMessageAttachmentFile(
  storageKey: string,
): Promise<void> {
  const absolute = absolutePathForMessageKey(storageKey);
  try {
    await unlink(absolute);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") throw error;
  }
}
