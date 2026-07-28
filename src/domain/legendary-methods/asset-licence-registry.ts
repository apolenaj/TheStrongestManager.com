/**
 * Asset licence registry for Legendary Training Methods.
 *
 * Allowed without a registry row: original abstract SVG/CSS artwork and
 * original diagrams/charts produced for this project.
 *
 * Required for any non-original asset: file name, source, licence,
 * commercial-use permission, attribution requirement, date obtained.
 *
 * Prohibited regardless of licence claims in this product surface:
 * celebrity photographs, athlete social-media images, documentary screenshots,
 * event broadcast footage, athlete signatures, federation logos, gym trademarks,
 * AI-generated celebrity likenesses.
 */

export type LegendaryAssetLicenceEntry = {
  fileName: string;
  source: string;
  licence: string;
  commercialUseAllowed: boolean;
  attributionRequired: boolean;
  attributionText?: string;
  dateObtained: string;
  notes?: string;
};

/** Non-original assets used by Legendary Methods. Keep empty when only original art ships. */
export const LEGENDARY_ASSET_LICENCE_REGISTRY: readonly LegendaryAssetLicenceEntry[] =
  [] as const;

export const LEGENDARY_PROHIBITED_IMAGE_CATEGORIES = [
  "celebrity photographs",
  "athlete social-media images",
  "documentary screenshots",
  "event broadcast footage",
  "athlete signatures",
  "federation logos",
  "gym trademarks",
  "AI-generated celebrity likenesses",
] as const;

export function isLegendaryAssetRegistered(fileName: string): boolean {
  return LEGENDARY_ASSET_LICENCE_REGISTRY.some(
    (entry) => entry.fileName === fileName,
  );
}

export function assertNonOriginalAssetIsLicensed(fileName: string): void {
  const entry = LEGENDARY_ASSET_LICENCE_REGISTRY.find(
    (item) => item.fileName === fileName,
  );
  if (!entry) {
    throw new Error(
      `Legendary Methods asset “${fileName}” is not in the licence registry. Register licence metadata before use.`,
    );
  }
  if (!entry.commercialUseAllowed) {
    throw new Error(
      `Legendary Methods asset “${fileName}” does not allow commercial use.`,
    );
  }
}
