import { describe, expect, it } from "vitest";
import { formatLocalizedMoney } from "@/domain/money/format-localized";

describe("formatLocalizedMoney", () => {
  it("formats GBP programs in en as pounds", () => {
    expect(formatLocalizedMoney(4900, "gbp", "en")).toMatch(/£\s?49/);
    expect(formatLocalizedMoney(0, "gbp", "en")).toBe("Free");
  });

  it("formats GBP programs in cs as Czech koruna", () => {
    const label = formatLocalizedMoney(4900, "gbp", "cs");
    expect(label).toMatch(/1\s?490/);
    expect(label).toMatch(/Kč|CZK/);
    expect(formatLocalizedMoney(0, "gbp", "cs")).toBe("Zdarma");
  });

  it("formats USD SaaS in en as dollars and cs as koruna", () => {
    expect(formatLocalizedMoney(1900, "usd", "en")).toMatch(/\$19/);
    const cs = formatLocalizedMoney(1900, "usd", "cs");
    expect(cs).toMatch(/449/);
    expect(cs).toMatch(/Kč|CZK/);
  });
});
