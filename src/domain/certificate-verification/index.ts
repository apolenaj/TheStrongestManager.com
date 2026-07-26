export {
  ACCREDITATION_NOTE,
  CERTIFICATE_VERIFICATION_HONESTY,
  displayLearnerName,
  getCertificateVerificationSnapshot,
  isPlausibleCertificateCode,
  normalizeCertificateCode,
  publicVerifyPath,
} from "@/domain/certificate-verification/constants";
export type {
  CertificateVerifyResult,
  CertificateVerifyStatus,
  PublicCertificateRecord,
} from "@/domain/certificate-verification/constants";
export {
  buildNotFoundResult,
  buildValidRecord,
  prepareCodeLookup,
} from "@/domain/certificate-verification/verify";
