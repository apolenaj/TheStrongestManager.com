"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Alert, Badge, Button, Input, Label } from "@/design-system";
import {
  CREATOR_CAPABILITIES,
  CREATOR_CAPABILITY_LABELS,
} from "@/domain/creator-program";
import {
  applyCreatorProgramAction,
  type CreatorActionState,
} from "@/services/creator-program/actions";
import type { CreatorProgramView } from "@/services/creator-program";

const initial: CreatorActionState = { ok: false };

export function CreatorHubPanel({ view }: { view: CreatorProgramView }) {
  const [state, action, pending] = useActionState(
    applyCreatorProgramAction,
    initial,
  );

  return (
    <div className="grid gap-8">
      <Alert tone="warning" title="Partnership is not implied">
        {view.honesty[0]} {view.honesty[1]}
      </Alert>

      {view.application ? (
        <>
          <section className="grid gap-3">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
              {view.isApprovedPartner
                ? "Creator partnership"
                : "Creator application"}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">
                {view.application.displayName}
              </span>
              <Badge
                variant={view.isApprovedPartner ? "success" : "neutral"}
              >
                {view.application.roleLabel}
              </Badge>
              <Badge variant="accent">{view.application.statusLabel}</Badge>
            </div>
            {view.application.handle ? (
              <p className="text-sm text-[var(--color-muted)]">
                Handle: {view.application.handle}
              </p>
            ) : null}
            {!view.isApprovedPartner ? (
              <Alert tone="info" title="Not a partner yet">
                {view.noPartnershipPromise} Status:{" "}
                {view.application.statusLabel}.
              </Alert>
            ) : null}
          </section>

          <section className="grid gap-3">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
              Capabilities
            </h2>
            <p className="text-sm text-[var(--color-muted)]">
              {view.isApprovedPartner
                ? "Approved capabilities are unlocked below."
                : "Capabilities stay locked until staff approve this application."}
            </p>
            <ul className="grid gap-3">
              {view.capabilities.map((cap) => (
                <li
                  key={cap.id}
                  className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{cap.label}</span>
                    <Badge variant={cap.unlocked ? "success" : "neutral"}>
                      {cap.unlocked ? "Unlocked" : "Locked"}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    {cap.description}
                  </p>
                  {cap.unlocked && cap.href ? (
                    <p className="mt-2 text-sm">
                      <Link
                        href={cap.href}
                        className="text-[var(--color-accent)] underline-offset-2 hover:underline"
                      >
                        Open →
                      </Link>
                      {cap.secondaryHref ? (
                        <>
                          {" · "}
                          <Link
                            href={cap.secondaryHref}
                            className="text-[var(--color-accent)] underline-offset-2 hover:underline"
                          >
                            Related →
                          </Link>
                        </>
                      ) : null}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : (
        <section className="grid gap-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
            Apply to the Creator Program
          </h2>
          <p className="text-sm text-[var(--color-muted)]">
            Submit an application. Approval is required before any creator
            partnership is implied. Applying alone grants no capabilities.
          </p>
          {state.error ? (
            <Alert tone="danger" title="Could not apply">
              {state.error}
            </Alert>
          ) : null}
          {state.message ? (
            <Alert tone="success" title="Application received">
              {state.message}
            </Alert>
          ) : null}
          <form action={action} className="grid max-w-lg gap-4">
            <div>
              <Label htmlFor="displayName">Display name</Label>
              <Input
                id="displayName"
                name="displayName"
                required
                maxLength={80}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="handle">Handle (optional)</Label>
              <Input
                id="handle"
                name="handle"
                maxLength={48}
                className="mt-1"
              />
            </div>
            <fieldset className="grid gap-2">
              <legend className="text-sm font-medium">
                Capabilities of interest
              </legend>
              {CREATOR_CAPABILITIES.map((cap) => (
                <label key={cap} className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    name={`cap_${cap}`}
                    value="true"
                    defaultChecked
                    className="mt-1"
                  />
                  <span>{CREATOR_CAPABILITY_LABELS[cap]}</span>
                </label>
              ))}
            </fieldset>
            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                maxLength={2000}
                className="mt-1 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-transparent px-3 py-2 text-sm"
              />
            </div>
            <Button type="submit" loading={pending}>
              Submit application
            </Button>
          </form>
        </section>
      )}

      <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
        {view.honesty.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}
