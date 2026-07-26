/**
 * Myth vs Reality service (Prompt 115).
 */

import { featureFlags } from "@/config/feature-flags";
import {
  getMythVsRealityEntryBySlug,
  listMythVsRealityEntries,
  type MythVsRealityEntry,
} from "@/domain/myth-vs-reality";

export async function getMythVsRealityOverview(): Promise<
  | { ok: true; entries: MythVsRealityEntry[] }
  | { ok: false; error: string }
> {
  if (!featureFlags.mythVsRealityEngine) {
    return { ok: false, error: "Myth vs Reality is not enabled." };
  }
  return { ok: true, entries: listMythVsRealityEntries() };
}

export async function getMythVsRealityEntry(
  slug: string,
): Promise<
  | { ok: true; entry: MythVsRealityEntry }
  | { ok: false; error: string }
> {
  if (!featureFlags.mythVsRealityEngine) {
    return { ok: false, error: "Myth vs Reality is not enabled." };
  }
  const entry = getMythVsRealityEntryBySlug(slug);
  if (!entry) return { ok: false, error: "Myth page not found." };
  return { ok: true, entry };
}
