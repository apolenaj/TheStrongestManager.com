import Link from "next/link";
import { ResearchLibraryImportForm } from "@/components/research-library/ResearchLibraryImportForm";
import { Alert } from "@/design-system";
import { RESEARCH_LIBRARY_HONESTY } from "@/domain/research-library";
import { requireAdmin } from "@/services/admin/require-admin";
import { featureFlags } from "@/config/feature-flags";

export default async function AdminResearchLibraryPage() {
  await requireAdmin();

  if (!featureFlags.researchLibrary) {
    return (
      <Alert tone="warning" title="Research Library off">
        Enable NEXT_PUBLIC_FF_RESEARCH_LIBRARY to use the import workflow.
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Research Library import
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          {RESEARCH_LIBRARY_HONESTY[1]} Dry-run validates CSV/JSON; publishing
          still requires an editorial catalog update with real citations.
        </p>
        {featureFlags.aiResearchSummarizer ? (
          <p className="mt-2 text-sm">
            <Link
              href="/app/admin/research/summarizer"
              className="text-[var(--color-accent)]"
            >
              AI Research Summarizer →
            </Link>{" "}
            <span className="text-[var(--color-muted)]">
              draft from verified paper text; human review required before
              publish.
            </span>
          </p>
        ) : null}
      </div>
      <ResearchLibraryImportForm />
    </div>
  );
}
