/**
 * Assemble a cross-surface personalization plan.
 * Never emits pricing items; never ranks on sensitive characteristics.
 */

import {
  getExerciseRelationshipGraph,
  relatedContentFromGraph,
  variationNeighborSlugs,
} from "@/domain/exercise-relationship-graph";
import type { ConfidenceLevel } from "@/domain/scoring/types";
import {
  DEFAULT_PERSONALIZATION_LOOKBACK_DAYS,
  PERSONALIZATION_ENGINE_VERSION,
  PERSONALIZATION_HONESTY,
  PERSONALIZATION_SENSITIVE_CHARACTERISTICS,
  PERSONALIZATION_SURFACE_LABELS,
  PERSONALIZATION_SURFACES,
  type PersonalizationInputKind,
  type PersonalizationSurface,
} from "@/domain/personalization/constants";
import type {
  PersonalizationItem,
  PersonalizationPlan,
  PersonalizationSignals,
  PersonalizationSurfaceSlot,
} from "@/domain/personalization/types";

function conf(
  n: number,
  thresholds: [number, number, number] = [1, 3, 8],
): ConfidenceLevel {
  if (n >= thresholds[2]) return "high";
  if (n >= thresholds[1]) return "medium";
  if (n >= thresholds[0]) return "low";
  return "none";
}

function stripSensitiveExtras(
  extras: Record<string, unknown> | undefined,
): { clean: Record<string, unknown>; ignored: string[] } {
  if (!extras) return { clean: {}, ignored: [] };
  const forbidden = new Set<string>(
    PERSONALIZATION_SENSITIVE_CHARACTERISTICS as readonly string[],
  );
  const clean: Record<string, unknown> = {};
  const ignored: string[] = [];
  for (const [key, value] of Object.entries(extras)) {
    if (forbidden.has(key)) {
      ignored.push(key);
      continue;
    }
    clean[key] = value;
  }
  return { clean, ignored };
}

function item(
  partial: Omit<PersonalizationItem, "confidence"> & {
    confidence?: ConfidenceLevel;
  },
): PersonalizationItem {
  return {
    ...partial,
    confidence: partial.confidence ?? "low",
  };
}

function sportLabel(signals: PersonalizationSignals): string | null {
  if (signals.sport.preferredSports.length > 1) {
    return signals.sport.preferredSports.join(" + ");
  }
  return (
    signals.sport.primaryDiscipline ??
    signals.sport.preferredSports[0] ??
    null
  );
}

function goalDrivenProgramHref(category: string | null): string {
  if (category === "performance" || category === "strength") {
    return "/app/programs";
  }
  if (category === "physique") return "/fit";
  return "/app/programs";
}

function contentHrefForSport(sport: string | null): string {
  if (sport === "powerlifting") return "/learn";
  if (sport === "bodybuilding") return "/academy";
  if (sport === "strongman") return "/methods";
  return "/learn";
}

function categoryAffinity(
  category: string,
  signals: PersonalizationSignals,
): number {
  const sport = sportLabel(signals);
  const goalCat = signals.goal.category;
  let score = 0;
  if (category === "training" && signals.history.completedSessions < 3) {
    score += 4;
  }
  if (category === "technique" && signals.history.techniqueUploads === 0) {
    score += 3;
  }
  if (
    category === "programming" &&
    !signals.history.hasActiveProgram &&
    goalCat
  ) {
    score += 3;
  }
  if (category === "recovery" && signals.preferences.volumeToleranceBand === "low") {
    score += 2;
  }
  if (sport && category.includes(sport)) score += 1;
  if (goalCat && category === goalCat) score += 2;
  return score;
}

