"use client";

import { useActionState } from "react";
import { Alert, Button, Label } from "@/design-system";
import {
  ACTIVITY_FEED_KIND_DESCRIPTIONS,
  ACTIVITY_FEED_KIND_LABELS,
  type ActivityFeedVisibility,
} from "@/domain/activity-feed";
import {
  updateActivityFeedVisibilityAction,
  type ActivityFeedActionState,
} from "@/services/activity-feed/actions";

const initial: ActivityFeedActionState = { ok: false };

function CheckRow({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string;
  label: string;
  description: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex gap-3 text-sm">
      <input
        type="checkbox"
        name={name}
        value="on"
        defaultChecked={defaultChecked}
        className="mt-1"
      />
      <span>
        <span className="font-medium">{label}</span>
        <span className="mt-0.5 block text-[var(--color-muted)]">
          {description}
        </span>
      </span>
    </label>
  );
}

export function ActivityFeedVisibilityForm({
  prefs,
}: {
  prefs: ActivityFeedVisibility;
}) {
  const [state, action, pending] = useActionState(
    updateActivityFeedVisibilityAction,
    initial,
  );

  return (
    <form action={action} className="grid gap-5">
      <fieldset className="grid gap-3">
        <legend className="font-[family-name:var(--font-display)] text-lg">
          Visibility
        </legend>
        <p className="text-sm text-[var(--color-muted)]">
          Choose what appears in your optional activity feed. Nothing is
          invented — turning a kind off simply hides matching milestones.
        </p>
        <CheckRow
          name="feedEnabled"
          label="Show activity feed"
          description="Master switch. When off, the feed stays empty."
          defaultChecked={prefs.feedEnabled}
        />
        <CheckRow
          name="showPrs"
          label={ACTIVITY_FEED_KIND_LABELS.pr}
          description={ACTIVITY_FEED_KIND_DESCRIPTIONS.pr}
          defaultChecked={prefs.showPrs}
        />
        <CheckRow
          name="showCompetitionResults"
          label={ACTIVITY_FEED_KIND_LABELS.competition_result}
          description={ACTIVITY_FEED_KIND_DESCRIPTIONS.competition_result}
          defaultChecked={prefs.showCompetitionResults}
        />
        <CheckRow
          name="showAchievements"
          label={ACTIVITY_FEED_KIND_LABELS.achievement}
          description={ACTIVITY_FEED_KIND_DESCRIPTIONS.achievement}
          defaultChecked={prefs.showAchievements}
        />
        <CheckRow
          name="showSharedTechnique"
          label={ACTIVITY_FEED_KIND_LABELS.shared_technique}
          description={ACTIVITY_FEED_KIND_DESCRIPTIONS.shared_technique}
          defaultChecked={prefs.showSharedTechnique}
        />
      </fieldset>

      {state.error ? (
        <Alert tone="danger" title="Update failed">
          {state.error}
        </Alert>
      ) : null}
      {state.ok ? (
        <Alert tone="success" title="Saved">
          Visibility preferences updated.
        </Alert>
      ) : null}

      <div>
        <Label htmlFor="visibility-submit-btn" className="sr-only">
          Save
        </Label>
        <Button
          id="visibility-submit-btn"
          type="submit"
          disabled={pending}
        >
          {pending ? "Saving…" : "Save visibility"}
        </Button>
      </div>
    </form>
  );
}
