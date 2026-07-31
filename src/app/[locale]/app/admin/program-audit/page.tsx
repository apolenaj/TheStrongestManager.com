import { ComingSoon } from "@/components/ui/ComingSoon";
import { ProgramAuditPanel } from "@/components/program-audit/ProgramAuditPanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getProgramAuditSnapshot } from "@/services/program-audit";

export default async function AdminProgramAuditPage() {
  await requireAdmin();

  if (!featureFlags.programAudit) {
    return (
      <ComingSoon
        title="Free Program Audit"
        description="Acquisition funnel is not enabled yet."
        reason="Set NEXT_PUBLIC_FF_PROGRAM_AUDIT=true to review paste → basic audit → signup unlock."
      />
    );
  }

  const snapshot = getProgramAuditSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Free program audit
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          SEO/acquisition funnel with deterministic checks and no fake scoring.
          Generated {new Date(snapshot.generatedAt).toLocaleString("en-US")}.
        </p>
      </div>
      <ProgramAuditPanel snapshot={snapshot} />
    </div>
  );
}
