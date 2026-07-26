import { Alert, Badge, ButtonLink } from "@/design-system";
import {
  CERTIFICATE_VERIFICATION_HONESTY,
  type CertificateVerifyResult,
} from "@/domain/certificate-verification";

export function CertificateVerifyResultView({
  result,
}: {
  result: CertificateVerifyResult;
}) {
  if (!result.found) {
    return (
      <div className="space-y-6">
        <Alert tone="warning" title="Certificate not found">
          No Certificate of Completion matches
          {result.uniqueId ? (
            <>
              {" "}
              ID <span className="font-mono">{result.uniqueId}</span>
            </>
          ) : (
            " that ID"
          )}
          . Double-check the code — this is not an accreditation registry.
        </Alert>
        <dl className="grid gap-3 text-sm">
          <div>
            <dt className="text-[var(--color-muted)]">Status</dt>
            <dd className="mt-1">
              <Badge variant="neutral">{result.statusLabel}</Badge>
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted)]">Accreditation</dt>
            <dd className="mt-1 text-[var(--color-foreground)]">
              {result.accreditationNote}
            </dd>
          </div>
        </dl>
        <ButtonLink href="/verify/certificate" variant="secondary">
          Try another ID
        </ButtonLink>
      </div>
    );
  }

  const { record } = result;
  const issued = new Date(record.issuedAt);

  return (
    <div className="space-y-6">
      <Alert tone="success" title="Certificate found">
        This ID matches an Academy Certificate of Completion. It is{" "}
        <strong>not</strong> an accredited professional credential.
      </Alert>

      <dl className="grid gap-4 rounded-[var(--radius-md)] border border-[var(--color-border)] p-5 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-[var(--color-muted)]">Unique ID</dt>
          <dd className="mt-1 font-mono text-[var(--color-foreground)]">
            {record.uniqueId}
          </dd>
        </div>
        <div>
          <dt className="text-[var(--color-muted)]">Status</dt>
          <dd className="mt-1">
            <Badge variant="success">{record.statusLabel}</Badge>
          </dd>
        </div>
        <div>
          <dt className="text-[var(--color-muted)]">Name</dt>
          <dd className="mt-1 text-[var(--color-foreground)]">{record.name}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-muted)]">Date issued</dt>
          <dd className="mt-1 text-[var(--color-foreground)]">
            {issued.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-[var(--color-muted)]">Course</dt>
          <dd className="mt-1 text-[var(--color-foreground)]">
            {record.course}
            <span className="mt-1 block text-xs text-[var(--color-muted)]">
              {record.certificateTitle}
            </span>
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-[var(--color-muted)]">Accreditation</dt>
            <dd className="mt-1 text-[var(--color-foreground)]">
              {record.accreditationNote}{" "}
              <Badge variant="neutral">Not accredited</Badge>
            </dd>
        </div>
      </dl>

      <ul className="list-disc space-y-2 pl-5 text-sm text-[var(--color-muted)]">
        {CERTIFICATE_VERIFICATION_HONESTY.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-2">
        <ButtonLink href="/verify/certificate" variant="secondary">
          Verify another
        </ButtonLink>
        <ButtonLink href={`/academy/${record.courseSlug}`} variant="secondary">
          View course
        </ButtonLink>
      </div>
    </div>
  );
}
