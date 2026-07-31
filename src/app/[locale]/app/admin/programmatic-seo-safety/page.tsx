import { ComingSoon } from "@/components/ui/ComingSoon";
import { ProgrammaticSeoSafetyPanel } from "@/components/programmatic-seo-safety/ProgrammaticSeoSafetyPanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getProgrammaticSeoSafetySnapshot } from "@/services/programmatic-seo-safety";

export default async function AdminProgrammaticSeoSafetyPage() {
  await requireAdmin();

  if (!featureFlags.programmaticSeoSafety) {
    return (
      <ComingSoon
        title="Programmatic SEO Safety"
        description="Quality-gated programmatic SEO templates are not enabled yet."
        reason="Set NEXT_PUBLIC_FF_PROGRAMMATIC_SEO_SAFETY=true to review allowlisted guides and refuse thin page factories."
      />
    );
  }

  const snapshot = getProgrammaticSeoSafetySnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Programmatic SEO safety
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Useful templates only — unique value, structured data, internal links,
          quality checks. Generated{" "}
          {new Date(snapshot.generatedAt).toLocaleString("en-US")}.
        </p>
      </div>
      <ProgrammaticSeoSafetyPanel snapshot={snapshot} />
    </div>
  );
}
