import type { ConfidenceLevel } from "@/domain/scoring/types";
import { detectCoachChatAdversarial } from "@/domain/coach-brain/chat-adversarial";
import {
  COACH_CHAT_SUGGESTED_QUESTIONS,
  type CoachChatIntent,
} from "@/domain/coach-brain/chat-constants";
import type { CoachBrainToolBag } from "@/domain/coach-brain/types";

export type CoachChatDataRefKind =
  | "training_session"
  | "technique_analysis"
  | "progress"
  | "recovery"
  | "program"
  | "adaptations"
  | "fact";

export type CoachChatDataRef = {
  id: string;
  label: string;
  detail: string;
  href: string | null;
  kind: CoachChatDataRefKind;
};

export type CoachChatAnswer = {
  intent: CoachChatIntent;
  content: string;
  confidence: ConfidenceLevel;
  dataRefs: CoachChatDataRef[];
  missingInformation: string[];
  suggestedFollowUps: string[];
};

/**
 * Lightweight intent router for the coaching chat — not an LLM.
 */
export function classifyCoachChatIntent(question: string): CoachChatIntent {
  const q = question.trim().toLowerCase();
  if (!q) return "general";

  if (
    /300\s*kg/.test(q) &&
    /deadlift/.test(q) &&
    /(progress|toward|towards|goal|reach)/.test(q)
  ) {
    return "goal_deadlift_300";
  }
  if (
    /deadlift/.test(q) &&
    /(increase|add load|go up|heavier|progress(ion)?)/.test(q)
  ) {
    return "increase_deadlift";
  }
  if (/bench/.test(q) && /(stop|stall|stuck|plateau|not progress)/.test(q)) {
    return "bench_stall";
  }
  if (/deload|de-load|take a week easy|reduce volume/.test(q)) {
    return "deload";
  }
  if (/accessor(y|ies)|variation|which lift should i change/.test(q)) {
    return "accessory_change";
  }
  return "general";
}

function refsFromTools(tools: CoachBrainToolBag): CoachChatDataRef[] {
  const refs: CoachChatDataRef[] = [];
  const sessions = tools.getRecentTraining.data?.recentSessions ?? [];
  for (const s of sessions.slice(0, 2)) {
    refs.push({
      id: `session-${s.id}`,
      label: s.title,
      detail: `${s.status}${s.when ? ` · ${s.when.slice(0, 10)}` : ""}`,
      href: s.href,
      kind: "training_session",
    });
  }
  const tech = tools.getTechniqueTrend.data;
  if (tech?.latestAnalysisHref) {
    refs.push({
      id: `tech-${tech.latestAnalysisId ?? "list"}`,
      label: "Latest technique analysis",
      detail:
        tech.latestScore != null
          ? `Score ${tech.latestScore} · ${tech.direction}`
          : tech.summary,
      href: tech.latestAnalysisHref,
      kind: "technique_analysis",
    });
  }
  refs.push({
    id: "progress-chart",
    label: "Progress charts",
    detail: "Strength, volume, and related trends from your logs",
    href: "/app/progress",
    kind: "progress",
  });
  return refs;
}

/**
 * Build a grounded chat answer from structured tools.
 * Never claims recovery/performance conclusions without enough data.
 */
