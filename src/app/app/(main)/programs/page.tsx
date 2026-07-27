import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { AdaptationsPanel } from "@/components/adaptive/AdaptationsPanel";
import { CatalogProgramsDashboard } from "@/components/catalog-workout/CatalogProgramsDashboard";
import { ButtonLink, EmptyState } from "@/design-system";
import { prisma } from "@/lib/db";
import { requireSession } from "@/services/auth/session";
import { listAdaptationsForUser } from "@/services/adaptive/adaptation-service";
import { getCatalogProgramsDashboard } from "@/services/catalog-workout";
import { normalizeMassUnit } from "@/services/units/convert";
import { featureFlags } from "@/config/feature-flags";

export const metadata: Metadata = {
  title: "My Programs",
  robots: { index: false, follow: false },
};

export default async function ProgramsPage() {
  const session = await requireSession();
  const [catalog, profile] = await Promise.all([
    getCatalogProgramsDashboard(session.user.id),
    prisma.athleteProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        programs: {
          where: { kind: "athlete" },
          orderBy: { updatedAt: "desc" },
          take: 8,
        },
      },
    }),
  ]);

  const adaptations = profile
    ? await listAdaptationsForUser(session.user.id)
    : [];
  const pendingCount = adaptations.filter((a) => a.status === "pending").length;
  const units = normalizeMassUnit(profile?.units);

  return (
    <AppPage
      eyebrow="Programming"
      title="My Programs"
      description="Active catalog training, your library, and assigned athlete templates. Adaptive changes never auto-apply."
      actions={
        <div className="flex flex-wrap gap-2">
          <ButtonLink href="/programs/find-my-program" variant="secondary" size="lg">
            Find a program
          </ButtonLink>
          {featureFlags.programBuilder ? (
            <ButtonLink href="/app/program-builder" variant="secondary" size="lg">
              Program Builder 2.0
            </ButtonLink>
          ) : null}
          <ButtonLink href="/app/adaptations" variant="secondary" size="lg">
            All adaptations
            {pendingCount > 0 ? ` (${pendingCount})` : ""}
          </ButtonLink>
        </div>
      }
    >
      <div className="space-y-14">
        <CatalogProgramsDashboard
          active={catalog.active}
          library={catalog.library}
        />

        <section className="space-y-3 border-t border-[var(--color-border)] pt-10">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
            Assigned templates
          </h2>
          {!profile ? (
            <EmptyState
              title="No athlete profile yet"
              description="Complete onboarding to assign classic athlete program templates."
              action={
                <ButtonLink href="/app/onboarding">Start onboarding</ButtonLink>
              }
            />
          ) : profile.programs.length === 0 ? (
            <EmptyState
              title="No athlete programs yet"
              description="Assign a program template to your profile to train from Today and unlock adaptations."
            />
          ) : (
            <ul className="space-y-2">
              {profile.programs.map((program) => (
                <li
                  key={program.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--color-border)] py-3 first:border-t-0"
                >
                  <div>
                    <p className="font-medium text-[var(--color-foreground)]">
                      {program.name}
                    </p>
                    <p className="text-sm text-[var(--color-subtle)]">
                      {program.status} · athlete copy
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <ButtonLink
                      href={`/app/program-review?programId=${encodeURIComponent(program.id)}`}
                      variant="secondary"
                      size="md"
                    >
                      AI review
                    </ButtonLink>
                    {featureFlags.programVersionControl ? (
                      <ButtonLink
                        href={`/app/programs/${program.id}/versions`}
                        variant="secondary"
                        size="md"
                      >
                        Versions
                      </ButtonLink>
                    ) : null}
                    <ButtonLink
                      href={`/app/programs/${program.id}`}
                      variant="secondary"
                      size="md"
                    >
                      Open
                    </ButtonLink>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {profile ? (
          <section className="space-y-4">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
              Adaptive suggestions
            </h2>
            <AdaptationsPanel
              items={adaptations
                .filter(
                  (a) =>
                    a.status === "pending" ||
                    a.status === "accepted" ||
                    a.status === "modified" ||
                    a.status === "declined",
                )
                .slice(0, 8)}
              units={units}
            />
          </section>
        ) : null}
      </div>
    </AppPage>
  );
}
