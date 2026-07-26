import { describe, expect, it } from "vitest";
import {
  athleteIncludedInOrgAggregates,
  buildOrgAnalytics,
  buildOrgRosterRows,
  canViewOrgAggregates,
  orgRoleUnlocksPrivateAthleteData,
  ORG_FORBIDDEN_PRIVATE_CLASSES,
  type OrgAthleteAggregateSignal,
} from "@/domain/org";

const signal = (
  partial: Partial<OrgAthleteAggregateSignal> & {
    athleteProfileId: string;
    displayName: string;
  },
): OrgAthleteAggregateSignal => ({
  teamIds: [],
  teamNames: [],
  sessionsLast7d: 0,
  sessionsLast28d: 0,
  adherencePct: null,
  techniqueDelta: null,
  ...partial,
});

describe("org permissions & privacy", () => {
  it("never unlocks private athlete data via org role", () => {
    expect(
      orgRoleUnlocksPrivateAthleteData({
        role: "org_admin",
        status: "active",
      }),
    ).toBe(false);
    expect(ORG_FORBIDDEN_PRIVATE_CLASSES).toContain("recovery_entries");
    expect(ORG_FORBIDDEN_PRIVATE_CLASSES).toContain("body_metrics");
    expect(ORG_FORBIDDEN_PRIVATE_CLASSES).toContain("technique_media");
  });

  it("requires aggregate opt-in for inclusion", () => {
    expect(
      athleteIncludedInOrgAggregates({
        membershipStatus: "active",
        aggregateOptIn: false,
      }),
    ).toBe(false);
    expect(
      athleteIncludedInOrgAggregates({
        membershipStatus: "active",
        aggregateOptIn: true,
      }),
    ).toBe(true);
  });

  it("gives org_admin aggregate view; athletes none by default", () => {
    expect(
      canViewOrgAggregates({ role: "org_admin", status: "active" }),
    ).toBe(true);
    expect(
      canViewOrgAggregates({ role: "org_athlete", status: "active" }),
    ).toBe(false);
  });
});

describe("org analytics", () => {
  it("rolls up adherence and participation without private fields", () => {
    const summary = buildOrgAnalytics(
      [
        signal({
          athleteProfileId: "1",
          displayName: "A",
          teamIds: ["t1"],
          teamNames: ["Alpha"],
          sessionsLast7d: 3,
          sessionsLast28d: 10,
          adherencePct: 80,
          techniqueDelta: 4,
        }),
        signal({
          athleteProfileId: "2",
          displayName: "B",
          teamIds: ["t1"],
          teamNames: ["Alpha"],
          sessionsLast7d: 0,
          sessionsLast28d: 4,
          adherencePct: 40,
          techniqueDelta: -6,
        }),
      ],
      [{ id: "t1", name: "Alpha" }],
    );

    expect(summary.optedInAthletes).toBe(2);
    expect(summary.participationRate7d).toBe(50);
    expect(summary.athletesMissedTraining7d).toBe(1);
    expect(summary.meanAdherencePct).toBe(60);
    expect(summary.teams[0]?.teamName).toBe("Alpha");
    expect(JSON.stringify(summary)).not.toMatch(/recovery|bodyfat|media|note/i);

    const roster = buildOrgRosterRows([
      signal({
        athleteProfileId: "1",
        displayName: "A",
        sessionsLast7d: 2,
        adherencePct: 70,
      }),
    ]);
    expect(roster[0]?.trainedLast7d).toBe(true);
    expect(roster[0]).not.toHaveProperty("recovery");
  });
});
