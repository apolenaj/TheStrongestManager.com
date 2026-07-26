/**
 * API route observability wrapper — latency + correlation IDs.
 */

import { NextResponse } from "next/server";
import {
  CORRELATION_HEADER,
  resolveCorrelationId,
  safeErrorCode,
} from "@/domain/observability";
import { runWithObservabilityContext } from "@/services/observability/context";
import { obs } from "@/services/observability/logger";

type ApiHandler = (
  request: Request,
  context?: unknown,
) => Promise<Response> | Response;

function pathFromRequest(request: Request): string {
  try {
    return new URL(request.url).pathname;
  } catch {
    return "unknown";
  }
}

/**
 * Wrap an App Router route handler with correlation + latency logging.
 * Sets x-correlation-id on the response. Never logs bodies.
 */
export function withObservedApi(handler: ApiHandler): ApiHandler {
  return async (request: Request, context?: unknown) => {
    const correlationId = resolveCorrelationId(
      request.headers.get(CORRELATION_HEADER),
    );
    const route = pathFromRequest(request);
    const method = request.method;
    const started = Date.now();

    return runWithObservabilityContext({ correlationId, route }, async () => {
      let response: Response;
      try {
        response = await handler(request, context);
      } catch (error) {
        const durationMs = Date.now() - started;
        obs.error({
          category: "errors",
          message: "api_unhandled_exception",
          props: {
            method,
            route,
            durationMs,
            errorCode: safeErrorCode(error),
          },
        });
        response = NextResponse.json(
          { ok: false, error: "Internal error." },
          { status: 500 },
        );
      }

      const durationMs = Date.now() - started;
      const status = response.status;
      const level =
        status >= 500 ? "error" : status >= 400 ? "warn" : "info";

      obs[level]({
        category: status >= 500 ? "errors" : "api_latency",
        message: "api_request",
        props: { method, route, status, durationMs },
      });

      const headers = new Headers(response.headers);
      headers.set(CORRELATION_HEADER, correlationId);
      return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    });
  };
}
