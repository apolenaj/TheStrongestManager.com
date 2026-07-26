import { describe, expect, it } from "vitest";
import {
  BODYWEIGHT_MILESTONE_MIN_DELTA_KG,
  TIMELINE_EVENT_KINDS,
  assembleTimelineEvents,
  buildUniversalTimelineSnapshot,
  detectBodyweightMilestones,
  filterTimelineEvents,
  parseTimelineKindsParam,
} from "@/domain/universal-timeline";

describe("universal timeline", () => {
  it("covers all required event kinds", () => {
    expect([...TIMELINE_EVENT_KINDS]).toEqual([
      "workout",
      "pr",
      "technique_analysis",
      "program_change",
      "competition",
      "bodyweight_milestone",
      "coach_note",
    ]);
  });

  it("assembles and sorts events newest first without inventing", () => {
    const events = assembleTimelineEvents({
      workouts: [
        {
          id: "w1",
          completedAt: new Date("2026-07-10T12:00:00.000Z"),
          scheduledAt: null,
          title: "Lower A",
          status: "completed",
        },
      ],
      prs: [
        {
          id: "p1",
          occurredAt: new Date("2026-07-12T12:00:00.000Z"),
          title: "Deadlift PR",
          summary: "200 kg",
          href: "/app/prs",
          meta: "observed",
        },
      ],
      technique: [
        {
          id: "t1",
          createdAt: new Date("2026-07-11T12:00:00.000Z"),
          exerciseName: "Deadlift",
          status: "completed",
          overallScore: 72,
        },
      ],
      programChanges: [
        {
          id: "v1",
          createdAt: new Date("2026-07-01T12:00:00.000Z"),
          programName: "Peak",
          versionLabel: "v2",
          reason: "Deload tweak",
          programId: "prog1",
        },
      ],
      competitions: [
        {
          id: "c1",
          competitionDate: new Date("2026-08-01T00:00:00.000Z"),
          name: "Local meet",
          sport: "powerlifting",
          status: "active",
          weightClassLabel: "83 kg",
        },
      ],
      bodyweights: [
        {
          id: "b1",
          recordedAt: new Date("2026-07-05T08:00:00.000Z"),
          valueKg: 80,
          source: "reported",
        },
        {
          id: "b2",
          recordedAt: new Date("2026-07-20T08:00:00.000Z"),
          valueKg: 80.5,
          source: "reported",
        },
        {
          id: "b3",
          recordedAt: new Date("2026-07-25T08:00:00.000Z"),
          valueKg: 83.2,
          source: "reported",
        },
      ],
      coachNotes: [
        {
          id: "n1",
          createdAt: new Date("2026-07-09T12:00:00.000Z"),
          section: "technique",
          preview: "Keep bar path tight.",
        },
      ],
    });

    expect(events[0]?.kind).toBe("competition");
    expect(events.map((e) => e.kind)).toEqual(
      expect.arrayContaining([
        "workout",
        "pr",
        "technique_analysis",
        "program_change",
        "competition",
        "bodyweight_milestone",
        "coach_note",
      ]),
    );
    // Small 0.5 kg change is not a milestone; first + 3.2 kg are.
    const bw = events.filter((e) => e.kind === "bodyweight_milestone");
    expect(bw).toHaveLength(2);
    expect(BODYWEIGHT_MILESTONE_MIN_DELTA_KG).toBe(2.5);
  });

  it("filters by kind", () => {
    const all = assembleTimelineEvents({
      workouts: [
        {
          id: "w1",
          completedAt: new Date("2026-07-10T12:00:00.000Z"),
          scheduledAt: null,
          title: "A",
          status: "completed",
        },
      ],
      prs: [],
      technique: [],
      programChanges: [],
      competitions: [],
      bodyweights: [],
      coachNotes: [
        {
          id: "n1",
          createdAt: new Date("2026-07-09T12:00:00.000Z"),
          section: "notes",
          preview: "Hi",
        },
      ],
    });
    const filtered = filterTimelineEvents(all, { kinds: ["coach_note"] });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.kind).toBe("coach_note");
  });

  it("parses kind query params", () => {
    expect(parseTimelineKindsParam("workout,pr")).toEqual(["workout", "pr"]);
    expect(parseTimelineKindsParam("fake,workout")).toEqual(["workout"]);
  });

  it("detects first bodyweight as milestone", () => {
    const events = detectBodyweightMilestones([
      {
        id: "b1",
        recordedAt: new Date("2026-07-01T00:00:00.000Z"),
        valueKg: 90,
        source: "reported",
      },
    ]);
    expect(events).toHaveLength(1);
    expect(events[0]?.title).toMatch(/First/i);
  });

  it("snapshot documents kinds", () => {
    const snap = buildUniversalTimelineSnapshot("2026-07-22T00:00:00.000Z");
    expect(snap.kinds).toHaveLength(7);
    expect(snap.docPath).toBe("docs/UNIVERSAL_TIMELINE.md");
  });
});
