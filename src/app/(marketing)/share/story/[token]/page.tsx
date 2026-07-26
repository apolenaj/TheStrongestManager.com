import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Alert, Badge } from "@/design-system";
import { siteConfig } from "@/config/site";
import { getPerformanceStoryShareByToken } from "@/services/performance-story";

type Props = { params: Promise<{ token: string }> };

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Yearly performance story",
    robots: { index: false, follow: false },
  };
}

export default async function PerformanceStorySharePage({ params }: Props) {
  const { token } = await params;
  const payload = await getPerformanceStoryShareByToken(token);
  if (!payload) notFound();

  return (
    <main className="mx-auto min-h-screen max-w-lg px-4 py-12">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
        {siteConfig.name}
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold">
        {payload.yearLabel}
      </h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        {payload.athleteDisplayName}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant="neutral">{payload.yearKey}</Badge>
        <Badge variant="info">Shared yearly review</Badge>
      </div>

      <ol className="mt-8 space-y-6">
        {payload.chapters.map((ch) => (
          <li key={ch.monthLabel}>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
              {ch.monthLabel}
            </h2>
            <ul className="mt-2 space-y-1 text-base text-[var(--color-foreground)]">
              {ch.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <Alert tone="info" title="Not causation" className="mt-8">
        {payload.causalityCaveat}
      </Alert>
      <Alert tone="info" title="Privacy" className="mt-4">
        {payload.honestyNote}
      </Alert>
      <p className="mt-8 text-sm">
        <Link
          href="/"
          className="text-[var(--color-accent)] underline-offset-2 hover:underline"
        >
          Learn more on {siteConfig.domain}
        </Link>
      </p>
    </main>
  );
}
