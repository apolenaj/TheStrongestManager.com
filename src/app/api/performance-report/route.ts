import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { featureFlags } from "@/config/feature-flags";
import { RATE_LIMITS, rateLimit } from "@/lib/rate-limit";
import { clientKeyFromRequest } from "@/lib/request-client-key";
import { generatePerformanceReportPdfForUser } from "@/services/performance-report";

export const runtime = "nodejs";

function parseDay(raw: string | null): Date | null {
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const d = new Date(`${raw}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function GET(request: Request) {
  if (!featureFlags.performanceReportPdf) {
    return NextResponse.json(
      { error: "Performance Report PDF is not enabled." },
      { status: 404 },
    );
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const limited = rateLimit(
    clientKeyFromRequest(request, "performance-report", session.user.id),
    RATE_LIMITS.dataExport,
  );
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Rate limit reached." },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSeconds) },
      },
    );
  }

  const url = new URL(request.url);
  const fromRaw = url.searchParams.get("from");
  const toRaw = url.searchParams.get("to");
  let from: Date | undefined;
  let to: Date | undefined;
  if (fromRaw || toRaw) {
    const f = parseDay(fromRaw);
    const t = parseDay(toRaw);
    if (!f || !t) {
      return NextResponse.json(
        { error: "Use from=YYYY-MM-DD and to=YYYY-MM-DD." },
        { status: 400 },
      );
    }
    from = f;
    to = t;
  }

  const result = await generatePerformanceReportPdfForUser({
    userId: session.user.id,
    from,
    to,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return new NextResponse(new Uint8Array(result.pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${result.filename}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
