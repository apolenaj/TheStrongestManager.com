import type { PrEvent, PrType } from "@/domain/pr-intelligence";
import {
  SHARE_CARD_BRAND,
  type ShareCardFormatId,
  type ShareMetricId,
} from "@/domain/share-cards/formats";

export type ShareCardLine = {
  kind: "eyebrow" | "headline" | "stat" | "footnote" | "brand";
  label?: string;
  value: string;
};

export type ShareCardModel = {
  formatId: ShareCardFormatId;
  /** e.g. NEW DEADLIFT PR */
  eyebrow: string;
  /** e.g. 260 KG × 7 */
  headline: string;
  lines: ShareCardLine[];
  brand: string;
  honestyFootnote: string;
  /** Metrics actually included — audit for privacy. */
  includedMetrics: ShareMetricId[];
};

function upperHeadline(headline: string): string {
  return headline.replace(/kg/gi, "KG").toUpperCase();
}

function exerciseEyebrow(event: PrEvent): string {
  const lift = event.exerciseLabel.trim().toUpperCase();
  if (/^NEW\b/i.test(event.title)) {
    return `NEW ${lift} PR`;
  }
  return `${lift} PR`;
}

function techniqueLine(event: PrEvent): ShareCardLine | null {
  const cur = event.metrics.techniqueScore;
  const prev = event.metrics.previousTechniqueScore;
  if (cur == null) return null;
  if (prev != null && prev > 0) {
    return {
      kind: "stat",
      label: "Technique",
      value: `${Math.round(prev)} → ${Math.round(cur)}`,
    };
  }
  return {
    kind: "stat",
    label: "Technique",
    value: `${Math.round(cur)}`,
  };
}

function e1rmDeltaLine(event: PrEvent): ShareCardLine | null {
  const cur = event.metrics.estimated1rmKg;
  const prev = event.metrics.previousEstimated1rmKg;
  if (cur == null) return null;
  if (prev != null && prev > 0) {
    const delta = Math.round((cur - prev) * 10) / 10;
    const sign = delta > 0 ? "+" : "";
    return {
      kind: "stat",
      label: "Estimated 1RM",
      value: `${sign}${delta} kg`,
    };
  }
  return {
    kind: "stat",
    label: "Estimated 1RM",
    value: `${cur} kg`,
  };
}

function volumeLine(event: PrEvent): ShareCardLine | null {
  if (event.metrics.volumeKg == null) return null;
  return {
    kind: "stat",
    label: "Volume",
    value: `${Math.round(event.metrics.volumeKg)} kg`,
  };
}

function typesLine(types: PrType[]): ShareCardLine | null {
  if (types.length === 0) return null;
  const labels: Record<PrType, string> = {
    one_rm: "1RM",
    estimated_1rm: "Est. 1RM",
    rep_pr: "Rep PR",
    volume_pr: "Volume",
    technical_pr: "Technical",
  };
  return {
    kind: "stat",
    label: "Types",
    value: types.map((t) => labels[t]).join(" · "),
  };
}

/**
 * Build a share card from a PR event.
 * Only opted-in metrics appear — private by default.
 */
export function buildShareCardModel(
  event: PrEvent,
  options: {
    formatId: ShareCardFormatId;
    selectedMetrics: ShareMetricId[];
  },
): ShareCardModel {
  const selected = new Set(options.selectedMetrics);
  const lines: ShareCardLine[] = [];
  const included: ShareMetricId[] = [];

  if (selected.has("technique_delta")) {
    const line = techniqueLine(event);
    if (line) {
      lines.push(line);
      included.push("technique_delta");
    }
  }

  if (selected.has("estimated_1rm_delta")) {
    const line = e1rmDeltaLine(event);
    if (line) {
      lines.push(line);
      included.push("estimated_1rm_delta");
    }
  }

  if (selected.has("volume")) {
    const line = volumeLine(event);
    if (line) {
      lines.push(line);
      included.push("volume");
    }
  }

  if (selected.has("pr_types")) {
    const line = typesLine(event.types);
    if (line) {
      lines.push(line);
      included.push("pr_types");
    }
  }

  if (selected.has("date")) {
    const d = new Date(event.at);
    if (!Number.isNaN(d.getTime())) {
      lines.push({
        kind: "stat",
        label: "Date",
        value: d.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      });
      included.push("date");
    }
  }

  lines.push({
    kind: "brand",
    value: SHARE_CARD_BRAND,
  });

  return {
    formatId: options.formatId,
    eyebrow: exerciseEyebrow(event),
    headline: upperHeadline(event.headline),
    lines,
    brand: SHARE_CARD_BRAND,
    honestyFootnote:
      "Estimated 1RM is never a verified competition PR.",
    includedMetrics: included,
  };
}

/**
 * Guard: ensure a metric list never silently includes undeclared private fields.
 */
export function assertOnlySelectedMetrics(
  model: ShareCardModel,
  selected: ShareMetricId[],
): boolean {
  const allowed = new Set(selected);
  return model.includedMetrics.every((m) => allowed.has(m));
}
