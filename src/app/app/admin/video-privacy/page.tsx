import { ComingSoon } from "@/components/ui/ComingSoon";
import { featureFlags } from "@/config/feature-flags";
import { getVideoPrivacySnapshot } from "@/domain/video-privacy";
import { requireAdmin } from "@/services/admin/require-admin";

export default async function AdminVideoPrivacyPage() {
  await requireAdmin();

  if (!featureFlags.videoPrivacyControls) {
    return (
      <ComingSoon
        title="Video privacy controls"
        description="Per-video privacy options are not enabled yet."
        reason="Set NEXT_PUBLIC_FF_VIDEO_PRIVACY_CONTROLS=true to review private-by-default upload opts and explicit opt-ins."
      />
    );
  }

  const snapshot = getVideoPrivacySnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Video privacy controls
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Private by default. Explicit opt-in only — see{" "}
          <code className="text-xs">{snapshot.docPath}</code>. Policy{" "}
          {snapshot.policyVersion}.
        </p>
      </div>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Options
        </h3>
        <ul className="mt-3 space-y-3 text-sm text-[var(--color-muted)]">
          {snapshot.options.map((opt) => (
            <li key={opt.id}>
              <span className="font-medium text-[var(--color-foreground)]">
                {opt.title}
              </span>
              {opt.required ? " (required)" : " (opt-in, default off)"}
              <span className="mt-1 block text-xs">{opt.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <ul className="list-disc space-y-2 pl-5 text-sm text-[var(--color-muted)]">
        {snapshot.honesty.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}
