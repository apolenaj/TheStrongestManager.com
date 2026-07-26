import { ComingSoon } from "@/components/ui/ComingSoon";
import { featureFlags } from "@/config/feature-flags";
import { getModelImprovementConsentSnapshot } from "@/domain/model-improvement-consent";
import { requireAdmin } from "@/services/admin/require-admin";

export default async function AdminModelImprovementConsentPage() {
  await requireAdmin();

  if (!featureFlags.modelImprovementConsent) {
    return (
      <ComingSoon
        title="Model improvement consent"
        description="Unbundled consent UI is not enabled yet."
        reason="Set NEXT_PUBLIC_FF_MODEL_IMPROVEMENT_CONSENT=true to review service / expert / research separation and revoke paths."
      />
    );
  }

  const snapshot = getModelImprovementConsentSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Model improvement consent
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Athlete UI at <code className="text-xs">/app/settings/consent</code>.
          See <code className="text-xs">{snapshot.docPath}</code>. Policy{" "}
          {snapshot.policyVersion}.
        </p>
      </div>
      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Separate kinds (never bundled)
        </h3>
        <ul className="mt-3 space-y-4 text-sm text-[var(--color-muted)]">
          {snapshot.kinds.map((k) => (
            <li key={k.id}>
              <span className="font-medium text-[var(--color-foreground)]">
                {k.title}
              </span>
              {k.revocable ? " · revocable" : ""}
              <span className="mt-1 block text-xs">{k.summary}</span>
              <span className="mt-1 block text-xs">Never: {k.never}</span>
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
