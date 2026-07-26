import { describe, expect, it } from "vitest";
import {
  highlightMatches,
  searchGlobal,
} from "@/domain/search";

describe("global search", () => {
  it("resolves RDL alias to Romanian Deadlift", () => {
    const result = searchGlobal("RDL");
    const exercises = result.groups.find((g) => g.category === "exercises");
    expect(exercises?.hits[0]?.title).toMatch(/Romanian Deadlift/i);
    expect(exercises?.hits[0]?.matchKind).toBe("alias");
    expect(exercises?.hits[0]?.href).toBe("/exercises/romanian-deadlift");
  });

  it("groups results by category without requiring AI", () => {
    const result = searchGlobal("periodization");
    expect(result.notes.some((n) => /deterministic|not required/i.test(n))).toBe(
      true,
    );
    expect(result.groups.length).toBeGreaterThan(0);
    for (const group of result.groups) {
      expect(group.hits.every((h) => h.category === group.category)).toBe(true);
    }
  });

  it("finds academy and article pillars", () => {
    const academy = searchGlobal("Deadlift Specialist");
    expect(
      academy.groups.some(
        (g) =>
          g.category === "academy" &&
          g.hits.some((h) => /Deadlift Specialist/i.test(h.title)),
      ),
    ).toBe(true);

    const learn = searchGlobal("powerlifting");
    expect(
      learn.groups.some(
        (g) =>
          g.category === "articles" &&
          g.hits.some((h) => /powerlifting/i.test(h.title)),
      ),
    ).toBe(true);
  });

  it("does not invent public program results", () => {
    const result = searchGlobal("mesocycle program template");
    const programs = result.groups.find((g) => g.category === "programs");
    expect(programs?.hits ?? []).toHaveLength(0);
  });

  it("highlights matching terms in titles", () => {
    const parts = highlightMatches("Romanian Deadlift", "dead");
    expect(parts.some((p) => p.match && /dead/i.test(p.text))).toBe(true);
    expect(parts.map((p) => p.text).join("")).toBe("Romanian Deadlift");
  });
});
