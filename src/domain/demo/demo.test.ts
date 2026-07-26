import { describe, expect, it } from "vitest";
import {
  DEMO_ATHLETE_DISPLAY_NAME,
  DEMO_ATHLETE_EMAIL,
  DEMO_MODE_LABEL,
  buildDemoDashboardFixture,
  isReservedDemoEmail,
  mapDashboardViewToDemoPaths,
  toDemoHref,
} from "@/domain/demo";
import { assertDemoDataNotMergedIntoProduction } from "@/services/demo/demo-service";

describe("demo mode isolation helpers", () => {
  it("reserves the demo email domain for Demo Mode only", () => {
    expect(isReservedDemoEmail(DEMO_ATHLETE_EMAIL)).toBe(true);
    expect(isReservedDemoEmail("coach@demo.thestrongest.local")).toBe(true);
    expect(isReservedDemoEmail("athlete@example.com")).toBe(false);
  });

  it("maps app paths onto /demo without leaking /app links", () => {
    expect(toDemoHref("/app/today")).toBe("/demo/today");
    expect(toDemoHref("/app")).toBe("/demo");
    expect(toDemoHref("/pricing")).toBe("/pricing");
  });

  it("builds a labeled demo dashboard fixture", () => {
    const view = buildDemoDashboardFixture();
    expect(view.isDemoPresentation).toBe(true);
    expect(view.greetingName).toBe(DEMO_ATHLETE_DISPLAY_NAME);
    expect(view.isNewAthlete).toBe(false);
    expect(view.scores.athlete.href.startsWith("/demo")).toBe(true);
    expect(view.opportunity?.href.startsWith("/demo")).toBe(true);
    expect(DEMO_MODE_LABEL).toMatch(/demo athlete/i);
  });

  it("rewrites seeded dashboard hrefs into Demo Mode paths", () => {
    const base = buildDemoDashboardFixture();
    const withAppLinks = {
      ...base,
      isDemoPresentation: false,
      greetingName: "Someone Else",
      scores: {
        ...base.scores,
        athlete: { ...base.scores.athlete, href: "/app/progress" },
      },
      opportunity: {
        id: "x",
        title: "t",
        body: "b",
        category: "training",
        href: "/app/today",
      },
    };
    const mapped = mapDashboardViewToDemoPaths(withAppLinks);
    expect(mapped.isDemoPresentation).toBe(true);
    expect(mapped.greetingName).toBe(DEMO_ATHLETE_DISPLAY_NAME);
    expect(mapped.scores.athlete.href).toBe("/demo/progress");
    expect(mapped.opportunity?.href).toBe("/demo/today");
  });

  it("refuses merging demo presentation data into production users", () => {
    expect(() =>
      assertDemoDataNotMergedIntoProduction({
        targetUserIsDemo: false,
        sourceIsDemoPresentation: true,
      }),
    ).toThrow(/cannot be merged/i);

    expect(() =>
      assertDemoDataNotMergedIntoProduction({
        targetUserIsDemo: true,
        sourceIsDemoPresentation: true,
      }),
    ).not.toThrow();
  });
});
