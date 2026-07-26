import {
  CAMERA_ANGLES,
  TECHNIQUE_ALLOWED_MIME_TYPES,
  TECHNIQUE_MAX_DURATION_SECONDS,
  TECHNIQUE_MAX_FILE_BYTES,
  TECHNIQUE_MIN_DURATION_SECONDS,
  TECHNIQUE_MIN_HEIGHT_PX,
  TECHNIQUE_MIN_WIDTH_PX,
  type CameraAngleId,
  type TechniqueAllowedMime,
} from "@/domain/technique/constants";

export type VideoValidationInput = {
  mimeType: string;
  fileSizeBytes: number;
  durationSeconds: number;
  widthPx: number;
  heightPx: number;
  fileName: string;
};

export type VideoValidationResult =
  | { ok: true; mimeType: TechniqueAllowedMime }
  | { ok: false; error: string };

const EXT_BY_MIME: Record<TechniqueAllowedMime, string[]> = {
  "video/mp4": [".mp4", ".m4v"],
  "video/webm": [".webm"],
  "video/quicktime": [".mov"],
};

export function validateTechniqueVideo(
  input: VideoValidationInput,
): VideoValidationResult {
  const mime = input.mimeType.toLowerCase().trim();
  if (
    !(TECHNIQUE_ALLOWED_MIME_TYPES as readonly string[]).includes(mime)
  ) {
    return {
      ok: false,
      error: `Unsupported file type. Allowed: ${TECHNIQUE_ALLOWED_MIME_TYPES.join(", ")}.`,
    };
  }

  if (input.fileSizeBytes <= 0) {
    return { ok: false, error: "File is empty." };
  }
  if (input.fileSizeBytes > TECHNIQUE_MAX_FILE_BYTES) {
    return {
      ok: false,
      error: `File is too large. Maximum size is ${Math.floor(TECHNIQUE_MAX_FILE_BYTES / (1024 * 1024))} MB.`,
    };
  }

  if (
    !Number.isFinite(input.durationSeconds) ||
    input.durationSeconds < TECHNIQUE_MIN_DURATION_SECONDS
  ) {
    return {
      ok: false,
      error: `Video is too short. Minimum duration is ${TECHNIQUE_MIN_DURATION_SECONDS}s.`,
    };
  }
  if (input.durationSeconds > TECHNIQUE_MAX_DURATION_SECONDS) {
    return {
      ok: false,
      error: `Video is too long. Maximum duration is ${TECHNIQUE_MAX_DURATION_SECONDS}s.`,
    };
  }

  if (
    !Number.isFinite(input.widthPx) ||
    !Number.isFinite(input.heightPx) ||
    input.widthPx < TECHNIQUE_MIN_WIDTH_PX ||
    input.heightPx < TECHNIQUE_MIN_HEIGHT_PX
  ) {
    return {
      ok: false,
      error: `Resolution too low. Minimum ${TECHNIQUE_MIN_WIDTH_PX}×${TECHNIQUE_MIN_HEIGHT_PX}px.`,
    };
  }

  const allowedExt = EXT_BY_MIME[mime as TechniqueAllowedMime];
  const lowerName = input.fileName.toLowerCase();
  if (!allowedExt.some((ext) => lowerName.endsWith(ext))) {
    return {
      ok: false,
      error: `File extension does not match type ${mime}.`,
    };
  }

  return { ok: true, mimeType: mime as TechniqueAllowedMime };
}

export function isCameraAngleId(value: string): value is CameraAngleId {
  return CAMERA_ANGLES.some((angle) => angle.id === value);
}

/** Sniff common video containers from the first bytes (defense in depth). */
export function sniffVideoContainer(
  header: Uint8Array,
): TechniqueAllowedMime | null {
  if (header.length < 12) return null;
  // WebM / EBML
  if (
    header[0] === 0x1a &&
    header[1] === 0x45 &&
    header[2] === 0xdf &&
    header[3] === 0xa3
  ) {
    return "video/webm";
  }
  // ISO BMFF (mp4 / mov) — "ftyp" at byte 4
  if (
    header[4] === 0x66 &&
    header[5] === 0x74 &&
    header[6] === 0x79 &&
    header[7] === 0x70
  ) {
    const brand = String.fromCharCode(
      header[8],
      header[9],
      header[10],
      header[11],
    );
    if (brand.startsWith("qt")) return "video/quicktime";
    return "video/mp4";
  }
  return null;
}
