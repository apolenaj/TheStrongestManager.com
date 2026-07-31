import { describe, expect, it } from "vitest";
import {
  isProtectedAppPath,
  resolveAuthRedirect,
  stripLocalePrefix,
} from "@/services/auth/route-guard";

describe("route protection", () => {
  it("strips locale prefixes", () => {
    expect(stripLocalePrefix("/en/app/dashboard")).toEqual({
      locale: "en",
      pathnameWithoutLocale: "/app/dashboard",
    });
    expect(stripLocalePrefix("/cs/login")).toEqual({
      locale: "cs",
      pathnameWithoutLocale: "/login",
    });
    expect(stripLocalePrefix("/about")).toEqual({
      locale: null,
      pathnameWithoutLocale: "/about",
    });
  });

  it("treats /app paths as protected (with or without locale)", () => {
    expect(isProtectedAppPath("/app")).toBe(true);
    expect(isProtectedAppPath("/en/app/dashboard")).toBe(true);
    expect(isProtectedAppPath("/cs/app/settings")).toBe(true);
    expect(isProtectedAppPath("/login")).toBe(false);
    expect(isProtectedAppPath("/")).toBe(false);
  });

  it("redirects unauthorized users away from app routes", () => {
    expect(
      resolveAuthRedirect({
        pathname: "/app/dashboard",
        isAuthenticated: false,
      }),
    ).toBe("/login?callbackUrl=%2Fapp%2Fdashboard");

    expect(
      resolveAuthRedirect({
        pathname: "/en/app/dashboard",
        isAuthenticated: false,
      }),
    ).toBe("/en/login?callbackUrl=%2Fen%2Fapp%2Fdashboard");

    expect(
      resolveAuthRedirect({
        pathname: "/app/settings",
        search: "?tab=danger",
        isAuthenticated: false,
      }),
    ).toBe("/login?callbackUrl=%2Fapp%2Fsettings%3Ftab%3Ddanger");
  });

  it("allows authenticated users into the app", () => {
    expect(
      resolveAuthRedirect({
        pathname: "/app/dashboard",
        isAuthenticated: true,
      }),
    ).toBeNull();
  });

  it("sends signed-in users away from auth pages", () => {
    expect(
      resolveAuthRedirect({
        pathname: "/login",
        isAuthenticated: true,
      }),
    ).toBe("/app");

    expect(
      resolveAuthRedirect({
        pathname: "/cs/signup",
        isAuthenticated: true,
      }),
    ).toBe("/cs/app");
  });

  it("leaves public marketing routes alone", () => {
    expect(
      resolveAuthRedirect({
        pathname: "/",
        isAuthenticated: false,
      }),
    ).toBeNull();
    expect(
      resolveAuthRedirect({
        pathname: "/en/about",
        isAuthenticated: false,
      }),
    ).toBeNull();
  });
});
