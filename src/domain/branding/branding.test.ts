import { describe, expect, it } from "vitest";
import {
  brandingColorsToCssVars,
  getPlatformBrandingDefaults,
  mergeBrandingConfig,
  WHITE_LABEL_HONESTY,
} from "@/domain/branding";
import { siteConfig } from "@/config/site";

describe("white-label branding config", () => {
  it("platform defaults use siteConfig and are not white-label", () => {
    const b = getPlatformBrandingDefaults();
    expect(b.displayName).toBe(siteConfig.name);
    expect(b.isWhiteLabel).toBe(false);
    expect(b.logoUrl).toBeNull();
    expect(b.colors.accent).toBeNull();
  });

  it("merges overlay without mutating platform defaults", () => {
    const merged = mergeBrandingConfig({
      displayName: "Northside Strength",
      logoUrl: "https://cdn.example.com/logo.svg",
      colors: { accent: "#1a5f4a", accentForeground: null },
      domain: { customHostname: "app.northside.example" },
      email: {
        fromName: "Northside Strength",
        templateSlots: [
          { key: "password_reset", subjectOverride: "Reset your Northside login" },
        ],
      },
    });
    expect(merged.isWhiteLabel).toBe(true);
    expect(merged.displayName).toBe("Northside Strength");
    expect(merged.colors.accent).toBe("#1a5f4a");
    expect(merged.domain.customHostname).toBe("app.northside.example");
    expect(merged.email.templateSlots).toHaveLength(1);

    const platform = getPlatformBrandingDefaults();
    expect(platform.displayName).toBe(siteConfig.name);
  });

  it("maps colors to CSS vars only when set", () => {
    expect(brandingColorsToCssVars({ ...getPlatformBrandingDefaults().colors })).toEqual(
      {},
    );
    expect(
      brandingColorsToCssVars({
        accent: "#abc",
        accentForeground: null,
        background: null,
        foreground: null,
      }),
    ).toEqual({ "--color-accent": "#abc" });
  });

  it("documents honesty that product is not fully white-labeled", () => {
    expect(WHITE_LABEL_HONESTY[0]).toMatch(/architecture-ready/i);
  });
});
