import { describe, expect, it } from "vitest";
import {
  COMPLIANCE_CERTIFICATIONS_NOT_OBTAINED,
  ENTERPRISE_SECURITY_AREAS,
  ENTERPRISE_SECURITY_CONTROLS,
  ENTERPRISE_SECURITY_HONESTY,
  buildEnterpriseSecuritySnapshot,
} from "@/domain/enterprise-security";

describe("enterprise security prep", () => {
  it("covers the six procurement areas", () => {
    expect([...ENTERPRISE_SECURITY_AREAS]).toEqual([
      "access_controls",
      "encryption",
      "data_processing",
      "logging",
      "backups",
      "incident_response",
    ]);
    for (const area of ENTERPRISE_SECURITY_AREAS) {
      expect(
        ENTERPRISE_SECURITY_CONTROLS.some((c) => c.area === area),
      ).toBe(true);
    }
  });

  it("does not claim compliance certifications not obtained", () => {
    const blob = ENTERPRISE_SECURITY_HONESTY.join(" ");
    expect(blob).toMatch(/do not claim SOC 2/i);
    expect(COMPLIANCE_CERTIFICATIONS_NOT_OBTAINED).toEqual(
      expect.arrayContaining([
        "SOC 2 Type II",
        "ISO/IEC 27001",
        "HIPAA (BAAs / covered entity or BA attestation)",
      ]),
    );
    const snapshot = buildEnterpriseSecuritySnapshot("2026-07-22T00:00:00.000Z");
    expect(snapshot.docPath).toBe("docs/ENTERPRISE_SECURITY.md");
    expect(snapshot.counts.notClaimed).toBe(
      COMPLIANCE_CERTIFICATIONS_NOT_OBTAINED.length,
    );
    expect(snapshot.counts.documented).toBeGreaterThan(0);
  });
});
