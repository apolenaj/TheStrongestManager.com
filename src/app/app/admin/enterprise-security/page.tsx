import { ComingSoon } from "@/components/ui/ComingSoon";
import { EnterpriseSecurityPanel } from "@/components/enterprise-security/EnterpriseSecurityPanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getEnterpriseSecuritySnapshot } from "@/services/enterprise-security";

export default async function AdminEnterpriseSecurityPage() {
  await requireAdmin();

  if (!featureFlags.enterpriseSecurity) {
    return (
      <ComingSoon
        title="Enterprise security"
        description="The B2B security prep console is not enabled yet."
        reason="Set NEXT_PUBLIC_FF_ENTERPRISE_SECURITY=true to review access controls, encryption, data processing, logging, backups, and incident response — without claiming unearned compliance certifications."
      />
    );
  }

  const snapshot = getEnterpriseSecuritySnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Enterprise security prep
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          B2B procurement registry — see{" "}
          <code className="text-xs">{snapshot.docPath}</code>. Not a SOC 2 / ISO
          certificate. Generated{" "}
          {new Date(snapshot.generatedAt).toLocaleString("en-US")}.
        </p>
      </div>
      <EnterpriseSecurityPanel snapshot={snapshot} />
    </div>
  );
}
