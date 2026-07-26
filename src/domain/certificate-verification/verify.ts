import {
  ACCREDITATION_NOTE,
  displayLearnerName,
  isPlausibleCertificateCode,
  normalizeCertificateCode,
  type CertificateVerifyResult,
  type PublicCertificateRecord,
} from "@/domain/certificate-verification/constants";
import { getCourseBySlug } from "@/domain/academy";

export function buildNotFoundResult(
  uniqueId: string | null,
): CertificateVerifyResult {
  return {
    found: false,
    status: "not_found",
    statusLabel: "Not found",
    uniqueId,
    isAccredited: false,
    accreditationNote: ACCREDITATION_NOTE,
  };
}

export function buildValidRecord(input: {
  code: string;
  userName: string | null | undefined;
  athleteDisplayName: string | null | undefined;
  courseSlug: string;
  certificateTitle: string;
  certificateKind: string;
  issuedAt: Date;
  enrollmentStatus: string;
}): PublicCertificateRecord | null {
  // Only treat completed enrollments as publicly valid.
  if (input.enrollmentStatus !== "completed") return null;

  const course = getCourseBySlug(input.courseSlug);
  return {
    uniqueId: input.code,
    name: displayLearnerName({
      userName: input.userName,
      athleteDisplayName: input.athleteDisplayName,
    }),
    course: course?.title ?? input.courseSlug,
    courseSlug: input.courseSlug,
    certificateTitle: input.certificateTitle,
    certificateKind: input.certificateKind,
    issuedAt: input.issuedAt.toISOString(),
    status: "valid",
    statusLabel: "Valid — Certificate of Completion",
    isAccredited: false,
    accreditationNote: ACCREDITATION_NOTE,
  };
}

export function prepareCodeLookup(
  raw: string,
):
  | { ok: true; code: string }
  | { ok: false; result: CertificateVerifyResult } {
  const code = normalizeCertificateCode(raw);
  if (!code || !isPlausibleCertificateCode(code)) {
    return { ok: false, result: buildNotFoundResult(code || null) };
  }
  return { ok: true, code };
}
