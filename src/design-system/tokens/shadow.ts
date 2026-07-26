/**
 * Shadows — subtle depth only. No neon glow.
 */
export const shadow = {
  none: "none",
  sm: "0 1px 2px rgba(0, 0, 0, 0.45)",
  md: "0 4px 12px rgba(0, 0, 0, 0.45)",
  lg: "0 12px 32px rgba(0, 0, 0, 0.55)",
  overlay: "0 24px 48px rgba(0, 0, 0, 0.65)",
} as const;

export type ShadowKey = keyof typeof shadow;
