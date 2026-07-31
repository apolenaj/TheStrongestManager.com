import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Alert, Badge } from "@/design-system";
import { siteConfig } from "@/config/site";
import { getMonthlyReportShareByToken } from "@/services/monthly-report";

type Props = { params: Promise<{ token: string }> };

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Monthly performance highlight",
    robots: { index: false, follow: false },
  };
}

export default async function MonthlyReportSharePage({ params }: Props) {
  const { token } = await params;
  const payload = await getMonthlyReportShareByToken(token);
  if (!payload) notFound();

  return (
    <main className="mx-auto min-h-screen max-w-lg px-4 py-12">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
        {siteConfig.name}
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold">
        {payload.monthLabel}
      </h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        {payload.athleteDisplayName}
      </p>
      {payload.headline ? (
        <p className="mt-4 text-lg">{payload.headline}</p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant="neutral">{payload.monthKey}</Badge>
        <Badge variant="info">Shared summary</Badge>
      </div>
      <ul className="mt-6 grid gap-2 text-sm">
        {payload.highlights.map((h) => (
          <li
            key={h}
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2"
          >
            {h}
          </li>
        ))}
      </ul>
      <Alert tone="info" title="Privacy" className="mt-6">
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
