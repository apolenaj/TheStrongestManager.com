import { NextResponse } from "next/server";
import { featureFlags } from "@/config/feature-flags";
import {
  CORRELATION_HEADER,
  resolveCorrelationId,
  sanitizeLogProps,
} from "@/domain/observability";
import { RATE_LIMITS, rateLimit } from "@/lib/rate-limit";
import { clientKeyFromRequest } from "@/lib/request-client-key";
import {
  obs,
  runWithObservabilityContext,
  withObservedApi,
} from "@/services/observability";

export const runtime = "nodejs";

/**
 * Client error beacon (Prompt 155).
 * Accepts digest-only payloads — rejects bodies with forbidden keys.
 */
async function postHandler(request: Request) {
  if (!featureFlags.productionObservability) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const limited = rateLimit(
    clientKeyFromRequest(request, "observability-client"),
    RATE_LIMITS.apiWrite,
  );
  if (!limited.ok) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const clean = sanitizeLogProps({
    digest: typeof body.digest === "string" ? body.digest : undefined,
    route: typeof body.route === "string" ? body.route : undefined,
    source: typeof body.source === "string" ? body.source : undefined,
  });

  const correlationId = resolveCorrelationId(
    typeof body.correlationId === "string"
      ? body.correlationId
      : request.headers.get(CORRELATION_HEADER),
  );

  runWithObservabilityContext({ correlationId }, () => {
    obs.error({
      category: "errors",
      message: "client_render_error",
      props: clean,
    });
  });

  return NextResponse.json({ ok: true });
}

export const POST = withObservedApi(postHandler);
