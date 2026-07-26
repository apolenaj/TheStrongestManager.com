"use client";

import { useActionState } from "react";
import {
  Badge,
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "@/design-system";
import { LEADERBOARD_CATEGORY_OPTIONS } from "@/domain/leaderboard";
import {
  saveLeaderboardOptInAction,
  type LeaderboardOptInActionState,
} from "@/services/leaderboard/actions";
import type { LeaderboardOptInView } from "@/services/leaderboard";

const initial: LeaderboardOptInActionState = { ok: false };

export function LeaderboardOptInForm({
  settings,
}: {
  settings: LeaderboardOptInView;
}) {
  const [state, action, pending] = useActionState(
    saveLeaderboardOptInAction,
    initial,
  );

  return (
    <Card>
      <CardHeader>
        <Badge variant={settings.optedIn ? "accent" : "neutral"}>
          {settings.optedIn ? "Opted in" : "Not participating (default)"}
        </Badge>
        <CardTitle className="mt-2 text-lg tracking-tight">
          Leaderboard opt-in
        </CardTitle>
        <CardDescription>
          Off by default. Only opted-in athletes appear. We never invent ranks or
          rank recovery / weight loss.
        </CardDescription>
      </CardHeader>

      <form action={action} className="grid max-w-xl gap-4">
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="optedIn"
            defaultChecked={settings.optedIn}
            className="mt-1 accent-[var(--color-accent)]"
          />
          <span>
            <span className="font-medium">Appear on leaderboards</span>
            <span className="mt-0.5 block text-xs text-[var(--color-muted)]">
              You choose categories and filters below.
            </span>
          </span>
        </label>

        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="showDisplayName"
            defaultChecked={settings.showDisplayName}
            className="mt-1 accent-[var(--color-accent)]"
          />
          <span className="font-medium">Show my display name</span>
        </label>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="lb-country">Country (ISO)</Label>
            <Input
              id="lb-country"
              name="countryCode"
              defaultValue={settings.countryCode ?? ""}
              placeholder="US"
              maxLength={2}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lb-sport">Sport</Label>
            <Input
              id="lb-sport"
              name="sport"
              defaultValue={settings.sport ?? ""}
              placeholder="powerlifting"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lb-class-label">Weight class label</Label>
            <Input
              id="lb-class-label"
              name="bodyweightClassLabel"
              defaultValue={settings.bodyweightClassLabel ?? ""}
              placeholder="83 kg"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lb-class-kg">Class limit (kg)</Label>
            <Input
              id="lb-class-kg"
              name="bodyweightClassMaxKg"
              type="number"
              step="0.1"
              defaultValue={settings.bodyweightClassMaxKg ?? ""}
              placeholder="83"
            />
          </div>
        </div>

        <fieldset className="grid gap-2">
          <legend className="text-sm font-medium">Categories</legend>
          {LEADERBOARD_CATEGORY_OPTIONS.map((opt) => (
            <label
              key={opt.id}
              className="flex items-start gap-3 rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
            >
              <input
                type="checkbox"
                name={`cat_${opt.id}`}
                defaultChecked={settings.categories[opt.id]}
                className="mt-1 accent-[var(--color-accent)]"
              />
              <span>
                <span className="font-medium">{opt.label}</span>
                <span className="mt-0.5 block text-xs text-[var(--color-muted)]">
                  {opt.description}
                </span>
              </span>
            </label>
          ))}
        </fieldset>

        {state.error ? (
          <p className="text-sm text-[var(--color-danger)]">{state.error}</p>
        ) : null}
        {state.ok && state.message ? (
          <p className="text-sm text-[var(--color-muted)]">{state.message}</p>
        ) : null}

        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save opt-in"}
        </Button>
      </form>
    </Card>
  );
}
