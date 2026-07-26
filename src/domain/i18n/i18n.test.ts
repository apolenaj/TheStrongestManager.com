import { describe, expect, it } from "vitest";
import {
  buildI18nArchitectureSnapshot,
  FITNESS_TERMINOLOGY,
  I18N_HONESTY,
  interpolateMessage,
  listActiveLocales,
  listPlannedLocales,
  resolveActiveLocale,
  resolveTerminology,
  t,
} from "@/domain/i18n";

describe("i18n architecture", () => {
  it("ships English as the only active locale", () => {
    expect(listActiveLocales()).toEqual(["en"]);
    expect(listPlannedLocales()).toEqual(["cs", "de", "es", "ar"]);
  });

  it("falls planned locales back to English for runtime resolution", () => {
    expect(resolveActiveLocale("cs")).toBe("en");
    expect(resolveActiveLocale("ar")).toBe("en");
    expect(resolveActiveLocale("en")).toBe("en");
    expect(resolveActiveLocale("xx")).toBe("en");
  });

  it("resolves English UI messages without hard-coded component literals", () => {
    expect(t("a11y.skipToContent", "en")).toBe("Skip to content");
    expect(t("i18n.admin.title", "en")).toBe("Internationalization");
    expect(
      interpolateMessage("Engine {version}", { version: "i18n.v1" }),
    ).toBe("Engine i18n.v1");
  });

  it("falls back to English when a planned catalog is empty", () => {
    expect(t("common.save", "cs")).toBe("Save");
    expect(t("common.save", "de")).toBe("Save");
  });

  it("keeps technical fitness terminology in English until reviewed", () => {
    for (const locale of ["cs", "de", "es", "ar"] as const) {
      expect(resolveTerminology("term.rpe", locale)).toBe("RPE");
      expect(t("term.1rm", locale)).toBe("1RM");
      expect(t("term.deadlift", locale)).toBe("deadlift");
    }
    expect(
      FITNESS_TERMINOLOGY.every((e) => e.requiresHumanReview === true),
    ).toBe(true);
    expect(
      FITNESS_TERMINOLOGY.every(
        (e) => Object.keys(e.reviewedTranslations).length === 0,
      ),
    ).toBe(true);
  });

  it("builds a readiness snapshot with Arabic RTL metadata", () => {
    const snap = buildI18nArchitectureSnapshot("2026-07-21T00:00:00.000Z");
    expect(snap.defaultLocale).toBe("en");
    expect(snap.englishMessageCount).toBeGreaterThan(10);
    expect(snap.terminologyCount).toBe(FITNESS_TERMINOLOGY.length);
    const ar = snap.readiness.find((r) => r.locale === "ar");
    expect(ar?.textDirection).toBe("rtl");
    expect(ar?.messageCoverage).toBe(0);
    expect(ar?.terminologyPending).toBe(FITNESS_TERMINOLOGY.length);
    const en = snap.readiness.find((r) => r.locale === "en");
    expect(en?.messageCoverage).toBe(1);
    expect(I18N_HONESTY.join(" ")).toMatch(/without review|human review/i);
  });
});
