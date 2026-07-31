import type { Metadata } from "next";
import Link from "next/link";
import { AppPage } from "@/components/app/AppPage";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { Alert, Badge, ButtonLink } from "@/design-system";
import {
  DEFAULT_PERFORMANCE_REPORT_DAYS,
  PERFORMANCE_REPORT_HONESTY,
  PERFORMANCE_REPORT_SECTION_LABELS,
  buildPerformanceReportPeriod,
  defaultPerformanceReportWindow,
} from "@/domain/performance-report";
import { requireSession } from "@/services/auth/session";
import { buildPerformanceReportForUser } from "@/services/performance-report";

export const metadata: Metadata = {
  title: "Performance Report",
  robots: { index: false, follow: false },
};

export default async function PerformanceReportPage() {
  const session = await requireSession();
  const window = defaultPerformanceReportWindow();
  const period = buildPerformanceReportPeriod(window);
  const preview = await buildPerformanceReportForUser({
    userId: session.user.id,
    from: window.from,
    to: window.to,
  });

  const downloadHref = `/api/performance-report?from=${period.fromIso}&to=${period.toIso}`;

  return (
    <FeatureGate
      flag="performanceReportPdf"
      title="Performance Report"
      description="Premium downloadable athlete reports are behind a feature flag."
    >
      <AppPage
        eyebrow="Reports"
        title="Performance Report"
        description={`Premium PDF for the last ${DEFAULT_PERFORMANCE_REPORT_DAYS} days — data period, missing data, and estimated metrics labeled.`}
      >
        <div className="grid gap-6">
          <Alert tone="info" title="Honesty">
            {PERFORMANCE_REPORT_HONESTY[0]} {PERFORMANCE_REPORT_HONESTY[2]}
          </Alert>

          <section className="grid gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="info">Data period</Badge>
              <span className="text-sm">{period.label}</span>
            </div>
            {preview.ok ? (
              <>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="neutral">
                    Estimated: {preview.report.estimatedMetricLabels.length}
                  </Badge>
                  <Badge variant="warning">
                    Missing notes: {preview.report.missingDataNotes.length}
                  </Badge>
                </div>
                <ul className="grid gap-1 text-sm text-[var(--color-muted)] sm:grid-cols-2">
                  {preview.report.sections.map((s) => (
                    <li key={s.id}>
                      {PERFORMANCE_REPORT_SECTION_LABELS[s.id]}
                      {s.missingData ? " — gaps noted" : ""}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <Alert tone="warning" title="Preview unavailable">
                {preview.error}
              </Alert>
            )}
            <ButtonLink href={downloadHref}>Download PDF</ButtonLink>
            <p className="text-xs text-[var(--color-muted)]">
              Report states the data period, lists missing data, and labels
              estimated metrics. No unsupported claims.
            </p>
          </section>

          <p className="text-sm text-[var(--color-muted)]">
            Related:{" "}
            <Link
              href="/app/weekly-review"
              className="text-[var(--color-accent)] underline-offset-2 hover:underline"
            >
              Weekly review
            </Link>
          </p>
        </div>
      </AppPage>
    </FeatureGate>
  );
}
