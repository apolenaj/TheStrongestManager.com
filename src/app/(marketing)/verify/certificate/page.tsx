import type { Metadata } from "next";
import { CertificateVerifyForm } from "@/components/certificate-verification/CertificateVerifyForm";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { PageIntro } from "@/components/ui/PageIntro";
import { featureFlags } from "@/config/feature-flags";
import { CERTIFICATE_VERIFICATION_HONESTY } from "@/domain/certificate-verification";
import { Alert } from "@/design-system";

export const metadata: Metadata = {
  title: "Verify certificate",
  description:
    "Verify a Performance OS Academy Certificate of Completion by unique ID — not an accredited professional certification.",
  alternates: { canonical: "/verify/certificate" },
  robots: { index: true, follow: true },
};

export default function VerifyCertificatePage() {
  if (!featureFlags.certificateVerification) {
    return (
      <MarketingContainer>
        <ComingSoon
          title="Certificate verification"
          description="Public certificate verification is not enabled yet."
          reason="Set NEXT_PUBLIC_FF_CERTIFICATE_VERIFICATION=true when Certificates of Completion are launched for public verify."
        />
      </MarketingContainer>
    );
  }

  return (
    <MarketingContainer>
      <PageIntro
        eyebrow="Academy"
        title="Verify a certificate"
        description="Enter the unique Certificate of Completion ID to confirm name, course, date, and status."
      />
      <div className="mt-8 max-w-lg">
        <Alert tone="warning" title="Not an accredited certification">
          {CERTIFICATE_VERIFICATION_HONESTY[1]}
        </Alert>
        <div className="mt-6">
          <CertificateVerifyForm />
        </div>
      </div>
      <section className="mt-14 max-w-2xl">
        <h2 className="font-[family-name:var(--font-display)] text-lg">
          How we keep this honest
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--color-muted)]">
          {CERTIFICATE_VERIFICATION_HONESTY.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>
    </MarketingContainer>
  );
}
