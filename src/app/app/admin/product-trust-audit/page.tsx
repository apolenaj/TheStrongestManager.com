import { ComingSoon } from "@/components/ui/ComingSoon";
import { ProductTrustAuditPanel } from "@/components/product-trust-audit/ProductTrustAuditPanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getProductTrustAuditSnapshot } from "@/services/product-trust-audit";

export default async function AdminProductTrustAuditPage() {
  await requireAdmin();

  if (!featureFlags.productTrustAudit) {
    return (
      <ComingSoon
        title="Product Trust Audit"
        description="The AI product trust registry is not enabled yet."
        reason="Set NEXT_PUBLIC_FF_PRODUCT_TRUST_AUDIT=true to review provenance, confidence, certainty risk, and challenge paths across AI features."
      />
    );
  }

  const snapshot = getProductTrustAuditSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Product Trust Audit
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Every AI feature scored on four questions. See{" "}
          <code className="text-xs">{snapshot.docPath}</code>. Generated{" "}
          {new Date(snapshot.generatedAt).toLocaleString("en-US")}.
        </p>
      </div>
      <ProductTrustAuditPanel snapshot={snapshot} />
    </div>
  );
}
