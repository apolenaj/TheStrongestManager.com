import { describe, expect, it } from "vitest";
import {
  ACCREDITATION_NOTE,
  CERTIFICATE_VERIFICATION_HONESTY,
  buildNotFoundResult,
  buildValidRecord,
  displayLearnerName,
  getCertificateVerificationSnapshot,
  isPlausibleCertificateCode,
  normalizeCertificateCode,
  prepareCodeLookup,
} from "@/domain/certificate-verification";

describe("certificate verification", () => {
  it("never implies accreditation in honesty copy", () => {
    const blob = CERTIFICATE_VERIFICATION_HONESTY.join(" ");
    expect(blob).toMatch(/Certificates? of Completion/i);
    expect(blob).toMatch(/not an accredited/i);
    expect(ACCREDITATION_NOTE).toMatch(/Not an accredited/i);
    expect(getCertificateVerificationSnapshot().fields).toEqual([
      "uniqueId",
      "name",
      "course",
      "date",
      "status",
    ]);
  });

  it("normalizes and validates codes", () => {
    expect(normalizeCertificateCode("  aoc-abc123def456  ")).toBe(
      "AOC-ABC123DEF456",
    );
    expect(isPlausibleCertificateCode("AOC-ABCDEF123456")).toBe(true);
    expect(isPlausibleCertificateCode("x")).toBe(false);
    expect(prepareCodeLookup("bad").ok).toBe(false);
  });

  it("builds valid public records without inventing accreditation", () => {
    const record = buildValidRecord({
      code: "AOC-TESTCODE1234",
      userName: "Alex Lifter",
      athleteDisplayName: null,
      courseSlug: "programming-fundamentals",
      certificateTitle: "Certificate of Completion — Programming Fundamentals",
      certificateKind: "certificate_of_completion",
      issuedAt: new Date("2026-07-01T12:00:00.000Z"),
      enrollmentStatus: "completed",
    });
    expect(record).not.toBeNull();
    expect(record!.uniqueId).toBe("AOC-TESTCODE1234");
    expect(record!.name).toBe("Alex Lifter");
    expect(record!.course).toMatch(/Programming/i);
    expect(record!.status).toBe("valid");
    expect(record!.isAccredited).toBe(false);
    expect(record!.accreditationNote).toBe(ACCREDITATION_NOTE);

    expect(
      buildValidRecord({
        code: "AOC-TESTCODE1234",
        userName: null,
        athleteDisplayName: null,
        courseSlug: "programming-fundamentals",
        certificateTitle: "Certificate of Completion — Programming Fundamentals",
        certificateKind: "certificate_of_completion",
        issuedAt: new Date(),
        enrollmentStatus: "active",
      }),
    ).toBeNull();

    expect(displayLearnerName({ userName: null, athleteDisplayName: "Pat" })).toBe(
      "Pat",
    );
    expect(buildNotFoundResult("AOC-NOPE").found).toBe(false);
  });
});
