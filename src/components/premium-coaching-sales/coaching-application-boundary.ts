/**
 * Frontend integration boundary for the 1:1 coaching application wizard.
 * Maps rich UI state onto the existing premium coaching submit action
 * (goal, experienceLevel, budgetRange, availability, notes) without
 * changing backend routes or Prisma schemas.
 */

import type {
  PremiumCoachingAvailability,
  PremiumCoachingBudgetRange,
  PremiumCoachingExperience,
  PremiumCoachingGoal,
} from "@/domain/premium-coaching-sales";

export const COACHING_APPLICATION_STEPS = [
  { id: 1, label: "Profile" },
  { id: 2, label: "Lifts" },
  { id: 3, label: "Goals" },
  { id: 4, label: "Support" },
  { id: 5, label: "Review" },
] as const;

export type CoachingApplicationStepId =
  (typeof COACHING_APPLICATION_STEPS)[number]["id"];

export type CoachingApplicationDraft = {
  // Step 1
  name: string;
  email: string;
  country: string;
  age: string;
  // Step 2
  bodyweightKg: string;
  weightClass: string;
  experienceLevel: PremiumCoachingExperience | "";
  squatKg: string;
  benchKg: string;
  deadliftKg: string;
  // Step 3
  goal: PremiumCoachingGoal | "";
  competitionDate: string;
  availability: PremiumCoachingAvailability | "";
  biggestProblem: string;
  // Step 4
  injuryNotes: string;
  currentCoachStatus: "none" | "previous" | "current" | "";
  expectedSupport: string;
  budgetRange: PremiumCoachingBudgetRange | "";
};

export const EMPTY_COACHING_APPLICATION: CoachingApplicationDraft = {
  name: "",
  email: "",
  country: "",
  age: "",
  bodyweightKg: "",
  weightClass: "",
  experienceLevel: "",
  squatKg: "",
  benchKg: "",
  deadliftKg: "",
  goal: "",
  competitionDate: "",
  availability: "",
  biggestProblem: "",
  injuryNotes: "",
  currentCoachStatus: "",
  expectedSupport: "",
  budgetRange: "",
};

export type CoachingApplicationFieldErrors = Partial<
  Record<keyof CoachingApplicationDraft, string>
>;

function required(value: string, message: string): string | undefined {
  if (!value.trim()) return message;
  return undefined;
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isPositiveNumber(value: string): boolean {
  const n = Number(value);
  return Number.isFinite(n) && n > 0;
}

export function validateCoachingApplicationStep(
  step: CoachingApplicationStepId,
  draft: CoachingApplicationDraft,
): CoachingApplicationFieldErrors {
  const errors: CoachingApplicationFieldErrors = {};

  if (step === 1) {
    const nameErr = required(draft.name, "Enter your name.");
    if (nameErr) errors.name = nameErr;

    if (!draft.email.trim()) errors.email = "Enter your email.";
    else if (!isEmail(draft.email)) errors.email = "Enter a valid email.";

    const countryErr = required(draft.country, "Enter your country.");
    if (countryErr) errors.country = countryErr;

    if (!draft.age.trim()) errors.age = "Enter your age.";
    else {
      const age = Number(draft.age);
      if (!Number.isInteger(age) || age < 16 || age > 90) {
        errors.age = "Age must be a whole number between 16 and 90.";
      }
    }
  }

  if (step === 2) {
    if (!draft.bodyweightKg.trim() || !isPositiveNumber(draft.bodyweightKg)) {
      errors.bodyweightKg = "Enter bodyweight in kg.";
    }
    const wcErr = required(draft.weightClass, "Enter your weight class.");
    if (wcErr) errors.weightClass = wcErr;
    if (!draft.experienceLevel) {
      errors.experienceLevel = "Select experience level.";
    }
    if (!draft.squatKg.trim() || !isPositiveNumber(draft.squatKg)) {
      errors.squatKg = "Enter squat (kg).";
    }
    if (!draft.benchKg.trim() || !isPositiveNumber(draft.benchKg)) {
      errors.benchKg = "Enter bench (kg).";
    }
    if (!draft.deadliftKg.trim() || !isPositiveNumber(draft.deadliftKg)) {
      errors.deadliftKg = "Enter deadlift (kg).";
    }
  }

  if (step === 3) {
    if (!draft.goal) errors.goal = "Select a primary goal.";
    if (!draft.availability) {
      errors.availability = "Select training availability.";
    }
    const problemErr = required(
      draft.biggestProblem,
      "Describe your biggest problem.",
    );
    if (problemErr) errors.biggestProblem = problemErr;
    // competitionDate optional — meets are not required
  }

  if (step === 4) {
    if (!draft.currentCoachStatus) {
      errors.currentCoachStatus = "Select current coach status.";
    }
    const supportErr = required(
      draft.expectedSupport,
      "Describe the support you expect.",
    );
    if (supportErr) errors.expectedSupport = supportErr;
    if (!draft.budgetRange) {
      errors.budgetRange = "Select a budget range.";
    }
  }

  return errors;
}

export function buildPremiumCoachingSubmitFormData(
  draft: CoachingApplicationDraft,
): FormData {
  const fd = new FormData();
  fd.set("goal", draft.goal);
  fd.set("experienceLevel", draft.experienceLevel);
  fd.set("budgetRange", draft.budgetRange);
  fd.set("availability", draft.availability);

  const notes = [
    "— Multi-step coaching application (frontend boundary) —",
    `Name: ${draft.name.trim()}`,
    `Email: ${draft.email.trim()}`,
    `Country: ${draft.country.trim()}`,
    `Age: ${draft.age.trim()}`,
    `Bodyweight (kg): ${draft.bodyweightKg.trim()}`,
    `Weight class: ${draft.weightClass.trim()}`,
    `Squat / Bench / Deadlift (kg): ${draft.squatKg} / ${draft.benchKg} / ${draft.deadliftKg}`,
    `Competition date: ${draft.competitionDate.trim() || "not set"}`,
    `Biggest problem: ${draft.biggestProblem.trim()}`,
    `Injury considerations: ${draft.injuryNotes.trim() || "none noted"}`,
    `Current coach status: ${draft.currentCoachStatus || "unspecified"}`,
    `Expected support: ${draft.expectedSupport.trim()}`,
  ].join("\n");

  fd.set("notes", notes.slice(0, 2000));
  return fd;
}
