"use client";

import { useEffect } from "react";
import { reportClientError } from "@/components/observability/reportClientError";

/**
 * Root error boundary — must define its own html/body (Next.js requirement).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientError({
      digest: error.digest,
      source: "global-error",
    });
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#0a0a0b",
          color: "#f4f4f5",
          padding: "1.5rem",
        }}
      >
        <div style={{ maxWidth: "28rem" }}>
          <p style={{ color: "#d4a017", fontWeight: 600, margin: 0 }}>Error</p>
          <h1 style={{ fontSize: "1.5rem", margin: "0.5rem 0 0" }}>
            TheStrongestManager could not load
          </h1>
          <p style={{ color: "#a1a1aa", lineHeight: 1.5 }}>
            A critical error stopped the page. Try again. If it persists, return
            later — we do not invent a working UI over a broken render.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              minHeight: "44px",
              padding: "0 1rem",
              border: "none",
              borderRadius: "4px",
              background: "#d4a017",
              color: "#0a0a0b",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
