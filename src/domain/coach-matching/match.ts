/**
 * Pure coach matching — organic score ignores paid placement.
 */

import {
  MATCH_GOAL_LABELS,
  MATCH_SPORT_LABELS,
  MATCH_STYLE_LABELS,
  MATCH_EXPERIENCE_LABELS,
  SPONSORED_LABEL,
  type MatchCoachingStyle,
  type MatchExperienceLevel,
  type MatchGoal,
  type MatchSport,
} from "@/domain/coach-matching/constants";

export type CoachMatchPreferences = {
  goal: MatchGoal | string;
  sport: MatchSport | string;
  experience: MatchExperienceLevel | string;
  /** Max budget in major currency units (e.g. USD). Null = no budget filter. */
  budgetMax: number | null;
  language: string;
  /** IANA timezone or free-text location preference. */
  locationOrTimezone: string;
  coachingStyle: MatchCoachingStyle | string;
};

export type CoachMatchCandidate = {
  id: string;
  slug: string;
  displayName: string;
  bio: string | null;
  specializations: string[];
  languages: string[];
  goalTags: string[];
  experienceLevels: string[];
  coachingStyles: string[];
  timezone: string | null;
  locationLabel: string | null;
  /** Display price in major units when known. */
  priceMajor: number | null;
  availabilityStatus: string;
  /** Explicit paid placement — must be labeled; never boosts organicScore. */
  isSponsored: boolean;
};

export type MatchReason = {
  factor: string;
  detail: string;
};

export type CoachMatchResult = {
  coach: CoachMatchCandidate;
  /** 0–100 organic fit — sponsored flag does not increase this. */
  organicScore: number;
  reasons: MatchReason[];
  /** True only when coach.isSponsored — for UI labeling. */
  sponsoredLabel: string | null;
};

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/[_-]+/g, " ");
}

function includesLoose(haystacks: string[], needle: string): boolean {
  const n = norm(needle);
  if (!n) return false;
  return haystacks.some((h) => {
    const x = norm(h);
    return x === n || x.includes(n) || n.includes(x);
  });
}

function scoreFactor(
  hit: boolean,
  weight: number,
  factor: string,
  detail: string,
): { points: number; reason: MatchReason | null } {
  if (!hit) return { points: 0, reason: null };
  return { points: weight, reason: { factor, detail } };
}

/**
 * Score one coach. `isSponsored` is recorded for labeling only —
 * it must never add points to organicScore.
 */
