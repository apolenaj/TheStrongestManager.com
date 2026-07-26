import { AffiliateDisclosureBanner } from "@/components/affiliate-system/AffiliateDisclosureBanner";
import { Badge } from "@/design-system";
import {
  AFFILIATE_DISCLOSURE,
  AFFILIATE_DISCLOSURE_SHORT,
} from "@/domain/affiliate-system";
import type { PublicAffiliateDirectoryItem } from "@/services/affiliate-system";
import Link from "next/link";

/**
 * Public partner directory. Disclosure is always rendered first.
 * Callers must pass partners only from listPublicAffiliateDirectory({ disclosureVisible: true }).
 */
export function AffiliateDirectory({
  partners,
}: {
  partners: PublicAffiliateDirectoryItem[];
}) {
  return (
    <div className="grid gap-8">
      <AffiliateDisclosureBanner
        lines={AFFILIATE_DISCLOSURE}
        short={AFFILIATE_DISCLOSURE_SHORT}
      />

      {partners.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">
          No active affiliate partners are listed yet. Partnerships are never
          shown without the disclosure above.
        </p>
      ) : (
        <ul className="grid gap-4">
          {partners.map((p) => (
            <li
              key={p.slug}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{p.displayName}</span>
                <Badge variant="accent">{p.partnerTypeLabel}</Badge>
              </div>
              <Link
                href={p.landingPath}
                className="mt-2 inline-block text-sm text-[var(--color-accent)] underline-offset-2 hover:underline"
              >
                Open disclosed affiliate link →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
