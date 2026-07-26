import { describe, expect, it } from "vitest";
import {
  OBSERVABILITY_CATEGORIES,
  OBSERVABILITY_HONESTY,
  OBSERVABILITY_SIGNALS,
  buildObservabilitySnapshot,
  createCorrelationId,
  resolveCorrelationId,
  sanitizeLogProps,
  isForbiddenLogProp,
} from "@/domain/observability";

describe("production observability", () => {
  it("covers all prompt monitoring categories", () => {
    const cats = new Set(OBSERVABILITY_SIGNALS.map((s) => s.category));
    for (const c of OBSERVABILITY_CATEGORIES) {
      expect(cats.has(c)).toBe(true);
    }
    expect(
      OBSERVABILITY_SIGNALS.every((s) => s.status === "shipped"),
    ).toBe(true);
  });

  it("sanitizes sensitive log props", () => {
    expect(isForbiddenLogProp("email")).toBe(true);
    expect(isForbiddenLogProp("storageKey")).toBe(true);
    expect(isForbiddenLogProp("stripe-signature")).toBe(true);
    const clean = sanitizeLogProps({
      email: "a@b.c",
      durationMs: 42,
      route: "/api/billing/webhook",
      password: "secret",
      nested: { bad: true },
    });
    expect(clean).toEqual({
      durationMs: 42,
      route: "/api/billing/webhook",
    });
    expect(OBSERVABILITY_HONESTY.join(" ")).toMatch(/sensitive|never/i);
  });

  it("resolves correlation ids safely", () => {
    const minted = createCorrelationId();
    expect(minted.startsWith("corr_")).toBe(true);
    expect(resolveCorrelationId("abc12345")).toBe("abc12345");
    expect(resolveCorrelationId("bad@email")).toMatch(/^corr_/);
    const snap = buildObservabilitySnapshot("2026-07-22T00:00:00.000Z");
    expect(snap.counts.shipped).toBeGreaterThanOrEqual(7);
  });
});
