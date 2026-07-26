import { Alert } from "@/design-system";

/**
 * Mandatory disclosure banner — render before any affiliate partnership UI.
 */
export function AffiliateDisclosureBanner({
  lines,
  short,
}: {
  lines: readonly string[];
  short?: string;
}) {
  return (
    <Alert tone="warning" title="Affiliate disclosure">
      <p>{short ?? lines[0]}</p>
      {lines.length > 1 ? (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          {lines.slice(1).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : null}
    </Alert>
  );
}