function buildDashboardItems(
  signals: PersonalizationSignals,
): PersonalizationItem[] {
  const items: PersonalizationItem[] = [];
  const sport = sportLabel(signals);

  if (signals.goal.title) {
    items.push(
      item({
        id: "dash.focus_goal",
        surface: "dashboard",
        title: `Focus: ${signals.goal.title}`,
        body: "Lead with progress and next actions tied to your active goal.",
        href: "/app/progress",
        priority: 90,
        drivenBy: ["goal"],
        confidence: "medium",
      }),
    );
  }

  if (signals.history.completedSessions === 0) {
    items.push(
      item({
        id: "dash.log_first",
        surface: "dashboard",
        title: "Log a training session",
        body: "Dashboard personalization needs completed sessions — start with Today or Training.",
        href: "/app/today",
        priority: 100,
        drivenBy: ["training_history"],
        confidence: "high",
      }),
    );
  } else if (signals.history.skippedSessions > signals.history.completedSessions) {
    items.push(
      item({
        id: "dash.adherence",
        surface: "dashboard",
        title: "Prioritize adherence",
        body: "Recent skips outpace completions — surface consistency before new programming.",
        href: "/app/training",
        priority: 85,
        drivenBy: ["behavior", "training_history"],
        confidence: conf(signals.history.skippedSessions),
      }),
    );
  }

  if (sport) {
    const multi = signals.sport.preferredSports.length > 1;
    items.push(
      item({
        id: "dash.sport_context",
        surface: "dashboard",
        title: multi ? `Multi-sport: ${sport}` : `${sport} context`,
        body: multi
          ? "Dashboard adapts to multiple focuses — PRs stay separated by sport; mixed goals are allowed."
          : "Bias modules toward your primary sport when scores and insights are shown.",
        href: multi ? "/app/multi-sport" : "/app/dashboard",
        priority: multi ? 70 : 60,
        drivenBy: ["sport"],
        confidence: "medium",
      }),
    );
  }

  if (signals.preferences.intensityBand === "prefer_higher") {
    items.push(
      item({
        id: "dash.intensity_pref",
        surface: "dashboard",
        title: "High-intensity preference",
        body: "Prefer effort and load signals when ranking dashboard opportunities.",
        href: "/app/training-style",
        priority: 55,
        drivenBy: ["preferences"],
        confidence: "low",
      }),
    );
  }

  return items.sort((a, b) => b.priority - a.priority);
}

function buildRecommendationItems(
  signals: PersonalizationSignals,
): PersonalizationItem[] {
  if (signals.pendingRecommendations.length === 0) {
    const fallback: PersonalizationItem[] = [];
    if (!signals.goal.title) {
      fallback.push(
        item({
          id: "rec.set_goal",
          surface: "recommendations",
          title: "Set a primary goal",
          body: "Recommendations need an explicit goal — nothing was assumed.",
          href: "/app/profile",
          priority: 80,
          drivenBy: ["goal"],
          confidence: "high",
        }),
      );
    }
    if (signals.history.completedSessions === 0) {
      fallback.push(
        item({
          id: "rec.first_session",
          surface: "recommendations",
          title: "Log your first workout",
          body: "Stored recommendations stay empty until training history exists.",
          href: "/app/today",
          priority: 90,
          drivenBy: ["training_history"],
          confidence: "high",
        }),
      );
    }
    return fallback;
  }

  return [...signals.pendingRecommendations]
    .map((rec) => {
      const affinity = categoryAffinity(rec.category, signals);
      return item({
        id: `rec.${rec.id}`,
        surface: "recommendations",
        title: rec.title,
        body: rec.body,
        href: hrefForCategory(rec.category),
        priority: rec.priority * 10 + affinity,
        drivenBy: affinityDrivers(signals),
        confidence: conf(affinity + 1, [1, 3, 5]),
      });
    })
    .sort((a, b) => b.priority - a.priority);
}

function affinityDrivers(
  signals: PersonalizationSignals,
): PersonalizationInputKind[] {
  const drivers: PersonalizationInputKind[] = [];
  if (signals.goal.title) drivers.push("goal");
  if (sportLabel(signals)) drivers.push("sport");
  if (signals.history.completedSessions > 0) drivers.push("training_history");
  if (
    signals.behavior.acceptedAdaptations + signals.behavior.declinedAdaptations >
    0
  ) {
    drivers.push("behavior");
  }
  if (
    signals.preferences.daysPerWeek != null ||
    signals.preferences.intensityBand
  ) {
    drivers.push("preferences");
  }
  return drivers.length > 0 ? drivers : ["training_history"];
}

function hrefForCategory(category: string): string {
  if (category === "technique") return "/app/technique";
  if (category === "recovery") return "/app/recovery";
  if (category === "programming" || category === "program") {
    return "/app/programs";
  }
  if (category === "assessment") return "/app/profile";
  return "/app/today";
}

