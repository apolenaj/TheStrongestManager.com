"use client";

import { useActionState } from "react";
import {
  Badge,
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
} from "@/design-system";
import type { ExpertWorkspaceView } from "@/services/expert-contributor";
import {
  saveExpertArticleAction,
  saveExpertProfileAction,
  type ExpertActionState,
} from "@/services/expert-contributor/actions";

const initial: ExpertActionState = { ok: false };

export function ExpertContributorWorkspace({
  view,
}: {
  view: ExpertWorkspaceView;
}) {
  const [profileState, profileAction, profilePending] = useActionState(
    saveExpertProfileAction,
    initial,
  );
  const [articleState, articleAction, articlePending] = useActionState(
    saveExpertArticleAction,
    initial,
  );

  return (
    <div className="grid gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Roles (explicit)</CardTitle>
          <CardDescription>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {view.honesty.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </CardDescription>
        </CardHeader>
        <div className="flex flex-wrap gap-2">
          {view.roleLabels.length === 0 ? (
            <Badge variant="neutral">No contributor roles yet</Badge>
          ) : (
            view.roleLabels.map((label) => (
              <Badge key={label} variant="accent">
                {label}
              </Badge>
            ))
          )}
        </div>
      </Card>

      <Card elevated>
        <CardHeader>
          <CardTitle>Contributor profile</CardTitle>
          <CardDescription>
            Specialization, credentials, and experience. Expert status requires
            staff verification — never automatic.
          </CardDescription>
        </CardHeader>
        {view.profile ? (
          <p className="mb-4 text-sm text-[var(--color-muted)]">
            Status:{" "}
            <Badge
              variant={
                view.profile.verificationStatus === "verified"
                  ? "success"
                  : "warning"
              }
            >
              {view.profile.verificationLabel}
            </Badge>
            {view.profile.seoSlug ? (
              <>
                {" "}
                · Public: /experts/{view.profile.seoSlug}
              </>
            ) : null}
          </p>
        ) : null}
        <form action={profileAction} className="grid gap-3">
          <label className="grid gap-1 text-sm">
            <span className="text-[var(--color-muted)]">Display name</span>
            <input
              name="displayName"
              required
              defaultValue={view.profile?.displayName ?? ""}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-[var(--color-muted)]">Bio</span>
            <textarea
              name="bio"
              rows={3}
              defaultValue={view.profile?.bio ?? ""}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-[var(--color-muted)]">
              Specializations (comma-separated)
            </span>
            <input
              name="specializations"
              defaultValue={view.profile?.specializations.join(", ") ?? ""}
              placeholder="powerlifting, technique"
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-[var(--color-muted)]">Credentials</span>
            <textarea
              name="credentialsSummary"
              rows={2}
              defaultValue={view.profile?.credentialsSummary ?? ""}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-[var(--color-muted)]">Experience</span>
            <textarea
              name="experienceSummary"
              rows={2}
              defaultValue={view.profile?.experienceSummary ?? ""}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            />
          </label>
          {view.canApply ? (
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                name="submitForReview"
                className="mt-1 accent-[var(--color-accent)]"
              />
              <span>Submit for Expert Contributor verification</span>
            </label>
          ) : (
            <p className="text-xs text-[var(--color-muted)]">
              Application not open for re-submit in current status (or already
              verified).
            </p>
          )}
          <Button type="submit" disabled={profilePending}>
            {profilePending ? "Saving…" : "Save profile"}
          </Button>
          {profileState.error ? (
            <p className="text-sm text-[var(--color-score-critical)]">
              {profileState.error}
            </p>
          ) : null}
          {profileState.message ? (
            <p className="text-sm text-[var(--color-score-excellent)]">
              {profileState.message}
            </p>
          ) : null}
        </form>
      </Card>

      <Card elevated>
        <CardHeader>
          <CardTitle>Expert article</CardTitle>
          <CardDescription>
            Publish only when verified. SEO uses Person author schema for
            verified contributors.
          </CardDescription>
        </CardHeader>
        {!view.canPublish ? (
          <p className="mb-4 text-sm text-[var(--color-muted)]">
            You can draft after applying; publishing requires verified Expert
            Contributor status.
          </p>
        ) : null}
        <form action={articleAction} className="grid gap-3">
          <label className="grid gap-1 text-sm">
            <span className="text-[var(--color-muted)]">Title</span>
            <input
              name="title"
              required
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-[var(--color-muted)]">Description</span>
            <input
              name="description"
              required
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-[var(--color-muted)]">Body</span>
            <textarea
              name="body"
              required
              rows={8}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            />
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              name="publish"
              disabled={!view.canPublish}
              className="mt-1 accent-[var(--color-accent)]"
            />
            <span>Publish (verified experts only)</span>
          </label>
          <Button type="submit" disabled={articlePending}>
            {articlePending ? "Saving…" : "Save article"}
          </Button>
          {articleState.error ? (
            <p className="text-sm text-[var(--color-score-critical)]">
              {articleState.error}
            </p>
          ) : null}
          {articleState.message ? (
            <p className="text-sm text-[var(--color-score-excellent)]">
              {articleState.message}
              {articleState.slug && view.profile?.seoSlug ? (
                <>
                  {" "}
                  · /experts/{view.profile.seoSlug}/articles/
                  {articleState.slug}
                </>
              ) : null}
            </p>
          ) : null}
        </form>
      </Card>

      {view.articles.length === 0 ? (
        <EmptyState
          title="No articles yet"
          description="Draft or publish expert-written articles once verified."
        />
      ) : (
        <ul className="grid gap-2">
          {view.articles.map((a) => (
            <li key={a.id}>
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="neutral">{a.status}</Badge>
                  </div>
                  <CardTitle className="mt-1 text-base">{a.title}</CardTitle>
                  <CardDescription>{a.slug}</CardDescription>
                </CardHeader>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
