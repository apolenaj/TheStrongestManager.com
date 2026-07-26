import Link from "next/link";
import {
  Alert,
  Badge,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system";
import {
  FATIGUE_PROFILE_LABELS,
  METHOD_CATEGORY_LABELS,
  METHOD_DETAIL_SECTIONS,
  type MethodListItem,
  type TrainingMethod,
} from "@/domain/methods/types";
import { EvidenceQualityLabelChip } from "@/components/evidence-quality/EvidenceQualityBadge";
import { fromMethodContentLayer } from "@/domain/evidence-quality";
import { featureFlags } from "@/config/feature-flags";

function LayerBadge({
  layer,
}: {
  layer: "historical_description" | "modern_interpretation" | "coaching_practice";
}) {
  if (layer === "historical_description") {
    return <Badge variant="neutral">Historical description</Badge>;
  }
  if (layer === "modern_interpretation") {
    return <Badge variant="accent">Modern interpretation</Badge>;
  }
  return <Badge variant="info">Coaching practice</Badge>;
}

function Section({
  id,
  title,
  layer,
  children,
}: {
  id: string;
  title: string;
  layer: "historical_description" | "modern_interpretation" | "coaching_practice";
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-28 space-y-3 border-t border-[var(--color-border)] pt-6"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-display text-xl text-[var(--color-foreground)]">
          {title}
        </h2>
        <LayerBadge layer={layer} />
        {featureFlags.evidenceQualitySystem ? (
          <EvidenceQualityLabelChip
            label={fromMethodContentLayer(layer)}
            showFamily
          />
        ) : null}
      </div>
      <div className="space-y-3 text-sm leading-relaxed text-[var(--color-muted)]">
        {children}
      </div>
    </section>
  );
}

export function MethodDetailContent({
  method,
  related,
  basePath,
}: {
  method: TrainingMethod;
  related: MethodListItem[];
  basePath: "/methods" | "/app/methods";
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {method.categories.map((c) => (
            <Badge key={c} variant="neutral">
              {METHOD_CATEGORY_LABELS[c]}
            </Badge>
          ))}
          <Badge variant="accent">
            Fatigue · {FATIGUE_PROFILE_LABELS[method.fatigueProfile]}
          </Badge>
        </div>
        <h1 className="font-display text-3xl tracking-tight text-[var(--color-foreground)] sm:text-4xl">
          {method.name}
        </h1>
        <p className="max-w-2xl text-base text-[var(--color-muted)]">
          {method.summary}
        </p>
        {method.aliases.length > 0 ? (
          <p className="text-sm text-[var(--color-subtle)]">
            Also known as: {method.aliases.join(" · ")}
          </p>
        ) : null}
      </div>

      <Alert tone="warning" title="Read the layers">
        <strong>Historical description</strong> covers origins and classical
        framing. <strong>Modern interpretation</strong> is how coaches use ideas
        today with evidence awareness. They are not the same claim.
      </Alert>

      <Alert tone="info" title="Evidence honesty">
        {method.evidenceHonesty}{" "}
        {featureFlags.evidenceQualitySystem ? (
          <Link
            href="/evidence"
            className="text-[var(--color-accent)] underline-offset-2 hover:underline"
          >
            Evidence label guide
          </Link>
        ) : null}
      </Alert>

      <nav
        aria-label="On this page"
        className="overflow-x-auto border-y border-[var(--color-border)] py-3"
      >
        <ul className="flex min-w-max gap-3 text-sm">
          {METHOD_DETAIL_SECTIONS.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="text-[var(--color-muted)] hover:text-[var(--color-accent)]"
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <Section id="overview" title="Overview" layer="historical_description">
        <p>{method.overview}</p>
      </Section>

      <Section id="origins" title="Origins" layer="historical_description">
        <p>{method.origins}</p>
      </Section>

      <Section
        id="principles"
        title="Core principles"
        layer="historical_description"
      >
        <ul className="list-disc space-y-2 pl-5">
          {method.corePrinciples.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>

      <Section id="use-cases" title="Best use cases" layer="coaching_practice">
        <ul className="list-disc space-y-2 pl-5">
          {method.bestUseCases.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>

      <Section id="limitations" title="Limitations" layer="coaching_practice">
        <ul className="list-disc space-y-2 pl-5">
          {method.limitations.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>

      <Section id="fatigue" title="Fatigue profile" layer="coaching_practice">
        <p>
          <span className="font-medium text-[var(--color-foreground)]">
            {FATIGUE_PROFILE_LABELS[method.fatigueProfile]}
          </span>
          {" — "}
          {method.fatigueNotes}
        </p>
        <p className="text-xs text-[var(--color-subtle)]">
          Qualitative coaching label — not a laboratory fatigue measurement.
        </p>
      </Section>

      <Section
        id="athletes"
        title="Suitable athletes"
        layer="coaching_practice"
      >
        <ul className="list-disc space-y-2 pl-5">
          {method.suitableAthletes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>

      <Section
        id="programming"
        title="Programming example"
        layer="coaching_practice"
      >
        <p className="whitespace-pre-wrap">{method.programmingExample}</p>
        <p className="text-xs text-[var(--color-subtle)]">
          Illustrative teaching sketch — not an individualized prescription.
        </p>
      </Section>

      <Section
        id="modern"
        title="Modern interpretation"
        layer="modern_interpretation"
      >
        <p>{method.modernInterpretation}</p>
      </Section>

      <Section
        id="mistakes"
        title="Common mistakes"
        layer="coaching_practice"
      >
        <ul className="list-disc space-y-2 pl-5">
          {method.commonMistakes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>

      <Section id="related" title="Related methods" layer="coaching_practice">
        {related.length === 0 ? (
          <p>No related methods linked yet.</p>
        ) : (
          <ul className="grid gap-3">
            {related.map((item) => (
              <li key={item.slug}>
                <Link href={`${basePath}/${item.slug}`}>
                  <Card className="transition-colors hover:bg-[var(--color-surface-elevated)]">
                    <CardHeader className="mb-0">
                      <CardTitle className="text-base">{item.name}</CardTitle>
                      <CardDescription>{item.summary}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {related.length > 0 ? (
          <p className="pt-2">
            <Link
              href={`/compare?methods=${[method.slug, related[0]!.slug].join(",")}`}
              className="text-[var(--color-accent)]"
            >
              Compare with {related[0]!.name} →
            </Link>
            {" · "}
            <Link href="/history" className="text-[var(--color-accent)]">
              Training history →
            </Link>
            {" · "}
            <Link href="/fit" className="text-[var(--color-accent)]">
              What fits me? →
            </Link>
          </p>
        ) : (
          <p className="pt-2">
            <Link href="/compare" className="text-[var(--color-accent)]">
              Open method comparison →
            </Link>
            {" · "}
            <Link href="/history" className="text-[var(--color-accent)]">
              Training history →
            </Link>
            {" · "}
            <Link href="/fit" className="text-[var(--color-accent)]">
              What fits me? →
            </Link>
          </p>
        )}
      </Section>

      <p className="text-sm text-[var(--color-subtle)]">
        <Link href={basePath} className="text-[var(--color-accent)]">
          ← All training methods
        </Link>
      </p>
    </div>
  );
}
