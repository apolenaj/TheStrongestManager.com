import type { Metadata } from "next";
import { CertificateVerifyForm } from "@/components/certificate-verification/CertificateVerifyForm";
import { CertificateVerifyResultView } from "@/components/certificate-verification/CertificateVerifyResult";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { PageIntro } from "@/components/ui/PageIntro";
import { featureFlags } from "@/config/feature-flags";
import { normalizeCertificateCode } from "@/domain/certificate-verification";
import { verifyCertificateByCode } from "@/services/certificate-verification";

type PageProps = {
  params: Promise<{ code: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code: raw } = await params;
  const code = normalizeCertificateCode(decodeURIComponent(raw));
  return {
    title: code ? `Verify ${code}` : "Verify certificate",
    description:
      "Public verification of an Academy Certificate of Completion — not an accredited professional certification.",
    robots: { index: false, follow: true },
  };
}

export default async function VerifyCertificateCodePage({ params }: PageProps) {
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

  const { code: raw } = await params;
  const code = normalizeCertificateCode(decodeURIComponent(raw));
  const result = await verifyCertificateByCode(code);

  return (
    <MarketingContainer>
      <PageIntro
        eyebrow="Academy"
        title="Verification result"
        description="Unique ID, name, course, date, and status for this Certificate of Completion."
      />
      <div className="mt-8 max-w-2xl space-y-10">
        <CertificateVerifyResultView result={result} />
        <div>
          <h2 className="mb-3 text-sm font-medium text-[var(--color-foreground)]">
            Verify another ID
          </h2>
          <CertificateVerifyForm initialCode="" />
        </div>
      </div>
    </MarketingContainer>
  );
}
