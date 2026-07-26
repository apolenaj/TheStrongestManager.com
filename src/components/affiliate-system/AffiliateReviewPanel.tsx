"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Badge, Button } from "@/design-system";
import { activateAffiliatePartnerAction } from "@/services/affiliate-system/actions";
import { AffiliateDisclosureBanner } from "@/components/affiliate-system/AffiliateDisclosureBanner";
import {
  AFFILIATE_DISCLOSURE,
  AFFILIATE_DISCLOSURE_SHORT,
} from "@/domain/affiliate-system";

export function AffiliateReviewPanel({
  partners,
}: {
  partners: Array<{
    id: string;
    displayName: string;
    slug: string;
    partnerType: string;
    status: string;
    createdAt: string;
  }>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="grid gap-6">
      <AffiliateDisclosureBanner
        lines={AFFILIATE_DISCLOSURE}
        short={AFFILIATE_DISCLOSURE_SHORT}
      />
      {partners.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">No partners yet.</p>
      ) : (
        <ul className="grid gap-3">
          {partners.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{p.displayName}</span>
                  <Badge variant="accent">{p.partnerType}</Badge>
                  <Badge variant="neutral">{p.status}</Badge>
                </div>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  /{p.slug}
                </p>
              </div>
              {p.status === "pending" ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    startTransition(async () => {
                      await activateAffiliatePartnerAction(fd);
                      router.refresh();
                    });
                  }}
                >
                  <input type="hidden" name="partnerId" value={p.id} />
                  <Button type="submit" size="sm" loading={pending}>
                    Activate
                  </Button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
