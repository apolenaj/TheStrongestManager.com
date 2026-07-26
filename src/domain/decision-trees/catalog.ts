/**
 * Curated decision trees — structured rules, educational outcomes.
 */

import type { DecisionTreeDefinition } from "@/domain/decision-trees/types";

export const DECISION_TREE_DELOAD: DecisionTreeDefinition = {
  slug: "should-i-deload",
  title: "Should I deload?",
  question: "Should I deload?",
  description:
    "A structured walkthrough for when a planned or reactive deload makes sense — not a medical screen.",
  startNodeId: "q_pain",
  nodes: {
    q_pain: {
      id: "q_pain",
      kind: "question",
      prompt: "Do you currently have sharp pain, injury flare, or red-flag symptoms?",
      help: "Red flags include chest pain, dizziness, unexplained weakness, or pain that worsens rapidly. This tree cannot diagnose.",
      options: [
        {
          id: "pain_yes",
          label: "Yes — pain, injury, or concerning symptoms",
          nextNodeId: "out_seek_care",
          ruleId: "deload.pain_seek_care",
          ruleLabel: "Pain / red flags → stop tree",
          ruleExplanation:
            "Decision trees are not medical tools. Pain or red flags need professional judgment, not a deload checklist.",
        },
        {
          id: "pain_no",
          label: "No — training feels hard but not injured",
          nextNodeId: "q_fatigue",
          ruleId: "deload.no_pain_continue",
          ruleLabel: "No pain → continue coaching rules",
          ruleExplanation:
            "Without acute injury signals, we can apply fatigue and performance rules.",
        },
      ],
    },
    q_fatigue: {
      id: "q_fatigue",
      kind: "question",
      prompt: "How has performance and recovery looked over the last 1–2 weeks?",
      options: [
        {
          id: "fat_down",
          label: "Lifts stalled or dropped; sleep/stress are rough",
          nextNodeId: "out_deload_yes",
          ruleId: "deload.fatigue_high",
          ruleLabel: "Accumulated fatigue → favor deload",
          ruleExplanation:
            "Persistent performance drop plus poor recovery is a classic coaching cue for a short deload.",
        },
        {
          id: "fat_mixed",
          label: "Mixed — some sessions good, some flat",
          nextNodeId: "q_weeks",
          ruleId: "deload.fatigue_mixed",
          ruleLabel: "Mixed signals → check training age of block",
          ruleExplanation:
            "Ambiguous fatigue needs context: how long since the last easier week.",
        },
        {
          id: "fat_ok",
          label: "Mostly progressing; recovery is acceptable",
          nextNodeId: "out_deload_no",
          ruleId: "deload.fatigue_low",
          ruleLabel: "Progressing → deload not required now",
          ruleExplanation:
            "If performance and recovery are acceptable, a mandatory deload is usually unnecessary.",
        },
      ],
    },
    q_weeks: {
      id: "q_weeks",
      kind: "question",
      prompt: "How long since your last easier / deload week?",
      options: [
        {
          id: "weeks_long",
          label: "4+ hard weeks without a lighter week",
          nextNodeId: "out_deload_yes",
          ruleId: "deload.block_long",
          ruleLabel: "Long hard block → planned deload",
          ruleExplanation:
            "Many lifters benefit from a lighter week after several hard weeks even when fatigue is only mixed.",
        },
        {
          id: "weeks_recent",
          label: "I deloaded or went easy within ~2 weeks",
          nextNodeId: "out_deload_hold",
          ruleId: "deload.recent_easy",
          ruleLabel: "Recent easy week → hold",
          ruleExplanation:
            "Another full deload so soon is often unnecessary; fix sleep, stress, or session quality first.",
        },
      ],
    },
    out_seek_care: {
      id: "out_seek_care",
      kind: "outcome",
      title: "Pause and get professional input",
      summary:
        "This tool stops here. Pain, injury flares, and red-flag symptoms need professional medical judgment — not a coaching checklist.",
      guidance: [
        "Stop pushing through sharp or worsening pain.",
        "Contact a qualified clinician or coach who can assess you in person.",
        "Do not treat a deload as a substitute for medical evaluation.",
      ],
      caveats: [
        "A deload may still be appropriate later — only after someone who knows your case advises you.",
      ],
    },
    out_deload_yes: {
      id: "out_deload_yes",
      kind: "outcome",
      title: "A deload week is reasonable",
      summary:
        "Based on fatigue and/or a long hard block, a planned easier week is a sensible coaching choice.",
      guidance: [
        "Reduce load, volume, or both for ~5–7 days (common pattern: ~40–60% less hard sets, or lighter top sets).",
        "Keep technique practice; avoid turning the week into complete inactivity unless advised.",
        "Return by rebuilding intensity gradually, not jumping straight to prior peak stress.",
      ],
      caveats: [
        "Not medical advice — if pain appears, stop and seek care.",
        "Sport calendars and peaking plans may override a generic deload cue.",
      ],
    },
    out_deload_no: {
      id: "out_deload_no",
      kind: "outcome",
      title: "You probably do not need a deload right now",
      summary:
        "Progress and recovery look acceptable under these rules — keep training and reassess weekly.",
      guidance: [
        "Continue progressive overload with normal recovery habits.",
        "Schedule a lighter week later if you run a long hard block.",
        "Watch for sleep, mood, and bar speed as early fatigue signals.",
      ],
      caveats: [
        "Feeling “fine” with sharp joint pain is still a stop signal — see the medical disclaimer.",
      ],
    },
    out_deload_hold: {
      id: "out_deload_hold",
      kind: "outcome",
      title: "Hold off on another full deload",
      summary:
        "You recently had easier training. Prioritize recovery quality and session execution before another unload week.",
      guidance: [
        "Protect sleep and stress first.",
        "Trim junk volume or poor warm-ups rather than another full deload.",
        "Re-run this tree in 1–2 weeks if performance keeps sliding.",
      ],
      caveats: [
        "Chronic under-recovery with medical symptoms needs a clinician, not repeated deloads alone.",
      ],
    },
  },
};

