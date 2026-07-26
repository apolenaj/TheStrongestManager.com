import type {
  InjuryDeclarationKind,
  InjurySuggestionKind,
} from "@/domain/injury-modification/constants";

export type InjuryModificationRecord = {
  id: string;
  declarationKind: InjuryDeclarationKind;
  status: "active" | "cleared";
  notes: string | null;
  /** Optional free-text area / pattern the athlete wants to modify around. */
  affectedArea: string | null;
  /** professional_instruction may name the source (PT, MD, coach) — not a diagnosis. */
  instructionSource: string | null;
  startsAt: string;
  endsAt: string | null;
  clearedAt: string | null;
};

export type InjuryModificationSuggestion = {
  kind: InjurySuggestionKind;
  label: string;
  summary: string;
  /** Coaching cue — never a medical prescription. */
  coachingCue: string;
  /** Optional deep-link surface. */
  href: string | null;
};

export type InjuryModificationPlan = {
  engineVersion: string;
  active: boolean;
  declarations: InjuryDeclarationKind[];
  suggestions: InjuryModificationSuggestion[];
  explanation: string[];
  honesty: readonly string[];
  healthcareDisclaimer: string;
  /** Explicit: never diagnose. */
  neverDiagnose: true;
  /** When Pain-Safe is active, defer — do not work around red flags. */
  deferToPainSafe: boolean;
};
