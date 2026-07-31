import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicAthleteProfileView } from "@/components/public-profile/PublicAthleteProfileView";
import { getAssembledPublicProfileBySlug } from "@/services/public-profile";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getAssembledPublicProfileBySlug(slug);
  if (!profile) {
    return { title: "Athlete", robots: { index: false, follow: false } };
  }
  const name = profile.displayName?.trim() || "Athlete";
  return {
    title: `${name} · The Strongest`,
    description: profile.bio ?? `${name} on The Strongest`,
    robots: { index: true, follow: true },
  };
}

export default async function PublicAthletePage({ params }: Props) {
  const { slug } = await params;
  const profile = await getAssembledPublicProfileBySlug(slug);
  if (!profile) notFound();

  return (
    <main className="mx-auto min-h-[70vh] max-w-3xl px-6 py-16">
      <PublicAthleteProfileView profile={profile} />
    </main>
  );
}
