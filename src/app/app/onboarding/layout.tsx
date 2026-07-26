import type { Metadata } from "next";
import Link from "next/link";
import { requireSession } from "@/services/auth/session";
import { redirectIfOnboardingComplete } from "@/services/onboarding/guards";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Athlete onboarding",
  robots: { index: false, follow: false },
};

export default async function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireSession();
  await redirectIfOnboardingComplete(session.user.id);

  return (
    <div className="min-h-[100svh] bg-[var(--color-background)]">
      <header className="border-b border-[var(--color-border)]">
        <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-tight text-[var(--color-foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
          >
            {siteConfig.name}
          </Link>
          <p className="truncate text-xs text-[var(--color-muted)]">
            {session.user.email}
          </p>
        </div>
      </header>
      {children}
    </div>
  );
}
