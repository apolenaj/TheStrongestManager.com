import { describe, expect, it } from "vitest";
import {
  isProgramEditable,
  isSessionPrescriptionLocked,
  validateProgramOwnership,
} from "@/domain/programming/guards";

describe("programming guards", () => {
  it("allows editing draft/active programs only", () => {
    expect(isProgramEditable("draft")).toBe(true);
    expect(isProgramEditable("active")).toBe(true);
    expect(isProgramEditable("completed")).toBe(false);
    expect(isProgramEditable("archived")).toBe(false);
  });

  it("locks completed session prescriptions", () => {
    expect(
      isSessionPrescriptionLocked({
        status: "completed",
        prescriptionLockedAt: null,
      }),
    ).toBe(true);
    expect(
      isSessionPrescriptionLocked({
        status: "planned",
        prescriptionLockedAt: new Date(),
      }),
    ).toBe(true);
    expect(
      isSessionPrescriptionLocked({
        status: "planned",
        prescriptionLockedAt: null,
      }),
    ).toBe(false);
  });

  it("requires athlete ownership for athlete programs", () => {
    expect(
      validateProgramOwnership({ kind: "athlete", athleteProfileId: null }).ok,
    ).toBe(false);
    expect(
      validateProgramOwnership({
        kind: "athlete",
        athleteProfileId: "profile_1",
      }).ok,
    ).toBe(true);
    expect(
      validateProgramOwnership({ kind: "template", athleteProfileId: null }).ok,
    ).toBe(true);
  });
});