function buildProgramItems(
  signals: PersonalizationSignals,
): PersonalizationItem[] {
  const items: PersonalizationItem[] = [];
  const sport = sportLabel(signals);
  const href = goalDrivenProgramHref(signals.goal.category);

  if (!signals.history.hasActiveProgram) {
    items.push(
      item({
        id: "prog.suggest_start",
        surface: "program_suggestions",
        title: signals.goal.title
          ? `Program ideas for “${signals.goal.title}”`
          : "Browse program templates",
        body: sport
          ? `Suggest templates aligned with ${sport} — never auto-applied.`
          : "Suggest templates from your goal when set — never auto-applied.",
        href,
        priority: 90,
        drivenBy: signals.goal.title ? ["goal", "sport"] : ["sport"],
        confidence: signals.goal.title ? "medium" : "low",
      }),
    );
  } else {
    items.push(
      item({
        id: "prog.review_active",
        surface: "program_suggestions",
        title: "Review active program fit",
        body: "You already have an active program — personalize review cues, not a replacement plan.",
        href: "/app/programs",
        priority: 70,
        drivenBy: ["training_history", "goal"],
        confidence: "medium",
      }),
    );
  }

  if (signals.preferences.frequencyBand === "low") {
    items.push(
      item({
        id: "prog.low_frequency",
        surface: "program_suggestions",
        title: "Prefer lower-frequency templates",
        body: "Frequency preference leans low — bias toward fewer training days when suggesting programs.",
        href: "/fit",
        priority: 65,
        drivenBy: ["preferences"],
        confidence: "low",
      }),
    );
  }

  if (signals.preferences.volumeToleranceBand === "low") {
    items.push(
      item({
        id: "prog.low_volume",
        surface: "program_suggestions",
        title: "Prefer moderate session size",
        body: "Low volume tolerance — avoid high-set template suggestions.",
        href: "/app/training-style",
        priority: 60,
        drivenBy: ["preferences", "behavior"],
        confidence: "low",
      }),
    );
  }

  return items.sort((a, b) => b.priority - a.priority);
}

function buildExerciseAltItems(
  signals: PersonalizationSignals,
): PersonalizationItem[] {
  const sport = sportLabel(signals);
  const items: PersonalizationItem[] = [];

  if (sport === "powerlifting" || sport?.includes("powerlifting")) {
    items.push(
      item({
        id: "ex.alt_pl",
        surface: "exercise_alternatives",
        title: "Powerlifting variation bias",
        body: "Prefer squat / bench / deadlift variations and close accessories when offering alternatives.",
        href: "/app/exercises",
        priority: 80,
        drivenBy: ["sport", "goal"],
        confidence: "medium",
      }),
    );
  } else if (sport === "bodybuilding" || sport?.includes("bodybuilding")) {
    items.push(
      item({
        id: "ex.alt_bb",
        surface: "exercise_alternatives",
        title: "Hypertrophy alternative bias",
        body: "Prefer machine / dumbbell alternatives that keep target muscle stress with lower skill demand.",
        href: "/app/exercises",
        priority: 80,
        drivenBy: ["sport"],
        confidence: "medium",
      }),
    );
  } else if (sport === "strongman" || sport?.includes("strongman")) {
    items.push(
      item({
        id: "ex.alt_sm",
        surface: "exercise_alternatives",
        title: "Strongman implement bias",
        body: "Prefer event-adjacent alternatives (carry, load, pull variations) when equipment allows.",
        href: "/app/exercises",
        priority: 80,
        drivenBy: ["sport"],
        confidence: "medium",
      }),
    );
  } else {
    items.push(
      item({
        id: "ex.alt_general",
        surface: "exercise_alternatives",
        title: "General strength alternatives",
        body: sport
          ? `Bias alternatives toward ${sport} movement patterns when catalog rules allow.`
          : "Set a sport or discipline so alternatives can be sport-aware.",
        href: sport ? "/app/exercises" : "/app/profile",
        priority: 50,
        drivenBy: sport ? ["sport"] : ["goal"],
        confidence: sport ? "low" : "none",
      }),
    );
  }

  if (signals.preferences.intensityBand === "prefer_lower") {
    items.push(
      item({
        id: "ex.alt_lower_intensity",
        surface: "exercise_alternatives",
        title: "Lower-skill / lower-fatigue swaps",
        body: "Intensity preference leans lower — favor less fatiguing alternatives when rules allow.",
        href: "/app/exercises",
        priority: 55,
        drivenBy: ["preferences"],
        confidence: "low",
      }),
    );
  }

  // Graph-backed alternatives (Prompt 109) — curated sport → exercise → variation edges
  const sportKey =
    signals.sport.preferredSports.find((s) => s !== "hybrid") ??
    signals.sport.primaryDiscipline;
  const normalizedSport =
    sportKey === "general" ? "general_strength" : sportKey;
  if (normalizedSport) {
    const seedEdge = getExerciseRelationshipGraph().edges.find(
      (e) =>
        e.relation === "sport" &&
        e.targetId === normalizedSport &&
        e.sportLevel === "high",
    );
    if (seedEdge) {
      const variations = variationNeighborSlugs(seedEdge.fromExerciseSlug).slice(
        0,
        2,
      );
      if (variations.length > 0) {
        items.push(
          item({
            id: "ex.alt_graph",
            surface: "exercise_alternatives",
            title: `Graph variations near ${seedEdge.fromExerciseSlug}`,
            body: `Curated variation edges: ${variations.join(", ")}. Not similarity guesses.`,
            href: `/exercises/${variations[0]}`,
            priority: 75,
            drivenBy: ["sport"],
            confidence: "medium",
          }),
        );
      }
    }
  }

  return items.sort((a, b) => b.priority - a.priority);
}

