import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { CoachProfileDetail } from "@/components/marketplace/CoachProfileDetail";
import { getPublishedCoachListingBySlug } from "@/services/marketplace";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const coach = await getPublishedCoachListingBySlug(slug);
  if (!coach) return { title: "Coach" };
  return {
    title: coach.displayName,
    description:
      coach.bio?.slice(0, 160) ||
      `Coaching profile — ${coach.specializations.join(", ")}`,
  };
}

export default async function CoachingProfilePage({ params }: Props) {
  const { slug } = await params;
  const coach = await getPublishedCoachListingBySlug(slug);
  if (!coach) notFound();

  return (
    <MarketingContainer>
      <p className="mb-6 text-sm">
        <Link href="/coaching" className="text-[var(--color-accent)]">
          ← All coaches
        </Link>
      </p>
      <CoachProfileDetail coach={coach} />
    </MarketingContainer>
  );
}
