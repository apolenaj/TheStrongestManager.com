/**
 * GDPR readiness — admin snapshot + cookie consent helpers for server code.
 */

import { cookies } from "next/headers";
import { featureFlags } from "@/config/feature-flags";
import {
  COOKIE_CONSENT_COOKIE,
  buildGdprReadinessSnapshot,
  parseCookieConsent,
  type CookieConsentState,
  type GdprReadinessSnapshot,
} from "@/domain/gdpr-readiness";

export function getGdprReadinessSnapshot(): GdprReadinessSnapshot {
  return buildGdprReadinessSnapshot();
}

export async function readCookieConsentFromRequest(): Promise<CookieConsentState> {
  const jar = await cookies();
  return parseCookieConsent(jar.get(COOKIE_CONSENT_COOKIE)?.value);
}

/** Functional cookies (e.g. growth experiment stickiness) allowed? */
export async function maySetFunctionalCookies(): Promise<boolean> {
  if (!featureFlags.gdprReadiness) return true;
  const consent = await readCookieConsentFromRequest();
  return Boolean(consent.decidedAt && consent.functional);
}

/** Analytics / vitals beacons allowed? */
export async function maySendAnalyticsBeacons(): Promise<boolean> {
  if (!featureFlags.gdprReadiness) return true;
  const consent = await readCookieConsentFromRequest();
  return Boolean(consent.decidedAt && consent.analytics);
}
