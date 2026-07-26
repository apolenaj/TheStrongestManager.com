import { describe, expect, it } from "vitest";
import {
  ARCHIVE_HONESTY,
  ARCHIVE_LENS_LABELS,
  ARCHIVE_PROFILE_KINDS,
} from "@/domain/history/archive-constants";
import {
  archiveRelatedErasValid,
  archiveRelatedMethodsValid,
  getArchiveProfileBySlug,
  listArchiveProfiles,
} from "@/domain/history/archive";
import { HISTORICAL_ARCHIVE_PROFILES } from "@/domain/history/archive-profiles";

describe("historical-training-archive", () => {
  it("covers systems, coaches, and famous methods", () => {
    for (const kind of ARCHIVE_PROFILE_KINDS) {
      expect(listArchiveProfiles(kind).length).toBeGreaterThan(0);
    }
  });

  it("requires all three analytical lenses on every profile", () => {
    for (const profile of HISTORICAL_ARCHIVE_PROFILES) {
      expect(profile.principlesSummary.length).toBeGreaterThan(0);
      expect(profile.whatWasInnovative.length).toBeGreaterThan(0);
      expect(profile.whatRemainsUseful.length).toBeGreaterThan(0);
      expect(profile.whatModernEvidenceQuestions.length).toBeGreaterThan(0);
      expect(profile.whatWasInnovative.join()).not.toEqual(
        profile.whatModernEvidenceQuestions.join(),
      );
    }
    expect(ARCHIVE_LENS_LABELS.innovative).toMatch(/innovative/i);
    expect(ARCHIVE_LENS_LABELS.evidenceQuestions).toMatch(/evidence/i);
  });

  it("links only published methods and real timeline eras", () => {
    for (const profile of HISTORICAL_ARCHIVE_PROFILES) {
      expect(archiveRelatedMethodsValid(profile)).toBe(true);
      expect(archiveRelatedErasValid(profile)).toBe(true);
    }
  });

  it("keeps copyright / principles honesty front and center", () => {
    expect(ARCHIVE_HONESTY.join(" ")).toMatch(/copyrighted|principles/i);
    expect(ARCHIVE_HONESTY.join(" ")).toMatch(/evidence verdict/i);
  });

  it("includes Westside / Louie / HIT archive entries", () => {
    expect(getArchiveProfileBySlug("westside-conjugate-system")?.kind).toBe(
      "system",
    );
    expect(getArchiveProfileBySlug("louie-simmons")?.kind).toBe("coach");
    expect(
      getArchiveProfileBySlug("high-intensity-training-method")?.kind,
    ).toBe("method");
  });
});
