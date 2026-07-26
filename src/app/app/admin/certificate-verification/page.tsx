import { ComingSoon } from "@/components/ui/ComingSoon";
import { CertificateVerificationPanel } from "@/components/certificate-verification/CertificateVerificationPanel";
import { featureFlags } from "@/config/feature-flags";
import { getCertificateVerificationSnapshot } from "@/domain/certificate-verification";
import { requireAdmin } from "@/services/admin/require-admin";

export default async function AdminCertificateVerificationPage() {
  await requireAdmin();

  if (!featureFlags.certificateVerification) {
    return (
      <ComingSoon
        title="Certificate verification"
        description="Public certificate verification is not enabled yet."
        reason="Set NEXT_PUBLIC_FF_CERTIFICATE_VERIFICATION=true to review public verify fields and honesty copy."
      />
    );
  }

  const snapshot = getCertificateVerificationSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Certificate verification
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Public verify for Academy Certificates of Completion — never implies
          accreditation unless an official accredited program is launched.
        </p>
      </div>
      <CertificateVerificationPanel snapshot={snapshot} />
    </div>
  );
}