export const DECISION_TREE_INCREASE_WEIGHT: DecisionTreeDefinition = {
  slug: "should-i-increase-weight",
  title: "Should I increase weight?",
  question: "Should I increase weight?",
  description:
    "Rules for when to add load on the bar versus repeat, reduce, or fix technique.",
  startNodeId: "q_tech",
  nodes: {
    q_tech: {
      id: "q_tech",
      kind: "question",
      prompt: "Was the last heavy set technically solid (bracing, depth/ROM, control)?",
      options: [
        {
          id: "tech_no",
          label: "No — form broke down or ROM shortened",
          nextNodeId: "out_form_first",
          ruleId: "load.tech_fail",
          ruleLabel: "Broken technique → do not add load",
          ruleExplanation:
            "Adding weight on top of failing standards usually teaches worse patterns.",
        },
        {
          id: "tech_yes",
          label: "Yes — standards looked honest",
          nextNodeId: "q_rpe",
          ruleId: "load.tech_ok",
          ruleLabel: "Solid technique → check effort",
          ruleExplanation:
            "Load increases belong only on reps that meet your standards.",
        },
      ],
    },
    q_rpe: {
      id: "q_rpe",
      kind: "question",
      prompt: "How hard were the top sets relative to your target (RPE / reps in reserve)?",
      options: [
        {
          id: "rpe_easy",
          label: "Clearly easier than planned (extra reps in reserve)",
          nextNodeId: "out_increase",
          ruleId: "load.under_target",
          ruleLabel: "Under target effort → increase",
          ruleExplanation:
            "When technique is solid and effort is below the prescription, a small load bump is appropriate.",
        },
        {
          id: "rpe_on",
          label: "About on target",
          nextNodeId: "out_repeat",
          ruleId: "load.on_target",
          ruleLabel: "On target → repeat before jumping",
          ruleExplanation:
            "Hitting the plan is success; repeating the load builds consistency before another jump.",
        },
        {
          id: "rpe_hard",
          label: "Harder than planned / missed reps",
          nextNodeId: "out_hold_or_drop",
          ruleId: "load.over_target",
          ruleLabel: "Over target → hold or reduce",
          ruleExplanation:
            "Misses and excessive strain argue against adding weight this session cycle.",
        },
      ],
    },
    out_form_first: {
      id: "out_form_first",
      kind: "outcome",
      title: "Fix technique before adding weight",
      summary:
        "Keep or slightly reduce load until your standards are honest again.",
      guidance: [
        "Film a set or use a trusted cue checklist.",
        "Earn the next jump with clean reps, not grind-only PRs.",
        "Accessories can address weak links without inflating top-set load.",
      ],
      caveats: [
        "Pain with loading is not a “technique cue” — seek professional care.",
      ],
    },
    out_increase: {
      id: "out_increase",
      kind: "outcome",
      title: "A small weight increase is reasonable",
      summary:
        "Technique held and effort was under target — progress the load modestly.",
      guidance: [
        "Use a small increment appropriate to the lift (often 1–5 kg / 2.5–10 lb).",
        "Keep the same rep target; do not also spike volume the same day.",
        "If the new load breaks technique, return to the previous weight.",
      ],
      caveats: [
        "Not medical advice. Stop if pain appears.",
      ],
    },
    out_repeat: {
      id: "out_repeat",
      kind: "outcome",
      title: "Repeat the load",
      summary:
        "You hit the plan. Repeating builds skill and confidence before the next increase.",
      guidance: [
        "Keep the same top-set weight for another session or week.",
        "Improve bar speed, bracing, or set quality at the same load.",
        "Increase when reps feel clearly under the target effort again.",
      ],
      caveats: [
        "Chronic stalls with good recovery may need programming changes — not endless micro-jumps.",
      ],
    },
    out_hold_or_drop: {
      id: "out_hold_or_drop",
      kind: "outcome",
      title: "Hold or reduce the load",
      summary:
        "Effort overshot the plan. Adding weight now would likely dig a deeper hole.",
      guidance: [
        "Repeat at the same or slightly lower weight with better control.",
        "Check sleep, stress, and warm-up quality.",
        "Consider whether the prescription itself is too aggressive.",
      ],
      caveats: [
        "Repeated failures plus pain need a coach or clinician — not ego loading.",
      ],
    },
  },
};

