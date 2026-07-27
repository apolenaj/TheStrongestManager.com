import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProgramAuditFunnel } from "@/components/program-audit/ProgramAuditFunnel";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { PageIntro } from "@/components/ui/PageIntro";
import { featureFlags } from "@/config/feature-flags";
import {
  PROGRAM_AUDIT_HONESTY,
  evaluateProgramAuditQuality,
} from "@/domain/program-audit";

export const metadata: Metadata = {
  title: "Free Powerlifting Program Audit",
  description:
    "Paste your powerlifting program for a free deterministic strength audit — volume, balance, and progression cues. No fake scores.",
  keywords: [
    "powerlifting program audit",
    "strength audit",
    "free program review",
  ],
  alternates: { canonical: "/program-audit" },
  openGraph: {
    title: "Free Powerlifting Program Audit",
    description:
      "Basic structural program audit before signup. Deterministic checks — never a fabricated grade.",
    url: "/program-audit",
    type: "website",
  },
};

export default function ProgramAuditPage() {
  if (!featureFlags.programAudit) {
    return (
      <MarketingContainer>
        <ComingSoon
          title="Free program audit"
          description="This acquisition tool is not enabled yet."
          reason="Ships behind NEXT_PUBLIC_FF_PROGRAM_AUDIT."
        />
      </MarketingContainer>
    );
  }

  if (!evaluateProgramAuditQuality().passed) {
    notFound();
  }

  return (
    <MarketingContainer>
      <PageIntro
        eyebrow="Free audit"
        title="Paste your program. Get a basic audit."
        description="Deterministic checks on structure, volume, and balance — no fake score. Create an account to unlock detailed recommendations and the full Training Audit."
      />
      <div className="mt-10">
        <ProgramAuditFunnel />
      </div>
      <section className="mt-14 max-w-2xl">
        <h2 className="font-[family-name:var(--font-display)] text-lg">
          Honesty
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--color-muted)]">
          {PROGRAM_AUDIT_HONESTY.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>
    </MarketingContainer>
  );
}
