"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  Alert,
  Button,
  Input,
  Label,
  Select,
  Textarea,
} from "@/design-system";
import type { ProfileActionState } from "@/services/athlete-profile/actions";
import type { AthleteProfileView } from "@/services/athlete-profile/profile-service";
import {
  EQUIPMENT_OPTIONS,
  EXPERIENCE_LEVELS,
  PRIMARY_GOALS,
  SPORTS,
} from "@/services/onboarding/options";
import { lengthUnitFor } from "@/services/units/convert";
import { COMMON_TIMEZONES, formatDateTimeInTimeZone } from "@/domain/timezone-system";
import {
  appendBodyMetricAction,
  appendPersonalRecordAction,
  updateEquipmentAction,
  updateGoalAction,
  updatePreferencesAction,
  updateRecoveryAction,
  updateSportFocusAction,
  updateTrainingAgeAction,
  updateTimezoneAction,
  updateUnitsAction,
} from "@/services/athlete-profile/actions";

const initial: ProfileActionState = { ok: false };

function ActionFeedback({ state }: { state: ProfileActionState }) {
  if (state.error) {
    return (
      <Alert tone="danger" title="Update failed" role="alert" className="mt-3">
        {state.error}
      </Alert>
    );
  }
  if (state.message) {
    return (
      <Alert tone="success" title="Saved" className="mt-3">
        {state.message}
      </Alert>
    );
  }
  return null;
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-[var(--color-border)] pt-6">
      <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight">
        {title}
      </h2>
      <p className="mt-1 text-sm text-[var(--color-muted)]">{description}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function AthleteProfileEditor({
  profile,
}: {
  profile: AthleteProfileView;
}) {
  const [unitsState, unitsAction, unitsPending] = useActionState(
    updateUnitsAction,
    initial,
  );
  const [timezoneState, timezoneAction, timezonePending] = useActionState(
    updateTimezoneAction,
    initial,
  );
  const [goalState, goalAction, goalPending] = useActionState(
    updateGoalAction,
    initial,
  );
  const [sportState, sportAction, sportPending] = useActionState(
    updateSportFocusAction,
    initial,
  );
  const [ageState, ageAction, agePending] = useActionState(
    updateTrainingAgeAction,
    initial,
  );
  const [prefState, prefAction, prefPending] = useActionState(
    updatePreferencesAction,
    initial,
  );
  const [equipState, equipAction, equipPending] = useActionState(
    updateEquipmentAction,
    initial,
  );
  const [recoveryState, recoveryAction, recoveryPending] = useActionState(
    updateRecoveryAction,
    initial,
  );
  const [bodyState, bodyAction, bodyPending] = useActionState(
    appendBodyMetricAction,
    initial,
  );
  const [heightState, heightAction, heightPending] = useActionState(
    appendBodyMetricAction,
    initial,
  );
  const [prState, prAction, prPending] = useActionState(
    appendPersonalRecordAction,
    initial,
  );

  const massUnit = profile.units;
  const lengthUnit = lengthUnitFor(massUnit);

  const matchedGoalId =
    PRIMARY_GOALS.find((goal) => goal.label === profile.goal?.title)?.id ?? "";

  return (
    <div className="space-y-10">
      <Section
        title="Unit preference"
        description="Mass, height, and distance displays follow your preference (kg/lb, cm or ft/in, m/km or ft/mi). Values are stored canonically (kg / cm / m) so history and calculations stay comparable."
      >
        <form action={unitsAction} className="flex flex-wrap items-end gap-3">
          <div>
            <Label htmlFor="units">Mass units</Label>
            <Select
              id="units"
              name="units"
              defaultValue={profile.units}
              className="min-w-[8rem]"
            >
              <option value="kg">kg</option>
              <option value="lb">lb</option>
            </Select>
          </div>
          <Button type="submit" loading={unitsPending}>
            Save units
          </Button>
        </form>
        <ActionFeedback state={unitsState} />
      </Section>

      <Section
        title="Timezone"
        description="Workout dates, competition countdowns, notifications, and coach messages use your local timezone. Values are stored in UTC."
      >
        <form action={timezoneAction} className="flex flex-wrap items-end gap-3">
          <div>
            <Label htmlFor="timezone">IANA timezone</Label>
            <Select
              id="timezone"
              name="timezone"
              defaultValue={profile.timezone}
              className="min-w-[16rem]"
            >
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </Select>
          </div>
          <Button type="submit" loading={timezonePending}>
            Save timezone
          </Button>
        </form>
        <ActionFeedback state={timezoneState} />
      </Section>

      <Section
        title="Goals"
        description="Your active primary goal. Changing it updates the active goal record."
      >
        <form action={goalAction} className="flex flex-wrap items-end gap-3">
          <div className="min-w-[16rem] flex-1">
            <Label htmlFor="goalId">Primary goal</Label>
            <Select id="goalId" name="goalId" defaultValue={matchedGoalId}>
              <option value="" disabled>
                Select a goal
              </option>
              {PRIMARY_GOALS.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.label}
                </option>
              ))}
            </Select>
          </div>
          <Button type="submit" loading={goalPending}>
            Save goal
          </Button>
        </form>
        {profile.goal ? (
          <p className="mt-3 text-sm text-[var(--color-muted)]">
            Current: {profile.goal.title} ({profile.goal.category})
          </p>
        ) : (
          <p className="mt-3 text-sm text-[var(--color-muted)]">No active goal yet.</p>
        )}
        <ActionFeedback state={goalState} />
      </Section>

      <Section
        title="Sport focus"
        description="Select one or more active focuses (e.g. Powerlifting + Strongman). One AthleteProfile only — PRs stay separated by sport."
      >
        <form action={sportAction} className="space-y-4">
          <div>
            <Label htmlFor="primaryDiscipline">Lead discipline</Label>
            <Select
              id="primaryDiscipline"
              name="primaryDiscipline"
              defaultValue={profile.primaryDiscipline ?? "general"}
            >
              {[
                "powerlifting",
                "bodybuilding",
                "strongman",
                "weightlifting",
                "general",
                "hybrid",
                "coach",
              ].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              Lead label for scoring when multiple sports are selected. Use
              hybrid if none leads.
            </p>
          </div>
          <fieldset>
            <legend className="mb-2 text-sm font-medium">
              Active sport focuses
            </legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {SPORTS.map((sport) => (
                <label
                  key={sport.id}
                  className="flex items-center gap-2 text-sm text-[var(--color-foreground)]"
                >
                  <input
                    type="checkbox"
                    name="sports"
                    value={sport.id}
                    defaultChecked={profile.sports.includes(sport.id)}
                    className="accent-[var(--color-accent)]"
                  />
                  {sport.label}
                </label>
              ))}
            </div>
          </fieldset>
          <Button type="submit" loading={sportPending}>
            Save sport focuses
          </Button>
        </form>
        <ActionFeedback state={sportState} />
      </Section>

      <Section
        title="Training age"
        description="Experience level and years of training."
      >
        <form action={ageAction} className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="level">Experience level</Label>
            <Select
              id="level"
              name="level"
              defaultValue={profile.experience.level ?? ""}
            >
              <option value="">Not set</option>
              {EXPERIENCE_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="yearsTraining" optional>
              Years training
            </Label>
            <Input
              id="yearsTraining"
              name="yearsTraining"
              type="number"
              min={0}
              step="0.5"
              defaultValue={profile.experience.yearsTraining ?? ""}
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" loading={agePending}>
              Save training age
            </Button>
          </div>
        </form>
        <ActionFeedback state={ageState} />
      </Section>

      <Section
        title="Current performance"
        description="Most recently logged lift values in your preferred units. Best PRs are listed under Personal records."
      >
        <ul className="grid gap-3 sm:grid-cols-2">
          {profile.lifts.map((lift) => (
            <li
              key={lift.liftId}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-3"
            >
              <p className="text-sm text-[var(--color-muted)]">{lift.label}</p>
              <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold">
                {lift.current
                  ? `${lift.current.displayValue} ${lift.current.displayUnit}`
                  : "—"}
              </p>
              {lift.current ? (
                <p className="mt-1 text-xs text-[var(--color-subtle)]">
                  Logged {lift.current.recordedAt.toLocaleDateString()}
                  {lift.current.isBest ? " · current best" : ""}
                </p>
              ) : (
                <p className="mt-1 text-xs text-[var(--color-subtle)]">
                  No lifts logged yet
                </p>
              )}
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="Body metrics"
        description="Each save appends a new snapshot. Older measurements stay in history."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-sm text-[var(--color-muted)]">
              Bodyweight now: {profile.bodyweight?.display ?? "—"}
            </p>
            <form action={bodyAction} className="mt-3 flex flex-wrap items-end gap-2">
              <input type="hidden" name="metricKey" value="bodyweight" />
              <div>
                <Label htmlFor="bodyweight">New bodyweight ({massUnit})</Label>
                <Input
                  id="bodyweight"
                  name="value"
                  type="number"
                  step="0.1"
                  min={1}
                  placeholder={String(profile.bodyweight?.displayValue ?? "")}
                  required
                />
              </div>
              <Button type="submit" loading={bodyPending}>
                Add entry
              </Button>
            </form>
            <ActionFeedback state={bodyState} />
          </div>
          <div>
            <p className="text-sm text-[var(--color-muted)]">
              Height now: {profile.height?.display ?? "—"}
            </p>
            <form action={heightAction} className="mt-3 flex flex-wrap items-end gap-2">
              <input type="hidden" name="metricKey" value="height" />
              <div>
                <Label htmlFor="height">
                  New height (
                  {massUnit === "lb" ? "ft/in e.g. 5'10" : lengthUnit})
                </Label>
                <Input
                  id="height"
                  name="value"
                  type={massUnit === "lb" ? "text" : "number"}
                  step={massUnit === "lb" ? undefined : "0.1"}
                  min={massUnit === "lb" ? undefined : 1}
                  placeholder={
                    massUnit === "lb"
                      ? "5'10"
                      : String(profile.height?.displayValue ?? "")
                  }
                  required
                />
              </div>
              <Button type="submit" loading={heightPending}>
                Add entry
              </Button>
            </form>
            <ActionFeedback state={heightState} />
          </div>
        </div>
      </Section>

      <Section
        title="Training preferences"
        description="Frequency, session length, coaching context, and recent history notes."
      >
        <form action={prefAction} className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="daysPerWeek" optional>
              Days per week
            </Label>
            <Input
              id="daysPerWeek"
              name="daysPerWeek"
              type="number"
              min={1}
              max={7}
              defaultValue={profile.experience.daysPerWeek ?? ""}
            />
          </div>
          <div>
            <Label htmlFor="sessionLengthMinutes" optional>
              Session length (minutes)
            </Label>
            <Input
              id="sessionLengthMinutes"
              name="sessionLengthMinutes"
              type="number"
              min={1}
              defaultValue={profile.experience.sessionLengthMinutes ?? ""}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="coachingStatus" optional>
              Coaching status
            </Label>
            <Select
              id="coachingStatus"
              name="coachingStatus"
              defaultValue={profile.experience.coachingStatus ?? ""}
            >
              <option value="">Not set</option>
              <option value="self">Self-coached</option>
              <option value="coached">Coached</option>
              <option value="mixed">Mixed</option>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="recentHistory" optional>
              Recent training history
            </Label>
            <Textarea
              id="recentHistory"
              name="recentHistory"
              defaultValue={profile.experience.recentHistory ?? ""}
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" loading={prefPending}>
              Save preferences
            </Button>
          </div>
        </form>
        <ActionFeedback state={prefState} />
      </Section>

      <Section
        title="Equipment"
        description="What you can usually access for programming realism."
      >
        <p className="mb-3 text-sm text-[var(--color-muted)]">
          Prefer presets?{" "}
          <Link
            href="/app/equipment-profiles"
            className="text-[var(--color-accent)] underline-offset-2 hover:underline"
          >
            Equipment profiles
          </Link>{" "}
          (commercial, home, powerlifting, minimal).
        </p>
        <form action={equipAction} className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2">
            {EQUIPMENT_OPTIONS.map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-2 text-sm text-[var(--color-foreground)]"
              >
                <input
                  type="checkbox"
                  name="equipment"
                  value={item.id}
                  defaultChecked={profile.experience.equipment.includes(item.id)}
                  className="accent-[var(--color-accent)]"
                />
                {item.label}
              </label>
            ))}
          </div>
          <Button type="submit" loading={equipPending}>
            Save equipment
          </Button>
        </form>
        <ActionFeedback state={equipState} />
      </Section>

      <Section
        title="Recovery habits"
        description="Habits only — not a medical record. Optional movement cautions stay non-diagnostic."
      >
        <form action={recoveryAction} className="space-y-4">
          <div>
            <Label htmlFor="recoveryHabits" optional>
              Recovery habits
            </Label>
            <Textarea
              id="recoveryHabits"
              name="recoveryHabits"
              defaultValue={profile.experience.recoveryHabits ?? ""}
            />
          </div>
          <div>
            <Label htmlFor="movementNotes" optional>
              Movement cautions
            </Label>
            <Textarea
              id="movementNotes"
              name="movementNotes"
              defaultValue={profile.movementNotes ?? ""}
            />
          </div>
          <Button type="submit" loading={recoveryPending}>
            Save recovery
          </Button>
        </form>
        <ActionFeedback state={recoveryState} />
      </Section>

      <Section
        title="Personal records"
        description="Logging a lift always adds a new historical entry. Previous PRs are never overwritten. Optional reps (2–12) enable an Estimated 1RM — never labeled as a verified PR."
      >
        <form action={prAction} className="mb-6 flex flex-wrap items-end gap-3">
          <div>
            <Label htmlFor="liftId">Lift</Label>
            <Select id="liftId" name="liftId" defaultValue="squat">
              {profile.lifts.map((lift) => (
                <option key={lift.liftId} value={lift.liftId}>
                  {lift.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="pr-value">Load ({massUnit})</Label>
            <Input
              id="pr-value"
              name="value"
              type="number"
              min={1}
              step="0.5"
              required
            />
          </div>
          <div>
            <Label htmlFor="pr-reps">Reps (optional)</Label>
            <Input
              id="pr-reps"
              name="reps"
              type="number"
              min={1}
              max={12}
              step={1}
              placeholder="1"
            />
          </div>
          <Button type="submit" loading={prPending}>
            Log PR / lift
          </Button>
        </form>
        <ActionFeedback state={prState} />

        <div className="space-y-6">
          {profile.lifts.map((lift) => (
            <div key={lift.liftId}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-medium text-[var(--color-foreground)]">
                  {lift.label}
                </h3>
                <p className="text-sm text-[var(--color-muted)]">
                  Best:{" "}
                  {lift.best
                    ? `${lift.best.displayValue} ${lift.best.displayUnit}`
                    : "—"}
                </p>
              </div>
              {lift.history.length === 0 ? (
                <p className="mt-2 text-sm text-[var(--color-subtle)]">
                  No history yet.
                </p>
              ) : (
                <ul className="mt-2 divide-y divide-[var(--color-border)] border border-[var(--color-border)]">
                  {lift.history.map((entry) => (
                    <li
                      key={entry.id}
                      className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                    >
                      <span>
                        {entry.displayValue} {entry.displayUnit}
                        {entry.isBest ? (
                          <span className="ml-2 text-[var(--color-accent)]">
                            PR
                          </span>
                        ) : null}
                      </span>
                      <span className="text-[var(--color-subtle)]">
                        {formatDateTimeInTimeZone(entry.recordedAt, profile.timezone)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
