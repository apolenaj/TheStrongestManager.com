import { describe, expect, it } from "vitest";
import {
  TRUST_CENTER_SECTION_IDS,
  TRUST_WHAT_AI_CANNOT_DO,
  getTrustCenterSections,
} from "@/domain/trust-center";

describe("trust center domain", () => {
  it("covers all required public trust pillars", () => {
    expect(TRUST_CENTER_SECTION_IDS).toEqual([
      "how-ai-works",
      "what-ai-can-do",
      "what-ai-cannot-do",
      "data-privacy",
      "video-privacy",
      "scoring-methodology",
      "safety-limitations",
      "evidence-standards",
    ]);
    const sections = getTrustCenterSections();
    expect(sections).toHaveLength(8);
    expect(sections.every((s) => s.points.length > 0)).toBe(true);
  });

  it("explicitly refuses diagnoses, invented scores, and silent auto-apply", () => {
    const cannot = TRUST_WHAT_AI_CANNOT_DO.join(" ");
    expect(cannot).toMatch(/diagnos/i);
    expect(cannot).toMatch(/invent/i);
    expect(cannot).toMatch(/auto-apply|without explicit/i);
  });
});