export function buildCoachChatAnswer(input: {
  question: string;
  tools: CoachBrainToolBag;
  /** When true, withhold load-increase advice and seek medical evaluation. */
  painSafeModeActive?: boolean;
}): CoachChatAnswer {
  const { tools } = input;
  const state = tools.getAthleteState.data;
  const recovery = tools.getRecoveryTrend.data;
  const training = tools.getRecentTraining.data;
  const prs = tools.getRecentPRs.data;
  const missing: string[] = [];
  const dataRefs = refsFromTools(tools);

  /** Red Team / adversarial gate — refuse before normal coaching intents. */
  const adversarial = detectCoachChatAdversarial(input.question);
  if (adversarial) {
    return {
      intent: "safety_refusal",
      content: adversarial.content,
      confidence: "low",
      dataRefs,
      missingInformation: missing,
      suggestedFollowUps: [
        "Should I deload?",
        "Open pain-safe response",
      ],
    };
  }

  const intent = classifyCoachChatIntent(input.question);

  if (input.painSafeModeActive && intent === "increase_deadlift") {
    return {
      intent,
      content:
        "Pain-safe mode is active based on your reported sharp pain, neurological symptoms, or serious injury signal. I will not recommend increasing load. Stop aggressive training progression and seek evaluation from a qualified medical professional. This app does not diagnose.",
      confidence: "low",
      dataRefs,
      missingInformation: missing,
      suggestedFollowUps: [
        "Open pain-safe response",
        "Should I deload?",
      ],
    };
  }

  const checkIns = recovery?.checkInsLast7Days ?? 0;
  if (checkIns < 3) {
    missing.push(
      `More recovery check-ins (logged ${checkIns} with readiness in the last 7 days)`,
    );
  }

  switch (intent) {
    case "increase_deadlift":
      return answerIncreaseDeadlift({
        tools,
        state,
        training,
        prs,
        recovery,
        checkIns,
        dataRefs,
        missing,
      });
    case "bench_stall":
      return answerBenchStall({
        tools,
        training,
        prs,
        recovery,
        checkIns,
        dataRefs,
        missing,
      });
    case "deload":
      return answerDeload({
        tools,
        state,
        recovery,
        checkIns,
        training,
        dataRefs,
        missing,
      });
    case "accessory_change":
      return answerAccessory({
        tools,
        dataRefs,
        missing,
      });
    case "goal_deadlift_300":
      return answerDeadliftGoal({
        prs,
        dataRefs,
        missing,
      });
    default:
      return answerGeneral({ tools, dataRefs, missing, checkIns });
  }
}

function answerIncreaseDeadlift(args: {
  tools: CoachBrainToolBag;
  state: CoachBrainToolBag["getAthleteState"]["data"];
  training: CoachBrainToolBag["getRecentTraining"]["data"];
  prs: CoachBrainToolBag["getRecentPRs"]["data"];
  recovery: CoachBrainToolBag["getRecoveryTrend"]["data"];
  checkIns: number;
  dataRefs: CoachChatDataRef[];
  missing: string[];
}): CoachChatAnswer {
  const dl = args.prs?.lifts.find((l) => l.metricKey === "lift_deadlift");
  const sessions7 = args.training?.completedLast7Days ?? 0;
  const fatigueSpike = args.state?.fatigueTrend.value?.loadSpikeFlagged === true;
  const techDown = args.state?.techniqueTrend.value?.direction === "down";

  const lines: string[] = [];
  if (!dl) {
    lines.push(
      "There is no deadlift log on file yet, so I cannot recommend increasing load from your data.",
    );
    args.missing.push("Deadlift lift log (reported or observed)");
  } else {
    lines.push(
      `Your best deadlift on file is ${dl.display} (${dl.source}).`,
    );
  }

  if (sessions7 === 0) {
    lines.push(
      "You have no completed sessions logged in the last 7 days, so a next-week increase would be speculative.",
    );
  } else {
    lines.push(
      `You completed ${sessions7} session(s) in the last 7 days.`,
    );
  }

  if (args.checkIns < 3) {
    lines.push(
      `You logged only ${args.checkIns} recovery check-in(s) with readiness this week, so there is not enough data to conclude that recovery supports a load jump.`,
    );
  } else if (args.recovery?.latestReadiness != null) {
    lines.push(
      `Latest readiness on file is ${args.recovery.latestReadiness}/100 (athlete-reported).`,
    );
  }

  if (fatigueSpike) {
    lines.push(
      "Estimated training volume recently spiked vs baseline — I would not push a deadlift increase until that settles and you confirm any program change.",
    );
  }
  if (techDown) {
    lines.push(
      "Technique trend is down on recent analyses — prioritize quality before adding load.",
    );
  }

  const canIncrease =
    Boolean(dl) &&
    sessions7 > 0 &&
    !fatigueSpike &&
    !techDown &&
    args.checkIns >= 3 &&
    (args.recovery?.latestReadiness == null ||
      args.recovery.latestReadiness >= 60);

  if (canIncrease) {
    lines.push(
      "Based on available logs, a small increase can be considered — but only after you explicitly confirm an adaptation. I will not change your program automatically.",
    );
  } else {
    lines.push(
      "I would hold on increasing deadlift until the missing or conflicting signals above are clearer.",
    );
  }

  args.dataRefs.push({
    id: "adaptations",
    label: "Adaptive suggestions",
    detail: "Confirm any load change here — never auto-applied",
    href: "/app/adaptations",
    kind: "adaptations",
  });

  return {
    intent: "increase_deadlift",
    content: lines.join(" "),
    confidence: canIncrease ? "medium" : "low",
    dataRefs: args.dataRefs,
    missingInformation: args.missing,
    suggestedFollowUps: [
      "Should I deload?",
      "How am I progressing toward a 300 kg deadlift?",
    ],
  };
}

