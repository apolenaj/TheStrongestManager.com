import {
  COMP_PHASE_INTENSIFICATION_DAYS,
  COMP_PHASE_MEET_WEEK_DAYS,
  COMP_PHASE_PEAKING_DAYS,
  COMP_PHASE_TAPER_DAYS,
} from "@/domain/competition-mode/constants";
import type {
  CompetitionPhaseId,
  TaperGuidance,
} from "@/domain/competition-mode/types";
import {
  DEFAULT_TIMEZONE,
  daysUntilInTimezone,
} from "@/domain/timezone-system";

/**
 * Calendar days until competition in the athlete’s timezone.
 * Defaults to UTC when timezone omitted (legacy callers).
 */
export function daysUntil(
  competitionDate: Date,
  now: Date,
  timeZone: string = DEFAULT_TIMEZONE,
): number {
  return daysUntilInTimezone(competitionDate, now, timeZone);
}

export function resolveCompetitionPhase(
  daysOut: number,
): CompetitionPhaseId {
  if (daysOut < 0) return "post_meet";
  if (daysOut <= COMP_PHASE_MEET_WEEK_DAYS) return "meet_week";
  if (daysOut <= COMP_PHASE_TAPER_DAYS) return "taper";
  if (daysOut <= COMP_PHASE_PEAKING_DAYS) return "peaking";
  if (daysOut <= COMP_PHASE_INTENSIFICATION_DAYS) return "intensification";
  return "build";
}

export function phaseLabel(id: CompetitionPhaseId): string {
  switch (id) {
    case "build":
      return "Build / base";
    case "intensification":
      return "Intensification";
    case "peaking":
      return "Peaking";
    case "taper":
      return "Taper";
    case "meet_week":
      return "Meet week";
    case "post_meet":
      return "Post-meet";
  }
}

export function phaseSummary(id: CompetitionPhaseId, daysOut: number): string {
  switch (id) {
    case "build":
      return `${Math.round(daysOut)} days out — volume and technique still have room before peaking.`;
    case "intensification":
      return `${Math.round(daysOut)} days out — shift toward heavier singles/doubles; manage fatigue.`;
    case "peaking":
      return `${Math.round(daysOut)} days out — specificity and confidence singles; avoid junk volume.`;
    case "taper":
      return `${Math.round(daysOut)} days out — reduce fatigue while keeping some intensity (illustrative).`;
    case "meet_week":
      return `${Math.round(daysOut)} day(s) out — prioritize sleep, food, and known openers — not new PRs in the gym.`;
    case "post_meet":
      return "Competition date has passed — review what worked; plan a deload before the next block.";
  }
}

/**
 * Illustrative taper notes — never auto-applied to the athlete's program.
 */
export function buildTaperGuidance(
  phaseId: CompetitionPhaseId,
): TaperGuidance {
  const base = {
    phaseId,
    illustrativeOnly: true as const,
  };

  switch (phaseId) {
    case "taper":
      return {
        ...base,
        headline: "Taper window (illustrative)",
        bullets: [
          "Trim hard-set volume; keep a few sharp singles/doubles you already own.",
          "Do not invent new variations or max-out protocols this close to the meet.",
          "Sleep and food consistency usually matter more than a perfect spreadsheet.",
        ],
      };
    case "meet_week":
      return {
        ...base,
        headline: "Meet week (illustrative)",
        bullets: [
          "Keep movement light enough to stay sharp — openers should feel familiar.",
          "Confirm commands, kit, and weigh-in rules with your federation.",
          "This app does not change your program automatically.",
        ],
      };
    case "peaking":
      return {
        ...base,
        headline: "Approaching taper",
        bullets: [
          "Finish heavy practice with recoverable intensity.",
          "Sketch openers from recent hard sets, not wishful thirds.",
          "Taper details stay athlete/coach decisions — not auto-prescribed here.",
        ],
      };
    case "post_meet":
      return {
        ...base,
        headline: "After the meet",
        bullets: [
          "Expect a short unload before rebuilding.",
          "Log what attempts felt like for the next cycle.",
        ],
      };
    default:
      return {
        ...base,
        headline: "Taper not yet due",
        bullets: [
          `Current phase is ${phaseLabel(phaseId)} — a formal taper usually starts closer to the meet.`,
          "When you enter the taper window, guidance here stays illustrative only.",
        ],
      };
  }
}

export function formatCountdown(daysOut: number): {
  days: number;
  label: string;
  past: boolean;
} {
  if (daysOut < 0) {
    const ago = Math.abs(Math.round(daysOut));
    return {
      days: daysOut,
      label: `Meet was ${ago} day${ago === 1 ? "" : "s"} ago`,
      past: true,
    };
  }
  if (daysOut === 0) {
    return { days: 0, label: "Competition day", past: false };
  }
  if (daysOut === 1) {
    return { days: 1, label: "1 day to go", past: false };
  }
  if (daysOut < 14) {
    return {
      days: daysOut,
      label: `${Math.round(daysOut)} days to go`,
      past: false,
    };
  }
  const weeks = Math.round((daysOut / 7) * 10) / 10;
  return {
    days: daysOut,
    label: `${Math.round(daysOut)} days (~${weeks} weeks) to go`,
    past: false,
  };
}
