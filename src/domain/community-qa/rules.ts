/**
 * Voting, accepted answer, and expert badge rules.
 */

export type VoteValue = 1 | -1;

export function normalizeVoteValue(raw: number): VoteValue | null {
  if (raw === 1 || raw === -1) return raw;
  return null;
}

export function applyVoteDelta(
  currentScore: number,
  previous: VoteValue | null,
  next: VoteValue | null,
): number {
  let score = currentScore;
  if (previous != null) score -= previous;
  if (next != null) score += next;
  return score;
}

/**
 * Expert badge — only when the author is an explicitly verified Expert Contributor.
 * Never auto-label from coach mode or marketplace credentials alone (Prompt 82).
 */
export function shouldShowExpertBadge(input: {
  hasVerifiedExpertContributor: boolean;
}): boolean {
  return input.hasVerifiedExpertContributor === true;
}

export function expertBadgeLabel(show: boolean): string | null {
  return show ? "Expert" : null;
}

/**
 * Question author may accept one published human answer.
 */
export function canAcceptAnswer(input: {
  questionAuthorProfileId: string;
  actorProfileId: string;
  answerStatus: string;
  answerAuthorship: string;
}): boolean {
  if (input.questionAuthorProfileId !== input.actorProfileId) return false;
  if (input.answerStatus !== "published") return false;
  if (
    input.answerAuthorship !== "human_athlete" &&
    input.answerAuthorship !== "human_coach"
  ) {
    return false;
  }
  return true;
}
