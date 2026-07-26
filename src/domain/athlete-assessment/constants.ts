/**
 * Free Athlete Score Funnel (Prompt 171).
 * Limited questions → partial profile (self-assessment estimate).
 * Not full Athlete Score. CTA: create account for data-driven score.
 */

export const ATHLETE_ASSESSMENT_ENGINE_VERSION =
  "athlete_assessment.v1" as const;

/** Exact product labels — required on every free result. */
export const ATHLETE_ASSESSMENT_SELF_LABEL =
  "Self-assessment estimate" as const;
export const ATHLETE_ASSESSMENT_NOT_FULL_LABEL =
  "Not full Athlete Score" as const;

export const ATHLETE_ASSESSMENT_HONESTY = [
  "Answers are self-reported only. This page returns a Self-assessment estimate — Not full Athlete Score.",
  "We never compute the real Athlete Score from a questionnaire. Overall and pillar scores need logged training data.",
  "Optional claimed lifts stay Reported — never Verified, never a PR.",
  "Create an account and log sessions, technique, and recovery to unlock the data-driven Athlete Score.",
] as const;

export const ATHLETE_ASSESSMENT_PRIVACY_COPY =
  "Answers stay in your browser for this free assessment. We do not store a guest Athlete Score row. Create an account to build a real score from logged training under your private profile.";

export const ATHLETE_ASSESSMENT_CLAIM_LIMIT = 10;
export const ATHLETE_ASSESSMENT_CLAIM_WINDOW_MS = 60 * 60 * 1000;
export const ATHLETE_ASSESSMENT_TICKET_TTL_SECONDS = 20 * 60;

export const ATHLETE_ASSESSMENT_FUNNEL_STEPS = [
  {
    id: "questions",
    label: "Limited questions",
    detail: "Goal, experience, sport, frequency, and recovery feel — self-reported only.",
  },
  {
    id: "claim_ticket",
    label: "Claim assessment",
    detail: "Rate-limited ticket per network — no account required for a partial profile.",
  },
  {
    id: "partial_profile",
    label: "Partial profile",
    detail: "Self-assessment estimate with missing-data checklist — Not full Athlete Score.",
  },
  {
    id: "signup_cta",
    label: "Real score",
    detail: "Create an account for the data-driven Athlete Score from logged training.",
  },
] as const;

export const ATHLETE_ASSESSMENT_LOCKED_SECTIONS = [
  "Overall Athlete Score (0–100)",
  "Pillar scores: strength, technique, programming, recovery, consistency",
  "Athlete Level from logged evidence",
  "Score history and trends",
  "Verified lift efforts from Progress",
] as const;

export const ATHLETE_ASSESSMENT_SIGNUP_HREF =
  "/signup?next=/app/dashboard&from=athlete-assessment";

export const ATHLETE_ASSESSMENT_GOALS = [
  { id: "strength", label: "Build strength" },
  { id: "powerlifting", label: "Powerlifting" },
  { id: "physique", label: "Muscle / physique" },
  { id: "strongman", label: "Strongman" },
  { id: "general", label: "General fitness" },
] as const;

export const ATHLETE_ASSESSMENT_EXPERIENCE = [
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
] as const;

export const ATHLETE_ASSESSMENT_SPORTS = [
  { id: "powerlifting", label: "Powerlifting" },
  { id: "bodybuilding", label: "Bodybuilding" },
  { id: "strongman", label: "Strongman" },
  { id: "general_strength", label: "General strength" },
  { id: "hybrid", label: "Hybrid" },
] as const;

export const ATHLETE_ASSESSMENT_FREQUENCY = [
  { id: "2", label: "1–2 days / week" },
  { id: "3", label: "3 days / week" },
  { id: "4", label: "4 days / week" },
  { id: "5", label: "5+ days / week" },
] as const;

export const ATHLETE_ASSESSMENT_RECOVERY = [
  { id: "good", label: "Usually recover well" },
  { id: "mixed", label: "Mixed — depends on the week" },
  { id: "struggling", label: "Often under-recovered" },
] as const;

export const ATHLETE_ASSESSMENT_LOGGING = [
  { id: "yes", label: "Yes — I already log sessions somewhere" },
  { id: "no", label: "Not yet" },
] as const;

export type AthleteAssessmentGoalId =
  (typeof ATHLETE_ASSESSMENT_GOALS)[number]["id"];
export type AthleteAssessmentExperienceId =
  (typeof ATHLETE_ASSESSMENT_EXPERIENCE)[number]["id"];
export type AthleteAssessmentSportId =
  (typeof ATHLETE_ASSESSMENT_SPORTS)[number]["id"];
export type AthleteAssessmentFrequencyId =
  (typeof ATHLETE_ASSESSMENT_FREQUENCY)[number]["id"];
export type AthleteAssessmentRecoveryId =
  (typeof ATHLETE_ASSESSMENT_RECOVERY)[number]["id"];
export type AthleteAssessmentLoggingId =
  (typeof ATHLETE_ASSESSMENT_LOGGING)[number]["id"];

export type AthleteAssessmentAnswers = {
  goal: AthleteAssessmentGoalId;
  experience: AthleteAssessmentExperienceId;
  sport: AthleteAssessmentSportId;
  frequency: AthleteAssessmentFrequencyId;
  recovery: AthleteAssessmentRecoveryId;
  logging: AthleteAssessmentLoggingId;
};
