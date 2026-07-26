import { describe, expect, it } from "vitest";
import { getAthleteState } from "@/services/performance-intelligence";

describe("PerformanceIntelligenceService", () => {
  it("returns null when the user has no athlete profile", async () => {
    const view = await getAthleteState("nonexistent-user-id");
    expect(view).toBeNull();
  });
});
