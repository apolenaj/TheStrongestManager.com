import Link from "next/link";
import { ADMIN_HONESTY, ADMIN_NAV } from "@/domain/admin";
import { cn } from "@/design-system/utils/cn";

export function AdminShell({
  email,
  children,
}: {
  email: string | null | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
              Admin
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-lg font-semibold">
              Content management
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-muted)]">
            <span>{email ?? "Admin"}</span>
            <Link
              href="/app/dashboard"
              className="text-[var(--color-accent)] underline-offset-2 hover:underline"
            >
              Exit to app
            </Link>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[14rem_1fr] sm:px-6">
        <nav aria-label="Admin" className="space-y-1">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--color-muted)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-foreground)]",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="min-w-0 space-y-6">
          <p className="text-xs text-[var(--color-muted)]">{ADMIN_HONESTY[0]}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
