import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppPage } from "@/components/app/AppPage";
import { ProgramVersionHistory } from "@/components/program-version/ProgramVersionHistory";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { Alert } from "@/design-system";
import { PROGRAM_VERSION_HONESTY } from "@/domain/program-version";
import { requireSession } from "@/services/auth/session";
import { listProgramVersions } from "@/services/program-version";
import { prisma } from "@/lib/db";
import { featureFlags } from "@/config/feature-flags";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Program versions · ${id}`,
    robots: { index: false, follow: false },
  };
}

export default async function ProgramVersionsPage({ params }: Props) {
  const session = await requireSession();
  const { id } = await params;

  if (!featureFlags.programVersionControl) {
    return (
      <AppPage
        eyebrow="Programming"
        title="Program versions"
        description="Version history is behind a feature flag."
      >
        <Alert tone="warning" title="Program Version Control off">
          Enable NEXT_PUBLIC_FF_PROGRAM_VERSION_CONTROL.
        </Alert>
      </AppPage>
    );
  }

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) notFound();

  const program = await prisma.program.findFirst({
    where: { id, athleteProfileId: profile.id },
    select: { id: true, name: true },
  });
  if (!program) notFound();

  const listed = await listProgramVersions({
    programId: program.id,
    athleteProfileId: profile.id,
  });
  if (!listed.ok) {
    return (
      <AppPage eyebrow="Programming" title="Program versions" description="">
        <Alert tone="danger" title="Could not load history">
          {listed.error}
        </Alert>
      </AppPage>
    );
  }

  return (
    <FeatureGate
      flag="programVersionControl"
      title="Program Version Control"
      description="Program Version Control is behind a feature flag."
    >
      <AppPage
        eyebrow="Programming"
        title={`${program.name} · versions`}
        description={PROGRAM_VERSION_HONESTY[0]}
        actions={
          <Link
            href={`/app/programs/${program.id}`}
            className="text-sm text-[var(--color-accent)]"
          >
            ← Program
          </Link>
        }
      >
        <ProgramVersionHistory
          programId={program.id}
          programName={program.name}
          currentVersionNumber={listed.currentVersionNumber}
          versions={listed.versions}
        />
      </AppPage>
    </FeatureGate>
  );
}
