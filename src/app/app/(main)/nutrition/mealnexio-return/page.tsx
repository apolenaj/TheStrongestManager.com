import { Alert, ButtonLink } from "@/design-system";
import { featureFlags } from "@/config/feature-flags";
import { requireSession } from "@/services/auth/session";
import { acceptMealnexioReturnPayload } from "@/domain/mealnexio-deep-linking";

/**
 * Return landing when Mealnexio hands back a nutrition summary.
 * Protocol is not live — never invent a summary from query params.
 */
export default async function MealnexioReturnPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireSession();
  const params = await searchParams;

  if (!featureFlags.mealnexioDeepLinking) {
    return (
      <div className="mx-auto max-w-lg space-y-4 px-4 py-12">
        <Alert tone="warning" title="Deep linking off">
          Mealnexio deep linking is feature-flagged off. No return summary is
          accepted.
        </Alert>
        <ButtonLink href="/app/nutrition" variant="secondary" size="md">
          Back to nutrition
        </ButtonLink>
      </div>
    );
  }

  // Intentionally do not invent nutrition numbers from loose query params.
  // When a signed body/handshake ships, pass it into acceptMealnexioReturnPayload
  // with protocolStatus: "ready".
  const attempt = acceptMealnexioReturnPayload(
    params.payload ? safeJson(params.payload) : null,
  );

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 py-12">
      <h1 className="font-[family-name:var(--font-display)] text-2xl">
        Mealnexio return
      </h1>
      {attempt.ok ? (
        <Alert tone="success" title="Nutrition summary received">
          Summary dated {attempt.summary.date} from Mealnexio — values come from
          the provider payload only.
        </Alert>
      ) : (
        <Alert tone="info" title="No summary to show">
          {attempt.detail} Open Mealnexio from a deep-link CTA when you want a
          nutrition review; live return sync ships with the handshake.
        </Alert>
      )}
      <ButtonLink href="/app/nutrition" variant="primary" size="md">
        Nutrition status
      </ButtonLink>
    </div>
  );
}

function safeJson(raw: string | string[] | undefined): unknown {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
