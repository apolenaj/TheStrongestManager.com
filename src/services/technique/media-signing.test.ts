import { afterEach, describe, expect, it } from "vitest";
import {
  createMediaAccessToken,
  verifyMediaAccessToken,
  buildSignedMediaPath,
} from "@/services/technique/media-signing";

describe("technique media signing", () => {
  const previousAuth = process.env.AUTH_SECRET;
  const previousMedia = process.env.TECHNIQUE_MEDIA_SECRET;

  afterEach(() => {
    if (previousAuth === undefined) delete process.env.AUTH_SECRET;
    else process.env.AUTH_SECRET = previousAuth;
    if (previousMedia === undefined) delete process.env.TECHNIQUE_MEDIA_SECRET;
    else process.env.TECHNIQUE_MEDIA_SECRET = previousMedia;
  });

  it("round-trips a valid token", () => {
    process.env.AUTH_SECRET = "test-signing-secret-for-technique";
    const token = createMediaAccessToken("analysis_1", "user_1", 600);
    const payload = verifyMediaAccessToken(token);
    expect(payload).toEqual({
      analysisId: "analysis_1",
      userId: "user_1",
      exp: expect.any(Number),
    });
  });

  it("rejects tampered signatures", () => {
    process.env.AUTH_SECRET = "test-signing-secret-for-technique";
    const token = createMediaAccessToken("analysis_1", "user_1", 600);
    const [body] = token.split(".");
    expect(verifyMediaAccessToken(`${body}.deadbeef`)).toBeNull();
  });

  it("rejects expired tokens", () => {
    process.env.AUTH_SECRET = "test-signing-secret-for-technique";
    const token = createMediaAccessToken("analysis_1", "user_1", -10);
    expect(verifyMediaAccessToken(token)).toBeNull();
  });

  it("builds a private signed media path", () => {
    process.env.AUTH_SECRET = "test-signing-secret-for-technique";
    const path = buildSignedMediaPath("a1", "u1");
    expect(path).toMatch(/^\/api\/technique\/analyses\/a1\/media\?token=/);
  });
});