function answerBenchStall(args: {
  tools: CoachBrainToolBag;
  training: CoachBrainToolBag["getRecentTraining"]["data"];
  prs: CoachBrainToolBag["getRecentPRs"]["data"];
  recovery: CoachBrainToolBag["getRecoveryTrend"]["data"];
  checkIns: number;
  dataRefs: CoachChatDataRef[];
  missing: string[];
}): CoachChatAnswer {
  const bench = args.prs?.lifts.find((l) => l.metricKey === "lift_bench");
  const lines: string[] = [];

  if (!bench) {
    lines.push(
      "There is no bench press log on file, so I cannot explain a bench stall from your data.",
    );
    args.missing.push("Bench press lift log");
  } else {
    lines.push(
      `Bench on file: ${bench.display} (${bench.source}). I do not invent a “stall” without enough timed sessions.`,
    );
  }

  const sessions28 = args.training?.completedLast28Days ?? 0;
  if (sessions28 < 3) {
    lines.push(
      `Only ${sessions28} completed session(s) in the last 28 days are logged — that is not enough history to conclude why bench stopped progressing.`,
    );
  } else {
    lines.push(
      `${sessions28} completed sessions are logged in the last 28 days. Open recent sessions and progress charts to inspect load/reps directly.`,
    );
  }

  if (args.checkIns < 3) {
    lines.push(
      `You logged only ${args.checkIns} recovery check-in(s) this week, so there is not enough data to conclude that recovery is the main issue.`,
    );
  }

  const tech = args.tools.getTechniqueTrend.data;
  if (!tech || tech.sampleCount < 2) {
    lines.push(
      "Fewer than two completed technique analyses are available for a technique-trend conclusion.",
    );
    args.missing.push("≥2 technique analyses");
  } else {
    lines.push(
      `Technique trend direction on file: ${tech.direction} (${tech.sampleCount} analyses).`,
    );
  }

  return {
    intent: "bench_stall",
    content: lines.join(" "),
    confidence: bench && sessions28 >= 3 ? "low" : "none",
    dataRefs: args.dataRefs,
    missingInformation: args.missing,
    suggestedFollowUps: [
      "Should I deload?",
      "Which accessory should I change?",
    ],
  };
}

function answerDeload(args: {
  tools: CoachBrainToolBag;
  state: CoachBrainToolBag["getAthleteState"]["data"];
  recovery: CoachBrainToolBag["getRecoveryTrend"]["data"];
  checkIns: number;
  training: CoachBrainToolBag["getRecentTraining"]["data"];
  dataRefs: CoachChatDataRef[];
  missing: string[];
}): CoachChatAnswer {
  const lines: string[] = [];
  const spike = args.state?.fatigueTrend.value?.loadSpikeFlagged === true;
  const readiness = args.recovery?.latestReadiness;

  if (args.checkIns < 3) {
    lines.push(
      `You logged only ${args.checkIns} recovery check-in(s) with readiness this week, so there is not enough data to conclude that recovery is poor or that a deload is required.`,
    );
  } else if (readiness != null) {
    lines.push(
      `Latest readiness is ${readiness}/100 from ${args.checkIns} check-ins this week (reported).`,
    );
  }

  if (spike) {
    lines.push(
      "Estimated volume spiked vs baseline — a deload is a reasonable option to review, but only if you confirm it in Adaptations.",
    );
  } else {
    lines.push(
      "No volume-spike flag is active on current estimated load windows.",
    );
  }

  const sessions7 = args.training?.completedLast7Days ?? 0;
  lines.push(
    `Completed sessions last 7 days: ${sessions7}.`,
  );

  args.dataRefs.push({
    id: "adaptations-deload",
    label: "Review adaptations",
    detail: "Deload suggestions require your Accept / Modify / Decline",
    href: "/app/adaptations",
    kind: "adaptations",
  });
  args.dataRefs.push({
    id: "recovery-page",
    label: "Recovery check-ins",
    detail: "Log readiness so deload advice can use real signals",
    href: "/app/recovery",
    kind: "recovery",
  });

  return {
    intent: "deload",
    content: lines.join(" "),
    confidence: spike && args.checkIns >= 3 ? "medium" : "low",
    dataRefs: args.dataRefs,
    missingInformation: args.missing,
    suggestedFollowUps: [
      "Should I increase my deadlift next week?",
      "Why did my bench stop progressing?",
    ],
  };
}

