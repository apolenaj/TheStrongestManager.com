import { describe, expect, it } from "vitest";
import { ADMIN_NAV, isAdminAction, isAdminEntityType } from "@/domain/admin";

describe("admin permissions domain", () => {
  it("covers required CMS areas in nav", () => {
    const hrefs = ADMIN_NAV.map((n) => n.href);
    expect(hrefs).toEqual(
      expect.arrayContaining([
        "/app/admin/exercises",
        "/app/admin/methods",
        "/app/admin/articles",
        "/app/admin/programs",
        "/app/admin/academy",
        "/app/admin/research",
        "/app/admin/research/summarizer",
        "/app/admin/feature-flags",
        "/app/admin/technique-eval",
        "/app/admin/audit",
      ]),
    );
  });

  it("validates actions and entity types", () => {
    expect(isAdminAction("content.reviewed")).toBe(true);
    expect(isAdminAction("hack")).toBe(false);
    expect(isAdminEntityType("exercise")).toBe(true);
    expect(isAdminEntityType("athlete")).toBe(false);
  });
});
