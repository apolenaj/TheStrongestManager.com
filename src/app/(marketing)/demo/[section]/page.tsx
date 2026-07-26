import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppPage } from "@/components/app/AppPage";
import {
  DemoBanner,
  DemoModeNav,
} from "@/components/demo/DemoChrome";
import {
  Badge,
  ButtonLink,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system";
import { DEMO_MODE_LABEL } from "@/domain/demo";
import {
  getDemoDashboard,
  isDemoModeEnabled,
} from "@/services/demo/demo-service";

const SECTION_COPY: Record<
  string,
  { title: string; body: string; navId: string }
> = {
  today: {
    title: "Example Today",
    body: "In a live account, Today shows the next planned session from your program. This Demo Mode page stays read-only so visitors never mutate production data.",
    navId: "today",
  },
  technique: {
    title: "Example technique",
    body: "Demo technique scores come from the example athlete only. Upload your own videos after signup — nothing here is copied onto a real profile.",
    navId: "technique",
  },
  progress: {
    title: "Example progress",
    body: "Charts and PRs on this walkthrough are demo statistics. New production accounts start without inherited history.",
    navId: "progress",
  },
  training: {
    title: "Example training",
    body: "Completed demo sessions illustrate consistency. Logging a real workout requires your own athlete profile.",
    navId: "training",
  },
  recovery: {
    title: "Example recovery",
    body: "Readiness entries shown in Demo Mode belong to the isolated demo athlete.",
    navId: "recovery",
  },
  profile: {
    title: "Example profile",
    body: "Goals, lifts, and experience here are labeled demo data for presentations — not editable production records.",
    navId: "dashboard",
  },
  programs: {
    title: "Example program",
    body: "“Meet peaking block (demo)” is an isolated seed/fixture program name for walkthroughs.",
    navId: "dashboard",
  },
  insights: {
    title: "Example insights",
    body: "Cross-domain notes in Demo Mode are illustrative. Live insights require your logged training signals.",
    navId: "dashboard",
  },
  nutrition: {
    title: "Example nutrition",
    body: "Nutrition stays empty or illustrative in Demo Mode — never synced as if it were your diet log.",
    navId: "dashboard",
  },
};

type PageProps = {
  params: Promise<{ section: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { section } = await params;
  const copy = SECTION_COPY[section];
  return {
    title: copy
      ? `Demo Mode — ${copy.title}`
      : "Demo Mode",
    robots: { index: false, follow: false },
  };
}

export default async function DemoSectionPage({ params }: PageProps) {
  if (!isDemoModeEnabled()) notFound();

  const { section } = await params;
  const copy = SECTION_COPY[section];
  if (!copy) notFound();

  const { view, source } = await getDemoDashboard();

  return (
    <div className="min-w-0">
      <DemoBanner source={source} />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <AppPage
          eyebrow="Demo Mode"
          title={copy.title}
          description={`${DEMO_MODE_LABEL} · ${copy.body}`}
          actions={<Badge variant="warning">{DEMO_MODE_LABEL}</Badge>}
        >
          <DemoModeNav active={copy.navId} />

          <Card elevated>
            <CardHeader>
              <CardTitle>{view.greetingName}</CardTitle>
              <CardDescription>
                {view.goalTitle
                  ? `Demo focus: “${view.goalTitle}”`
                  : "Isolated example athlete"}
              </CardDescription>
            </CardHeader>
            {section === "today" && view.upcomingWorkout ? (
              <div className="space-y-2 text-sm">
                <p className="font-[family-name:var(--font-display)] text-xl font-semibold">
                  {view.upcomingWorkout.title}
                </p>
                <p className="text-[var(--color-muted)]">
                  Status: {view.upcomingWorkout.status} · example session only
                </p>
              </div>
            ) : null}
            {section === "technique" ? (
              <ul className="grid gap-2 text-sm">
                {view.techniqueTrend.map((point) => (
                  <li
                    key={point.id}
                    className="flex justify-between gap-3 border-b border-[var(--color-border)] py-2 last:border-0"
                  >
                    <span>{point.label}</span>
                    <span className="font-medium">{point.value}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {section === "progress" || section === "training" ? (
              <ul className="grid gap-2 text-sm">
                {section === "progress"
                  ? view.personalRecords.map((pr) => (
                      <li
                        key={pr.liftId}
                        className="flex justify-between gap-3 border-b border-[var(--color-border)] py-2 last:border-0"
                      >
                        <span>{pr.label}</span>
                        <span className="font-medium">{pr.display}</span>
                      </li>
                    ))
                  : view.recentSessions.map((s) => (
                      <li
                        key={s.id}
                        className="flex justify-between gap-3 border-b border-[var(--color-border)] py-2 last:border-0"
                      >
                        <span>{s.title}</span>
                        <span className="text-[var(--color-muted)]">
                          {s.status}
                        </span>
                      </li>
                    ))}
              </ul>
            ) : null}
            {section === "recovery" ? (
              <ul className="grid gap-2 text-sm">
                {view.recoveryTrend.map((point) => (
                  <li
                    key={point.id}
                    className="flex justify-between gap-3 border-b border-[var(--color-border)] py-2 last:border-0"
                  >
                    <span>{point.label}</span>
                    <span className="font-medium">{point.value}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            <p className="mt-5 text-xs text-[var(--color-muted)]">
              Read-only Demo Mode · source: {source}
            </p>
          </Card>

          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/demo">Back to example dashboard</ButtonLink>
            <ButtonLink href="/signup" variant="secondary">
              Start free with your data
            </ButtonLink>
          </div>
        </AppPage>
      </div>
    </div>
  );
}
