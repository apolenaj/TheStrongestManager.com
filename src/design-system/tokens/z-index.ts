/** Z-index scale — keep overlays predictable. */
export const zIndex = {
  base: 0,
  raised: 10,
  sticky: 20,
  dropdown: 40,
  overlay: 50,
  modal: 60,
  toast: 70,
  tooltip: 80,
} as const;

export type ZIndexKey = keyof typeof zIndex;
