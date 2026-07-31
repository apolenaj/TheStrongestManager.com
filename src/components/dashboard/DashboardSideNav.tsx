"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/design-system/utils/cn";

const LINKS = [
  { href: "/app/programs", key: "myPrograms" as const },
  { href: "/app/progress", key: "strengthMetrics" as const },
  { href: "/app/settings", key: "settings" as const },
] as const;

export function DashboardSideNav() {
  const t = useTranslations("Dashboard.nav");
  const pathname = usePathname();

  return (
    <nav aria-label={t("aria")} className="space-y-1">
      {LINKS.map((link) => {
        const active =
          pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "block border border-transparent px-3 py-2.5 text-xs font-bold uppercase tracking-[0.12em] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]",
              active
                ? "border-zinc-800 bg-zinc-900 text-white"
                : "text-zinc-400 hover:border-zinc-800 hover:bg-zinc-900/60 hover:text-white",
            )}
          >
            {t(link.key)}
          </Link>
        );
      })}
    </nav>
  );
}
