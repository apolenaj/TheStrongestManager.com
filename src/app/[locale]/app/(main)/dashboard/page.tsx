import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { CommandCenter } from "@/components/command-center/CommandCenter";
import { featureFlags } from "@/config/feature-flags";
import { requireSession } from "@/services/auth/session";
import { getPerformanceDashboard } from "@/services/dashboard/dashboard-service";
import { getAthleteState } from "@/services/performance-intelligence";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Dashboard");
  return {
    title: t("meta.title"),
    robots: { index: false, follow: false },
  };
}

/**
 * Authenticated athlete landing.
 * Session is enforced here (and again in `(main)/layout`) via `requireSession` —
 * unauthenticated visitors are redirected to `/login` before any dashboard data loads.
 */
export default async function DashboardPage() {
  const session = await requireSession();
  const t = await getTranslations("Dashboard");

  const [dashboard, athleteState] = await Promise.all([
    getPerformanceDashboard(session.user.id),
    getAthleteState(session.user.id),
  ]);

  const email = session.user.email ?? null;
  const displayName =
    dashboard?.greetingName?.trim() ||
    email?.split("@")[0] ||
    t("athleteFallback");

  const useCommandCenter = featureFlags.commandCenter && Boolean(dashboard);

  return (
    <div className="space-y-12">
      <DashboardHome
        email={email}
        displayName={displayName}
        dashboard={dashboard}
      />

      {useCommandCenter && dashboard ? (
        <section className="border-t border-zinc-800 pt-10">
          <CommandCenter data={dashboard} athleteState={athleteState} />
        </section>
      ) : null}
    </div>
  );
}
