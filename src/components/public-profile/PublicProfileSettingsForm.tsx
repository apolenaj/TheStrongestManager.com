"use client";

import { useActionState } from "react";
import Link from "next/link";
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
import {
  PUBLIC_PROFILE_FIELD_OPTIONS,
  type PublicProfileVisibility,
} from "@/domain/public-profile";
import {
  savePublicProfileAction,
  type PublicProfileActionState,
} from "@/services/public-profile/actions";
import type { PublicProfileSettingsView } from "@/services/public-profile";

const initial: PublicProfileActionState = { ok: false };

export function PublicProfileSettingsForm({
  settings,
}: {
  settings: PublicProfileSettingsView;
}) {
  const [state, action, pending] = useActionState(
    savePublicProfileAction,
    initial,
  );

  const visibility: PublicProfileVisibility = settings.visibility;
  const publicPath = state.publicPath ?? settings.publicPath;

  return (
    <Card elevated>
      <CardHeader>
        <div className="flex flex-wrap gap-2">
          <Badge variant={settings.isPublic ? "accent" : "neutral"}>
            {settings.isPublic ? "Public" : "Private (default)"}
          </Badge>
        </div>
        <CardTitle className="mt-2 text-xl tracking-tight">
          Public athlete profile
        </CardTitle>
        <CardDescription>
          Profiles are private by default. Enable only what you want strangers to
          see. Recovery data and private notes are never exposed.
        </CardDescription>
      </CardHeader>

      <form action={action} className="grid max-w-xl gap-5">
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="isPublic"
            defaultChecked={settings.isPublic}
            className="mt-1 accent-[var(--color-accent)]"
          />
          <span>
            <span className="font-medium">Enable public profile</span>
            <span className="mt-0.5 block text-xs text-[var(--color-muted)]">
              When off, /u/your-slug returns not found.
            </span>
          </span>
        </label>

        <div className="grid gap-2">
          <Label htmlFor="public-slug">Public slug</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--color-muted)]">/u/</span>
            <Input
              id="public-slug"
              name="slug"
              defaultValue={settings.slug ?? ""}
              placeholder="your-name"
              pattern="[a-zA-Z0-9-]{3,32}"
              maxLength={32}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="public-bio">Public bio (optional)</Label>
          <Input
            id="public-bio"
            name="bio"
            defaultValue={settings.bio ?? ""}
            maxLength={280}
            placeholder="Powerlifter · deadlift focused"
          />
        </div>

        <fieldset className="grid gap-2">
          <legend className="text-sm font-medium">Public fields</legend>
          <p className="text-xs text-[var(--color-muted)]">
            Body metrics stay off unless you check them. Recovery and private
            notes cannot be selected.
          </p>
          <ul className="grid gap-2">
            {PUBLIC_PROFILE_FIELD_OPTIONS.map((opt) => (
              <li key={opt.id}>
                <label className="flex cursor-pointer items-start gap-3 rounded-md border border-[var(--color-border)] px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    name={`vis_${opt.id}`}
                    defaultChecked={visibility[opt.id]}
                    className="mt-1 accent-[var(--color-accent)]"
                  />
                  <span>
                    <span className="font-medium">{opt.label}</span>
                    {!opt.defaultOn ? (
                      <Badge variant="neutral" className="ml-2">
                        Off by default
                      </Badge>
                    ) : null}
                    <span className="mt-0.5 block text-xs text-[var(--color-muted)]">
                      {opt.description}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>

        {state.error ? (
          <p className="text-sm text-[var(--color-danger)]">{state.error}</p>
        ) : null}
        {state.ok && state.message ? (
          <p className="text-sm text-[var(--color-muted)]">{state.message}</p>
        ) : null}
        {publicPath ? (
          <p className="text-sm text-[var(--color-muted)]">
            Live at{" "}
            <Link
              href={publicPath}
              className="text-[var(--color-accent)] underline-offset-2 hover:underline"
            >
              {publicPath}
            </Link>
          </p>
        ) : null}

        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save public profile"}
        </Button>
      </form>
    </Card>
  );
}
