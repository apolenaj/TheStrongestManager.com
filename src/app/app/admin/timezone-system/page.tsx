import { ComingSoon } from "@/components/ui/ComingSoon";
import { TimezoneSystemPanel } from "@/components/timezone-system/TimezoneSystemPanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getTimezoneSystemSnapshot } from "@/services/timezone-system";

export default async function AdminTimezoneSystemPage() {
  await requireAdmin();

  if (!featureFlags.timezoneSystem) {
    return (
      <ComingSoon
        title="Timezone system"
        description="The timezone architecture console is not enabled yet."
        reason="Set NEXT_PUBLIC_FF_TIMEZONE_SYSTEM=true to review UTC storage and local display rules."
      />
    );
  }

  const snapshot = getTimezoneSystemSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Timezone system
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Store UTC. Display local. Workout dates, competition countdowns,
          notifications, and coach communication respect the athlete timezone.
          Generated {new Date(snapshot.generatedAt).toLocaleString("en-US")}.
        </p>
      </div>
      <TimezoneSystemPanel snapshot={snapshot} />
    </div>
  );
}
