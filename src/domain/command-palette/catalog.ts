import type { CommandPaletteAction } from "@/domain/command-palette/types";

/**
 * Power-user commands. Example set from Prompt 190 marked `example: true`.
 * Hrefs are real app routes — no fake mutations.
 */
export const COMMAND_PALETTE_ACTIONS: readonly CommandPaletteAction[] = [
  {
    id: "log-workout",
    label: "Log workout",
    description: "Open Today to log or continue a session.",
    category: "training",
    href: "/app/today",
    keywords: ["workout", "session", "train", "log set", "today"],
    example: true,
  },
  {
    id: "upload-deadlift",
    label: "Upload deadlift",
    description: "Open Technique to upload a deadlift video for analysis.",
    category: "technique",
    href: "/app/technique",
    keywords: ["deadlift", "upload", "video", "technique", "form"],
    example: true,
  },
  {
    id: "ask-coach",
    label: "Ask coach",
    description: "Open AI Coach chat — never auto-applies programs.",
    category: "coach",
    href: "/app/coach-brain",
    keywords: ["ai", "coach", "chat", "ask", "advice"],
    example: true,
  },
  {
    id: "find-exercise",
    label: "Find exercise",
    description: "Browse the exercise library.",
    category: "library",
    href: "/app/exercises",
    keywords: ["exercise", "find", "library", "movement"],
    example: true,
  },
  {
    id: "view-pr",
    label: "View PR",
    description: "Open personal records — observed / reported only.",
    category: "progress",
    href: "/app/prs",
    keywords: ["pr", "personal record", "pb", "best", "max"],
    example: true,
  },
  {
    id: "search-method",
    label: "Search method",
    description: "Open training methods library.",
    category: "library",
    href: "/app/methods",
    keywords: ["method", "programming", "system", "search"],
    example: true,
  },
  {
    id: "open-dashboard",
    label: "Open dashboard",
    description: "Go to Command Center / dashboard.",
    category: "navigation",
    href: "/app/dashboard",
    keywords: ["home", "command center", "dashboard"],
  },
  {
    id: "open-recovery",
    label: "Open recovery",
    description: "Recovery check-in and readiness estimate.",
    category: "recovery",
    href: "/app/recovery",
    keywords: ["recovery", "sleep", "readiness", "check-in"],
  },
  {
    id: "open-nutrition",
    label: "Open nutrition",
    description: "Nutrition status and Mealnexio — no invented macros.",
    category: "recovery",
    href: "/app/nutrition",
    keywords: ["nutrition", "mealnexio", "macros", "calories"],
  },
  {
    id: "open-progress",
    label: "Open progress",
    description: "Progress charts and trends from logged work.",
    category: "progress",
    href: "/app/progress",
    keywords: ["progress", "charts", "trends"],
  },
  {
    id: "open-timeline",
    label: "Open timeline",
    description: "Universal athlete history with filters.",
    category: "progress",
    href: "/app/timeline",
    keywords: ["timeline", "history", "events"],
  },
  {
    id: "open-performance-story",
    label: "Open performance story",
    description: "Yearly narrative from logged history — no fake causation.",
    category: "progress",
    href: "/app/performance-story",
    keywords: ["story", "yearly", "narrative", "year in review"],
  },
  {
    id: "open-year-in-review",
    label: "Open year in review",
    description: "Annual almanac cards — sessions, PRs, technique, competition.",
    category: "progress",
    href: "/app/year-in-review",
    keywords: ["wrapped", "almanac", "year", "annual", "review"],
  },
  {
    id: "open-activity-feed",
    label: "Open activity feed",
    description:
      "Optional milestones — PRs, competition, achievements, shared technique.",
    category: "progress",
    href: "/app/activity-feed",
    keywords: ["feed", "milestones", "achievements", "prs", "social"],
  },
  {
    id: "open-live-competition",
    label: "Open live competition",
    description:
      "Meet-day board architecture — attempts, results, warm-up timing (runtime gated).",
    category: "training",
    href: "/app/competition/live",
    keywords: ["meet", "live", "attempts", "platform", "warmup"],
  },
  {
    id: "open-warmup-generator",
    label: "Open warm-up generator",
    description:
      "Progressive warm-ups from working weight — conservative, editable.",
    category: "training",
    href: "/app/warmup",
    keywords: ["warmup", "warm-up", "ramp", "sets"],
  },
  {
    id: "open-session-readiness",
    label: "Open session readiness",
    description:
      "Pre-workout check-in — proceed, minor adjustment, or review load.",
    category: "training",
    href: "/app/session-readiness",
    keywords: ["readiness", "fatigue", "sleep", "soreness", "motivation"],
  },
  {
    id: "open-programs",
    label: "Open programs",
    description: "Your programs and templates.",
    category: "training",
    href: "/app/programs",
    keywords: ["program", "mesocycle", "plan"],
  },
  {
    id: "open-insights",
    label: "Open insights",
    description: "Cross-domain insights when evidence exists.",
    category: "progress",
    href: "/app/insights",
    keywords: ["insights", "cross-domain"],
  },
  {
    id: "global-search",
    label: "Search content",
    description: "Full search page for exercises, methods, articles, academy.",
    category: "library",
    href: "/search",
    keywords: ["search", "⌘k", "find content"],
  },
  {
    id: "open-profile",
    label: "Open profile",
    description: "Athlete profile and goals.",
    category: "navigation",
    href: "/app/profile",
    keywords: ["profile", "settings", "goals"],
  },
  {
    id: "open-goal-progress",
    label: "View goal trajectory",
    description: "Goal progress — qualitative when data is thin.",
    category: "progress",
    href: "/app/goal-progress",
    keywords: ["goal", "trajectory", "probability"],
  },
] as const;

export function getCommandById(
  id: string,
): CommandPaletteAction | undefined {
  return COMMAND_PALETTE_ACTIONS.find((c) => c.id === id);
}

export function exampleCommands(): CommandPaletteAction[] {
  return COMMAND_PALETTE_ACTIONS.filter((c) => c.example);
}
