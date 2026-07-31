/**
 * One-off audit harness for Prompt 8B (run via: npx tsx scripts/legendary-methods-audit.ts)
 */
import {
  LEGENDARY_METHOD_PROFILES,
  LEGENDARY_ASSET_LICENCE_REGISTRY,
  LEGENDARY_PROHIBITED_IMAGE_CATEGORIES,
  LEGENDARY_DISCLAIMER_SHORT,
  LEGENDARY_DISCLAIMER_COMPLETE,
  assertLegendaryMethodRegistryIntegrity,
  canPublishLegendaryMethod,
  canServeLegendaryMethodProfile,
  findProhibitedWordingHits,
  getPublishedLegendaryMethods,
  allPublishedLegendaryMethodSlugs,
  listLegendaryMethodCards,
  listFeaturedLegendaryMethodCards,
  paidProgrammeCatalogUsesAthleteNames,
  relatedProgrammeUsesAthleteName,
  publicTextContainsProhibitedWording,
  validateLegendaryMethodForPublish,
} from "../src/domain/legendary-methods/index";
import { REQUIRED_LEGENDARY_SECTION_DEFINITIONS } from "../src/domain/legendary-methods/sections";
import { legendaryMethodsLibraryJsonLd } from "../src/domain/legendary-methods/seo";
import { buildPublicSitemapEntries } from "../src/domain/seo/sitemap-entries";
import { articleJsonLd, breadcrumbJsonLd } from "../src/domain/seo/schema";
import { absoluteUrl } from "../src/config/site";
import { PROGRAM_CATALOG_SEED } from "../src/domain/program-catalog/catalog";

const report: Record<string, unknown> = {};

report.totalProfiles = LEGENDARY_METHOD_PROFILES.length;
report.statuses = LEGENDARY_METHOD_PROFILES.map((p) => ({
  slug: p.slug,
  status: p.status,
  legalReviewStatus: p.legalReviewStatus ?? "unset",
  sources: p.sources.length,
  canPublish: canPublishLegendaryMethod(p),
}));
report.publishedCount = getPublishedLegendaryMethods().length;
report.publishedSlugs = allPublishedLegendaryMethodSlugs();
report.draftServeDefault = canServeLegendaryMethodProfile("draft");
report.publishedServe = canServeLegendaryMethodProfile("published");
report.registryIntegrityOk = assertLegendaryMethodRegistryIntegrity(
  LEGENDARY_METHOD_PROFILES,
).ok;
report.wordingHits = LEGENDARY_METHOD_PROFILES.flatMap((p) =>
  findProhibitedWordingHits(p).map((h) => ({ slug: p.slug, ...h })),
);
report.anyProhibitedWording = LEGENDARY_METHOD_PROFILES.some(
  publicTextContainsProhibitedWording,
);
report.paidCatalogUsesAthleteNames = paidProgrammeCatalogUsesAthleteNames();
report.relatedProgrammeAthleteNameHits = LEGENDARY_METHOD_PROFILES.filter(
  relatedProgrammeUsesAthleteName,
).map((p) => p.slug);
report.allHaveDisclaimer = LEGENDARY_METHOD_PROFILES.every(
  (p) => p.introductoryDisclaimer.en.trim().length > 40,
);
report.shortDisclaimerPresent = Boolean(LEGENDARY_DISCLAIMER_SHORT);
report.completeDisclaimerPresent = Boolean(LEGENDARY_DISCLAIMER_COMPLETE);
report.sourceStats = LEGENDARY_METHOD_PROFILES.map((p) => {
  const httpsOk = p.sources.every((s) => s.url.startsWith("https://"));
  const fieldsOk = p.sources.every(
    (s) =>
      s.title.trim() &&
      s.publisher.trim() &&
      s.accessDate.trim() &&
      s.supports.length > 0,
  );
  return { slug: p.slug, count: p.sources.length, httpsOk, fieldsOk };
});
report.sectionCoverage = LEGENDARY_METHOD_PROFILES.map((p) => {
  const missing = REQUIRED_LEGENDARY_SECTION_DEFINITIONS.filter((req) => {
    const s = p.sections.find((x) => x.id === req.id);
    return !s || (req.id !== "sources" && !s.body.en.trim());
  }).map((r) => r.id);
  const layerMismatch = REQUIRED_LEGENDARY_SECTION_DEFINITIONS.filter((req) => {
    const s = p.sections.find((x) => x.id === req.id);
    return s && s.layer !== req.layer;
  }).map((r) => r.id);
  return { slug: p.slug, missingBodies: missing, layerMismatch };
});
report.evidenceQuality = LEGENDARY_METHOD_PROFILES.map((p) => ({
  slug: p.slug,
  evidenceQuality: p.evidenceQuality,
}));
report.assetRegistryEmpty = LEGENDARY_ASSET_LICENCE_REGISTRY.length === 0;
report.prohibitedImageCategoriesCount =
  LEGENDARY_PROHIBITED_IMAGE_CATEGORIES.length;
