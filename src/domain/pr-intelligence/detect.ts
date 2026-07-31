import { estimate1rmKg } from "@/domain/scoring/strength/e1rm";
import {
  PR_LOAD_BUCKET_KG,
  PR_TYPE_LABELS,
} from "@/domain/pr-intelligence/constants";
import type {
  PrEvent,
  PrTimeline,
  PrType,
  StrengthSample,
  TechniqueSample,
} from "@/domain/pr-intelligence/types";

function roundLoadBucket(kg: number): number {
  return Math.round(kg / PR_LOAD_BUCKET_KG) * PR_LOAD_BUCKET_KG;
}

function eventId(parts: string[]): string {
  return parts.join(":");
}

type ExerciseState = {
  bestOneRmKg: number;
  bestE1rmKg: number;
  bestRepsAtLoad: Map<number, number>;
  bestSetVolume: number;
  bestTechnique: number;
};

function emptyState(): ExerciseState {
  return {
    bestOneRmKg: 0,
    bestE1rmKg: 0,
    bestRepsAtLoad: new Map(),
    bestSetVolume: 0,
    bestTechnique: 0,
  };
}

type Timed =
  | { kind: "strength"; sample: StrengthSample }
  | { kind: "technique"; sample: TechniqueSample };

/**
 * Detect typed PR events chronologically and attach related signals
 * (e.g. e1RM up + technique up on the same celebration).
 */
