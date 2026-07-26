import type { Metadata } from "next";
import Link from "next/link";
import { AppPage } from "@/components/app/AppPage";
import { VideoCompareWorkspace } from "@/components/video-comparison/VideoCompareWorkspace";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { ButtonLink, EmptyState } from "@/design-system";
import { requireSession } from "@/services/auth/session";
import { getVideoComparison } from "@/services/video-comparison";
import { listTechniqueAnalysesForUser } from "@/services/technique/analysis-service";

export const metadata: Metadata = {
  title: "Compare lifts",
  robots: { index: false, follow: false },
};

export default async function TechniqueComparePage({
  searchParams,
}: {
  searchParams: Promise<{ old?: string; new?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const oldId = params.old?.trim() || null;
  const newId = params.new?.trim() || null;

  const view =
    oldId && newId
      ? await getVideoComparison({
          userId: session.user.id,
          oldAnalysisId: oldId,
          newAnalysisId: newId,
        })
      : null;

  const analyses =
    !oldId || !newId
      ? await listTechniqueAnalysesForUser(session.user.id)
      : [];

  const withVideo = analyses.filter((a) => a.storageKey);

  return (
    <FeatureGate
      flag="videoComparison"
      title="Side-by-side video comparison"
      description="Old vs new lift comparison is behind a feature flag."
    >
      <AppPage
        eyebrow="Technique"
        title="Compare lifts"
        description="Synchronize old and new lift videos — pause, frame step, speed, overlay, landmarks."
      >
        {!oldId || !newId ? (
          <EmptyState
            title="Pick two analyses"
            description="Open compare from a technique report, or choose two uploads with video below."
            action={
              withVideo.length >= 2 ? (
                <div className="grid max-w-lg gap-3 text-left text-sm">
                  {withVideo.slice(0, 8).map((a, i, arr) => {
                    const other = arr[i === 0 ? 1 : 0];
                    if (!other || a.id === other.id) return null;
                    return (
                      <Link
                        key={a.id}
                        href={`/app/technique/compare?old=${other.id}&new=${a.id}`}
                        className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2 text-[var(--color-fg)] hover:border-[var(--color-accent)]"
                      >
                        Compare recent: {a.exercise?.name ?? "Lift"} (
                        {a.createdAt.toISOString().slice(0, 10)})
                      </Link>
                    );
                  })}
                  <ButtonLink href="/app/technique">Back to technique</ButtonLink>
                </div>
              ) : (
                <ButtonLink href="/app/technique">Upload technique</ButtonLink>
              )
            }
          />
        ) : !view ? (
          <EmptyState
            title="Analyses not found"
            description="One or both analysis ids are missing from your account."
            action={
              <ButtonLink href="/app/technique">Back to technique</ButtonLink>
            }
          />
        ) : (
          <VideoCompareWorkspace result={view.result} />
        )}
      </AppPage>
    </FeatureGate>
  );
}
