import { describe, expect, it } from "vitest";
import {
  MEALNEXIO_DEEP_LINK_QUERY,
  MEALNEXIO_SSO_DEFAULT_STATUS,
  RECOVERY_NUTRITION_CTA_LABEL,
  RECOVERY_NUTRITION_PROMPT,
  TSM_DEEP_LINK_SOURCE,
  acceptMealnexioReturnPayload,
  buildMealnexioDeepLink,
  buildMealnexioDeepLinkingSnapshot,
  buildRecoveryNutritionDeepLinkPrompt,
  getMealnexioSsoArchitecture,
} from "@/domain/mealnexio-deep-linking";

describe("mealnexio deep linking", () => {
  it("builds outbound nutrition review links with TSM context", () => {
    const link = buildMealnexioDeepLink({
      intent: "nutrition_review",
      prompt: RECOVERY_NUTRITION_PROMPT,
      ref: "abc123",
    });
    const url = new URL(link.href);
    expect(url.origin).toBe("https://mealnexio.com");
    expect(url.searchParams.get(MEALNEXIO_DEEP_LINK_QUERY.source)).toBe(
      TSM_DEEP_LINK_SOURCE,
    );
    expect(url.searchParams.get(MEALNEXIO_DEEP_LINK_QUERY.intent)).toBe(
      "nutrition_review",
    );
    expect(url.searchParams.get(MEALNEXIO_DEEP_LINK_QUERY.prompt)).toBe(
      RECOVERY_NUTRITION_PROMPT,
    );
    expect(url.searchParams.get(MEALNEXIO_DEEP_LINK_QUERY.ref)).toBe("abc123");
    expect(url.searchParams.get(MEALNEXIO_DEEP_LINK_QUERY.sso)).toBe(
      MEALNEXIO_SSO_DEFAULT_STATUS,
    );
    expect(link.ssoAttached).toBe(false);
    expect(url.searchParams.has(MEALNEXIO_DEEP_LINK_QUERY.returnPath)).toBe(
      false,
    );
  });

  it("omits SSO tokens unless status is available", () => {
    const plain = buildMealnexioDeepLink(
      { intent: "nutrition_review" },
      { ssoStatus: "not_configured" },
    );
    expect(plain.ssoAttached).toBe(false);

    const future = buildMealnexioDeepLink(
      { intent: "nutrition_review" },
      { ssoStatus: "available" },
    );
    expect(future.ssoAttached).toBe(true);
    expect(future.honesty).toMatch(/IdP/i);
  });

  it("builds the recovery nutrition CTA without inventing intake claims", () => {
    const prompt = buildRecoveryNutritionDeepLinkPrompt();
    expect(prompt.message).toBe(RECOVERY_NUTRITION_PROMPT);
    expect(prompt.ctaLabel).toBe(RECOVERY_NUTRITION_CTA_LABEL);
    expect(prompt.deepLink.href).toContain("mealnexio.com");
    expect(prompt.caveat).toMatch(/not a diagnosis/i);
  });

  it("rejects return payloads while protocol is not live", () => {
    const result = acceptMealnexioReturnPayload({
      version: "mealnexio_return.v1",
      ref: "r1",
      summary: {
        date: "2026-07-21",
        caloriesKcal: 2200,
        macros: { proteinG: 160, carbsG: 220, fatG: 70 },
        adherencePct: 90,
        mealTimingNotes: null,
        trainingDayTagged: true,
        source: "mealnexio",
        syncedAt: new Date("2026-07-21T12:00:00.000Z"),
      },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("protocol_not_live");
    }
  });

  it("accepts valid summary only when protocol is ready", () => {
    const syncedAt = new Date("2026-07-21T12:00:00.000Z");
    const result = acceptMealnexioReturnPayload(
      {
        version: "mealnexio_return.v1",
        ref: "r1",
        summary: {
          date: "2026-07-21",
          caloriesKcal: 2100,
          macros: { proteinG: 150, carbsG: 200, fatG: 65 },
          adherencePct: null,
          mealTimingNotes: null,
          trainingDayTagged: null,
          source: "mealnexio",
          syncedAt: syncedAt.toISOString(),
        },
      },
      { protocolStatus: "ready" },
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.summary.caloriesKcal).toBe(2100);
      expect(result.ref).toBe("r1");
    }
  });

  it("does not invent summary from invalid ready payloads", () => {
    const result = acceptMealnexioReturnPayload(
      { version: "mealnexio_return.v1", summary: { date: "x" } },
      { protocolStatus: "ready" },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("missing_summary");
  });

  it("documents SSO as not_configured by default", () => {
    const sso = getMealnexioSsoArchitecture();
    expect(sso.status).toBe("not_configured");
    expect(sso.plannedModel).toBe("oidc_authorization_code");
  });

  it("snapshot documents honesty and example CTA", () => {
    const snap = buildMealnexioDeepLinkingSnapshot("2026-07-22T00:00:00.000Z");
    expect(snap.docPath).toBe("docs/MEALNEXIO_DEEP_LINKING.md");
    expect(snap.examplePrompt.message).toBe(RECOVERY_NUTRITION_PROMPT);
    expect(snap.returnProtocol.status).toBe("not_live");
    expect(snap.sso.status).toBe("not_configured");
  });
});
