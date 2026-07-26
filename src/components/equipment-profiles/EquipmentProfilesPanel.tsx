import { Alert, Badge, Button } from "@/design-system";
import type { AthleteEquipmentProfileView } from "@/services/equipment-profiles";
import {
  applyEquipmentPresetAction,
  saveCustomEquipmentAction,
} from "@/services/equipment-profiles/actions";
import { EQUIPMENT_OPTIONS } from "@/services/onboarding/options";

export function EquipmentProfilesPanel({
  view,
}: {
  view: AthleteEquipmentProfileView;
}) {
  return (
    <div className="grid gap-8">
      <Alert tone="info" title="Respects your gear">
        {view.honesty[0]} {view.honesty[1]}
      </Alert>
      <Alert tone="info" title="Presets are starting points">
        {view.honesty[2]} {view.honesty[3]}
      </Alert>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Active profile
        </h2>
        <div className="flex flex-wrap gap-2">
          <Badge variant="accent">{view.label}</Badge>
          <Badge variant="neutral">
            Fit mode: {view.fitEquipment.replace(/_/g, " ")}
          </Badge>
        </div>
        {view.description ? (
          <p className="text-sm text-[var(--color-muted)]">{view.description}</p>
        ) : null}
        <p className="text-sm text-[var(--color-muted)]">
          Catalog keys:{" "}
          {view.catalogKeys.length > 0
            ? view.catalogKeys.join(", ")
            : "none set — suggestions stay withheld"}
        </p>
      </section>

      <section className="grid gap-4">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Presets
        </h2>
        <ul className="grid gap-3">
          {view.presets.map((p) => (
            <li
              key={p.id}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{p.label}</p>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">
                    {p.description}
                  </p>
                </div>
                <form action={applyEquipmentPresetAction}>
                  <input type="hidden" name="profileId" value={p.id} />
                  <Button
                    type="submit"
                    variant={
                      view.profileId === p.id ? "secondary" : "primary"
                    }
                  >
                    {view.profileId === p.id ? "Active" : "Use preset"}
                  </Button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Custom checklist
        </h2>
        <p className="text-sm text-[var(--color-muted)]">
          Refine what you actually have. Program builder and exercise suggestions
          use this list.
        </p>
        <form action={saveCustomEquipmentAction} className="grid gap-3">
          <ul className="grid gap-2 sm:grid-cols-2">
            {EQUIPMENT_OPTIONS.map((opt) => (
              <li key={opt.id}>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="equipment"
                    value={opt.id}
                    defaultChecked={view.onboardingIds.includes(opt.id)}
                  />
                  {opt.label}
                </label>
              </li>
            ))}
          </ul>
          <Button type="submit">Save checklist</Button>
        </form>
      </section>
    </div>
  );
}
