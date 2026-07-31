import type { CzechProfileOverlay } from "@/domain/legendary-methods/profiles/apply-czech";
import { CZECH_OVERLAYS_PART1 } from "@/domain/legendary-methods/profiles/czech-overlays-part1";
import { CZECH_OVERLAYS_PART2 } from "@/domain/legendary-methods/profiles/czech-overlays-part2";

/** Czech copy overlays for all Legendary Methods profiles (except Arnold, which is authored inline). */
export const CZECH_PROFILE_OVERLAYS: Record<string, CzechProfileOverlay> = {
  ...CZECH_OVERLAYS_PART1,
  ...CZECH_OVERLAYS_PART2,
};