function answerAccessory(args: {
  tools: CoachBrainToolBag;
  dataRefs: CoachChatDataRef[];
  missing: string[];
}): CoachChatAnswer {
  const tech = args.tools.getTechniqueTrend.data;
  const lines: string[] = [
    "Accessory selection needs exercise-level session history and cues. I will not invent a specific accessory swap without that detail.",
  ];

  if (!tech || tech.sampleCount === 0) {
    lines.push(
      "No completed technique analyses are on file to point at a weak pattern.",
    );
    args.missing.push("Technique analysis for the main lift");
  } else {
    lines.push(
      `Latest technique context: ${tech.summary} Open the analysis to see cues before changing accessories.`,
    );
  }

  const sessions = args.tools.getRecentTraining.data?.recentSessions ?? [];
  if (sessions.length === 0) {
    lines.push("No recent training sessions are linked to inspect accessory work.");
    args.missing.push("Recent completed sessions with accessories logged");
  } else {
    lines.push(
      "Open a recent training session to see what accessories you actually performed.",
    );
  }

  return {
    intent: "accessory_change",
    content: lines.join(" "),
    confidence: "low",
    dataRefs: args.dataRefs,
    missingInformation: args.missing,
    suggestedFollowUps: [
      "Why did my bench stop progressing?",
      "Should I deload?",
    ],
  };
}

function answerDeadliftGoal(args: {
  prs: CoachBrainToolBag["getRecentPRs"]["data"];
  dataRefs: CoachChatDataRef[];
  missing: string[];
}): CoachChatAnswer {
  const targetKg = 300;
  const dl = args.prs?.lifts.find((l) => l.metricKey === "lift_deadlift");
  const lines: string[] = [];

  if (!dl) {
    lines.push(
      "No deadlift is logged yet, so progress toward 300 kg cannot be measured from your data.",
    );
    args.missing.push("Deadlift lift log");
  } else {
    const gap = Math.round((targetKg - dl.valueKg) * 10) / 10;
    lines.push(
      `Best deadlift on file: ${dl.display} (${dl.source}). Target referenced: 300 kg.`,
    );
    if (gap > 0) {
      lines.push(
        `Gap remaining: about ${gap} kg — this is arithmetic from your log, not a timeline prediction.`,
      );
    } else {
      lines.push(
        "Your logged best already meets or exceeds 300 kg on file.",
      );
    }
  }

  args.dataRefs.push({
    id: "progress-dl",
    label: "Progress",
    detail: "Open charts for strength trend context",
    href: "/app/progress",
    kind: "progress",
  });

  return {
    intent: "goal_deadlift_300",
    content: lines.join(" "),
    confidence: dl ? "medium" : "none",
    dataRefs: args.dataRefs,
    missingInformation: args.missing,
    suggestedFollowUps: [
      "Should I increase my deadlift next week?",
      "Should I deload?",
    ],
  };
}

function answerGeneral(args: {
  tools: CoachBrainToolBag;
  dataRefs: CoachChatDataRef[];
  missing: string[];
  checkIns: number;
}): CoachChatAnswer {
  const state = args.tools.getAthleteState.data;
  const lines: string[] = [
    "I answer from your structured athlete data. Ask about load increases, stalls, deloads, accessories, or a specific goal.",
  ];

  if (!state) {
    lines.push(
      "AthleteState is not available yet — log training or recovery so coaching can use real signals.",
    );
  } else {
    lines.push(
      `Data confidence: ${state.dataConfidence.value?.overall ?? "none"}. Freshness: ${state.dataFreshness.value?.freshnessLabel ?? "unknown"}.`,
    );
  }

  if (args.checkIns < 3) {
    lines.push(
      `You logged only ${args.checkIns} recovery check-in(s) this week, so recovery-based conclusions stay limited.`,
    );
  }

  return {
    intent: "general",
    content: lines.join(" "),
    confidence: "low",
    dataRefs: args.dataRefs,
    missingInformation: args.missing,
    suggestedFollowUps: [...COACH_CHAT_SUGGESTED_QUESTIONS].slice(0, 3),
  };
}