/**
 * Program Version Control (Prompt 118).
 * History: v1, v2, v3 — who / why / date — restore without rewriting completed sessions.
 */

export const PROGRAM_VERSION_ENGINE_VERSION = "program_version.v1" as const;

export const PROGRAM_VERSION_SOURCES = [
  "save",
  "assign",
  "adaptation",
  "restore",
  "checkpoint",
] as const;

export type ProgramVersionSource = (typeof PROGRAM_VERSION_SOURCES)[number];

export const PROGRAM_VERSION_HONESTY = [
  "Program versions record who changed the plan, why, and when — labels are v1, v2, v3, and so on.",
  "Restore reapplies an editable prescription snapshot. Completed training sessions stay locked and are never rewritten.",
  "Version history is append-only. Restoring creates a new version (it does not delete older ones).",
] as const;
