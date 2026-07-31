"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/design-system/utils/cn";
import {
  SITE_NAV_CATEGORIES,
  STRENGTH_AUDIT_HREF,
  siteNavCategoryLinks,
  type SiteNavCategory,
  type SiteNavFeatured,
} from "@/components/layout/site-nav";
import { navLinkMessageKey } from "@/components/layout/nav-i18n";
import { trackLegendaryAnalytics } from "@/components/legendary-methods/LegendaryAnalytics";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { usePathname } from "@/i18n/navigation";

function trackLegendaryNavClick(
  surface: "header" | "learn_menu" | "mobile_nav",
  href: string,
) {
  if (href === "/legendary-methods" || href.startsWith("/legendary-methods/")) {
    trackLegendaryAnalytics("legendary_methods_nav_click", { surface });
  }
}

function useNavCopy() {
  const t = useTranslations("Navigation");

  const categoryLabel = useCallback(
    (category: SiteNavCategory) => t(`categories.${category.id}`),
    [t],
  );

  const columnLabel = useCallback(
    (columnId: string) => t(`columns.${columnId}`),
    [t],
  );

  const linkLabel = useCallback(
    (label: string) => {
      const key = navLinkMessageKey(label);
      return key ? t(`links.${key}`) : label;
    },
    [t],
  );

  const linkDescription = useCallback(
    (label: string, fallback?: string) => {
      const key = navLinkMessageKey(label);
      if (!key) return fallback ?? "";
      return t(`descriptions.${key}`);
    },
    [t],
  );

  const featuredCopy = useCallback(
    (categoryId: string, featured: SiteNavFeatured) => {
      if (categoryId === "programs") {
        return {
          eyebrow: t("featured.eyebrow"),
          title: t("featured.findMyProgram.title"),
          description: t("featured.findMyProgram.description"),
          cta: t("featured.findMyProgram.cta"),
          href: featured.href,
        };
      }
      if (categoryId === "coaching") {
        return {
          eyebrow: t("featured.eyebrow"),
          title: t("featured.strengthAudit.title"),
          description: t("featured.strengthAudit.description"),
          cta: t("featured.strengthAudit.cta"),
          href: featured.href,
        };
      }
      return featured;
    },
    [t],
  );

  return { t, categoryLabel, columnLabel, linkLabel, linkDescription, featuredCopy };
}

