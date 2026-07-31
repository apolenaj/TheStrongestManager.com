import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/design-system";
import { getPublicExpertProfile } from "@/services/expert-contributor";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getPublicExpertProfile(slug);
  if (!profile) return { title: "Expert" };
  return {
    title: profile.displayName,
    description:
      profile.bio?.slice(0, 160) ||
      `Expert Contributor — ${profile.specializations.join(", ")}`,
  };
}

export default async function PublicExpertProfilePage({ params }: Props) {
  const { slug } = await params;
  const profile = await getPublicExpertProfile(slug);
  if (!profile) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
        Expert Contributor
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight">
        {profile.displayName}
      </h1>
      <div className="mt-3 flex flex-wrap gap-2">
        {profile.roleLabels.map((r) => (
          <Badge key={r} variant="accent">
            {r}
          </Badge>
        ))}
      </div>
      {profile.bio ? (
        <p className="mt-6 text-[var(--color-muted)]">{profile.bio}</p>
      ) : null}
      {profile.specializations.length > 0 ? (
        <p className="mt-4 text-sm">
          <span className="text-[var(--color-muted)]">Specialization: </span>
          {profile.specializations.join(", ")}
        </p>
      ) : null}
      {profile.credentialsSummary ? (
        <p className="mt-2 text-sm">
          <span className="text-[var(--color-muted)]">Credentials: </span>
          {profile.credentialsSummary}
        </p>
      ) : null}
      {profile.experienceSummary ? (
        <p className="mt-2 text-sm">
          <span className="text-[var(--color-muted)]">Experience: </span>
          {profile.experienceSummary}
        </p>
      ) : null}

      <section className="mt-12">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
          Articles
        </h2>
        {profile.articles.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--color-muted)]">
            No published articles yet.
          </p>
        ) : (
          <ul className="mt-4 grid gap-4">
            {profile.articles.map((a) => (
              <li key={a.slug}>
                <Link
                  href={`/experts/${profile.seoSlug}/articles/${a.slug}`}
                  className="block rounded-md border border-[var(--color-border)] p-4 hover:border-[var(--color-accent)]"
                >
                  <h3 className="font-medium">{a.title}</h3>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">
                    {a.description}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
