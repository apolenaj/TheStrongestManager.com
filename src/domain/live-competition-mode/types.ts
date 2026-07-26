import type {
  LiveAttemptNumber,
  LiveAttemptResult,
  LiveCompetitionCapabilityId,
  LiveCompetitionOfflineMutation,
  LiveLiftKind,
  LiveMeetStatus,
  LiveWarmupSlotKind,
} from "@/domain/live-competition-mode/constants";

export type LiveMeetSession = {
  id: string;
  athleteProfileId: string;
  /** Optional link to Competition Prep (Prompt 70). */
  competitionPrepId: string | null;
  status: LiveMeetStatus;
  meetName: string | null;
  startedAt: string | null;
  completedAt: string | null;
  /** Athlete-declared platform / flight time for warm-up clocks. */
  platformAt: string | null;
};

export type LiveAttemptRecord = {
  id: string;
  meetSessionId: string;
  lift: LiveLiftKind;
  attemptNumber: LiveAttemptNumber;
  /** Planned load in kg — athlete-entered. */
  plannedLoadKg: number | null;
  result: LiveAttemptResult;
  /** When the result was logged (local or server). */
  resultLoggedAt: string | null;
  notes: string | null;
};

export type LiveWarmupSlot = {
  id: string;
  meetSessionId: string;
  kind: LiveWarmupSlotKind;
  /** Minutes before platformAt (negative if after). */
  offsetMinutesBeforePlatform: number;
  label: string;
  completed: boolean;
};

export type LiveNextAttempt = {
  attempt: LiveAttemptRecord;
  reason: string;
} | null;

export type LiveWarmupTimingView = {
  platformAt: string | null;
  slots: Array<
    LiveWarmupSlot & {
      scheduledAt: string | null;
      minutesUntil: number | null;
    }
  >;
  honesty: string;
};

export type LiveCompetitionOfflineDraft = {
  id: string;
  mutation: LiveCompetitionOfflineMutation;
  meetSessionId: string;
  payloadJson: string;
  createdAt: string;
};

export type LiveCompetitionSnapshot = {
  engineVersion: string;
  honesty: readonly string[];
  capabilities: Array<{
    id: LiveCompetitionCapabilityId;
    label: string;
    detail: string;
  }>;
  meetStatuses: Array<{ id: LiveMeetStatus; label: string }>;
  attemptResults: Array<{ id: LiveAttemptResult; label: string }>;
  warmupSlotKinds: Array<{ id: LiveWarmupSlotKind; label: string }>;
  safetyRefusals: readonly string[];
  safetyCopy: readonly string[];
  offlineMutations: readonly LiveCompetitionOfflineMutation[];
  offlineStorageKey: string;
  architectureEnabled: boolean;
  liveRuntimeEnabled: boolean;
  docPath: "docs/LIVE_COMPETITION_MODE.md";
  relatedPrepDoc: "docs/COMPETITION_MODE.md";
  generatedAt: string;
};
