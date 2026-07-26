"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Alert, Badge, Button, Input, Label } from "@/design-system";
import {
  PROGRAM_MARKETPLACE_COPYRIGHT_PROTECTION,
  PROGRAM_MARKETPLACE_DIFFICULTIES,
  PROGRAM_MARKETPLACE_DIFFICULTY_LABELS,
  PROGRAM_MARKETPLACE_DURATIONS_WEEKS,
  PROGRAM_MARKETPLACE_EQUIPMENT,
  PROGRAM_MARKETPLACE_EQUIPMENT_LABELS,
  PROGRAM_MARKETPLACE_GOALS,
  PROGRAM_MARKETPLACE_GOAL_LABELS,
  PROGRAM_MARKETPLACE_HONESTY,
  PROGRAM_MARKETPLACE_SPORTS,
  PROGRAM_MARKETPLACE_SPORT_LABELS,
} from "@/domain/program-marketplace";
import type { ProgramListingCard } from "@/services/program-marketplace";
import {
  submitProgramListingAction,
  type ProgramMarketplaceActionState,
} from "@/services/program-marketplace/actions";

const initial: ProgramMarketplaceActionState = { ok: false };

export function ProgramCreatorPublishPanel({
  listings,
  canPublish,
}: {
  listings: ProgramListingCard[];
  canPublish: boolean;
}) {
  const [state, action, pending] = useActionState(
    submitProgramListingAction,
    initial,
  );

  return (
    <div className="grid gap-8">
      <Alert tone="warning" title="Copyright protection">
        {PROGRAM_MARKETPLACE_COPYRIGHT_PROTECTION[0]}{" "}
        {PROGRAM_MARKETPLACE_COPYRIGHT_PROTECTION[1]}
      </Alert>

      {!canPublish ? (
        <Alert tone="info" title="Creator approval required">
          Publishing requires an approved Creator Program capability for
          publish programs.{" "}
          <Link
            href="/app/creator"
            className="underline underline-offset-2"
          >
            Apply / check status
          </Link>
          .
        </Alert>
      ) : (
        <section className="grid gap-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
            Submit a program listing
          </h2>
          <p className="text-sm text-[var(--color-muted)]">
            Listings go to copyright review first — not live until staff
            publish.
          </p>
          {state.error ? (
            <Alert tone="danger" title="Could not submit">
              {state.error}
            </Alert>
          ) : null}
          {state.message ? (
            <Alert tone="success" title="Submitted">
              {state.message}
            </Alert>
          ) : null}
          <form action={action} className="grid max-w-xl gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required maxLength={120} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="preview">Preview</Label>
              <textarea
                id="preview"
                name="preview"
                required
                minLength={20}
                maxLength={2000}
                rows={5}
                className="mt-1 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-transparent px-3 py-2 text-sm"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="sport">Sport</Label>
                <select
                  id="sport"
                  name="sport"
                  required
                  defaultValue=""
                  className="mt-1 flex h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-transparent px-3 text-sm"
                >
                  <option value="" disabled>
                    Select
                  </option>
                  {PROGRAM_MARKETPLACE_SPORTS.map((s) => (
                    <option key={s} value={s}>
                      {PROGRAM_MARKETPLACE_SPORT_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="goal">Goal</Label>
                <select
                  id="goal"
                  name="goal"
                  required
                  defaultValue=""
                  className="mt-1 flex h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-transparent px-3 text-sm"
                >
                  <option value="" disabled>
                    Select
                  </option>
                  {PROGRAM_MARKETPLACE_GOALS.map((g) => (
                    <option key={g} value={g}>
                      {PROGRAM_MARKETPLACE_GOAL_LABELS[g]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="durationWeeks">Duration (weeks)</Label>
                <select
                  id="durationWeeks"
                  name="durationWeeks"
                  required
                  defaultValue="8"
                  className="mt-1 flex h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-transparent px-3 text-sm"
                >
                  {PROGRAM_MARKETPLACE_DURATIONS_WEEKS.map((w) => (
                    <option key={w} value={w}>
                      {w} weeks
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <select
                  id="difficulty"
                  name="difficulty"
                  required
                  defaultValue=""
                  className="mt-1 flex h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-transparent px-3 text-sm"
                >
                  <option value="" disabled>
                    Select
                  </option>
                  {PROGRAM_MARKETPLACE_DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>
                      {PROGRAM_MARKETPLACE_DIFFICULTY_LABELS[d]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <fieldset className="grid gap-2">
              <legend className="text-sm font-medium">Equipment</legend>
              {PROGRAM_MARKETPLACE_EQUIPMENT.map((eq) => (
                <label key={eq} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name={`eq_${eq}`} value="true" />
                  {PROGRAM_MARKETPLACE_EQUIPMENT_LABELS[eq]}
                </label>
              ))}
            </fieldset>
            <div>
              <Label htmlFor="priceDollars">Price (USD)</Label>
              <Input
                id="priceDollars"
                name="priceDollars"
                type="number"
                min={0}
                step="0.01"
                defaultValue="49"
                className="mt-1"
              />
            </div>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                name="copyrightAttested"
                value="true"
                required
                className="mt-1"
              />
              <span>
                I attest that I created this program or have rights to
                distribute it, and that it is not an unauthorized copyrighted
                commercial upload.
              </span>
            </label>
            <Button type="submit" loading={pending}>
              Submit for review
            </Button>
          </form>
        </section>
      )}

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Your listings
        </h2>
        {listings.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">
            No listings yet.
          </p>
        ) : (
          <ul className="grid gap-2">
            {listings.map((l) => (
              <li
                key={l.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2 text-sm"
              >
                <span>{l.title}</span>
                <Badge variant="neutral">{l.statusLabel}</Badge>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
        {PROGRAM_MARKETPLACE_HONESTY.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}