export const DECISION_TREE_DEADLIFT: DecisionTreeDefinition = {
  slug: "which-deadlift-variation",
  title: "Which deadlift variation should I use?",
  question: "Which deadlift variation should I use?",
  description:
    "Conventional vs sumo vs trap-bar style choice from goals, comfort, and rules — not “cheating” debates.",
  startNodeId: "q_goal",
  nodes: {
    q_goal: {
      id: "q_goal",
      kind: "question",
      prompt: "What is the primary reason you are deadlifting right now?",
      options: [
        {
          id: "goal_pl",
          label: "Powerlifting competition (barbell only)",
          nextNodeId: "q_stance",
          ruleId: "dl.goal_powerlifting",
          ruleLabel: "Powerlifting → barbell stance choice",
          ruleExplanation:
            "Competition deadlift is a barbell lift; trap bar is accessory unless your federation allows otherwise.",
        },
        {
          id: "goal_gen",
          label: "General strength / hypertrophy / athleticism",
          nextNodeId: "q_back",
          ruleId: "dl.goal_general",
          ruleLabel: "General training → comfort & back tolerance",
          ruleExplanation:
            "Without a federation constraint, comfort and back tolerance can guide variation.",
        },
        {
          id: "goal_back",
          label: "I am managing back irritation (not diagnosing)",
          nextNodeId: "out_trap_or_coach",
          ruleId: "dl.goal_back_issue",
          ruleLabel: "Back irritation → cautious variation + pro advice",
          ruleExplanation:
            "Irritation is not something a tree can diagnose; trap-bar or lighter work is a common coaching bridge while you get advice.",
        },
      ],
    },
    q_stance: {
      id: "q_stance",
      kind: "question",
      prompt: "Which stance lets you brace better and hit lockout standards more cleanly?",
      options: [
        {
          id: "stance_sumo",
          label: "Sumo feels stronger / more stable for me",
          nextNodeId: "out_sumo",
          ruleId: "dl.stance_sumo",
          ruleLabel: "Better sumo positions → prefer sumo",
          ruleExplanation:
            "Within legal standards, choose the stance you can own technically and recover from.",
        },
        {
          id: "stance_conv",
          label: "Conventional feels stronger / more stable for me",
          nextNodeId: "out_conventional",
          ruleId: "dl.stance_conventional",
          ruleLabel: "Better conventional positions → prefer conventional",
          ruleExplanation:
            "Leverage and hip structure differ; conventional is not morally superior.",
        },
        {
          id: "stance_unsure",
          label: "Not sure — both feel awkward",
          nextNodeId: "out_experiment",
          ruleId: "dl.stance_unsure",
          ruleLabel: "Unclear → short experiment block",
          ruleExplanation:
            "When both feel awkward, a short structured experiment beats internet absolutism.",
        },
      ],
    },
    q_back: {
      id: "q_back",
      kind: "question",
      prompt: "How does a conventional barbell hinge feel relative to a wider or hex-bar position?",
      options: [
        {
          id: "back_conv_ok",
          label: "Conventional feels fine and trains what I want",
          nextNodeId: "out_conventional",
          ruleId: "dl.general_conventional",
          ruleLabel: "Comfortable conventional → use it",
          ruleExplanation:
            "If conventional is comfortable and goal-aligned, it is a solid default.",
        },
        {
          id: "back_sumo_ok",
          label: "Wider stance / sumo feels clearly better",
          nextNodeId: "out_sumo",
          ruleId: "dl.general_sumo",
          ruleLabel: "Comfortable sumo → use it",
          ruleExplanation:
            "Sumo is a legitimate hinge variation for general strength when it fits your structure.",
        },
        {
          id: "back_trap",
          label: "Trap / hex bar feels clearly better for me",
          nextNodeId: "out_trap",
          ruleId: "dl.general_trap",
          ruleLabel: "Trap bar comfort → prefer trap bar",
          ruleExplanation:
            "Trap-bar pulls are excellent for general strength when equipment allows.",
        },
      ],
    },
    out_sumo: {
      id: "out_sumo",
      kind: "outcome",
      title: "Prefer sumo (for now)",
      summary:
        "Your answers point to sumo as the better-fitting primary deadlift variation.",
      guidance: [
        "Train sumo as the main pull; keep conventional light if you want versatility.",
        "Learn your federation’s start and lockout rules if you compete.",
        "Ignore “sumo is cheating” slogans — legality and technique matter.",
      ],
      caveats: [
        "Pain is still a stop signal. This is not medical advice.",
        "See Myth vs Reality: Is sumo cheating? for culture vs rules.",
      ],
    },
    out_conventional: {
      id: "out_conventional",
      kind: "outcome",
      title: "Prefer conventional (for now)",
      summary:
        "Your answers point to conventional as the better-fitting primary deadlift variation.",
      guidance: [
        "Own bracing, bar path, and lockout before chasing load.",
        "Use sumo or trap bar as accessories if they help weak links.",
        "Stance preference is leverage + skill, not morality.",
      ],
      caveats: [
        "Not medical advice. Sharp back or hip pain needs professional input.",
      ],
    },
    out_trap: {
      id: "out_trap",
      kind: "outcome",
      title: "Prefer trap / hex bar",
      summary:
        "For general strength goals, trap-bar work is a strong match when it feels better and equipment exists.",
      guidance: [
        "Use trap-bar deadlifts as a primary hinge if you are not bound to a barbell standard.",
        "Still train some barbell skill if you may compete later.",
        "Progress load with the same honesty rules as any heavy pull.",
      ],
      caveats: [
        "Powerlifting meets usually require a barbell — train the contested lift if that is the goal.",
      ],
    },
    out_experiment: {
      id: "out_experiment",
      kind: "outcome",
      title: "Run a short stance experiment",
      summary:
        "Neither stance is clearly better yet. Use a structured 2–4 week comparison instead of arguing online.",
      guidance: [
        "Alternate weeks or sessions between sumo and conventional with similar effort.",
        "Compare technique quality, recovery, and bar speed — not one maximal single.",
        "Then commit to a primary stance for a full training block.",
      ],
      caveats: [
        "If both cause pain, stop and get professional advice — do not “test through” injury.",
      ],
    },
    out_trap_or_coach: {
      id: "out_trap_or_coach",
      kind: "outcome",
      title: "Use a cautious variation and get advice",
      summary:
        "Back irritation is outside what a decision tree can safely resolve.",
      guidance: [
        "Consider temporarily reducing load or using a variation that feels less irritating (often trap bar), only if pain-free.",
        "Consult a clinician or qualified coach — do not self-diagnose from a web tool.",
        "Return to heavier barbell pulls only when cleared and technique is solid.",
      ],
      caveats: [
        "This is not medical advice and not a treatment plan.",
      ],
    },
  },
};

