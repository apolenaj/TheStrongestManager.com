import { describe, expect, it } from "vitest";
import {
  isProtectedAppPath,
  resolveAuthRedirect,
} from "@/services/auth/route-guard";

describe("route protection", () => {
  it("treats /app paths as protected", () => {
    expect(isProtectedAppPath("/app")).toBe(true);
    expect(isProtectedAppPath("/app/dashboard")).toBe(true);
    expect(isProtectedAppPath("/app/settings")).toBe(true);
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
        pathname: "/signup",
        isAuthenticated: true,
      }),
    ).toBe("/app");
  });

  it("leaves public marketing routes alone", () => {
    expect(
      resolveAuthRedirect({
        pathname: "/",
        isAuthenticated: false,
      }),
    ).toBeNull();
  });
});
