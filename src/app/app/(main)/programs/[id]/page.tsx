import type { Metadata } from "next";
import Link from "next/link";
import { AppPage } from "@/components/app/AppPage";
import { FeatureGate } from "@/components/ui/FeatureGate";

type ProgramDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: ProgramDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Program · ${id}`,
    robots: { index: false, follow: false },
  };
}

export default async function ProgramDetailPage({
  params,
}: ProgramDetailPageProps) {
  const { id } = await params;

  return (
    <FeatureGate
      flag="programDetail"
      title="Program detail"
      description="Individual program views open when the programming engine and feature flag are enabled."
    >
      <AppPage
        eyebrow="Program"
        title={`Program ${id}`}
        description="Structural route for /app/programs/[id]. Open version history to save and restore program snapshots."
        actions={
          <Link
            href={`/app/programs/${id}/versions`}
            className="text-sm text-[var(--color-accent)]"
          >
            Version history →
          </Link>
        }
      />
    </FeatureGate>
  );
}
