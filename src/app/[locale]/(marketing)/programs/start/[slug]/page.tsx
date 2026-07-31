import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { FreeProgramOnboardingForm } from "@/components/programs/FreeProgramOnboardingForm";
import { getPublicProgramBySlug } from "@/services/program-catalog";

export const revalidate = 3600;

type StartPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ weakest?: string }>;
};

export async function generateMetadata({
  params,
}: StartPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublicProgramBySlug(slug);
  if (!result.ok || !result.program.isFree) {
    return { title: "Start free program" };
  }
  const title = `Start Free · ${result.program.name}`;
  const description = `Start this free powerlifting training program — set schedule, units, and optional 1RMs to generate week 1 for ${result.program.name}.`;
  const canonical = `/programs/start/${result.program.slug}`;
  return {
    title,
    description,
    keywords: [
      "free powerlifting program",
      "powerlifting training programs",
      result.program.name.toLowerCase(),
    ],
    alternates: { canonical },
    openGraph: {
      title: `${title} | The Strongest`,
      description,
      url: canonical,
      type: "website",
    },
  };
}

export default async function StartFreeProgramPage({
  params,
  searchParams,
}: StartPageProps) {
  const { slug } = await params;
  const query = await searchParams;

  if (slug === "complete") {
    redirect("/programs/start/complete");
  }

  const result = await getPublicProgramBySlug(slug);
  if (!result.ok || !result.program.isFree) {
    notFound();
  }

  const session = await auth();
  const loginHref = `/login?callbackUrl=${encodeURIComponent(`/programs/start/${slug}`)}`;

  const weakestRaw = query.weakest;
  const weakestLift =
    weakestRaw === "squat" ||
    weakestRaw === "bench" ||
    weakestRaw === "deadlift"
      ? weakestRaw
      : "none";

  return (
    <div className="bg-[var(--color-background)]">
      <section className="border-b border-[var(--color-border)]">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
            Free onboarding
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
            {result.program.name}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-[var(--color-muted)]">
            Tell us your schedule and units. Optional 1RMs shape week-1 loads.
            Unrealistic numbers are rejected.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <FreeProgramOnboardingForm
          productSlug={result.program.slug}
          productName={result.program.name}
          availableSchedules={result.program.availableSchedules}
          isAuthenticated={Boolean(session?.user?.id)}
          loginHref={loginHref}
          weakestLift={weakestLift}
        />
      </div>
    </div>
  );
}
