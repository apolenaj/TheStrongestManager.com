import { ComingSoon } from "@/components/ui/ComingSoon";
import { MicroLearningPanel } from "@/components/micro-learning/MicroLearningPanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getMicroLearningSnapshot } from "@/services/micro-learning";

export default async function AdminMicroLearningPage() {
  await requireAdmin();

  if (!featureFlags.microLearning) {
    return (
      <ComingSoon
        title="Micro-learning"
        description="Short educational cards are not enabled yet."
        reason="Set NEXT_PUBLIC_FF_MICRO_LEARNING=true to review personalized 1-minute lessons and anti-spam caps."
      />
    );
  }

  const snapshot = getMicroLearningSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Micro-learning
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Personalized 1-minute cards — max one per day. Generated{" "}
          {new Date(snapshot.generatedAt).toLocaleString("en-US")}.
        </p>
      </div>
      <MicroLearningPanel snapshot={snapshot} />
    </div>
  );
}
