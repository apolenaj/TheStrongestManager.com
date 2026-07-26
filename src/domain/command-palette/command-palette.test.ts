import { describe, expect, it } from "vitest";
import {
  COMMAND_PALETTE_ACTIONS,
  COMMAND_PALETTE_SHORTCUT,
  buildCommandPaletteSnapshot,
  exampleCommands,
  filterCommands,
  scoreCommand,
} from "@/domain/command-palette";

describe("command palette", () => {
  it("includes the required example commands", () => {
    const labels = exampleCommands().map((c) => c.label);
    expect(labels).toEqual(
      expect.arrayContaining([
        "Log workout",
        "Upload deadlift",
        "Ask coach",
        "Find exercise",
        "View PR",
        "Search method",
      ]),
    );
    expect(COMMAND_PALETTE_ACTIONS.length).toBeGreaterThanOrEqual(6);
  });

  it("filters and ranks by query without inventing routes", () => {
    const deadlift = filterCommands("deadlift");
    expect(deadlift[0]?.command.id).toBe("upload-deadlift");
    expect(deadlift[0]?.command.href).toBe("/app/technique");

    const workout = filterCommands("log workout");
    expect(workout.some((m) => m.command.id === "log-workout")).toBe(true);

    const empty = filterCommands("");
    expect(empty.length).toBe(COMMAND_PALETTE_ACTIONS.length);

    const nonsense = filterCommands("zzzz-not-a-command");
    expect(nonsense).toHaveLength(0);
  });

  it("scores exact label highest", () => {
    const ask = COMMAND_PALETTE_ACTIONS.find((c) => c.id === "ask-coach")!;
    expect(scoreCommand(ask, "Ask coach")).toBeGreaterThan(
      scoreCommand(ask, "coach"),
    );
  });

  it("documents keyboard shortcut distinct from content search", () => {
    expect(COMMAND_PALETTE_SHORTCUT.key).toBe("p");
    expect(COMMAND_PALETTE_SHORTCUT.shiftKey).toBe(true);
    const snap = buildCommandPaletteSnapshot("2026-07-22T00:00:00.000Z");
    expect(snap.examples).toHaveLength(6);
    expect(snap.shortcutLabel).toMatch(/Shift\+P/i);
    expect(snap.docPath).toBe("docs/COMMAND_PALETTE.md");
  });
});
