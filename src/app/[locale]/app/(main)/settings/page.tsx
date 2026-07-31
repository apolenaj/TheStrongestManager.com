import type { Metadata } from "next";
import Link from "next/link";
import { AppPage } from "@/components/app/AppPage";
import { DeleteAccountForm } from "@/components/auth/DeleteAccountForm";
import { CoachAccessSettings } from "@/components/coach/CoachAccessSettings";
import { DataControlPanel } from "@/components/privacy/DataControlPanel";
import { CookiePreferencesPanel } from "@/components/gdpr/CookiePreferencesPanel";
import { featureFlags } from "@/config/feature-flags";
import {
  Button,
  ButtonLink,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system";
import { prisma } from "@/lib/db";
import { logoutAction } from "@/services/auth/actions";
import { requireSession } from "@/services/auth/session";
import {
  getUserRoles,
  listAthleteCoachGrants,
} from "@/services/coach/coach-service";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  const session = await requireSession();
  const [user, roles, grants] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, passwordHash: true },
    }),
    getUserRoles(session.user.id),
    listAthleteCoachGrants(session.user.id),
  ]);

  return (
    <AppPage
      eyebrow="Account"
      title="Settings"
      description="Manage authentication, data controls, roles, and coach access grants."
    >
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Athlete profile</CardTitle>
            <CardDescription>
              Goals, units, PRs, and training preferences live on your athlete
              profile — separate from account security.
            </CardDescription>
          </CardHeader>
          <ButtonLink href="/app/profile" variant="secondary">
            Open athlete profile
          </ButtonLink>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Push, email, and in-app channels plus frequency preferences.
            </CardDescription>
          </CardHeader>
          <ButtonLink href="/app/notifications" variant="secondary">
            Notification preferences
          </ButtonLink>
        </Card>

        {featureFlags.activityFeedMvp ? (
          <Card>
            <CardHeader>
              <CardTitle>Activity feed</CardTitle>
              <CardDescription>
                Optional milestones and which kinds appear — no endless
                engagement loops.
              </CardDescription>
            </CardHeader>
            <ButtonLink href="/app/activity-feed" variant="secondary">
              Activity feed visibility
            </ButtonLink>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Coach Mode & access</CardTitle>
            <CardDescription>
              Enable Coach Mode and grant/revoke coach access. Coaches never see
              recovery or detailed body data unless you opt in.
            </CardDescription>
          </CardHeader>
          <CoachAccessSettings
            roles={roles ?? { isAthlete: true, isCoach: false }}
            grants={grants}
          />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Signed in as {user?.email ?? session.user.email}
            </CardDescription>
          </CardHeader>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--color-muted)]">Email</dt>
              <dd className="text-[var(--color-foreground)]">
                {user?.email ?? "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--color-muted)]">Auth method</dt>
              <dd className="text-[var(--color-foreground)]">
                {user?.passwordHash ? "Email and password" : "Social provider"}
              </dd>
            </div>
          </dl>
          <form action={logoutAction} className="mt-6">
            <Button type="submit" variant="secondary">
              Log out
            </Button>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Consent preferences</CardTitle>
            <CardDescription>
              Separate choices for service use, expert review, and
              research/model improvement — no bundled consent.
            </CardDescription>
          </CardHeader>
          {featureFlags.modelImprovementConsent ? (
            <ButtonLink href="/app/settings/consent" variant="secondary">
              Manage consent
            </ButtonLink>
          ) : (
            <p className="text-xs text-[var(--color-muted)]">
              Consent dashboard ships behind NEXT_PUBLIC_FF_MODEL_IMPROVEMENT_CONSENT.
            </p>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacy & data controls</CardTitle>
            <CardDescription>
              Export your data, delete uploaded technique videos, or review draft
              legal pages. Individual videos can also be deleted from Technique.
            </CardDescription>
          </CardHeader>
          <DataControlPanel />
          {featureFlags.gdprReadiness ? (
            <div className="mt-8 space-y-3 border-t border-[var(--color-border)] pt-6">
              <h3 className="text-sm font-medium text-[var(--color-foreground)]">
                Cookie preferences
              </h3>
              <p className="text-xs text-[var(--color-muted)]">
                Essential cookies stay on. Optional functional and analytics
                cookies require your choice — draft policy for professional legal
                review.
              </p>
              <CookiePreferencesPanel />
            </div>
          ) : null}
          <p className="mt-4 text-xs text-[var(--color-muted)]">
            Draft policies (for professional legal review):{" "}
            <Link
              href="/privacy"
              className="text-[var(--color-accent)] underline-offset-4 hover:underline"
            >
              Privacy
            </Link>
            {" · "}
            <Link
              href="/terms"
              className="text-[var(--color-accent)] underline-offset-4 hover:underline"
            >
              Terms
            </Link>
            {featureFlags.gdprReadiness ? (
              <>
                {" · "}
                <Link
                  href="/cookies"
                  className="text-[var(--color-accent)] underline-offset-4 hover:underline"
                >
                  Cookies
                </Link>
              </>
            ) : null}
          </p>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delete account</CardTitle>
            <CardDescription>
              Permanently remove this authentication account, sessions, and
              private technique videos from storage.
            </CardDescription>
          </CardHeader>
          <DeleteAccountForm hasPassword={Boolean(user?.passwordHash)} />
        </Card>
      </div>
    </AppPage>
  );
}
