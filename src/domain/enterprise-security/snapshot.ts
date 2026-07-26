import {
  COMPLIANCE_CERTIFICATIONS_NOT_OBTAINED,
  ENTERPRISE_SECURITY_AREAS,
  ENTERPRISE_SECURITY_CONTROLS,
  ENTERPRISE_SECURITY_ENGINE_VERSION,
  ENTERPRISE_SECURITY_HONESTY,
} from "@/domain/enterprise-security/constants";

export type EnterpriseSecuritySnapshot = {
  engineVersion: typeof ENTERPRISE_SECURITY_ENGINE_VERSION;
  controls: typeof ENTERPRISE_SECURITY_CONTROLS;
  areas: typeof ENTERPRISE_SECURITY_AREAS;
  honesty: typeof ENTERPRISE_SECURITY_HONESTY;
  certificationsNotObtained: typeof COMPLIANCE_CERTIFICATIONS_NOT_OBTAINED;
  docPath: "docs/ENTERPRISE_SECURITY.md";
  relatedDocs: readonly string[];
  counts: {
    documented: number;
    partial: number;
    planned: number;
    notClaimed: number;
  };
  generatedAt: string;
};

export function buildEnterpriseSecuritySnapshot(
  generatedAt: string = new Date().toISOString(),
): EnterpriseSecuritySnapshot {
  return {
    engineVersion: ENTERPRISE_SECURITY_ENGINE_VERSION,
    controls: ENTERPRISE_SECURITY_CONTROLS,
    areas: ENTERPRISE_SECURITY_AREAS,
    honesty: ENTERPRISE_SECURITY_HONESTY,
    certificationsNotObtained: COMPLIANCE_CERTIFICATIONS_NOT_OBTAINED,
    docPath: "docs/ENTERPRISE_SECURITY.md",
    relatedDocs: [
      "docs/SECURITY.md",
      "docs/DISASTER_RECOVERY.md",
      "docs/DATA_MODEL.md",
      "docs/DATA_MOAT_ARCHITECTURE.md",
    ] as const,
    counts: {
      documented: ENTERPRISE_SECURITY_CONTROLS.filter(
        (c) => c.status === "documented",
      ).length,
      partial: ENTERPRISE_SECURITY_CONTROLS.filter((c) => c.status === "partial")
        .length,
      planned: ENTERPRISE_SECURITY_CONTROLS.filter((c) => c.status === "planned")
        .length,
      notClaimed: COMPLIANCE_CERTIFICATIONS_NOT_OBTAINED.length,
    },
    generatedAt,
  };
}
