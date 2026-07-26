import {
  buildNotFoundResult,
  buildValidRecord,
  prepareCodeLookup,
  type CertificateVerifyResult,
} from "@/domain/certificate-verification";
import { prisma } from "@/lib/db";

/**
 * Public lookup by unique certificate code.
 * Never returns email or other sensitive account fields.
 */
export async function verifyCertificateByCode(
  rawCode: string,
): Promise<CertificateVerifyResult> {
  const prepared = prepareCodeLookup(rawCode);
  if (!prepared.ok) return prepared.result;

  const row = await prisma.academyCompletionCertificate.findUnique({
    where: { code: prepared.code },
    include: {
      enrollment: {
        include: {
          user: {
            select: {
              name: true,
              athleteProfile: { select: { displayName: true } },
            },
          },
        },
      },
    },
  });

  if (!row) return buildNotFoundResult(prepared.code);

  const record = buildValidRecord({
    code: row.code,
    userName: row.enrollment.user.name,
    athleteDisplayName: row.enrollment.user.athleteProfile?.displayName,
    courseSlug: row.enrollment.courseSlug,
    certificateTitle: row.title,
    certificateKind: row.certificateKind,
    issuedAt: row.issuedAt,
    enrollmentStatus: row.enrollment.status,
  });

  if (!record) return buildNotFoundResult(prepared.code);

  return { found: true, record };
}

export { publicVerifyPath } from "@/domain/certificate-verification";