function CompactDropdownPanel({
  category,
  menuId,
}: {
  category: SiteNavCategory;
  menuId: string;
}) {
  const { t, categoryLabel, linkLabel, linkDescription } = useNavCopy();
  const categoryName = categoryLabel(category);

  return (
    <div
      id={menuId}
      role="menu"
      aria-label={t("menuAria", { label: categoryName })}
      className="absolute left-0 top-full z-50 w-[min(18.5rem,calc(100vw-2rem))] pt-3"
    >
      <div className="overflow-hidden rounded-md border border-white/10 bg-zinc-900 shadow-[0_16px_48px_rgba(0,0,0,0.55)]">
        <ul className="py-2">
          {category.links.map((link) => {
            const isOverview = link.href === "/legendary-methods";
            const label = linkLabel(link.label);
            const description = link.description
              ? linkDescription(link.label, link.description)
              : undefined;
            return (
              <li key={`${category.id}-${link.href}-${link.label}`} role="none">
                <Link
                  href={link.href}
                  role="menuitem"
                  onClick={() => trackLegendaryNavClick("header", link.href)}
                  className={cn(
                    "flex min-h-11 flex-col justify-center px-4 py-2.5 transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-red-600",
                    isOverview
                      ? "mt-1 border-t border-white/10 text-sm font-semibold text-red-600 hover:bg-white/[0.04] hover:text-red-500"
                      : "text-sm text-zinc-400 hover:bg-white/[0.05] hover:text-white",
                  )}
                >
                  <span className={cn(!isOverview && "font-medium text-inherit")}>
                    {label}
                  </span>
                  {description && !isOverview ? (
                    <span className="mt-0.5 text-xs text-zinc-500">
                      {description}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function MegaMenuPanel({
  category,
  menuId,
}: {
  category: SiteNavCategory;
  menuId: string;
}) {
  const {
    t,
    categoryLabel,
    columnLabel,
    linkLabel,
    linkDescription,
    featuredCopy,
  } = useNavCopy();
  const hasColumns = Boolean(category.columns?.length);
  const categoryName = categoryLabel(category);
  const featured = category.featured
    ? featuredCopy(category.id, category.featured)
    : null;

  return (
    <div
      id={menuId}
      role="menu"
      aria-label={t("menuAria", { label: categoryName })}
      className="absolute left-1/2 top-full z-50 w-[min(44rem,calc(100vw-2rem))] -translate-x-1/2 pt-3"
    >
      <div className="overflow-hidden rounded-sm border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-[var(--shadow-overlay)] backdrop-blur-md">
        <div
          className={cn(
            "grid gap-0",
            featured ? "lg:grid-cols-[1.25fr_0.75fr]" : "grid-cols-1",
          )}
        >
          {hasColumns ? (
            <div className="grid gap-6 p-4 sm:grid-cols-2 sm:gap-4 sm:p-5">
              {category.columns!.map((column) => (
                <div key={column.id}>
                  <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                    {columnLabel(column.id)}
                  </p>
                  <ul className="grid gap-1">
                    {column.links.map((link) => {
                      const Icon = link.icon;
                      return (
                        <li
                          key={`${category.id}-${column.id}-${link.href}-${link.label}`}
                          role="none"
                        >
                          <Link
                            href={link.href}
                            role="menuitem"
                            onClick={() =>
                              trackLegendaryNavClick("learn_menu", link.href)
                            }
                            className="flex min-h-11 gap-3 rounded-sm border border-transparent px-3 py-2.5 transition-colors duration-200 hover:border-[var(--color-border)] hover:bg-white/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
                          >
                            {Icon ? (
                              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border border-[var(--color-border)] text-[var(--color-accent)]">
                                <Icon
                                  className="h-3.5 w-3.5"
                                  strokeWidth={1.5}
                                  aria-hidden
                                />
                              </span>
                            ) : null}
                            <span className="min-w-0">
                              <span className="block text-sm font-medium text-[var(--color-foreground)]">
                                {linkLabel(link.label)}
                              </span>
                              {link.description ? (
                                <span className="mt-0.5 block text-xs leading-relaxed text-[var(--color-muted)]">
                                  {linkDescription(link.label, link.description)}
                                </span>
                              ) : null}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <ul className="grid gap-1 p-3 sm:grid-cols-2 sm:p-4">
              {category.links.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={`${category.id}-${link.href}-${link.label}`} role="none">
                    <Link
                      href={link.href}
                      role="menuitem"
                      onClick={() =>
                        trackLegendaryNavClick("learn_menu", link.href)
                      }
                      className="flex min-h-11 gap-3 rounded-sm border border-transparent px-3 py-3 transition-colors duration-200 hover:border-[var(--color-border)] hover:bg-white/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
                    >
                      {Icon ? (
                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--color-border)] text-[var(--color-accent)]">
                          <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                        </span>
                      ) : null}
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-[var(--color-foreground)]">
                          {linkLabel(link.label)}
                        </span>
                        {link.description ? (
                          <span className="mt-0.5 block text-xs leading-relaxed text-[var(--color-muted)]">
                            {linkDescription(link.label, link.description)}
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {featured ? (
            <aside className="border-t border-[var(--color-border)] bg-[var(--color-surface)] p-5 lg:border-l lg:border-t-0">
              <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
                {featured.eyebrow}
              </p>
              <p className="mt-3 font-[family-name:var(--font-display)] text-xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
                {featured.title}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
                {featured.description}
              </p>
              <Link
                href={featured.href}
                role="menuitem"
                className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-sm bg-[var(--color-accent)] px-4 text-sm font-semibold text-[var(--color-accent-foreground)] transition-colors duration-200 hover:bg-[var(--color-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
              >
                {featured.cta}
                <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
              </Link>
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function DesktopNavItem({
  category,
  open,
  onOpen,
  onClose,
}: {
  category: SiteNavCategory;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const menuId = useId();
  const itemRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { t, categoryLabel } = useNavCopy();
  const label = categoryLabel(category);
  const categoryActive = Boolean(
    category.href &&
      (pathname === category.href || pathname.startsWith(`${category.href}/`)),
  );

  if (category.presentation === "link" && category.href) {
    return (
      <Link
        href={category.href}
        className={cn(
          "group inline-flex min-h-11 items-center whitespace-nowrap px-[clamp(0.4rem,0.7vw,0.75rem)] py-2 text-sm transition-colors duration-300 motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]",
          categoryActive
            ? "text-[var(--color-foreground)]"
            : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]",
        )}
      >
        <span className="relative">
          {label}
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 bg-[var(--color-accent)] transition-transform duration-300 ease-[var(--easing-standard)] motion-reduce:transition-none group-hover:scale-x-100 group-focus-visible:scale-x-100",
              categoryActive && "scale-x-100",
            )}
          />
        </span>
      </Link>
    );
  }

  function onTriggerKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    }
  }

  return (
    <div
      ref={itemRef}
      className="relative"
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
      onFocusCapture={onOpen}
      onBlurCapture={(event) => {
        if (!itemRef.current?.contains(event.relatedTarget as Node | null)) {
          onClose();
        }
      }}
    >
      <button
        type="button"
        className={cn(
          "group inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap px-[clamp(0.4rem,0.7vw,0.75rem)] py-2 text-sm transition-colors duration-300 motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]",
          categoryActive || open
            ? "text-[var(--color-foreground)]"
            : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]",
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => (open ? onClose() : onOpen())}
        onKeyDown={onTriggerKeyDown}
      >
        <span className="relative">
          {label}
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 bg-[var(--color-accent)] transition-transform duration-300 ease-[var(--easing-standard)] motion-reduce:transition-none group-hover:scale-x-100 group-focus-visible:scale-x-100",
              (open || categoryActive) && "scale-x-100",
            )}
          />
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
            open && "rotate-180",
          )}
          strokeWidth={1.75}
          aria-hidden
        />
      </button>
      <div
        className={cn(
          "transition-opacity duration-200",
          open ? "visible opacity-100" : "invisible opacity-0 pointer-events-none",
        )}
      >
        {open ? (
          category.presentation === "dropdown" ? (
            <CompactDropdownPanel category={category} menuId={menuId} />
          ) : (
            <MegaMenuPanel category={category} menuId={menuId} />
          )
        ) : null}
      </div>
      {category.href ? (
        <Link href={category.href} className="sr-only">
          {t("overviewAria", { label })}
        </Link>
      ) : null}
    </div>
  );
}

function MobileAccordion({
  category,
  open,
  onToggle,
  onNavigate,
}: {
  category: SiteNavCategory;
  open: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  const panelId = useId();
  const buttonId = useId();
  const pathname = usePathname();
  const {
    categoryLabel,
    columnLabel,
    linkLabel,
    featuredCopy,
  } = useNavCopy();
  const label = categoryLabel(category);
  const featured = category.featured
    ? featuredCopy(category.id, category.featured)
    : null;

  if (category.presentation === "link" && category.href) {
    const active =
      pathname === category.href || pathname.startsWith(`${category.href}/`);
    return (
      <div className="border-b border-[var(--color-border)]">
        <Link
          href={category.href}
          onClick={() => {
            if (category.id === "legendary-methods") {
              trackLegendaryAnalytics("legendary_methods_nav_click", {
                surface: "mobile_nav",
              });
            }
            onNavigate();
          }}
          className={cn(
            "flex min-h-12 w-full items-center py-3 font-[family-name:var(--font-display)] text-lg font-semibold uppercase tracking-[0.04em] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]",
            active
              ? "text-[var(--color-accent)]"
              : "text-[var(--color-foreground)]",
          )}
        >
          {label}
        </Link>
      </div>
    );
  }

  return (
    <div className="border-b border-[var(--color-border)]">
      <button
        id={buttonId}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className="flex min-h-12 w-full items-center justify-between gap-3 py-3 text-left font-[family-name:var(--font-display)] text-lg font-semibold uppercase tracking-[0.04em] text-[var(--color-foreground)] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
      >
        {label}
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-[var(--color-muted)] transition-transform duration-200",
            open && "rotate-180 text-[var(--color-accent)]",
          )}
          strokeWidth={1.75}
          aria-hidden
        />
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!open}
        className={cn(
          "grid transition-all duration-200 ease-[var(--easing-standard)]",
          open ? "grid-rows-[1fr] pb-4" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          {category.columns?.length ? (
            <div className="space-y-5">
              {category.columns.map((column) => (
                <div key={`${category.id}-m-col-${column.id}`}>
                  <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                    {columnLabel(column.id)}
                  </p>
                  <ul className="space-y-1">
                    {column.links.map((link) => (
                      <li key={`${category.id}-m-${column.id}-${link.href}-${link.label}`}>
                        <Link
                          href={link.href}
                          onClick={() => {
                            trackLegendaryNavClick("mobile_nav", link.href);
                            onNavigate();
                          }}
                          className="flex min-h-11 items-center px-1 py-2.5 text-base text-[var(--color-muted)] transition-colors duration-200 hover:text-[var(--color-foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
                        >
                          {linkLabel(link.label)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <ul className="space-y-1">
              {siteNavCategoryLinks(category).map((link) => (
                <li key={`${category.id}-m-${link.href}-${link.label}`}>
                  <Link
                    href={link.href}
                    onClick={() => {
                      trackLegendaryNavClick("mobile_nav", link.href);
                      onNavigate();
                    }}
                    className={cn(
                      "flex min-h-11 items-center px-1 py-2.5 text-base transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]",
                      link.href === "/legendary-methods"
                        ? "font-semibold text-red-600 hover:text-red-500"
                        : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]",
                    )}
                  >
                    {linkLabel(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {featured ? (
            <Link
              href={featured.href}
              onClick={onNavigate}
              className="mt-4 flex min-h-12 items-center justify-between gap-3 border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm font-semibold text-[var(--color-accent)] transition-colors duration-200 hover:border-[color-mix(in_srgb,var(--color-accent)_40%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
            >
              {featured.title}
              <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { t } = useNavCopy();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(!isHome);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>("coaching");
  const [openMegaId, setOpenMegaId] = useState<string | null>(null);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const closeMega = useCallback(() => {
    setOpenMegaId(null);
  }, []);

  useEffect(() => {
    closeMobile();
    closeMega();
  }, [pathname, closeMobile, closeMega]);

  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      return;
    }

    function onScroll() {
      setScrolled(window.scrollY > 24);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (mobileOpen) closeMobile();
      if (openMegaId) closeMega();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen, openMegaId, closeMobile, closeMega]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  const solid = scrolled || mobileOpen || !isHome;

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-[var(--z-sticky)] w-full transition-[background-color,border-color,backdrop-filter] duration-200",
          solid
            ? "border-b border-[var(--color-border)] bg-[#070807]/95 backdrop-blur-md"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-[4.25rem] sm:px-6">
          <BrandLogo />

          <nav
            aria-label={t("primaryNavAria")}
            className="hidden min-w-0 items-center gap-[clamp(0.15rem,0.9vw,0.65rem)] min-[1100px]:flex"
          >
            {SITE_NAV_CATEGORIES.map((category) => (
              <DesktopNavItem
                key={category.id}
                category={category}
                open={openMegaId === category.id}
                onOpen={() => setOpenMegaId(category.id)}
                onClose={closeMega}
              />
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <LanguageSwitcher className="mr-0.5 sm:mr-1" />
            <Link
              href="/login"
              className="hidden min-h-11 items-center px-3 text-sm text-[var(--color-muted)] transition-colors duration-200 hover:text-[var(--color-foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)] md:inline-flex"
            >
              {t("logIn")}
            </Link>
            <Link
              href="/signup"
              className="hidden min-h-11 items-center rounded-sm bg-[var(--color-accent)] px-4 text-sm font-semibold tracking-tight text-[var(--color-accent-foreground)] transition-colors duration-200 hover:bg-[var(--color-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)] md:inline-flex"
            >
              {t("startFree")}
            </Link>
            <button
              type="button"
              aria-label={mobileOpen ? t("closeMenu") : t("openMenu")}
              aria-expanded={mobileOpen}
              aria-controls="site-mobile-nav"
              className="inline-flex h-11 w-11 items-center justify-center border border-[var(--color-border)] text-[var(--color-foreground)] transition-colors duration-200 hover:bg-white/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)] min-[1100px]:hidden"
              onClick={() => setMobileOpen((value) => !value)}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" strokeWidth={1.5} aria-hidden />
              ) : (
                <Menu className="h-5 w-5" strokeWidth={1.5} aria-hidden />
              )}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen ? (
        <div
          id="site-mobile-nav"
          className="fixed inset-0 z-[var(--z-overlay)] flex flex-col bg-[#070807] min-[1100px]:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={t("siteNavAria")}
          style={{
            paddingTop: "env(safe-area-inset-top)",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          <div className="flex h-16 items-center justify-between border-b border-[var(--color-border)] px-4 sm:h-[4.25rem] sm:px-6">
            <BrandLogo onNavigate={closeMobile} />
            <button
              type="button"
              aria-label={t("closeMenu")}
              className="inline-flex h-11 w-11 items-center justify-center border border-[var(--color-border)] text-[var(--color-foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
              onClick={closeMobile}
            >
              <X className="h-5 w-5" strokeWidth={1.5} aria-hidden />
            </button>
          </div>

          <nav
            aria-label={t("primaryMobileNavAria")}
            className="flex-1 overflow-y-auto px-4 py-4 sm:px-6"
          >
            {SITE_NAV_CATEGORIES.map((category) => (
              <MobileAccordion
                key={category.id}
                category={category}
                open={openAccordion === category.id}
                onToggle={() =>
                  setOpenAccordion((current) =>
                    current === category.id ? null : category.id,
                  )
                }
                onNavigate={closeMobile}
              />
            ))}

            <div className="mt-6 flex flex-col gap-2 border-t border-[var(--color-border)] pt-6">
              <div className="flex min-h-11 items-center justify-center">
                <LanguageSwitcher />
              </div>
              <Link
                href="/login"
                onClick={closeMobile}
                className="flex min-h-11 items-center justify-center text-base text-[var(--color-muted)] transition-colors duration-200 hover:text-[var(--color-foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
              >
                {t("logIn")}
              </Link>
              <Link
                href="/signup"
                onClick={closeMobile}
                className="flex min-h-12 items-center justify-center rounded-sm bg-[var(--color-accent)] text-base font-semibold text-[var(--color-accent-foreground)] transition-colors duration-200 hover:bg-[var(--color-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
              >
                {t("startFree")}
              </Link>
            </div>
          </nav>

          <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:px-6">
            <Link
              href={STRENGTH_AUDIT_HREF}
              onClick={closeMobile}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-sm border border-[var(--color-accent)] bg-[var(--color-accent)] px-4 text-center text-sm font-bold uppercase tracking-[0.08em] text-[var(--color-accent-foreground)] transition-colors duration-200 hover:bg-[var(--color-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
            >
              {t("strengthAuditCta")}
              <ArrowRight className="h-4 w-4" strokeWidth={2.25} aria-hidden />
            </Link>
          </div>
        </div>
      ) : null}
    </>
  );
}
