import {
  Alert,
  Badge,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system";
import { getCertificateVerificationSnapshot } from "@/domain/certificate-verification";

export function CertificateVerificationPanel({
  snapshot,
}: {
  snapshot: ReturnType<typeof getCertificateVerificationSnapshot>;
}) {
  return (
    <div className="space-y-6">
      <Alert tone="warning" title="Not accredited by default">
        {snapshot.accreditationNote}
      </Alert>
      <Card>
        <CardHeader>
          <CardTitle>Public verification fields</CardTitle>
          <CardDescription>
            Shown on /verify/certificate — unique ID, name, course, date,
            status. Email is never exposed.
          </CardDescription>
        </CardHeader>
        <div className="flex flex-wrap gap-2 px-1 pb-3">
          {snapshot.fields.map((f) => (
            <Badge key={f} variant="neutral">
              {f}
            </Badge>
          ))}
        </div>
      </Card>
      <div>
        <h3 className="text-sm font-medium">Routes</h3>
        <ul className="mt-2 space-y-1 text-sm text-[var(--color-muted)]">
          {snapshot.routes.map((r) => (
            <li key={r} className="font-mono">
              {r}
            </li>
          ))}
        </ul>
      </div>
      <ul className="list-disc space-y-2 pl-5 text-sm text-[var(--color-muted)]">
        {snapshot.honesty.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}
