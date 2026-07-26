import { describe, expect, it } from "vitest";
import { detectPrEvents, toSharePayload } from "@/domain/pr-intelligence";

function at(iso: string): Date {
  return new Date(iso);
}

describe("detectPrEvents", () => {
  it("celebrates rep PR with e1RM increase and technique note", () => {
    const timeline = detectPrEvents(
      [
        {
          id: "s1",
          at: at("2026-03-01T12:00:00.000Z"),
          exerciseKey: "deadlift",
          exerciseLabel: "Deadlift",
          loadKg: 250,
          reps: 5,
        },
        {
          id: "s2",
          at: at("2026-03-10T12:00:00.000Z"),
          exerciseKey: "deadlift",
          exerciseLabel: "Deadlift",
          loadKg: 260,
          reps: 7,
        },
      ],
      [
        {
          id: "t1",
          at: at("2026-03-05T12:00:00.000Z"),
          exerciseKey: "deadlift",
          exerciseLabel: "Deadlift",
          overallScore: 62,
        },
        {
          id: "t2",
          at: at("2026-03-08T12:00:00.000Z"),
          exerciseKey: "deadlift",
          exerciseLabel: "Deadlift",
          overallScore: 71,
        },
      ],
    );

    const event = timeline.events.find((e) => e.headline === "260 kg × 7");
    expect(event).toBeDefined();
    expect(event!.title).toBe("NEW PR");
    expect(event!.types).toContain("rep_pr");
    expect(event!.types).toContain("estimated_1rm");
    expect(event!.related.some((r) => /Estimated 1RM increased/i.test(r))).toBe(
      true,
    );
    expect(
      event!.related.some((r) => /Technique score also improved/i.test(r)),
    ).toBe(true);
  });

  it("detects verified 1RM separately from estimated", () => {
    const timeline = detectPrEvents(
      [
        {
          id: "a",
          at: at("2026-04-01T12:00:00.000Z"),
          exerciseKey: "squat",
          exerciseLabel: "Squat",
          loadKg: 180,
          reps: 1,
        },
        {
          id: "b",
          at: at("2026-04-08T12:00:00.000Z"),
          exerciseKey: "squat",
          exerciseLabel: "Squat",
          loadKg: 190,
          reps: 1,
        },
      ],
      [],
    );
    expect(timeline.countsByType.one_rm).toBe(2);
    expect(timeline.events[0]!.headline).toBe("190 kg");
    expect(timeline.events[0]!.types).toContain("one_rm");
  });

  it("detects volume and technical PRs", () => {
    const timeline = detectPrEvents(
      [
        {
          id: "v1",
          at: at("2026-05-01T12:00:00.000Z"),
          exerciseKey: "bench",
          exerciseLabel: "Bench",
          loadKg: 100,
          reps: 8,
        },
        {
          id: "v2",
          at: at("2026-05-08T12:00:00.000Z"),
          exerciseKey: "bench",
          exerciseLabel: "Bench",
          loadKg: 100,
          reps: 10,
        },
      ],
      [
        {
          id: "tech",
          at: at("2026-05-01T10:00:00.000Z"),
          exerciseKey: "bench",
          exerciseLabel: "Bench",
          overallScore: 55,
        },
      ],
    );
    expect(timeline.countsByType.volume_pr).toBeGreaterThan(0);
    expect(timeline.countsByType.technical_pr).toBe(1);
    expect(timeline.countsByType.rep_pr).toBeGreaterThan(0);
  });

  it("builds a share payload without private dumps", () => {
    const timeline = detectPrEvents(
      [
        {
          id: "x",
          at: at("2026-06-01T12:00:00.000Z"),
          exerciseKey: "deadlift",
          exerciseLabel: "Deadlift",
          loadKg: 300,
          reps: 1,
        },
      ],
      [],
    );
    const payload = toSharePayload(timeline.events[0]!);
    expect(payload.headline).toBe("300 kg");
    expect(payload.honestyNote).toMatch(/Estimated 1RM/i);
  });
});
