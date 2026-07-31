import { createNavigation } from "next-intl/navigation";
import { routing } from "@/i18n/routing";

/**
 * Locale-aware navigation helpers. Prefer these over next/link for UI routes
 * once pages start consuming translations.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
