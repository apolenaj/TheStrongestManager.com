import { ButtonLink } from "@/design-system";
import { HomeSection } from "@/components/marketing/HomeSection";

export function HomeTechnique() {
  return (
    <HomeSection
      id="technique"
      eyebrow="Technique analysis"
      title="Upload a lift. See what the camera can support."
      description="Deadlift movement analysis runs today when pose data and camera angle are suitable. Other lifts can upload privately and wait for a real backend — we never invent a Technique Score."
    >
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <ul className="space-y-4 text-sm leading-relaxed text-[var(--color-muted)] sm:text-base">
          <li className="border-l border-[var(--color-accent)] pl-4">
            Observed metrics called out when the pipeline can measure them.
          </li>
          <li className="border-l border-[var(--color-border-strong)] pl-4">
            Estimates labeled as estimates — not sold as lab precision.
          </li>
          <li className="border-l border-[var(--color-border-strong)] pl-4">
            Athlete-reported context kept separate from model output.
          </li>
          <li className="border-l border-[var(--color-border-strong)] pl-4">
            Pain cues point to caution, not a diagnosis.
          </li>
        </ul>
        <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--color-foreground)]">
            Technique workspace
          </p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Private storage, signed playback for you, and delete controls on every
            upload.
          </p>
          <div className="mt-6">
            <ButtonLink href="/app/technique" variant="secondary" size="sm">
              Open technique hub
            </ButtonLink>
          </div>
        </div>
      </div>
    </HomeSection>
  );
}
