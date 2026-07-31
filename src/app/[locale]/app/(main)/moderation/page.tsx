import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { ModerationQueuePanel } from "@/components/content-moderation/ModerationQueuePanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { Alert } from "@/design-system";
import { CONTENT_MODERATION_HONESTY } from "@/domain/content-moderation";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getContentModerationHubView } from "@/services/content-moderation";

export const metadata: Metadata = {
  title: "Content moderation",
  robots: { index: false, follow: false },
};

export default async function ContentModerationPage() {
  if (!featureFlags.contentModeration) {
    return (
      <AppPage
        eyebrow="Safety"
        title="Content moderation"
        description="Report, review, remove, suspend — with audit log."
      >
        <Alert tone="warning" title="Feature off">
          Enable NEXT_PUBLIC_FF_CONTENT_MODERATION.
        </Alert>
      </AppPage>
    );
  }

  const admin = await requireAdmin();
  const result = await getContentModerationHubView({
    actorUserId: admin.user.id,
  });

  return (
    <FeatureGate
      flag="contentModeration"
      title="Content moderation"
      description="Content Moderation is behind a feature flag."
    >
      <AppPage
        eyebrow="Safety"
        title="Content moderation"
        description={CONTENT_MODERATION_HONESTY[0]}
      >
        {result.ok ? (
          <ModerationQueuePanel
            reports={result.reports}
            audit={result.audit}
            honesty={result.honesty}
          />
        ) : (
          <Alert tone="danger" title="Unavailable">
            {result.error}
          </Alert>
        )}
      </AppPage>
    </FeatureGate>
  );
}