export function scoreCoachMatch(
  prefs: CoachMatchPreferences,
  coach: CoachMatchCandidate,
): CoachMatchResult {
  const reasons: MatchReason[] = [];
  let points = 0;

  // Capture sponsored for label only — never add to points
  const sponsoredLabel = coach.isSponsored ? SPONSORED_LABEL : null;

  const sportHit =
    includesLoose(coach.specializations, prefs.sport) ||
    includesLoose(coach.goalTags, prefs.sport);
  {
    const r = scoreFactor(
      sportHit,
      25,
      "Sport",
      `Specializes in ${MATCH_SPORT_LABELS[prefs.sport as MatchSport] ?? prefs.sport}`,
    );
    points += r.points;
    if (r.reason) reasons.push(r.reason);
  }

  const goalHit =
    includesLoose(coach.goalTags, prefs.goal) ||
    includesLoose(coach.specializations, prefs.goal) ||
    norm(coach.bio ?? "").includes(norm(prefs.goal));
  {
    const r = scoreFactor(
      goalHit,
      20,
      "Goal",
      `Aligned with ${MATCH_GOAL_LABELS[prefs.goal as MatchGoal] ?? prefs.goal}`,
    );
    points += r.points;
    if (r.reason) reasons.push(r.reason);
  }

  const expHit =
    includesLoose(coach.experienceLevels, prefs.experience) ||
    norm(coach.bio ?? "").includes(norm(prefs.experience));
  {
    const r = scoreFactor(
      expHit,
      15,
      "Experience",
      `Works with ${MATCH_EXPERIENCE_LABELS[prefs.experience as MatchExperienceLevel] ?? prefs.experience} athletes`,
    );
    points += r.points;
    if (r.reason) reasons.push(r.reason);
  }

  const styleHit = includesLoose(coach.coachingStyles, prefs.coachingStyle);
  {
    const r = scoreFactor(
      styleHit,
      15,
      "Coaching style",
      `Offers ${MATCH_STYLE_LABELS[prefs.coachingStyle as MatchCoachingStyle] ?? prefs.coachingStyle}`,
    );
    points += r.points;
    if (r.reason) reasons.push(r.reason);
  }

  const lang = prefs.language.trim();
  const langHit = lang.length > 0 && includesLoose(coach.languages, lang);
  {
    const r = scoreFactor(langHit, 10, "Language", `Speaks ${lang}`);
    points += r.points;
    if (r.reason) reasons.push(r.reason);
  }

  const loc = prefs.locationOrTimezone.trim();
  const locHit =
    loc.length > 0 &&
    (includesLoose(
      [coach.timezone ?? "", coach.locationLabel ?? ""].filter(Boolean),
      loc,
    ) ||
      norm(coach.timezone ?? "").includes(norm(loc)) ||
      norm(coach.locationLabel ?? "").includes(norm(loc)));
  {
    const r = scoreFactor(
      locHit,
      10,
      "Location / timezone",
      `Near your location/timezone preference (${loc})`,
    );
    points += r.points;
    if (r.reason) reasons.push(r.reason);
  }

  if (prefs.budgetMax != null && Number.isFinite(prefs.budgetMax)) {
    if (coach.priceMajor == null) {
      points += 3;
      reasons.push({
        factor: "Budget",
        detail: "Pricing on request — within reach pending consult",
      });
    } else if (coach.priceMajor <= prefs.budgetMax) {
      points += 5;
      reasons.push({
        factor: "Budget",
        detail: `Displayed rate (${coach.priceMajor}) is within your budget (${prefs.budgetMax})`,
      });
    }
  }

  const score = Math.min(100, Math.max(0, points));

  return {
    coach,
    organicScore: score,
    reasons,
    sponsoredLabel,
  };
}

/**
 * Rank coaches organically. Sponsored flag never reorders this list.
 * Callers may surface sponsored coaches separately with labels.
 */
export function rankOrganicMatches(
  prefs: CoachMatchPreferences,
  coaches: CoachMatchCandidate[],
  limit = 5,
): CoachMatchResult[] {
  return coaches
    .map((c) => scoreCoachMatch(prefs, c))
    .filter((r) => r.organicScore > 0 || r.reasons.length > 0)
    .sort((a, b) => {
      if (b.organicScore !== a.organicScore) {
        return b.organicScore - a.organicScore;
      }
      // Tie-break by name — never by isSponsored
      return a.coach.displayName.localeCompare(b.coach.displayName);
    })
    .slice(0, limit);
}

/**
 * Sponsored results: labeled only. Sorted by organic score among sponsored —
 * payment does not invent a higher score.
 */
export function rankSponsoredMatches(
  prefs: CoachMatchPreferences,
  coaches: CoachMatchCandidate[],
  limit = 3,
): CoachMatchResult[] {
  const sponsored = coaches.filter((c) => c.isSponsored);
  return rankOrganicMatches(prefs, sponsored, limit).map((r) => ({
    ...r,
    sponsoredLabel: SPONSORED_LABEL,
  }));
}

export function buildMatchExplanation(result: CoachMatchResult): string {
  if (result.reasons.length === 0) {
    return "Limited overlap with your preferences — review the profile carefully.";
  }
  return result.reasons.map((r) => `${r.factor}: ${r.detail}`).join(" · ");
}