function buildContentItems(
  signals: PersonalizationSignals,
): PersonalizationItem[] {
  const sport = sportLabel(signals);
  const href = contentHrefForSport(sport);
  const items: PersonalizationItem[] = [
    item({
      id: "content.primary",
      surface: "content",
      title: sport
        ? `Learn content for ${sport}`
        : "Browse learning content",
      body: signals.goal.title
        ? `Prioritize articles and academy modules near “${signals.goal.title}”.`
        : "Prioritize general strength literacy until a goal is set.",
      href,
      priority: 70,
      drivenBy: sport ? ["sport", "goal"] : ["goal"],
      confidence: sport || signals.goal.title ? "medium" : "low",
    }),
  ];

  // Graph-backed related content (Prompt 109)
  const sportKey =
    signals.sport.preferredSports.find((s) => s !== "hybrid") ??
    signals.sport.primaryDiscipline;
  const normalizedSport =
    sportKey === "general" ? "general_strength" : sportKey;
  if (normalizedSport) {
    const seed = getExerciseRelationshipGraph().edges.find(
      (e) =>
        e.relation === "sport" &&
        e.targetId === normalizedSport &&
        e.sportLevel === "high",
    );
    if (seed) {
      const graphLinks = relatedContentFromGraph(seed.fromExerciseSlug).filter(
        (l) =>
          !l.href.startsWith("/app/") &&
          (l.relation === "method" ||
            l.relation === "variation" ||
            l.relation === "technique_issue"),
      );
      const top = graphLinks[0];
      if (top) {
        items.push(
          item({
            id: "content.graph_related",
            surface: "content",
            title: `Related: ${top.title}`,
            body: `From the exercise graph (${top.relation}) — ${top.reason}`,
            href: top.href,
            priority: 65,
            drivenBy: ["sport"],
            confidence: "medium",
          }),
        );
      }
    }
  }

  if (signals.history.techniqueUploads === 0) {
    items.push(
      item({
        id: "content.technique_guides",
        surface: "content",
        title: "Technique recording guides",
        body: "No technique uploads yet — surface recording and camera guidance content first.",
        href: "/app/technique",
        priority: 85,
        drivenBy: ["training_history"],
        confidence: "medium",
      }),
    );
  }

  return items.sort((a, b) => b.priority - a.priority);
}

