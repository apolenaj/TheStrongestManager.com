import { describe, expect, it } from "vitest";
import {
  TECHNIQUE_MAX_DURATION_SECONDS,
  TECHNIQUE_MAX_FILE_BYTES,
  TECHNIQUE_MIN_DURATION_SECONDS,
  TECHNIQUE_MIN_HEIGHT_PX,
  TECHNIQUE_MIN_WIDTH_PX,
} from "@/domain/technique/constants";
import {
  isCameraAngleId,
  sniffVideoContainer,
  validateTechniqueVideo,
} from "@/domain/technique/validation";

const validBase = {
  mimeType: "video/mp4",
  fileSizeBytes: 2 * 1024 * 1024,
  durationSeconds: 12,
  widthPx: 1280,
  heightPx: 720,
  fileName: "squat-side.mp4",
};

describe("validateTechniqueVideo", () => {
  it("accepts a valid mp4 within limits", () => {
    const result = validateTechniqueVideo(validBase);
    expect(result).toEqual({ ok: true, mimeType: "video/mp4" });
  });

  it("rejects unsupported mime types", () => {
    const result = validateTechniqueVideo({
      ...validBase,
      mimeType: "video/avi",
      fileName: "clip.avi",
    });
    expect(result.ok).toBe(false);
  });

  it("rejects oversized files", () => {
    const result = validateTechniqueVideo({
      ...validBase,
      fileSizeBytes: TECHNIQUE_MAX_FILE_BYTES + 1,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/too large/i);
  });

  it("rejects duration outside bounds", () => {
    expect(
      validateTechniqueVideo({
        ...validBase,
        durationSeconds: TECHNIQUE_MIN_DURATION_SECONDS - 0.1,
      }).ok,
    ).toBe(false);
    expect(
      validateTechniqueVideo({
        ...validBase,
        durationSeconds: TECHNIQUE_MAX_DURATION_SECONDS + 1,
      }).ok,
    ).toBe(false);
  });

  it("rejects low resolution", () => {
    const result = validateTechniqueVideo({
      ...validBase,
      widthPx: TECHNIQUE_MIN_WIDTH_PX - 1,
      heightPx: TECHNIQUE_MIN_HEIGHT_PX - 1,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/resolution/i);
  });

  it("rejects extension / mime mismatch", () => {
    const result = validateTechniqueVideo({
      ...validBase,
      fileName: "squat.webm",
    });
    expect(result.ok).toBe(false);
  });
});

describe("isCameraAngleId", () => {
  it("accepts catalog angles only", () => {
    expect(isCameraAngleId("side")).toBe(true);
    expect(isCameraAngleId("diagonal")).toBe(false);
  });
});

describe("sniffVideoContainer", () => {
  it("detects ISO BMFF mp4 ftyp", () => {
    const header = new Uint8Array(12);
    header[4] = 0x66;
    header[5] = 0x74;
    header[6] = 0x79;
    header[7] = 0x70;
    header[8] = 0x69;
    header[9] = 0x73;
    header[10] = 0x6f;
    header[11] = 0x6d;
    expect(sniffVideoContainer(header)).toBe("video/mp4");
  });

  it("detects WebM EBML", () => {
    const header = new Uint8Array([0x1a, 0x45, 0xdf, 0xa3, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(sniffVideoContainer(header)).toBe("video/webm");
  });
});
