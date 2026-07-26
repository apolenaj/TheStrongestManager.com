import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { BehavioralRetentionPanel } from "@/components/behavioral-retention/BehavioralRetentionPanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { Alert } from "@/design-system";
import { requireSession } from "@/services/auth/session";
import { getBehavioralRetention } from "@/services/behavioral-retention";

export const metadata: Metadata = {
  title: "Retention",
  robots: { index: false, follow: false },
};

export default async function BehavioralRetentionPage() {
  const session = await requireSession();
  const result = await getBehavioralRetention({ userId: session.user.id });

  return (
    <FeatureGate
      flag="behavioralRetention"
      title="Retention"
      description="Behavioral retention is behind a feature flag."
    >
      <AppPage
        eyebrow="Follow-through"
        title="Behavioral retention"
        description="Ethical loops for workouts, weekly review, goals, and technique — planned rest counts; no dark patterns."
      >
        {!result.ok ? (
          <Alert tone="warning" title="Unavailable">
            {result.error}
          </Alert>
        ) : (
          <BehavioralRetentionPanel retention={result.retention} />
        )}
      </AppPage>
    </FeatureGate>
  );
}
