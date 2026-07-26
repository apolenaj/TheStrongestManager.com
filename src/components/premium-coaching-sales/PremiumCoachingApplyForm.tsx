"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Alert, Button, Label } from "@/design-system";
import {
  PREMIUM_COACHING_AVAILABILITY,
  PREMIUM_COACHING_AVAILABILITY_LABELS,
  PREMIUM_COACHING_BUDGET_LABELS,
  PREMIUM_COACHING_BUDGET_RANGES,
  PREMIUM_COACHING_EXPERIENCE_LABELS,
  PREMIUM_COACHING_EXPERIENCE_LEVELS,
  PREMIUM_COACHING_GOAL_LABELS,
  PREMIUM_COACHING_GOALS,
  PREMIUM_COACHING_HONESTY,
  PREMIUM_COACHING_NO_ACCEPTANCE_PROMISE,
} from "@/domain/premium-coaching-sales";
import { submitPremiumCoachingApplicationAction } from "@/services/premium-coaching-sales/actions";

export function PremiumCoachingApplyForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  return (
    <div className="grid gap-6">
      <Alert tone="warning" title="Before you apply">
        {PREMIUM_COACHING_NO_ACCEPTANCE_PROMISE} {PREMIUM_COACHING_HONESTY[1]}
      </Alert>

      {error ? (
        <Alert tone="danger" title="Could not submit">
          {error}
        </Alert>
      ) : null}
      {success ? (
        <Alert tone="success" title="Application received">
          {success}
        </Alert>
      ) : null}

      <form
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          startTransition(async () => {
            const result = await submitPremiumCoachingApplicationAction(fd);
            if (!result.ok) {
              setError(result.error);
              setSuccess(null);
            } else {
              setError(null);
              setSuccess(result.message);
              router.push("/app/premium-coaching");
              router.refresh();
            }
          });
        }}
      >
        <div>
          <Label htmlFor="goal">Goal</Label>
          <select
            id="goal"
            name="goal"
            required
            className="mt-1 flex h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-transparent px-3 text-sm"
            defaultValue=""
          >
            <option value="" disabled>
              Select a goal
            </option>
            {PREMIUM_COACHING_GOALS.map((g) => (
              <option key={g} value={g}>
                {PREMIUM_COACHING_GOAL_LABELS[g]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="experienceLevel">Experience</Label>
          <select
            id="experienceLevel"
            name="experienceLevel"
            required
            className="mt-1 flex h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-transparent px-3 text-sm"
            defaultValue=""
          >
            <option value="" disabled>
              Select experience
            </option>
            {PREMIUM_COACHING_EXPERIENCE_LEVELS.map((x) => (
              <option key={x} value={x}>
                {PREMIUM_COACHING_EXPERIENCE_LABELS[x]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="budgetRange">Budget range</Label>
          <select
            id="budgetRange"
            name="budgetRange"
            required
            className="mt-1 flex h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-transparent px-3 text-sm"
            defaultValue=""
          >
            <option value="" disabled>
              Select a budget range
            </option>
            {PREMIUM_COACHING_BUDGET_RANGES.map((b) => (
              <option key={b} value={b}>
                {PREMIUM_COACHING_BUDGET_LABELS[b]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="availability">Availability</Label>
          <select
            id="availability"
            name="availability"
            required
            className="mt-1 flex h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-transparent px-3 text-sm"
            defaultValue=""
          >
            <option value="" disabled>
              Select availability
            </option>
            {PREMIUM_COACHING_AVAILABILITY.map((a) => (
              <option key={a} value={a}>
                {PREMIUM_COACHING_AVAILABILITY_LABELS[a]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="notes">Anything else? (optional)</Label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            maxLength={2000}
            className="mt-1 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-transparent px-3 py-2 text-sm"
            placeholder="Optional context for reviewers — not used in analytics."
          />
        </div>

        <Button type="submit" disabled={pending}>
          Submit application
        </Button>
      </form>
    </div>
  );
}
