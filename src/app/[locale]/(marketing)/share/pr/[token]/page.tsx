import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/design-system";
import { prTypeLabel, type PrType } from "@/domain/pr-intelligence";
import {
  type ShareCardFormatId,
  type ShareCardModel,
} from "@/domain/share-cards";
import { PerformanceCardPreview } from "@/components/share-cards/PerformanceCardPreview";
import { getPrShareByToken } from "@/services/pr-intelligence";

type Props = {
  params: Promise<{ token: string }>;
};

function cardFromPayload(
  payload: NonNullable<
    Awaited<ReturnType<typeof getPrShareByToken>>
  >["payload"],
): ShareCardModel | null {
  const c = payload.shareCard;
  if (!c) return null;
  const formatId = (c.formatId || "instagram_post") as ShareCardFormatId;
  return {
    formatId,
    eyebrow: c.eyebrow,
    headline: c.cardHeadline,
    lines: [
      ...c.stats.map((s) => ({
        kind: "stat" as const,
        label: s.label,
        value: s.value,
      })),
      { kind: "brand" as const, value: c.brand },
    ],
    brand: c.brand,
    honestyFootnote: payload.honestyNote,
    includedMetrics: c.includedMetrics as ShareCardModel["includedMetrics"],
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const share = await getPrShareByToken(token);
  if (!share) {
    return { title: "PR share", robots: { index: false, follow: false } };
  }
  const eyebrow = share.payload.shareCard?.eyebrow ?? share.payload.title;
  return {
    title: `${eyebrow}: ${share.payload.shareCard?.cardHeadline ?? share.payload.headline}`,
    description: `${share.payload.exerciseLabel} — The Strongest`,
    robots: { index: false, follow: false },
  };
}

export default async function PublicPrSharePage({ params }: Props) {
  const { token } = await params;
  const share = await getPrShareByToken(token);
  if (!share) notFound();

  const { payload } = share;
  const card = cardFromPayload(payload);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center gap-6 px-6 py-16">
      {card ? (
        <PerformanceCardPreview
          model={card}
          className="w-full overflow-hidden rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-lg)]"
        />
      ) : (
        <div className="grid gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <Badge variant="accent">{payload.title}</Badge>
            {payload.types.map((t: PrType) => (
              <Badge key={t} variant="neutral">
                {prTypeLabel(t)}
              </Badge>
            ))}
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight text-[var(--color-fg)]">
            {payload.headline}
          </h1>
          <p className="text-[var(--color-muted)]">{payload.exerciseLabel}</p>
          <ul className="grid gap-2 text-sm text-[var(--color-muted)]">
            {payload.related.map((line, i) => (
              <li
                key={i}
                className="border-l-2 border-[var(--color-border)] pl-3"
              >
                {line}
              </li>
            ))}
          </ul>
          <p className="text-xs text-[var(--color-muted)]">
            {payload.honestyNote}
          </p>
        </div>
      )}
      <p className="text-sm text-[var(--color-muted)]">
        <Link
          href="/"
          className="text-[var(--color-accent)] underline-offset-2 hover:underline"
        >
          The Strongest
        </Link>
      </p>
    </main>
  );
}
