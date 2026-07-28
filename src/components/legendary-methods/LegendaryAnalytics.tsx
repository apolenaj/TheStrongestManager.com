"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  type ComponentProps,
  type ReactNode,
} from "react";
import { trackClientAnalyticsAction } from "@/services/analytics/actions";
import type { ProductEventPropsMap } from "@/domain/analytics";

type LegendaryClientEvent =
  | "legendary_methods_nav_click"
  | "legendary_methods_homepage_click"
  | "legendary_profile_opened"
  | "legendary_profile_source_clicked"
  | "legendary_profile_programme_clicked"
  | "legendary_methods_filter_used";

export function trackLegendaryAnalytics<N extends LegendaryClientEvent>(
  name: N,
  props: ProductEventPropsMap[N],
): void {
  void trackClientAnalyticsAction({
    name,
    props: props as Record<string, unknown>,
  });
}

type LegendaryAnalyticsLinkProps<N extends LegendaryClientEvent> = {
  event: N;
  eventProps: ProductEventPropsMap[N];
  href: string;
  children: ReactNode;
  className?: string;
  target?: ComponentProps<typeof Link>["target"];
  rel?: ComponentProps<typeof Link>["rel"];
};

/**
 * Link that fires a Legendary Methods analytics event on click.
 */
export function LegendaryAnalyticsLink<N extends LegendaryClientEvent>({
  event,
  eventProps,
  href,
  children,
  className,
  target,
  rel,
}: LegendaryAnalyticsLinkProps<N>) {
  function onClick() {
    trackLegendaryAnalytics(event, eventProps);
  }

  return (
    <Link
      href={href}
      className={className}
      target={target}
      rel={rel}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

/** Fire profile-opened once on mount (detail pages). */
export function LegendaryProfileOpenedBeacon({ slug }: { slug: string }) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    trackLegendaryAnalytics("legendary_profile_opened", { slug });
  }, [slug]);

  return null;
}

/** External source anchor with analytics (profile sources list). */
export function LegendarySourceAnalyticsLink({
  href,
  slug,
  children,
  className,
}: {
  href: string;
  slug: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className={className}
      onClick={() =>
        trackLegendaryAnalytics("legendary_profile_source_clicked", { slug })
      }
    >
      {children}
    </a>
  );
}