export function detectPrEvents(
  strength: StrengthSample[],
  technique: TechniqueSample[],
  now: Date = new Date(),
): PrTimeline {
  const timed: Timed[] = [
    ...strength.map((sample) => ({ kind: "strength" as const, sample })),
    ...technique.map((sample) => ({ kind: "technique" as const, sample })),
  ].sort((a, b) => a.sample.at.getTime() - b.sample.at.getTime());

  const byExercise = new Map<string, ExerciseState>();
  const events: PrEvent[] = [];

  for (const item of timed) {
    const key = item.sample.exerciseKey;
    const state = byExercise.get(key) ?? emptyState();
    if (!byExercise.has(key)) byExercise.set(key, state);

    if (item.kind === "technique") {
      const score = item.sample.overallScore;
      if (score > state.bestTechnique) {
        const previous = state.bestTechnique > 0 ? state.bestTechnique : null;
        state.bestTechnique = score;
        events.push({
          id: eventId(["tech", item.sample.id, String(score)]),
          types: ["technical_pr"],
          primaryType: "technical_pr",
          at: item.sample.at.toISOString(),
          exerciseKey: key,
          exerciseLabel: item.sample.exerciseLabel,
          title: "NEW PR",
          headline: `Technique ${Math.round(score)}`,
          related: [
            previous != null
              ? `Technical PR — score improved from ${Math.round(previous)}.`
              : "First logged technique score for this lift.",
          ],
          metrics: {
            loadKg: null,
            reps: null,
            estimated1rmKg: null,
            volumeKg: null,
            techniqueScore: score,
            previousEstimated1rmKg: null,
            previousTechniqueScore: previous,
          },
        });
      }
      continue;
    }

    const s = item.sample;
    if (!(s.loadKg > 0) || !Number.isInteger(s.reps) || s.reps < 1) continue;

    const types: PrType[] = [];
    const related: string[] = [];
    let estimated1rmKg: number | null =
      s.reps === 1 ? s.loadKg : estimate1rmKg(s.loadKg, s.reps);
    const volumeKg = s.loadKg * s.reps;
    const loadBucket = roundLoadBucket(s.loadKg);
    const prevE1rm = state.bestE1rmKg > 0 ? state.bestE1rmKg : null;
    const prevTech = state.bestTechnique > 0 ? state.bestTechnique : null;

    // 1RM — verified single (reps === 1)
    if (s.reps === 1 && s.loadKg > state.bestOneRmKg) {
      types.push("one_rm");
      related.push(
        state.bestOneRmKg > 0
          ? `1RM PR — previous best ${state.bestOneRmKg} kg.`
          : "First logged single for this lift.",
      );
      state.bestOneRmKg = s.loadKg;
    }

    // Estimated 1RM
    if (estimated1rmKg != null && estimated1rmKg > state.bestE1rmKg) {
      types.push("estimated_1rm");
      related.push(
        prevE1rm != null
          ? `Estimated 1RM increased (${Math.round(prevE1rm * 10) / 10} → ${Math.round(estimated1rmKg * 10) / 10} kg).`
          : "Estimated 1RM established (Epley for multi-rep — not a verified PR).",
      );
      state.bestE1rmKg = estimated1rmKg;
    } else if (estimated1rmKg == null) {
      estimated1rmKg = null;
    }

    // Rep PR at (approx) same load
    const prevReps = state.bestRepsAtLoad.get(loadBucket) ?? 0;
    if (s.reps > prevReps && s.reps >= 2) {
      types.push("rep_pr");
      related.push(
        prevReps > 0
          ? `Rep PR at ~${loadBucket} kg — previous best ${prevReps} reps.`
          : `Rep PR — ${s.reps} reps at ${s.loadKg} kg.`,
      );
      state.bestRepsAtLoad.set(loadBucket, s.reps);
    } else if (s.reps > prevReps) {
      state.bestRepsAtLoad.set(loadBucket, s.reps);
    }

    // Volume PR (set tonnage)
    if (volumeKg > state.bestSetVolume) {
      types.push("volume_pr");
      related.push(
        state.bestSetVolume > 0
          ? `Volume PR — set tonnage ${Math.round(volumeKg)} kg (prev ${Math.round(state.bestSetVolume)}).`
          : `Volume PR — set tonnage ${Math.round(volumeKg)} kg.`,
      );
      state.bestSetVolume = volumeKg;
    }

    // Technique also improved recently (same exercise, within 7 days)
    const recentTechPr = events.find(
      (e) =>
        e.exerciseKey === key &&
        e.primaryType === "technical_pr" &&
        s.at.getTime() - new Date(e.at).getTime() >= 0 &&
        s.at.getTime() - new Date(e.at).getTime() < 7 * 24 * 60 * 60 * 1000,
    );
    if (types.length > 0 && recentTechPr) {
      related.push("Technique score also improved.");
    }

    if (types.length === 0) continue;

    // Primary type priority for display
    const primaryType: PrType = types.includes("one_rm")
      ? "one_rm"
      : types.includes("rep_pr")
        ? "rep_pr"
        : types.includes("estimated_1rm")
          ? "estimated_1rm"
          : types.includes("volume_pr")
            ? "volume_pr"
            : types[0]!;

    const headline =
      s.reps === 1 ? `${s.loadKg} kg` : `${s.loadKg} kg × ${s.reps}`;

    // Deduplicate related lines
    const uniqRelated = [...new Set(related)];

    events.push({
      id: eventId(["str", s.id, types.join("+")]),
      types,
      primaryType,
      at: s.at.toISOString(),
      exerciseKey: key,
      exerciseLabel: s.exerciseLabel,
      title: "NEW PR",
      headline,
      related: uniqRelated,
      metrics: {
        loadKg: s.loadKg,
        reps: s.reps,
        estimated1rmKg:
          estimated1rmKg != null
            ? Math.round(estimated1rmKg * 10) / 10
            : null,
        volumeKg: Math.round(volumeKg * 10) / 10,
        techniqueScore: state.bestTechnique > 0 ? state.bestTechnique : null,
        previousEstimated1rmKg:
          prevE1rm != null ? Math.round(prevE1rm * 10) / 10 : null,
        previousTechniqueScore: prevTech,
      },
    });
  }

  // Newest first for timeline UI
  events.sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  );

  const countsByType: Record<PrType, number> = {
    one_rm: 0,
    estimated_1rm: 0,
    rep_pr: 0,
    volume_pr: 0,
    technical_pr: 0,
  };
  for (const e of events) {
    for (const t of e.types) countsByType[t] += 1;
  }

  return {
    events,
    countsByType,
    generatedAt: now.toISOString(),
  };
}

export function prTypeLabel(type: PrType): string {
  return PR_TYPE_LABELS[type];
}

export function toSharePayload(
  event: PrEvent,
  shareCard?: {
    formatId: string;
    eyebrow: string;
    cardHeadline: string;
    stats: Array<{ label?: string; value: string }>;
    brand: string;
    includedMetrics: string[];
  },
): import("@/domain/pr-intelligence/types").PrSharePayload {
  return {
    title: event.title,
    headline: event.headline,
    exerciseLabel: event.exerciseLabel,
    types: event.types,
    related: event.related,
    at: event.at,
    honestyNote:
      "Shared from The Strongest — Estimated 1RM is never a verified competition PR.",
    shareCard,
  };
}
