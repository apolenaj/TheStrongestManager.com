import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/design-system";
import type { ShareCardFormatId } from "@/domain/share-cards";
import type { TechniqueShareCardModel } from "@/domain/technique-share-cards";
import { TechniqueScoreCardPreview } from "@/components/technique-share/TechniqueScoreCardPreview";
import { getTechniqueShareByToken } from "@/services/technique-share";

type Props = {
  params: Promise<{ token: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const share = await getTechniqueShareByToken(token);
  if (!share) {
    return {
      title: "Technique share",
      robots: { index: false, follow: false },
    };
  }
  const c = share.payload.card;
  return {
    title: `${c.eyebrow}${c.scoreLine ? ` ${c.scoreLine}` : ""}`,
    description: "Technique analysis from TheStrongestManager — Analyze your lift.",
    robots: { index: false, follow: false },
  };
}

export default async function PublicTechniqueSharePage({ params }: Props) {
  const { token } = await params;
  const share = await getTechniqueShareByToken(token);
  if (!share) notFound();

  const { payload } = share;
  const card: TechniqueShareCardModel = {
    ...payload.card,
    formatId: (payload.card.formatId || "instagram_post") as ShareCardFormatId,
    includeThumbnailInPng: false,
  };

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center gap-6 px-6 py-16">
      <TechniqueScoreCardPreview
        model={card}
        className="w-full overflow-hidden rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-lg)]"
      />
      <div className="grid gap-3">
        <ButtonLink href={payload.referralPath}>
          {payload.ctaLabel}
        </ButtonLink>
        <p className="text-center text-sm text-[var(--color-muted)]">
          <Link
            href="/"
            className="text-[var(--color-accent)] underline-offset-2 hover:underline"
          >
            TheStrongestManager
          </Link>
        </p>
      </div>
    </main>
  );
}
