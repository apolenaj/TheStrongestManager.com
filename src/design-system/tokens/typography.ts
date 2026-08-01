/**
 * Typography tokens.
 * Heading/display: Anton (latin + latin-ext) · Body: DM Sans.
 */
export const typography = {
  fontFamily: {
    heading: "var(--font-heading), system-ui, sans-serif",
    display: "var(--font-display), var(--font-heading), system-ui, sans-serif",
    body: "var(--font-body), system-ui, sans-serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
  },
  lineHeight: {
    tight: "1.2",
    snug: "1.35",
    normal: "1.5",
    relaxed: "1.65",
  },
  fontWeight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  letterSpacing: {
    tight: "-0.02em",
    normal: "0",
    wide: "0.06em",
    wider: "0.2em",
  },
} as const;
