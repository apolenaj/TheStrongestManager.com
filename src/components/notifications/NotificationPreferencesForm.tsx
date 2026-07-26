"use client";

import { useActionState } from "react";
import {
  Alert,
  Button,
  Label,
  Select,
} from "@/design-system";
import {
  NOTIFICATION_FREQUENCY_LABELS,
  NOTIFICATION_FREQUENCIES,
  NOTIFICATION_KIND_LABELS,
  NOTIFICATION_KINDS,
  type NotificationPreferenceState,
} from "@/domain/notifications";
import {
  updateNotificationPreferencesAction,
  type NotificationActionState,
} from "@/services/notifications/actions";

const initial: NotificationActionState = { ok: false };

export function NotificationPreferencesForm({
  prefs,
}: {
  prefs: NotificationPreferenceState;
}) {
  const [state, action, pending] = useActionState(
    updateNotificationPreferencesAction,
    initial,
  );

  return (
    <form action={action} className="grid gap-6">
      <fieldset className="grid gap-3">
        <legend className="font-medium">Channels</legend>
        <p className="text-sm text-[var(--color-muted)]">
          Choose where alerts may go. Push is stored for a future device
          registry — nothing is pushed until that ships.
        </p>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="inAppEnabled"
            defaultChecked={prefs.inAppEnabled}
          />
          In-app
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="emailEnabled"
            defaultChecked={prefs.emailEnabled}
          />
          Email
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="pushEnabled"
            defaultChecked={prefs.pushEnabled}
          />
          Push (preference only — not delivered yet)
        </label>
      </fieldset>

      <div className="grid gap-2">
        <Label htmlFor="frequency">Frequency</Label>
        <Select
          id="frequency"
          name="frequency"
          defaultValue={prefs.frequency}
        >
          {NOTIFICATION_FREQUENCIES.map((f) => (
            <option key={f} value={f}>
              {NOTIFICATION_FREQUENCY_LABELS[f]}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="maxPerDay">Max new notifications per day</Label>
        <Select
          id="maxPerDay"
          name="maxPerDay"
          defaultValue={String(prefs.maxPerDay)}
        >
          {[1, 2, 3, 5, 8, 10].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </Select>
        <p className="text-xs text-[var(--color-muted)]">
          Anti-spam daily cap. Cooldowns also limit repeats of the same kind.
        </p>
      </div>

      <fieldset className="grid gap-3">
        <legend className="font-medium">Notification types</legend>
        {NOTIFICATION_KINDS.map((kind) => (
          <label key={kind} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name={`kind_${kind}`}
              defaultChecked={prefs.kinds[kind]}
            />
            {NOTIFICATION_KIND_LABELS[kind]}
          </label>
        ))}
      </fieldset>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save preferences"}
      </Button>

      {state.error ? (
        <Alert tone="danger" title="Update failed">
          {state.error}
        </Alert>
      ) : null}
      {state.message ? (
        <Alert tone="success" title="Saved">
          {state.message}
        </Alert>
      ) : null}
    </form>
  );
}
