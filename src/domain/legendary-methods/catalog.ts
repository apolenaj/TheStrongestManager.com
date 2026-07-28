import {
  ARNOLD_SCHWARZENEGGER_GOLDEN_ERA_VOLUME,
  BORIS_SHEIKO_RUSSIAN_POWERLIFTING,
  COLTON_ENGELBRECHT_SUPERHEAVYWEIGHT,
  EDDIE_HALL_500KG_DEADLIFT,
  HAFTHOR_BJORNSSON_STRONGMAN_STRENGTH,
  JAMAL_BROWNER_SUMO_DEADLIFT,
  JOHN_HAACK_RELATIVE_STRENGTH,
  LOUIE_SIMMONS_CONJUGATE_METHOD,
  RONNIE_COLEMAN_HEAVY_HIGH_VOLUME,
  TOM_PLATZ_EXTREME_LEG_TRAINING,
} from "@/domain/legendary-methods/profiles";
import type { LegendaryMethodProfile } from "@/domain/legendary-methods/types";
import { assertLegendaryMethodRegistryIntegrity } from "@/domain/legendary-methods/validation";

/**
 * Typed content registry for Legendary Training Methods.
 * Prompts 5A–5D ship full draft content modules (athletes + Sheiko/Conjugate systems).
 * Related programme titles are generic (never athlete-named products).
 */

export const LEGENDARY_METHOD_PROFILES: LegendaryMethodProfile[] = [
  ARNOLD_SCHWARZENEGGER_GOLDEN_ERA_VOLUME,
  TOM_PLATZ_EXTREME_LEG_TRAINING,
  RONNIE_COLEMAN_HEAVY_HIGH_VOLUME,
  EDDIE_HALL_500KG_DEADLIFT,
  HAFTHOR_BJORNSSON_STRONGMAN_STRENGTH,
  COLTON_ENGELBRECHT_SUPERHEAVYWEIGHT,
  JOHN_HAACK_RELATIVE_STRENGTH,
  JAMAL_BROWNER_SUMO_DEADLIFT,
  BORIS_SHEIKO_RUSSIAN_POWERLIFTING,
  LOUIE_SIMMONS_CONJUGATE_METHOD,
];

const registryIntegrity = assertLegendaryMethodRegistryIntegrity(
  LEGENDARY_METHOD_PROFILES,
);
if (!registryIntegrity.ok) {
  throw new Error(
    `Legendary Methods registry integrity failed:\n${registryIntegrity.issues
      .map((i) => `- ${i.message}`)
      .join("\n")}`,
  );
}

export function allLegendaryMethodSlugs(): string[] {
  return LEGENDARY_METHOD_PROFILES.map((profile) => profile.slug);
}

export function getLegendaryMethodBySlug(
  slug: string,
): LegendaryMethodProfile | undefined {
  return LEGENDARY_METHOD_PROFILES.find((profile) => profile.slug === slug);
}

export function getPublishedLegendaryMethods(): LegendaryMethodProfile[] {
  return LEGENDARY_METHOD_PROFILES.filter(
    (profile) => profile.status === "published",
  );
}

export function getPublishedLegendaryMethodBySlug(
  slug: string,
): LegendaryMethodProfile | undefined {
  const profile = getLegendaryMethodBySlug(slug);
  if (!profile || profile.status !== "published") return undefined;
  return profile;
}

export function allPublishedLegendaryMethodSlugs(): string[] {
  return getPublishedLegendaryMethods().map((profile) => profile.slug);
}
