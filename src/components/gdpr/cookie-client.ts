"use client";

import {
  COOKIE_CONSENT_COOKIE,
  DEFAULT_COOKIE_CONSENT,
  parseCookieConsent,
  serializeCookieConsent,
  type CookieConsentState,
} from "@/domain/gdpr-readiness";

const MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

function readRawCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  if (!match) return null;
  return decodeURIComponent(match.slice(name.length + 1));
}

export function readClientCookieConsent(): CookieConsentState {
  return parseCookieConsent(readRawCookie(COOKIE_CONSENT_COOKIE));
}

export function writeClientCookieConsent(state: CookieConsentState): void {
  if (typeof document === "undefined") return;
  const value = encodeURIComponent(serializeCookieConsent(state));
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `${COOKIE_CONSENT_COOKIE}=${value}; Path=/; Max-Age=${MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

export function acceptAllCookies(): CookieConsentState {
  const next: CookieConsentState = {
    ...DEFAULT_COOKIE_CONSENT,
    functional: true,
    analytics: true,
    decidedAt: new Date().toISOString(),
  };
  writeClientCookieConsent(next);
  return next;
}

export function rejectNonEssentialCookies(): CookieConsentState {
  const next: CookieConsentState = {
    ...DEFAULT_COOKIE_CONSENT,
    functional: false,
    analytics: false,
    decidedAt: new Date().toISOString(),
  };
  writeClientCookieConsent(next);
  return next;
}

export function saveCookiePreferences(input: {
  functional: boolean;
  analytics: boolean;
}): CookieConsentState {
  const next: CookieConsentState = {
    ...DEFAULT_COOKIE_CONSENT,
    functional: input.functional,
    analytics: input.analytics,
    decidedAt: new Date().toISOString(),
  };
  writeClientCookieConsent(next);
  return next;
}

export function clientAllowsAnalytics(): boolean {
  const state = readClientCookieConsent();
  return Boolean(state.decidedAt && state.analytics);
}

export function clientAllowsFunctional(): boolean {
  const state = readClientCookieConsent();
  return Boolean(state.decidedAt && state.functional);
}
