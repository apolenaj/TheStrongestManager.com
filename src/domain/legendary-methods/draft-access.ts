/**
 * Draft / publish access control for Legendary Training Methods profiles.
 *
 * Drafts stay out of sitemap, cards, search, and (by default) public URLs.
 * Local preview requires ALLOW_LEGENDARY_DRAFT_PREVIEW=true.
 */

export function allowLegendaryDraftPreview(): boolean {
  return process.env.ALLOW_LEGENDARY_DRAFT_PREVIEW === "true";
}

/**
 * Whether a draft profile may be rendered on a detail URL.
 * Published profiles always may; drafts only when preview is explicitly enabled.
 */
export function canServeLegendaryMethodProfile(status: "draft" | "published"): boolean {
  if (status === "published") return true;
  return allowLegendaryDraftPreview();
}
