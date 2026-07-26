import { NextResponse } from "next/server";

/**
 * Optional beacon sink for Core Web Vitals (Prompt 152).
 * Accepts JSON; does not store PII. Logs in development only.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.info("[web-vitals:beacon]", body);
    }
  } catch {
    // ignore malformed
  }
  return NextResponse.json({ ok: true });
}