export const DECISION_TREE_VOLUME: DecisionTreeDefinition = {
  slug: "do-i-need-more-volume",
  title: "Do I need more volume?",
  question: "Do I need more volume?",
  description:
    "When to add sets versus recover, intensify, or improve execution — without volume absolutism.",
  startNodeId: "q_progress",
  nodes: {
    q_progress: {
      id: "q_progress",
      kind: "question",
      prompt: "Are you still progressing on your main lifts or measurements?",
      options: [
        {
          id: "prog_yes",
          label: "Yes — slow but clear progress",
          nextNodeId: "out_volume_hold",
          ruleId: "vol.progressing",
          ruleLabel: "Progressing → volume increase not required",
          ruleExplanation:
            "If the current dose still moves the needle, adding volume is optional, not mandatory.",
        },
        {
          id: "prog_no",
          label: "No — stalled for several weeks",
          nextNodeId: "q_recovery",
          ruleId: "vol.stalled",
          ruleLabel: "Stall → check recovery before adding sets",
          ruleExplanation:
            "Stalls can mean under-stimulus or under-recovery; recovery comes first in this tree.",
        },
      ],
    },
    q_recovery: {
      id: "q_recovery",
      kind: "question",
      prompt: "How is recovery (sleep, soreness that lingers, motivation, joint feel)?",
      options: [
        {
          id: "rec_poor",
          label: "Poor — crushed, sore, sleep is off",
          nextNodeId: "out_volume_reduce",
          ruleId: "vol.recovery_poor",
          ruleLabel: "Poor recovery → do not add volume",
          ruleExplanation:
            "Adding sets on top of poor recovery usually worsens the stall.",
        },
        {
          id: "rec_ok",
          label: "Acceptable — I feel ready for hard sessions",
          nextNodeId: "q_effort",
          ruleId: "vol.recovery_ok",
          ruleLabel: "Recovery OK → check set quality / effort",
          ruleExplanation:
            "With recovery intact, we ask whether existing hard sets are truly hard.",
        },
      ],
    },
    q_effort: {
      id: "q_effort",
      kind: "question",
      prompt: "Are your hard sets actually hard (near the planned RPE / proximity to failure)?",
      options: [
        {
          id: "effort_soft",
          label: "No — I leave a lot of reps in reserve",
          nextNodeId: "out_intensify",
          ruleId: "vol.effort_soft",
          ruleLabel: "Soft effort → intensify before adding sets",
          ruleExplanation:
            "More easy sets rarely fix a stall; better proximity to the plan often does.",
        },
        {
          id: "effort_hard",
          label: "Yes — hard sets are honestly hard",
          nextNodeId: "out_volume_add",
          ruleId: "vol.effort_hard",
          ruleLabel: "Hard + recovered + stalled → small volume add",
          ruleExplanation:
            "When recovery and effort are solid but progress stalled, a modest volume increase is a reasonable experiment.",
        },
      ],
    },
    out_volume_hold: {
      id: "out_volume_hold",
      kind: "outcome",
      title: "Keep volume where it is",
      summary:
        "You are progressing. Protect the dose that works before chasing more sets.",
      guidance: [
        "Maintain current hard-set counts for main movements.",
        "Improve technique and load progression first.",
        "Revisit volume if progress stalls for several weeks with good recovery.",
      ],
      caveats: [
        "Not medical advice. Pain is a stop signal.",
      ],
    },
    out_volume_reduce: {
      id: "out_volume_reduce",
      kind: "outcome",
      title: "Do not add volume — recover first",
      summary:
        "Recovery looks limiting. More sets would likely dig a deeper hole.",
      guidance: [
        "Trim accessory volume or insert an easier week.",
        "Fix sleep and stress drivers you control.",
        "Return to progressive loading when readiness improves.",
      ],
      caveats: [
        "Persistent fatigue with medical symptoms needs a clinician.",
      ],
    },
    out_intensify: {
      id: "out_intensify",
      kind: "outcome",
      title: "Intensify existing sets before adding more",
      summary:
        "Effort looks softer than the plan. Quality often beats quantity here.",
      guidance: [
        "Push hard sets closer to the prescribed RPE / RIR.",
        "Keep set count steady for 1–2 weeks while effort rises.",
        "Add volume only if you stall again with honest effort and good recovery.",
      ],
      caveats: [
        "Intensity is not the same as grinding into injury — stop for pain.",
      ],
    },
    out_volume_add: {
      id: "out_volume_add",
      kind: "outcome",
      title: "A small volume increase is reasonable",
      summary:
        "Stalled, recovered, and already training hard — try a modest set increase as an experiment.",
      guidance: [
        "Add a small number of hard sets to lagging lifts or muscles (often +1–2 hard sets / week).",
        "Hold the new dose for several weeks before judging.",
        "Be ready to pull volume back if recovery collapses.",
      ],
      caveats: [
        "Volume is not infinitely scalable. This is coaching practice, not a prescription.",
        "Not medical advice.",
      ],
    },
  },
};

export const DECISION_TREE_CATALOG: readonly DecisionTreeDefinition[] = [
  DECISION_TREE_DELOAD,
  DECISION_TREE_INCREASE_WEIGHT,
  DECISION_TREE_DEADLIFT,
  DECISION_TREE_VOLUME,
] as const;
