"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { IconButton } from "@/design-system/components/IconButton";
import { logoutAction } from "@/services/auth/actions";
import { cn } from "@/design-system/utils/cn";

export type AccountMenuUser = {
  email: string | null | undefined;
};

export function AccountMenu({
  compact = false,
  user,
}: {
  compact?: boolean;
  user?: AccountMenuUser | null;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const signedIn = Boolean(user?.email);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      {compact ? (
        <IconButton
          aria-label="Account menu"
          aria-expanded={open}
          aria-haspopup="menu"
          aria-controls={menuId}
          onClick={() => setOpen((value) => !value)}
        >
          <UserIcon />
        </IconButton>
      ) : (
        <button
          type="button"
          className={cn(
            "inline-flex h-9 max-w-[12rem] items-center gap-2 truncate rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 text-sm text-[var(--color-foreground)] transition-colors hover:border-[var(--color-border-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]",
          )}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-controls={menuId}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="truncate">{user?.email ?? "Account"}</span>
          <ChevronIcon />
        </button>
      )}
      {open ? (
        <ul
          id={menuId}
          role="menu"
          className="absolute right-0 z-[var(--z-dropdown)] mt-1 min-w-[12rem] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] py-1 shadow-[var(--shadow-md)]"
        >
          {signedIn ? (
            <li className="border-b border-[var(--color-border)] px-3 py-2 text-xs text-[var(--color-muted)]">
              {user?.email}
            </li>
          ) : null}
          <li role="none">
            <Link
              role="menuitem"
              href="/app/settings"
              className="block px-3 py-2 text-sm hover:bg-[var(--color-surface-overlay)] focus-visible:bg-[var(--color-surface-overlay)] focus-visible:outline-none"
              onClick={() => setOpen(false)}
            >
              Settings
            </Link>
          </li>
          <li role="none">
            <Link
              role="menuitem"
              href="/"
              className="block px-3 py-2 text-sm hover:bg-[var(--color-surface-overlay)] focus-visible:bg-[var(--color-surface-overlay)] focus-visible:outline-none"
              onClick={() => setOpen(false)}
            >
              Marketing site
            </Link>
          </li>
          {signedIn ? (
            <li role="none">
              <form action={logoutAction}>
                <button
                  type="submit"
                  role="menuitem"
                  className="block w-full px-3 py-2 text-left text-sm text-[var(--color-danger)] hover:bg-[var(--color-surface-overlay)]"
                >
                  Log out
                </button>
              </form>
            </li>
          ) : (
            <li role="none">
              <Link
                role="menuitem"
                href="/login"
                className="block px-3 py-2 text-sm hover:bg-[var(--color-surface-overlay)]"
                onClick={() => setOpen(false)}
              >
                Log in
              </Link>
            </li>
          )}
        </ul>
      ) : null}
    </div>
  );
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <circle cx="9" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M4 14.5c1.2-2 2.8-3 5-3s3.8 1 5 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M3 4.5L6 7.5L9 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