report.libraryCards = listLegendaryMethodCards(
  getPublishedLegendaryMethods(),
).length;
report.homepageFeatured = listFeaturedLegendaryMethodCards(
  getPublishedLegendaryMethods(),
  6,
).length;
const sitemap = buildPublicSitemapEntries();
const legendarySitemap = sitemap.filter((e) =>
  String(e.url).includes("/legendary-methods"),
);
report.sitemapLegendaryPaths = legendarySitemap.map((e) => e.url);
report.draftsInSitemap = LEGENDARY_METHOD_PROFILES.filter(
  (p) =>
    p.status === "draft" &&
    legendarySitemap.some((e) =>
      String(e.url).endsWith(`/legendary-methods/${p.slug}`),
    ),
).map((p) => p.slug);
const titles = LEGENDARY_METHOD_PROFILES.map((p) => p.seo.title);
const descs = LEGENDARY_METHOD_PROFILES.map((p) => p.seo.description);
const cans = LEGENDARY_METHOD_PROFILES.map((p) => p.seo.canonicalPath);
report.seoUniqueTitles = new Set(titles).size === titles.length;
report.seoUniqueDescriptions = new Set(descs).size === descs.length;
report.seoUniqueCanonicals = new Set(cans).size === cans.length;
const libJson = legendaryMethodsLibraryJsonLd({
  name: "Legendary Training Methods",
  description: "x",
  cards: [],
});
report.librarySchemaTypes = libJson.map((g) => g["@type"]);
const article = articleJsonLd({
  headline: "t",
  description: "d",
  path: "/legendary-methods/x",
  datePublished: "2026-07-28",
  dateModified: "2026-07-28",
  image: absoluteUrl("/legendary-methods/opengraph-image"),
});
report.articleHasAuthor = JSON.stringify(article).includes("Josef");
report.articleHasImage = Boolean(article.image);
report.breadcrumbType = breadcrumbJsonLd([{ name: "Home", path: "/" }])[
  "@type"
];
const catalogSlugs = new Set(PROGRAM_CATALOG_SEED.map((p) => p.slug));
report.relatedProgrammeHrefIssues = LEGENDARY_METHOD_PROFILES.flatMap((p) =>
  p.relatedProgrammes
    .filter((r) => !catalogSlugs.has(r.slug))
    .map((r) => ({ profile: p.slug, programme: r.slug, href: r.href })),
);
const v = validateLegendaryMethodForPublish(LEGENDARY_METHOD_PROFILES[0]!);
report.samplePublishBlockers = v.ok
  ? []
  : [...new Set(v.issues.map((i) => i.code))];
report.relatedProgrammeTitles = LEGENDARY_METHOD_PROFILES.flatMap((p) =>
  p.relatedProgrammes.map((r) => ({
    profile: p.slug,
    title: r.title,
    slug: r.slug,
  })),
);
report.minSources = Math.min(
  ...LEGENDARY_METHOD_PROFILES.map((p) => p.sources.length),
);
report.allHttpsSources = (
  report.sourceStats as Array<{ httpsOk: boolean; fieldsOk: boolean }>
).every((s) => s.httpsOk && s.fieldsOk);
report.anyMissingSections = (
  report.sectionCoverage as Array<{
    missingBodies: string[];
    layerMismatch: string[];
  }>
).some((s) => s.missingBodies.length || s.layerMismatch.length);

console.log(JSON.stringify(report, null, 2));
