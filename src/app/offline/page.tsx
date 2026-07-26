import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Offline",
  robots: { index: false, follow: false },
};

/**
 * Offline shell — shown when navigation fails while the service worker is active.
 * No authenticated data; no sensitive content.
 */
export default function OfflinePage() {
  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-6 px-4 py-16"
    >
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-muted)]">
        {siteConfig.name}
      </p>
      <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-[var(--color-foreground)]">
        You&apos;re offline
      </h1>
      <p className="text-base text-[var(--color-muted)]">
        The app shell is available, but live data needs a connection. If you
        started a workout earlier, open it again when you reconnect — pending
        set logs will sync automatically. Technique video and account settings
        are never cached offline.
      </p>
      <div className="flex flex-col gap-3">
        <Link
          href="/app/today"
          className="inline-flex min-h-14 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent)] px-4 text-base font-semibold text-[var(--color-background)]"
        >
          Try Today
        </Link>
        <Link
          href="/app/training"
          className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-strong)] px-4 text-base font-medium text-[var(--color-foreground)]"
        >
          Training
        </Link>
      </div>
    </main>
  );
}
