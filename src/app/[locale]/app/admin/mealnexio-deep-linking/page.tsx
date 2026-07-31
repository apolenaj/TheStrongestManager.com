import { ComingSoon } from "@/components/ui/ComingSoon";
import { MealnexioDeepLinkingPanel } from "@/components/mealnexio-deep-linking/MealnexioDeepLinkingPanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getMealnexioDeepLinkingSnapshot } from "@/services/mealnexio-deep-linking";

export default async function AdminMealnexioDeepLinkingPage() {
  await requireAdmin();

  if (!featureFlags.mealnexioDeepLinking) {
    return (
      <ComingSoon
        title="Mealnexio deep linking"
        description="Cross-product Mealnexio deep linking is not enabled yet."
        reason="Set NEXT_PUBLIC_FF_MEALNEXIO_DEEP_LINKING=true to review outbound CTAs, return protocol, and SSO architecture stubs."
      />
    );
  }

  const snapshot = getMealnexioDeepLinkingSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Mealnexio deep linking
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Seamless cross-product UX architecture — no fake sync or SSO. See{" "}
          <code className="text-xs">{snapshot.docPath}</code>. Generated{" "}
          {new Date(snapshot.generatedAt).toLocaleString("en-US")}.
        </p>
      </div>
      <MealnexioDeepLinkingPanel snapshot={snapshot} />
    </div>
  );
}
