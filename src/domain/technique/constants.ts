/**
 * Technique video upload limits and catalogs.
 * Named constants with rationale — not buried magic numbers.
 */

/** Allowed video MIME types. */
export const TECHNIQUE_ALLOWED_MIME_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
] as const;

export type TechniqueAllowedMime =
  (typeof TECHNIQUE_ALLOWED_MIME_TYPES)[number];

/** Max upload size: 100 MiB — keeps mobile uploads practical while blocking abuse. */
export const TECHNIQUE_MAX_FILE_BYTES = 100 * 1024 * 1024;

/** Max clip length for technique review. */
export const TECHNIQUE_MAX_DURATION_SECONDS = 90;

/** Minimum duration (reject empty/corrupt near-zero clips). */
export const TECHNIQUE_MIN_DURATION_SECONDS = 1;

/** Minimum resolution width (approx. 480p landscape). */
export const TECHNIQUE_MIN_WIDTH_PX = 640;

/** Minimum resolution height. */
export const TECHNIQUE_MIN_HEIGHT_PX = 360;

/** Signed media URL lifetime. */
export const TECHNIQUE_SIGNED_URL_TTL_SECONDS = 10 * 60;

export const CAMERA_ANGLES = [
  { id: "front", label: "Front" },
  { id: "side", label: "Side" },
  { id: "rear", label: "Rear" },
  { id: "forty_five", label: "45°" },
  { id: "overhead", label: "Overhead" },
  { id: "other", label: "Other" },
] as const;

export type CameraAngleId = (typeof CAMERA_ANGLES)[number]["id"];

export const TECHNIQUE_PRIVACY_COPY =
  "Videos are private by default — not public, not used for marketing. Analysis requires your explicit opt-in. Expert review and anonymous model improvement stay off unless you opt in separately. You can change optional settings or delete an upload anytime. No technique score is invented when a real backend is not configured.";
