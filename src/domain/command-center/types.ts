import type {
  CommandCenterDensity,
  CommandCenterFold,
  CommandCenterSectionId,
} from "@/domain/command-center/constants";

export type CommandCenterWidgetDef = {
  id: CommandCenterSectionId;
  label: string;
  href: string;
  description: string;
  /** Default fold — only TODAY is above by policy. */
  defaultFold: CommandCenterFold;
  /** Default visibility. */
  defaultVisible: boolean;
  /** Default order within fold (lower = earlier). */
  defaultOrder: number;
  /** Grid column span hint: 1 | 2 (full on narrow). */
  defaultSpan: 1 | 2;
};

export type CommandCenterWidgetPreference = {
  id: CommandCenterSectionId;
  visible: boolean;
  fold: CommandCenterFold;
  order: number;
  span: 1 | 2;
};

export type CommandCenterLayoutPreferences = {
  version: number;
  /** null = adaptive from viewport. */
  densityOverride: CommandCenterDensity | null;
  widgets: CommandCenterWidgetPreference[];
};

export type ResolvedCommandCenterWidget = CommandCenterWidgetDef & {
  visible: boolean;
  fold: CommandCenterFold;
  order: number;
  span: 1 | 2;
};

export type ResolvedCommandCenterLayout = {
  density: CommandCenterDensity;
  densitySource: "viewport" | "user";
  aboveFold: ResolvedCommandCenterWidget[];
  belowFold: ResolvedCommandCenterWidget[];
  hidden: ResolvedCommandCenterWidget[];
};

/** Snippet for a widget — never invent numeric scores here. */
export type CommandCenterWidgetSnippet = {
  sectionId: CommandCenterSectionId;
  headline: string;
  detail: string | null;
  empty: boolean;
  ctaLabel: string;
};

export type CommandCenterSnapshot = {
  engineVersion: string;
  honesty: readonly string[];
  sections: Array<{ id: CommandCenterSectionId; label: string; href: string }>;
  defaultAboveFold: CommandCenterSectionId[];
  densities: readonly CommandCenterDensity[];
  docPath: "docs/COMMAND_CENTER.md";
  generatedAt: string;
};
