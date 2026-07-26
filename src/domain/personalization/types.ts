import type { ConfidenceLevel } from "@/domain/scoring/types";
import type {
  PersonalizationInputKind,
  PersonalizationSurface,
} from "@/domain/personalization/constants";

export type PersonalizationItem = {
  id: string;
  surface: PersonalizationSurface;
  title: string;
  body: string;
  href: string | null;
  /** Higher = show first. */
  priority: number;
  /** Which input kinds justified this item. */
  drivenBy: PersonalizationInputKind[];
  confidence: ConfidenceLevel;
};

export type PersonalizationSurfaceSlot = {
  surface: PersonalizationSurface;
  label: string;
  items: PersonalizationItem[];
  missingNote: string | null;
};

export type PersonalizationPlan = {
  engineVersion: string;
  lookbackDays: number;
  generatedAtIso: string;
  summaryLine: string | null;
  surfaces: PersonalizationSurfaceSlot[];
  /** Explicit audit: pricing personalization is always blocked. */
  pricingPersonalization: {
    allowed: false;
    reason: string;
  };
  /** Sensitive keys that were intentionally ignored if present upstream. */
  ignoredSensitiveKeys: string[];
  honesty: readonly string[];
};

/** Pure inputs — no sex / birthYear / pricing fields. */
export type PersonalizationSignals = {
  now: Date;
  lookbackDays: number;
  goal: {
    title: string | null;
    category: string | null;
  };
  sport: {
    primaryDiscipline: string | null;
    preferredSports: string[];
  };
  history: {
    completedSessions: number;
    skippedSessions: number;
    trainingDays: number;
    hasActiveProgram: boolean;
    techniqueUploads: number;
  };
  behavior: {
    acceptedAdaptations: number;
    declinedAdaptations: number;
    feedbackHelpful: number;
    feedbackNotHelpful: number;
  };
  preferences: {
    daysPerWeek: number | null;
    sessionLengthMinutes: number | null;
    intensityBand: string | null;
    frequencyBand: string | null;
    volumeToleranceBand: string | null;
  };
  /** Pending stored recommendations to re-rank. */
  pendingRecommendations: Array<{
    id: string;
    title: string;
    body: string;
    category: string;
    priority: number;
  }>;
  /**
   * Optional bag from upstream — any sensitive keys listed in
   * PERSONALIZATION_SENSITIVE_CHARACTERISTICS are stripped and audited.
   */
  unsafeExtras?: Record<string, unknown>;
};
