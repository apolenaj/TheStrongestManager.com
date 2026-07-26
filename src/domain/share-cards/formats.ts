/**
 * Shareable performance card formats (Prompt 73).
 */

export type ShareCardFormatId =
  | "instagram_story"
  | "instagram_post"
  | "tiktok"
  | "x_linkedin";

export type ShareCardFormat = {
  id: ShareCardFormatId;
  label: string;
  /** Platform hint for the athlete. */
  platform: string;
  width: number;
  height: number;
  /** Optional — shown as secondary in UI. */
  optional?: boolean;
};

export const SHARE_CARD_FORMATS: readonly ShareCardFormat[] = [
  {
    id: "instagram_story",
    label: "Instagram Story",
    platform: "Instagram",
    width: 1080,
    height: 1920,
  },
  {
    id: "instagram_post",
    label: "Instagram Post",
    platform: "Instagram",
    width: 1080,
    height: 1080,
  },
  {
    id: "tiktok",
    label: "TikTok",
    platform: "TikTok",
    width: 1080,
    height: 1920,
  },
  {
    id: "x_linkedin",
    label: "X / LinkedIn",
    platform: "X · LinkedIn",
    width: 1200,
    height: 675,
    optional: true,
  },
] as const;

export function getShareCardFormat(id: ShareCardFormatId): ShareCardFormat {
  const found = SHARE_CARD_FORMATS.find((f) => f.id === id);
  if (!found) return SHARE_CARD_FORMATS[0]!;
  return found;
}

/** Brand lockup on every card. */
export const SHARE_CARD_BRAND = "TheStrongestManager";

/**
 * Metric keys athletes may opt into.
 * Headline + brand are always shown — never “private dumps”.
 */
export type ShareMetricId =
  | "technique_delta"
  | "estimated_1rm_delta"
  | "volume"
  | "pr_types"
  | "date";

export const SHARE_METRIC_OPTIONS: readonly {
  id: ShareMetricId;
  label: string;
  /** True = off unless athlete enables (privacy default). */
  privateByDefault: boolean;
  description: string;
}[] = [
  {
    id: "technique_delta",
    label: "Technique change",
    privateByDefault: true,
    description: "e.g. Technique: 82 → 86",
  },
  {
    id: "estimated_1rm_delta",
    label: "Estimated 1RM change",
    privateByDefault: true,
    description: "e.g. Estimated 1RM: +8 kg — never a verified meet PR",
  },
  {
    id: "volume",
    label: "Set volume",
    privateByDefault: true,
    description: "Load × reps tonnage for this set",
  },
  {
    id: "pr_types",
    label: "PR type tags",
    privateByDefault: true,
    description: "Rep PR, Estimated 1RM, etc.",
  },
  {
    id: "date",
    label: "Date",
    privateByDefault: true,
    description: "When the PR was logged",
  },
] as const;

/** Default selection: nothing private until the athlete opts in. */
export function defaultSelectedMetrics(): ShareMetricId[] {
  return [];
}
