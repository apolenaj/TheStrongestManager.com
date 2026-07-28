import Link from "next/link";
import {
  Alert,
  Badge,
  ButtonLink,
} from "@/design-system";
import {
  getRelatedClusters,
  type SeoTopicCluster,
} from "@/domain/seo";
import { featureFlags } from "@/config/feature-flags";

export function LearnHub({ clusters }: { clusters: SeoTopicCluster[] }) {
  return (
    <div className="space-y-10">
      <Alert tone="info" title="How these guides are written">
        Each topic is curated and linked to real product pages. We do not publish
        thin filler articles.
        {featureFlags.evidenceQualitySystem ? (
          <>
            {" "}
            Content uses{" "}
            <a href="/evidence" className="text-[var(--color-accent)] underline-offset-2 hover:underline">
              evidence quality labels
            </a>{" "}
            that separate research evidence from expert practice — without faking
            certainty.
          </>
        ) : null}
      </Alert>

      <p className="text-sm leading-relaxed text-[var(--color-muted)]">
        Prefer sourced athlete and system analyses?{" "}
        <Link
          href="/legendary-methods"
          className="font-medium text-[var(--color-accent)] underline-offset-2 hover:underline"
        >
          Explore Legendary Methods
        </Link>
        .
      </p>

      <ul className="grid gap-5 md:grid-cols-2">
        {clusters.map((cluster) => (
          <li
            key={cluster.slug}
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-5"
          >
            <Badge variant="accent">{cluster.clusterLabel}</Badge>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-xl text-[var(--color-foreground)]">
              {cluster.title}
            </h2>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              {cluster.description}
            </p>
            <p className="mt-3 text-xs text-[var(--color-muted)]">
              {cluster.supportingPages.length} supporting deep links
            </p>
            <div className="mt-4">
              <ButtonLink
                href={`/learn/${cluster.slug}`}
                variant="secondary"
                size="sm"
              >
                Open pillar
              </ButtonLink>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LearnPillar({ cluster }: { cluster: SeoTopicCluster }) {
  const related = getRelatedClusters(cluster);

  return (
    <article className="space-y-10">
      <Alert tone="info" title="Supporting links">
        Links below go to existing exercises, methods, history, academy, and
        tools — not empty stubs.
      </Alert>

      <p className="max-w-3xl text-base leading-relaxed text-[var(--color-muted)]">
        {cluster.overview}
      </p>

      {cluster.sections.map((section) => (
        <section key={section.heading} className="space-y-3">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-foreground)]">
            {section.heading}
          </h2>
          <p className="max-w-3xl text-sm leading-relaxed text-[var(--color-muted)]">
            {section.body}
          </p>
        </section>
      ))}

      <section className="space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-foreground)]">
          Supporting pages
        </h2>
        <ul className="space-y-3">
          {cluster.supportingPages.map((page) => (
            <li
              key={page.href}
              className="border-t border-[var(--color-border)] pt-3"
            >
              <ButtonLink href={page.href} variant="ghost" size="sm">
                {page.title}
              </ButtonLink>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                {page.reason}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {cluster.faqs.length > 0 ? (
        <section className="space-y-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-foreground)]">
            FAQ
          </h2>
          <dl className="space-y-4">
            {cluster.faqs.map((faq) => (
              <div key={faq.question}>
                <dt className="font-medium text-[var(--color-foreground)]">
                  {faq.question}
                </dt>
                <dd className="mt-1 text-sm text-[var(--color-muted)]">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-foreground)]">
            Related clusters
          </h2>
          <ul className="flex flex-wrap gap-2">
            {related.map((r) => (
              <li key={r.slug}>
                <ButtonLink
                  href={`/learn/${r.slug}`}
                  variant="secondary"
                  size="sm"
                >
                  {r.title}
                </ButtonLink>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <ButtonLink href="/learn" variant="secondary">
        All topic clusters
      </ButtonLink>
    </article>
  );
}
