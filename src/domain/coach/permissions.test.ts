import { describe, expect, it } from "vitest";
import {
  DEFAULT_COACH_SCOPES,
  SENSITIVE_COACH_SCOPES,
  describeRoles,
  hasCoachScope,
  parseCoachScopes,
  serializeCoachScopes,
} from "@/domain/coach/permissions";

describe("coach permissions", () => {
  it("defaults to training-safe scopes without recovery or media", () => {
    expect(parseCoachScopes(undefined)).toEqual([...DEFAULT_COACH_SCOPES]);
    expect(parseCoachScopes("[]")).toEqual([...DEFAULT_COACH_SCOPES]);
    expect(parseCoachScopes("not-json")).toEqual([...DEFAULT_COACH_SCOPES]);
    for (const s of SENSITIVE_COACH_SCOPES) {
      expect(DEFAULT_COACH_SCOPES.includes(s)).toBe(false);
    }
  });

  it("parses only known scopes and ignores junk", () => {
    const scopes = parseCoachScopes(
      JSON.stringify(["training", "recovery", "hacked", "technique_media"]),
    );
    expect(scopes).toEqual(["training", "recovery", "technique_media"]);
    expect(hasCoachScope(scopes, "recovery")).toBe(true);
    expect(hasCoachScope(scopes, "body_metrics_detailed")).toBe(false);
  });

  it("serializes unique scopes", () => {
    expect(serializeCoachScopes(["training", "training", "programs"])).toBe(
      JSON.stringify(["training", "programs"]),
    );
  });

  it("describes athlete / coach / both roles", () => {
    expect(describeRoles({ isAthlete: true, isCoach: false })).toBe("Athlete");
    expect(describeRoles({ isAthlete: false, isCoach: true })).toBe("Coach");
    expect(describeRoles({ isAthlete: true, isCoach: true })).toBe(
      "Athlete + Coach",
    );
  });
});
