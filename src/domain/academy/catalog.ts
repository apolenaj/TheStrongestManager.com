import type { AcademyCourse } from "@/domain/academy/types";

/**
 * Curated Academy catalog (Prompt 38).
 * Educational coaching-practice courses — Certificate of Completion only.
 */

function q(
  id: string,
  prompt: string,
  choices: [string, string, string, string],
  correctIndex: 0 | 1 | 2 | 3,
) {
  const choiceObjs = choices.map((label, i) => ({
    id: `${id}-c${i}`,
    label,
  }));
  return {
    id,
    prompt,
    choices: choiceObjs,
    correctChoiceId: choiceObjs[correctIndex]!.id,
  };
}

export const ACADEMY_COURSES: AcademyCourse[] = [
  {
    slug: "deadlift-specialist",
    title: "Deadlift Specialist",
    summary:
      "Setup, bar path, hinge mechanics, and common faults for conventional and sumo deadlift — coaching-practice education.",
    audience: "both",
    topics: ["deadlift", "technique", "hinge", "powerlifting"],
    estimatedHours: 4,
    isPublished: true,
    prerequisiteCourseSlugs: ["programming-fundamentals"],
    modules: [
      {
        id: "dl-m1",
        title: "Setup & starting position",
        summary: "Stance, grip, and bracing before the pull.",
        sortOrder: 1,
        lessons: [
          {
            id: "dl-m1-l1",
            title: "Stance and foot pressure",
            summary: "Conventional vs sumo stance trade-offs.",
            estimatedMinutes: 12,
            body: "Stance width and toe angle should let you reach the bar with a braced torso and clear hips. Conventional typically keeps feet closer; sumo widens the base and shortens the range. Neither is universally “better” — choose from leverages, hip structure, and sport rules. Teach athletes to feel mid-foot pressure before they pull.",
            techniqueExamples: [
              {
                exerciseSlug: "deadlift",
                label: "Deadlift (library)",
                note: "Compare conventional vs sumo notes in the exercise library — not a video grade.",
              },
            ],
            practicalAssignments: [
              {
                id: "dl-m1-l1-a1",
                title: "Film one setup from the side",
                instructions:
                  "Record a light setup (empty bar or light load). Check mid-foot pressure and stance. Self-attest when done — this is practice, not a scored technique review.",
                evidenceKind: "technique_upload_suggested",
              },
            ],
          },
          {
            id: "dl-m1-l2",
            title: "Grip, lat tension, and brace",
            summary: "Create a rigid trunk before the bar leaves the floor.",
            estimatedMinutes: 14,
            body: "Grip the bar after finding the stance. Set the lats (think “armpits to pockets”), take air into the trunk, and brace as if preparing for a punch. The bar should stay close without yanking slack carelessly. Mixed grip, hook, and straps are tools — discuss trade-offs honestly with the athlete.",
            techniqueExamples: [
              {
                exerciseSlug: "deadlift",
                label: "Deadlift brace cues",
                note: "Use the exercise page cues as reference — Academy does not invent injury diagnoses.",
              },
            ],
          },
        ],
        quiz: {
          id: "dl-m1-quiz",
          title: "Setup check",
          passPercent: 70,
          questions: [
            q(
              "dl-m1-q1",
              "What should generally be true before the bar leaves the floor?",
              [
                "The athlete is fully exhaled and soft through the trunk",
                "The trunk is braced and the bar path intent is close to the body",
                "The hips shoot up first every time",
                "The athlete looks at the ceiling to keep the chest up",
              ],
              1,
            ),
            q(
              "dl-m1-q2",
              "Which statement about conventional vs sumo is most honest?",
              [
                "Sumo is always safer for every lifter",
                "Conventional is required for strength gains",
                "Stance choice depends on leverages, comfort, and rules — not dogma",
                "Toe angle never matters",
              ],
              2,
            ),
          ],
        },
      },
      {
        id: "dl-m2",
        title: "Pull & lockout",
        summary: "Bar path, hip extension, and finishing the lift.",
        sortOrder: 2,
        lessons: [
          {
            id: "dl-m2-l1",
            title: "Bar path and hip hinge",
            summary: "Keep the bar close; extend hips without hyperextending the spine.",
            estimatedMinutes: 15,
            body: "A useful cue is to push the floor away while keeping the bar close to the legs. Hips and shoulders should rise in a coordinated pattern for that athlete — “chest up” cues can backfire if they create excessive lumbar extension. Lockout is hip extension to a tall finish, not a dramatic lean-back.",
            techniqueExamples: [
              {
                exerciseSlug: "romanian-deadlift",
                label: "Romanian deadlift (hinge drill)",
                note: "RDL can reinforce hinge feel at lighter loads — not a substitute for floor deadlift specificity.",
              },
            ],
            practicalAssignments: [
              {
                id: "dl-m2-l1-a1",
                title: "Two slow hinge reps",
                instructions:
                  "Perform two controlled hinge reps (RDL or light deadlift). Focus on bar closeness. Mark complete when practiced — no fake rubric score.",
                evidenceKind: "self_attested",
              },
            ],
          },
          {
            id: "dl-m2-l2",
            title: "Common faults",
            summary: "Hips shooting up, bar drifting, soft lockout.",
            estimatedMinutes: 12,
            body: "Hips rising early often means the athlete is not strong enough in the start position or lost tension. Bar drift usually means lost lat tension or poor setup. Soft lockouts may be cueing, strength, or fatigue. Film from the side when possible; do not invent injury diagnoses from a single video.",
            practicalAssignments: [
              {
                id: "dl-m2-l2-a1",
                title: "Log one deadlift session note",
                instructions:
                  "After a session, note one fault you watched for (hips early, bar drift, soft lockout). Optional: log the session in Today. Self-attest — not a coach grade.",
                evidenceKind: "log_session_suggested",
              },
            ],
          },
        ],
        quiz: {
          id: "dl-m2-quiz",
          title: "Pull check",
          passPercent: 70,
          questions: [
            q(
              "dl-m2-q1",
              "A dramatic lean-back at lockout is best described as:",
              [
                "Required for a legal powerlifting lockout in all federations",
                "Often unnecessary spinal extension rather than true hip extension",
                "Proof the glutes are weak",
                "The only way to finish a sumo pull",
              ],
              1,
            ),
          ],
        },
      },
    ],
  },
  {
    slug: "programming-fundamentals",
    title: "Programming Fundamentals",
    summary:
      "Volume, intensity, progressive overload, and recovery basics for writing simple strength plans.",
    audience: "both",
    topics: ["programming", "volume", "intensity", "recovery"],
    estimatedHours: 5,
    isPublished: true,
    modules: [
      {
        id: "pf-m1",
        title: "Load management basics",
        summary: "Sets, reps, intensity, and progressive overload.",
        sortOrder: 1,
        lessons: [
          {
            id: "pf-m1-l1",
            title: "Volume and intensity",
            summary: "Define hard sets and relative intensity without fake precision.",
            estimatedMinutes: 14,
            body: "Volume is often counted as hard sets per muscle or lift per week. Intensity can mean % of 1RM, RPE, or proximity to failure. These are tools, not laws. Beginners usually need consistency more than perfect periodization jargon.",
          },
          {
            id: "pf-m1-l2",
            title: "Progressive overload",
            summary: "Add stress when recovery allows — not every session forever.",
            estimatedMinutes: 12,
            body: "Overload can be load, reps, sets, density, or skill demand. Plateaus and deloads are normal. Autoregulation (RPE/RIR) helps when life stress varies. Never promise linear PRs indefinitely.",
            practicalAssignments: [
              {
                id: "pf-m1-l2-a1",
                title: "Write one overload plan for next week",
                instructions:
                  "Pick one main lift. Write how you might overload next week (load, reps, or sets) if recovery allows. Self-attest when written — not graded.",
                evidenceKind: "self_attested",
              },
            ],
          },
        ],
        quiz: {
          id: "pf-m1-quiz",
          title: "Load basics",
          passPercent: 70,
          questions: [
            q(
              "pf-m1-q1",
              "Progressive overload means:",
              [
                "Adding weight every session no matter what",
                "Gradually increasing training stress when the athlete can recover from it",
                "Only increasing volume, never intensity",
                "Avoiding deloads forever",
              ],
              1,
            ),
          ],
        },
      },
      {
        id: "pf-m2",
        title: "Recovery & constraints",
        summary: "Sleep, stress, and honest recovery signals.",
        sortOrder: 2,
        lessons: [
          {
            id: "pf-m2-l1",
            title: "Recovery is not a readiness score science",
            summary: "Use check-ins without inventing wearable truth.",
            estimatedMinutes: 10,
            body: "Subjective recovery (sleep, stress, soreness, motivation) can guide adjustments. Wearables may help some athletes later — do not fabricate HRV insights. Pain and injury need medical professionals, not Academy quizzes.",
          },
        ],
        quiz: null,
      },
    ],
  },
  {
    slug: "powerlifting-programming",
    title: "Powerlifting Programming",
    summary:
      "Meet peaking sketches, variation selection, and week structure for squat, bench, and deadlift.",
    audience: "both",
    topics: ["powerlifting", "peaking", "periodization", "competition"],
    estimatedHours: 6,
    isPublished: true,
    prerequisiteCourseSlugs: ["programming-fundamentals"],
    modules: [
      {
        id: "pp-m1",
        title: "Weekly structure",
        summary: "Main lifts, variations, and accessories.",
        sortOrder: 1,
        lessons: [
          {
            id: "pp-m1-l1",
            title: "Competition lifts vs variations",
            summary: "Specificity rises closer to a meet.",
            estimatedMinutes: 16,
            body: "Far from a meet, variations can address weak ranges and technique. Closer to a meet, specificity usually increases toward competition commands and equipment. Templates are starting points — individualize for recovery and rulesets.",
          },
          {
            id: "pp-m1-l2",
            title: "Accessory work with a purpose",
            summary: "Support the main lifts; avoid random exercise spam.",
            estimatedMinutes: 12,
            body: "Accessories should address muscle groups that limit the big three or keep the athlete durable. Track them lightly. If accessories consistently steal recovery from squat/bench/deadlift, cut volume.",
          },
        ],
        quiz: {
          id: "pp-m1-quiz",
          title: "Structure check",
          passPercent: 70,
          questions: [
            q(
              "pp-m1-q1",
              "As a meet approaches, programming usually becomes:",
              [
                "Less specific to the competition lifts",
                "More specific to competition lifts, commands, and equipment",
                "Entirely random each week",
                "Only bodybuilding isolation",
              ],
              1,
            ),
          ],
        },
      },
      {
        id: "pp-m2",
        title: "Peaking sketch",
        summary: "Illustrative taper ideas — not a guaranteed meet plan.",
        sortOrder: 2,
        lessons: [
          {
            id: "pp-m2-l1",
            title: "Taper honesty",
            summary: "Reduce fatigue while keeping neuromuscular freshness.",
            estimatedMinutes: 14,
            body: "A common sketch lowers volume while keeping some intensity exposure, then rests before attempts. Exact taper length varies. This course does not guarantee meet totals or attempt selection success.",
          },
        ],
        quiz: {
          id: "pp-m2-quiz",
          title: "Peaking check",
          passPercent: 70,
          questions: [
            q(
              "pp-m2-q1",
              "A powerlifting taper sketch is best framed as:",
              [
                "A guaranteed PR protocol for every lifter",
                "An illustrative fatigue-management pattern that must be individualized",
                "Identical for every federation and weight class",
                "Unnecessary if the lifter is advanced",
              ],
              1,
            ),
          ],
        },
      },
    ],
  },
  {
    slug: "strength-coaching",
    title: "Strength Coaching",
    summary:
      "Communication, cueing, athlete autonomy, and ethical boundaries for coaches in the Performance OS.",
    audience: "coach",
    topics: ["coaching", "cueing", "ethics", "communication"],
    estimatedHours: 5,
    isPublished: true,
    modules: [
      {
        id: "sc-m1",
        title: "Coach–athlete relationship",
        summary: "Clarity, consent, and data access ethics.",
        sortOrder: 1,
        lessons: [
          {
            id: "sc-m1-l1",
            title: "Explicit access & scopes",
            summary: "Athletes grant coach access — never assume health data.",
            estimatedMinutes: 12,
            body: "In this product, coaches only see athletes who grant access. Sensitive recovery and body metrics stay opt-in. Marketplace discovery is separate from data grants. Document decisions; do not present AI suggestions as your own.",
          },
          {
            id: "sc-m1-l2",
            title: "Cueing that teaches",
            summary: "External cues, fewer words, film when helpful.",
            estimatedMinutes: 14,
            body: "Prefer 1–2 clear cues over a lecture mid-set. External focus cues often work well. Ask what the athlete felt. Avoid diagnosing injuries; refer out when pain or medical questions arise.",
            practicalAssignments: [
              {
                id: "sc-m1-l2-a1",
                title: "Draft two external cues",
                instructions:
                  "Write two external-focus cues for a squat or deadlift. Practice saying them in under five words each. Self-attest — Certificate of Completion is still lessons + quizzes only.",
                evidenceKind: "self_attested",
              },
            ],
          },
        ],
        quiz: {
          id: "sc-m1-quiz",
          title: "Ethics check",
          passPercent: 80,
          questions: [
            q(
              "sc-m1-q1",
              "Regarding athlete health data in Coach Mode:",
              [
                "Coaches can browse all athletes by default",
                "Access requires an explicit grant; sensitive scopes are opt-in",
                "Recovery data is always visible to any coach",
                "AI suggestions should be labelled as human coach decisions",
              ],
              1,
            ),
            q(
              "sc-m1-q2",
              "Academy course completion means:",
              [
                "You are an accredited strength coach internationally",
                "You earned a Certificate of Completion for this curriculum",
                "You may legally practice physical therapy",
                "You hold a CSCS equivalent",
              ],
              1,
            ),
          ],
        },
      },
      {
        id: "sc-m2",
        title: "Programming conversations",
        summary: "Explain why without overselling certainty.",
        sortOrder: 2,
        lessons: [
          {
            id: "sc-m2-l1",
            title: "Honest recommendations",
            summary: "Confidence language and athlete decisions.",
            estimatedMinutes: 12,
            body: "When suggesting load changes, separate human coach judgment from engine suggestions. Timestamp and audit modifications. Invite athlete Accept / Modify / Decline where the product supports it.",
          },
        ],
        quiz: null,
      },
    ],
  },
];
