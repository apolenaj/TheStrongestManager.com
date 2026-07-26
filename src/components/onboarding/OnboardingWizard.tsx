"use client";

import { useActionState, useMemo, useState, useTransition } from "react";
import {
  Alert,
  Button,
  Checkbox,
  Input,
  Label,
  ProgressBar,
  Textarea,
} from "@/design-system";
import { completeOnboardingAction } from "@/services/onboarding/actions";
import {
  EQUIPMENT_OPTIONS,
  EXPERIENCE_LEVELS,
  FREQUENCY_OPTIONS,
  MAJOR_LIFTS,
  PRIMARY_GOALS,
  SPORTS,
  emptyOnboardingDraft,
  type EquipmentId,
  type ExperienceLevelId,
  type MajorLiftId,
  type OnboardingDraft,
  type PrimaryGoalId,
  type SportId,
} from "@/services/onboarding/options";
import {
  ONBOARDING_PATH_HONESTY,
  ONBOARDING_PATH_OPTIONS,
  applyOnboardingPathSeed,
  getOnboardingPathVisibility,
  type OnboardingPathId,
} from "@/domain/onboarding-paths";
import { cn } from "@/design-system/utils/cn";

type StepId =
  | "path"
  | "goal"
  | "experience"
  | "details"
  | "caution"
  | "building";

type StepDef = {
  id: StepId;
  title: string;
  kind: "required" | "optional" | "system";
};

function buildSteps(personalized: boolean, pathId: OnboardingPathId | null): StepDef[] {
  if (!personalized) {
    return [
      { id: "goal", title: "Choose your primary goal", kind: "required" },
      { id: "experience", title: "Training experience", kind: "required" },
      { id: "details", title: "Optional details", kind: "optional" },
      { id: "caution", title: "Pain & injury caution", kind: "required" },
      { id: "building", title: "Building profile", kind: "system" },
    ];
  }

  const visibility = getOnboardingPathVisibility(pathId);
  const steps: StepDef[] = [
    { id: "path", title: "What best describes you?", kind: "required" },
  ];
  if (visibility.showGoalStep) {
    steps.push({
      id: "goal",
      title: "Choose your primary goal",
      kind: "required",
    });
  }
  if (visibility.showExperienceStep) {
    steps.push({
      id: "experience",
      title: "Training experience",
      kind: "required",
    });
  }
  if (visibility.showDetailsStep) {
    steps.push({
      id: "details",
      title:
        pathId === "beginner"
          ? "A few simple details"
          : "Optional details for your path",
      kind: "optional",
    });
  }
  steps.push({
    id: "caution",
    title: "Pain & injury caution",
    kind: "required",
  });
  steps.push({ id: "building", title: "Building profile", kind: "system" });
  return steps;
}

function toggleInList<T extends string>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

function OptionCard({
  selected,
  title,
  hint,
  onSelect,
}: {
  selected: boolean;
  title: string;
  hint?: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "w-full rounded-[var(--radius-md)] border px-4 py-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]",
        selected
          ? "border-[var(--color-accent)] bg-[var(--color-accent-muted)]"
          : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-strong)]",
      )}
    >
      <span className="block font-medium text-[var(--color-foreground)]">
        {title}
      </span>
      {hint ? (
        <span className="mt-1 block text-sm text-[var(--color-muted)]">
          {hint}
        </span>
      ) : null}
    </button>
  );
}

function clearOptionalFields(draft: OnboardingDraft): OnboardingDraft {
  return {
    ...draft,
    sports: draft.pathId
      ? draft.sports
      : [],
    daysPerWeek: null,
    equipment: [],
    bodyweightKg: null,
    heightCm: null,
    lifts: {},
    competitionDate: null,
    currentProgramNote: null,
    recentHistory: null,
    recoveryHabits: null,
  };
}

function stepLabel(id: StepId): string {
  if (id === "path") return "Path";
  if (id === "goal") return "Goal";
  if (id === "experience") return "Experience";
  if (id === "details") return "Details";
  if (id === "caution") return "Caution";
  return "Build";
}