function buildNotificationItems(
  signals: PersonalizationSignals,
): PersonalizationItem[] {
  const items: PersonalizationItem[] = [];

  if (
    signals.history.completedSessions > 0 &&
    signals.history.skippedSessions >= 2
  ) {
    items.push(
      item({
        id: "notif.missed_sessions",
        surface: "notifications",
        title: "Missed sessions reminder",
        body: `${signals.history.skippedSessions} skipped session(s) in the lookback — remind to reschedule, not guilt.`,
        href: "/app/training",
        priority: 80,
        drivenBy: ["behavior", "training_history"],
        confidence: conf(signals.history.skippedSessions),
      }),
    );
  }

  if (
    signals.pendingRecommendations.length > 0 &&
    signals.history.completedSessions > 0
  ) {
    items.push(
      item({
        id: "notif.open_recommendation",
        surface: "notifications",
        title: "Open next recommendation",
        body: "You have pending coaching recommendations ready to review.",
        href: "/app/dashboard",
        priority: 60,
        drivenBy: ["goal", "training_history"],
        confidence: "low",
      }),
    );
  }

  if (
    signals.behavior.declinedAdaptations >
    signals.behavior.acceptedAdaptations + 1
  ) {
    items.push(
      item({
        id: "notif.adaptation_review",
        surface: "notifications",
        title: "Adaptation preferences",
        body: "Several adaptations were declined — notify to review preference settings, not to push the same change.",
        href: "/app/training-style",
        priority: 55,
        drivenBy: ["behavior", "preferences"],
        confidence: "low",
      }),
    );
  }

  return items.sort((a, b) => b.priority - a.priority);
}

const BUILDERS: Record<
  PersonalizationSurface,
  (s: PersonalizationSignals) => PersonalizationItem[]
> = {
  dashboard: buildDashboardItems,
  recommendations: buildRecommendationItems,
  program_suggestions: buildProgramItems,
  exercise_alternatives: buildExerciseAltItems,
  content: buildContentItems,
  notifications: buildNotificationItems,
};

export function assemblePersonalizationPlan(
  signals: PersonalizationSignals,
): PersonalizationPlan {
  const lookbackDays =
    signals.lookbackDays > 0
      ? signals.lookbackDays
      : DEFAULT_PERSONALIZATION_LOOKBACK_DAYS;

  const { ignored } = stripSensitiveExtras(signals.unsafeExtras);

  const surfaces: PersonalizationSurfaceSlot[] = PERSONALIZATION_SURFACES.map(
    (surface) => {
      const items = BUILDERS[surface](signals);
      return {
        surface,
        label: PERSONALIZATION_SURFACE_LABELS[surface],
        items,
        missingNote:
          items.length === 0
            ? `No ${PERSONALIZATION_SURFACE_LABELS[surface].toLowerCase()} personalization yet — need more goal, sport, or training signal.`
            : null,
      };
    },
  );

  const topTitles = surfaces
    .flatMap((s) => s.items.slice(0, 1))
    .slice(0, 3)
    .map((i) => i.title);
  const summaryLine =
    topTitles.length > 0
      ? `Personalized: ${topTitles.join(" · ")}.`
      : null;

  return {
    engineVersion: PERSONALIZATION_ENGINE_VERSION,
    lookbackDays,
    generatedAtIso: signals.now.toISOString(),
    summaryLine,
    surfaces,
    pricingPersonalization: {
      allowed: false,
      reason:
        "Pricing is never personalized from sensitive characteristics or from this engine.",
    },
    ignoredSensitiveKeys: ignored,
    honesty: PERSONALIZATION_HONESTY,
  };
}

/** Items for one surface, priority-desc. */
export function itemsForSurface(
  plan: PersonalizationPlan,
  surface: PersonalizationSurface,
): PersonalizationItem[] {
  return plan.surfaces.find((s) => s.surface === surface)?.items ?? [];
}

/**
 * Hard guard for callers — pricing personalization is always disallowed.
 */
export function isPricingPersonalizationAllowed(): false {
  return false;
}

/**
 * Reject attempts to treat pricing as a personalization surface.
 */
export function assertNotPricingPersonalization(use: string): void {
  const blocked = [
    "pricing",
    "plan_price",
    "subscription_price",
    "discount",
    "promotional_price",
    "paywall_amount",
  ];
  if (blocked.includes(use)) {
    throw new Error(
      "Personalization engine must not personalize pricing (especially from sensitive characteristics).",
    );
  }
}

/** Flatten text for honesty / forbidden-use tests. */
export function personalizationPlanText(plan: PersonalizationPlan): string {
  return [
    plan.summaryLine ?? "",
    plan.pricingPersonalization.reason,
    ...plan.honesty,
    ...plan.surfaces.flatMap((s) => [
      s.label,
      s.missingNote ?? "",
      ...s.items.flatMap((i) => [i.title, i.body, i.href ?? ""]),
    ]),
  ]
    .join("\n")
    .toLowerCase();
}
