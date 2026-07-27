"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  ChevronDown,
  ClipboardList,
  Dumbbell,
  Menu,
  Scale,
  Target,
  Trophy,
  Workflow,
  X,
} from "lucide-react";
import { cn } from "@/design-system/utils/cn";

const POWERLIFTING_LINKS: readonly {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    href: "/goals/powerlifting-program",
    label: "IPF Standardy",
    description: "Pravidla, hloubka a soutěžní standardy",
    icon: Scale,
  },
  {
    href: "/methods/block-periodization",
    label: "Peaking programy",
    description: "Vrcholení formy před závodem",
    icon: Trophy,
  },
  {
    href: "/goals/powerlifting-program",
    label: "Závodní příprava",
    description: "Cyklus od tréninku k platformě",
    icon: Target,
  },
];

const METHOD_LINKS: readonly {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    href: "/methods/daily-undulating-periodization",
    label: "RPE / RIR systém",
    description: "Řízení intenzity podle rezervy",
    icon: ClipboardList,
  },
  {
    href: "/methods/linear-periodization",
    label: "Lineární periodizace",
    description: "Postupný nárůst zátěže v čase",
    icon: Workflow,
  },
  {
    href: "/methods/conjugate",
    label: "Conjugate metodika",
    description: "Max effort, dynamic effort, GPP",
    icon: Dumbbell,
  },
];

function NavDropdown({
  label,
  items,
}: {
  label: string;
  items: readonly {
    href: string;
    label: string;
    description: string;
    icon: LucideIcon;
  }[];
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-300 transition-all duration-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500"
        aria-haspopup="menu"
      >
        {label}
        <ChevronDown
          className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-180"
          strokeWidth={1.75}
          aria-hidden
        />
      </button>

      <div
        className={cn(
          "invisible absolute left-1/2 top-full z-50 w-[22rem] -translate-x-1/2 pt-3 opacity-0",
          "transition-all duration-300 group-hover:visible group-hover:opacity-100",
          "group-focus-within:visible group-focus-within:opacity-100",
        )}
      >
        <div
          role="menu"
          className="overflow-hidden rounded-sm border border-white/10 bg-black/95 p-2 shadow-[0_24px_48px_rgba(0,0,0,0.55)] backdrop-blur-md"
        >
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                role="menuitem"
                className="flex gap-3 rounded-sm border border-transparent px-3 py-3 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04]"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center border border-white/10 text-yellow-500">
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-white">
                    {item.label}
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-gray-400">
                    {item.description}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isHome = pathname === "/";

  return (
    <>
      <header className="sticky top-0 z-[var(--z-sticky)] w-full border-b border-white/10 bg-black/70 backdrop-blur-md transition-all duration-300">
        <div className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto] items-center gap-4 px-4 sm:h-[4.25rem] sm:px-6 lg:grid-cols-[1fr_auto_1fr]">
          <Link
            href="/"
            className="min-w-0 font-[family-name:var(--font-display)] text-sm font-semibold tracking-[-0.02em] text-white transition-all duration-300 sm:text-base"
          >
            The Strongest{" "}
            <span className="text-yellow-500">Manager</span>
          </Link>

          <nav
            aria-label="Primary"
            className="hidden items-center justify-center gap-1 lg:flex"
          >
            <NavDropdown label="Powerlifting" items={POWERLIFTING_LINKS} />
            <NavDropdown
              label="Tréninkové Metody"
              items={METHOD_LINKS}
            />
            <Link
              href={isHome ? "#about" : "/#about"}
              className="px-3 py-2 text-sm text-gray-300 transition-all duration-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500"
            >
              O mně
            </Link>
          </nav>

          <div className="flex items-center justify-end gap-2 sm:gap-3">
            <Link
              href="/login"
              className="hidden px-3 py-2 text-sm text-gray-300 transition-all duration-300 hover:text-white sm:inline-flex"
            >
              Přihlásit
            </Link>
            <Link
              href="/signup"
              className="hidden rounded-sm bg-yellow-500 px-4 py-2.5 text-sm font-semibold tracking-tight text-black transition-all duration-300 hover:bg-yellow-400 sm:inline-flex"
            >
              Zahájit trénink
            </Link>
            <button
              type="button"
              aria-label={mobileOpen ? "Zavřít menu" : "Otevřít menu"}
              aria-expanded={mobileOpen}
              className="inline-flex h-10 w-10 items-center justify-center border border-white/10 text-white transition-all duration-300 hover:border-white/20 hover:bg-white/[0.04] lg:hidden"
              onClick={() => setMobileOpen((open) => !open)}
            >
              {mobileOpen ? (
                <X className="h-[18px] w-[18px]" strokeWidth={1.5} />
              ) : (
                <Menu className="h-[18px] w-[18px]" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <div className="border-t border-white/10 bg-black/95 backdrop-blur-md lg:hidden">
            <nav
              aria-label="Primary mobile"
              className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6"
            >
              <div>
                <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-yellow-500">
                  Powerlifting
                </p>
                <ul className="mt-3 space-y-1">
                  {POWERLIFTING_LINKS.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="block border border-transparent px-3 py-2.5 text-sm text-gray-300 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
                        onClick={() => setMobileOpen(false)}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-yellow-500">
                  Tréninkové Metody
                </p>
                <ul className="mt-3 space-y-1">
                  {METHOD_LINKS.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="block border border-transparent px-3 py-2.5 text-sm text-gray-300 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
                        onClick={() => setMobileOpen(false)}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href={isHome ? "#about" : "/#about"}
                className="border border-white/10 px-3 py-3 text-sm text-white transition-all duration-300 hover:border-yellow-500/40"
                onClick={() => setMobileOpen(false)}
              >
                O mně
              </Link>

              <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
                <Link
                  href="/login"
                  className="px-3 py-3 text-center text-sm text-gray-300 transition-all duration-300 hover:text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  Přihlásit
                </Link>
                <Link
                  href="/signup"
                  className="rounded-sm bg-yellow-500 px-4 py-3 text-center text-sm font-semibold text-black transition-all duration-300 hover:bg-yellow-400"
                  onClick={() => setMobileOpen(false)}
                >
                  Zahájit trénink
                </Link>
              </div>
            </nav>
          </div>
        ) : null}
      </header>
    </>
  );
}
