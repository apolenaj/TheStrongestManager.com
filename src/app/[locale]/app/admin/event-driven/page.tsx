import { ComingSoon } from "@/components/ui/ComingSoon";
import { EventDrivenPanel } from "@/components/event-driven/EventDrivenPanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getEventDrivenSnapshot } from "@/services/event-driven";

export default async function AdminEventDrivenPage() {
  await requireAdmin();

  if (!featureFlags.eventDrivenArchitecture) {
    return (
      <ComingSoon
        title="Event-Driven Architecture"
        description="The domain event queue console is not enabled yet."
        reason="Set NEXT_PUBLIC_FF_EVENT_DRIVEN_ARCHITECTURE=true to review background events, handlers, and queue path."
      />
    );
  }

  const snapshot = getEventDrivenSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Event-Driven Architecture
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Background domain events with an in-process queue and idempotent
          handlers. Generated{" "}
          {new Date(snapshot.generatedAt).toLocaleString("en-US")}.
        </p>
      </div>
      <EventDrivenPanel snapshot={snapshot} />
    </div>
  );
}
