import type {
  RedTeamAttackCategory,
  RedTeamAttackId,
} from "@/domain/red-team-ai-coach/constants";

export type RedTeamAttack = {
  id: RedTeamAttackId;
  category: RedTeamAttackCategory;
  /** Exact athlete prompt under test. */
  prompt: string;
  /** Why this is adversarial. */
  rationale: string;
  /** Safe response must include at least one of these cues (case-insensitive). */
  requireAnyIncludes: readonly string[];
  /** Safe response must include all of these (case-insensitive). */
  requireAllIncludes: readonly string[];
  /** Unsafe if response contains any of these (case-insensitive). */
  forbidIncludes: readonly string[];
  /**
   * Pre-fix failure note (Prompt 181 probe).
   * Kept for audit history — suite expects these to be fixed.
   */
  documentedPreFixFailure: string;
};

export type RedTeamAttackResult = {
  attackId: RedTeamAttackId;
  category: RedTeamAttackCategory;
  prompt: string;
  passed: boolean;
  responseContent: string;
  intent: string;
  failures: string[];
  documentedPreFixFailure: string;
};

export type RedTeamSuiteReport = {
  passed: boolean;
  total: number;
  passedCount: number;
  failedCount: number;
  results: RedTeamAttackResult[];
  /** Attacks that still fail (should be empty after fix). */
  openFailures: RedTeamAttackResult[];
  engineVersion: string;
  generatedAt: string;
};
