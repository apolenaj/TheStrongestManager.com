import { absoluteUrl, siteConfig } from "@/config/site";
import { breadcrumbJsonLd, type JsonLd } from "@/domain/seo";
import type { LegendaryMethodCardModel } from "@/domain/legendary-methods/cards";

/** Abstract OG artwork path — never athlete photographs. */
export const LEGENDARY_METHODS_OG_IMAGE_PATH =
  "/legendary-methods/opengraph-image";

export function legendaryMethodsLibraryJsonLd(input: {
  name: string;
  description: string;
  cards: LegendaryMethodCardModel[];
  dateModified?: string;
}): JsonLd[] {
  const path = "/legendary-methods";
  const collection: JsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: input.name,
    description: input.description,
    url: absoluteUrl(path),
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: absoluteUrl("/"),
    },
    publisher: {
      "@type": "Organization",
      name: "The Strongest Manager editorial team",
      url: absoluteUrl("/"),
    },
    about: {
      "@type": "Thing",
      name: "Legendary training methods",
      description:
        "Independent educational analyses of bodybuilding, strongman, and powerlifting training systems.",
    },
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
    ...(input.cards.length > 0
      ? {
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: input.cards.length,
            itemListElement: input.cards.map((card, index) => ({
              "@type": "ListItem",
              position: index + 1,
              url: absoluteUrl(card.href),
              name: card.profileTitle,
            })),
          },
        }
      : {}),
  };

  return [
    collection,
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Legendary Training Methods", path },
    ]),
  ];
}

/** Shared OG/Twitter metadata for Legendary Methods pages (abstract art only). */
export function legendaryMethodsSocialMetadata(input: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
}) {
  const ogImage = absoluteUrl(LEGENDARY_METHODS_OG_IMAGE_PATH);
  return {
    openGraph: {
      title: input.title,
      description: input.description,
      url: input.path,
      type: input.type ?? "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "Legendary Training Methods — abstract barbell geometry graphic",
        },
      ],
      ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
      ...(input.modifiedTime ? { modifiedTime: input.modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image" as const,
      title: input.title,
      description: input.description,
      images: [ogImage],
    },
  };
}