export function OnboardingWizard({
  personalized = false,
  introEyebrow = "First session setup",
  introSupport,
}: {
  personalized?: boolean;
  introEyebrow?: string;
  introSupport?: string;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<OnboardingDraft>(emptyOnboardingDraft);
  const [localError, setLocalError] = useState<string | null>(null);
  const [pendingBuild, startBuildTransition] = useTransition();
  const [actionState, formAction] = useActionState(completeOnboardingAction, {
    ok: false,
  });
  const [submitPayload, setSubmitPayload] = useState<string | null>(null);

  const steps = useMemo(
    () => buildSteps(personalized, draft.pathId),
    [personalized, draft.pathId],
  );

  // Clamp index if path change shortens the flow
  const safeIndex = Math.min(stepIndex, steps.length - 1);
  const step = steps[safeIndex]!;
  const userSteps = steps.filter((s) => s.kind !== "system");
  const userStepIndex =
    step.kind === "system"
      ? userSteps.length
      : Math.min(
          userSteps.findIndex((s) => s.id === step.id) + 1,
          userSteps.length,
        );
  const progressValue = (userStepIndex / Math.max(userSteps.length, 1)) * 100;

  const visibility = getOnboardingPathVisibility(
    personalized ? draft.pathId : null,
  );

  const livePayload = useMemo(() => JSON.stringify(draft), [draft]);
  const payload = submitPayload ?? livePayload;

  const goals = PRIMARY_GOALS.filter((g) =>
    visibility.goalIds.includes(g.id),
  );
  const levels = EXPERIENCE_LEVELS.filter((l) =>
    visibility.experienceLevelIds.includes(l.id),
  );
  const sports = SPORTS.filter((s) => visibility.sportIds.includes(s.id));
  const equipment = EQUIPMENT_OPTIONS.filter((e) =>
    visibility.equipmentIds.includes(e.id),
  );
  const lifts = MAJOR_LIFTS.filter((l) => visibility.liftIds.includes(l.id));
  const sections = new Set(visibility.detailSections);

  function goNext() {
    setLocalError(null);
    const id = step.id;

    if (id === "path" && !draft.pathId) {
      setLocalError("Select a path to continue.");
      return;
    }
    if (id === "goal" && !draft.primaryGoalId) {
      setLocalError("Select a primary goal to continue.");
      return;
    }
    if (id === "experience" && !draft.experienceLevelId) {
      setLocalError("Select your experience level to continue.");
      return;
    }
    if (id === "caution" && !draft.painCautionAcknowledged) {
      setLocalError("Please acknowledge the caution before continuing.");
      return;
    }

    if (id === "caution") {
      finishOnboarding(false);
      return;
    }

    setStepIndex((value) => Math.min(value + 1, steps.length - 1));
  }

  function goBack() {
    setLocalError(null);
    setStepIndex((value) => Math.max(value - 1, 0));
  }

  function skipOptionalDetails() {
    setLocalError(null);
    setDraft((prev) => clearOptionalFields(prev));
    setStepIndex((value) => Math.min(value + 1, steps.length - 1));
  }

  function selectPath(pathId: OnboardingPathId) {
    setDraft((prev) => applyOnboardingPathSeed(prev, pathId));
  }

  function finishOnboarding(clearMovementNotes: boolean) {
    setLocalError(null);
    if (!draft.painCautionAcknowledged) {
      setLocalError("Please acknowledge the caution before continuing.");
      return;
    }
    if (!draft.primaryGoalId || !draft.experienceLevelId) {
      setLocalError("Required profile fields are missing for this path.");
      return;
    }

    const nextDraft: OnboardingDraft = {
      ...draft,
      movementNotes: clearMovementNotes ? null : draft.movementNotes,
      painCautionAcknowledged: true,
    };
    setDraft(nextDraft);
    setSubmitPayload(JSON.stringify(nextDraft));
    setStepIndex(steps.length - 1);
    startBuildTransition(() => {
      window.setTimeout(() => {
        const form = document.getElementById(
          "onboarding-submit-form",
        ) as HTMLFormElement | null;
        form?.requestSubmit();
      }, 50);
    });
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10 sm:py-14">
      <p className="ui-eyebrow">{introEyebrow}</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
        {step.title}
      </h1>
      {introSupport && safeIndex === 0 ? (
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
          {introSupport}
        </p>
      ) : null}
      <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
        {step.id === "path"
          ? ONBOARDING_PATH_HONESTY[0]
          : step.kind === "optional"
            ? pathIdHint(draft.pathId)
            : step.kind === "system"
              ? "Saving only what you provided."
              : "Only relevant questions for your path. Optional details can wait."}
      </p>

      <div className="mt-8 space-y-2">
        <ProgressBar
          label={
            step.kind === "system"
              ? "Finishing"
              : `Step ${userStepIndex} of ${userSteps.length}${
                  step.kind === "optional" ? " · optional" : ""
                }`
          }
          value={progressValue}
          tone="accent"
        />
        <ol className="flex flex-wrap gap-2 text-[11px] text-[var(--color-subtle)]">
          {userSteps.map((s, index) => (
            <li
              key={s.id}
              className={cn(
                "rounded-sm border px-2 py-1",
                s.id === step.id
                  ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                  : index < userStepIndex - 1
                    ? "border-[var(--color-border-strong)] text-[var(--color-muted)]"
                    : "border-[var(--color-border)]",
              )}
            >
              {index + 1}. {stepLabel(s.id)}
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-8 space-y-4">
        {step.id === "path" ? (
          <div className="grid gap-3">
            {ONBOARDING_PATH_OPTIONS.map((path) => (
              <OptionCard
                key={path.id}
                title={path.label}
                hint={path.hint}
                selected={draft.pathId === path.id}
                onSelect={() => selectPath(path.id)}
              />
            ))}
          </div>
        ) : null}

        {step.id === "goal" ? (
          <div className="grid gap-3">
            <p className="text-sm text-[var(--color-muted)]">
              Required. Goals shown match your path — irrelevant options are
              hidden.
            </p>
            {goals.map((goal) => (
              <OptionCard
                key={goal.id}
                title={goal.label}
                selected={draft.primaryGoalId === goal.id}
                onSelect={() =>
                  setDraft((prev) => ({
                    ...prev,
                    primaryGoalId: goal.id as PrimaryGoalId,
                  }))
                }
              />
            ))}
          </div>
        ) : null}

        {step.id === "experience" ? (
          <div className="grid gap-3">
            <p className="text-sm text-[var(--color-muted)]">
              Required. Helps programming stay realistic — not a ranking.
            </p>
            {levels.map((level) => (
              <OptionCard
                key={level.id}
                title={level.label}
                hint={level.hint}
                selected={draft.experienceLevelId === level.id}
                onSelect={() =>
                  setDraft((prev) => ({
                    ...prev,
                    experienceLevelId: level.id as ExperienceLevelId,
                  }))
                }
              />
            ))}
          </div>
        ) : null}

        {step.id === "details" ? (
          <div className="space-y-8">
            <Alert tone="info" title="Optional — skip anytime">
              Only fields relevant to your path appear here. Skipping does not
              invent values.
            </Alert>

            {sections.has("sports") ? (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-[var(--color-foreground)]">
                  Sports
                </h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  {sports.map((sport) => (
                    <OptionCard
                      key={sport.id}
                      title={sport.label}
                      selected={draft.sports.includes(sport.id)}
                      onSelect={() =>
                        setDraft((prev) => ({
                          ...prev,
                          sports: toggleInList(
                            prev.sports,
                            sport.id as SportId,
                          ),
                        }))
                      }
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {sections.has("frequency") ? (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-[var(--color-foreground)]">
                  Days per week
                </h2>
                <div className="grid gap-2">
                  {FREQUENCY_OPTIONS.map((option) => (
                    <OptionCard
                      key={option.id}
                      title={option.label}
                      selected={draft.daysPerWeek === option.id}
                      onSelect={() =>
                        setDraft((prev) => ({
                          ...prev,
                          daysPerWeek: option.id,
                        }))
                      }
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {sections.has("equipment") ? (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-[var(--color-foreground)]">
                  Equipment
                </h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  {equipment.map((item) => (
                    <OptionCard
                      key={item.id}
                      title={item.label}
                      selected={draft.equipment.includes(item.id)}
                      onSelect={() =>
                        setDraft((prev) => ({
                          ...prev,
                          equipment: toggleInList(
                            prev.equipment,
                            item.id as EquipmentId,
                          ),
                        }))
                      }
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {sections.has("body_metrics") ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="bodyweight" optional>
                    Bodyweight (kg)
                  </Label>
                  <Input
                    id="bodyweight"
                    type="number"
                    inputMode="decimal"
                    min={1}
                    step="0.1"
                    placeholder="e.g. 82.5"
                    value={draft.bodyweightKg ?? ""}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        bodyweightKg: event.target.value
                          ? Number(event.target.value)
                          : null,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="height" optional>
                    Height (cm)
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    inputMode="decimal"
                    min={1}
                    step="0.1"
                    placeholder="e.g. 178"
                    value={draft.heightCm ?? ""}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        heightCm: event.target.value
                          ? Number(event.target.value)
                          : null,
                      }))
                    }
                  />
                </div>
              </div>
            ) : null}

            {sections.has("lifts") ? (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-[var(--color-foreground)]">
                  Current PRs (kg)
                </h2>
                <p className="text-xs text-[var(--color-muted)]">
                  Self-reported estimates only. Leave blank to skip.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {lifts.map((lift) => (
                    <div key={lift.id}>
                      <Label htmlFor={`lift-${lift.id}`} optional>
                        {lift.label}
                      </Label>
                      <Input
                        id={`lift-${lift.id}`}
                        type="number"
                        inputMode="decimal"
                        min={1}
                        step="0.5"
                        placeholder="Skip"
                        value={draft.lifts[lift.id as MajorLiftId] ?? ""}
                        onChange={(event) =>
                          setDraft((prev) => ({
                            ...prev,
                            lifts: {
                              ...prev.lifts,
                              [lift.id]: event.target.value
                                ? Number(event.target.value)
                                : null,
                            },
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {sections.has("competition_date") ? (
              <div>
                <Label htmlFor="competition-date" optional>
                  Competition date
                </Label>
                <Input
                  id="competition-date"
                  type="date"
                  value={draft.competitionDate ?? ""}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      competitionDate: event.target.value || null,
                    }))
                  }
                />
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  Optional. Creates a competition prep entry — no invented
                  openers.
                </p>
              </div>
            ) : null}

            {sections.has("current_program") ? (
              <div>
                <Label htmlFor="current-program" optional>
                  Current program
                </Label>
                <Textarea
                  id="current-program"
                  placeholder="Optional — e.g. Sheiko 4-day, custom peak…"
                  value={draft.currentProgramNote ?? ""}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      currentProgramNote: event.target.value,
                    }))
                  }
                />
              </div>
            ) : null}

            {sections.has("history") ? (
              <div>
                <Label htmlFor="history" optional>
                  Recent training (short)
                </Label>
                <Textarea
                  id="history"
                  placeholder="Optional — recent block notes…"
                  value={draft.recentHistory ?? ""}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      recentHistory: event.target.value,
                    }))
                  }
                />
              </div>
            ) : null}

            {sections.has("recovery") ? (
              <div>
                <Label htmlFor="recovery" optional>
                  Recovery habits
                </Label>
                <Textarea
                  id="recovery"
                  placeholder="Optional — sleep, walks, etc."
                  value={draft.recoveryHabits ?? ""}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      recoveryHabits: event.target.value,
                    }))
                  }
                />
              </div>
            ) : null}
          </div>
        ) : null}

        {step.id === "caution" ? (
          <div className="space-y-4">
            <Alert tone="warning" title="Pain and injury caution">
              TheStrongestManager does not diagnose injuries or disease. If you
              have pain or a suspected injury, consider consulting a qualified
              clinician. Optional notes stay brief — never a medical history.
            </Alert>
            <Checkbox
              id="pain-ack"
              name="pain-ack"
              label="I understand this is not medical advice"
              checked={draft.painCautionAcknowledged}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  painCautionAcknowledged: event.target.checked,
                }))
              }
            />
            {draft.pathId !== "coach" ? (
              <div>
                <Label htmlFor="movement-notes" optional>
                  Areas to treat carefully
                </Label>
                <Textarea
                  id="movement-notes"
                  placeholder="Skip if none."
                  value={draft.movementNotes ?? ""}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      movementNotes: event.target.value,
                    }))
                  }
                />
              </div>
            ) : null}
          </div>
        ) : null}

        {step.id === "building" ? (
          <div className="ui-panel px-5 py-8">
            <p className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
              {draft.pathId === "coach"
                ? "Enabling Coach Mode"
                : "Building your athlete profile"}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
              Saving only what you provided — nothing invented.
            </p>
            {(pendingBuild || !actionState.error) && !actionState.ok ? (
              <p className="mt-6 text-sm text-[var(--color-accent)]" role="status">
                Saving your profile…
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      {localError || actionState.error ? (
        <div className="mt-6">
          <Alert tone="danger" title="Could not continue" role="alert">
            {localError ?? actionState.error}
          </Alert>
        </div>
      ) : null}

      <form id="onboarding-submit-form" action={formAction} className="hidden">
        <input type="hidden" name="payload" value={payload} />
      </form>

      {step.id !== "building" ? (
        <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={goBack}
            disabled={safeIndex === 0}
          >
            Back
          </Button>
          <div className="flex flex-col gap-3 sm:flex-row">
            {step.id === "details" ? (
              <Button
                type="button"
                variant="secondary"
                onClick={skipOptionalDetails}
              >
                Skip optional details
              </Button>
            ) : null}
            {step.id === "caution" ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => finishOnboarding(true)}
              >
                Skip note & finish
              </Button>
            ) : null}
            <Button type="button" onClick={goNext}>
              {step.id === "caution" ? "Finish setup" : "Continue"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function pathIdHint(pathId: OnboardingPathId | null): string {
  if (pathId === "beginner") {
    return "Keep it simple — frequency and equipment only. Skip anything you do not want to share.";
  }
  if (
    pathId === "experienced" ||
    pathId === "powerlifter" ||
    pathId === "strongman"
  ) {
    return "Advanced options (PRs, competition date, current program) are optional — skip freely.";
  }
  if (pathId === "bodybuilder") {
    return "Schedule, equipment, and current program when useful — no irrelevant meet or SBD grid.";
  }
  return "Skip anything you do not want to share. You can fill gaps later in Profile.";
}
