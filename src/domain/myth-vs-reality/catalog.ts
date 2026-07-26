/**
 * Curated Myth vs Reality catalog.
 * Educational copy only — no invented study citations or DOIs.
 */

import type { MythVsRealityEntry } from "@/domain/myth-vs-reality/types";

export const MYTH_VS_REALITY_ENTRIES: readonly MythVsRealityEntry[] = [
  {
    slug: "knees-over-toes",
    claim: "Do knees over toes destroy knees?",
    seoTitle: "Do knees over toes destroy knees?",
    seoDescription:
      "A careful look at the “knees over toes” myth: what people say, what evidence suggests, a practical answer, and important nuance — without clickbait certainty.",
    whatPeopleSay:
      "A long-running gym rule says the knee must stay behind the toe in squats and lunges, or cartilage and ligaments will be ruined. Many lifters still cue “sit back” as if any forward knee travel is automatically dangerous.",
    whatEvidenceSuggests:
      "Forward knee travel increases demand at the knee joint in some positions, but that is not the same as “destroying” healthy knees. Controlled knee flexion with load is a normal part of walking, stairs, and sport. Blanket bans on knees-over-toes are stronger than the evidence for healthy trainees using sensible progression. Pain, prior injury, and poor control are different problems than a geometry cue.",
    practicalAnswer:
      "Allow knees to track over the toes when the ankle, hip, and balance need it — especially in deeper squats and lunges — while keeping the heel down, the knee tracking roughly over the mid-foot, and load progressing gradually. Teach control and comfort, not a fear-based ban.",
    nuance:
      "Athletes with knee pain, recent surgery, or sport-specific rehab needs should follow clinician guidance. Extremely aggressive “knees over toes” challenges are not required for progress. Footwear, ankle mobility, and torso angle change how much forward knee travel appears for the same depth.",
    evidenceLabel: "coaching_consensus",
    topics: ["squat", "knees", "technique", "injury-myths"],
  },
  {
    slug: "is-sumo-cheating",
    claim: "Is sumo cheating?",
    seoTitle: "Is sumo deadlift cheating?",
    seoDescription:
      "Is the sumo deadlift cheating? Separating internet slogans from federation rules, leverages, and honest strength training — without clickbait.",
    whatPeopleSay:
      "Online debates often call sumo “cheating” because the range of motion looks shorter or because some lifters move big weights more easily in a wide stance. Conventional-only camps treat stance choice as a moral issue instead of a leverage and rules question.",
    whatEvidenceSuggests:
      "Sumo and conventional are different deadlift styles with different hip, knee, and torso demands. Neither is universally harder or easier; leverages, mobility, and training history matter. In federations that allow both, a legal sumo pull is not cheating — it is a permitted technique. “Cheating” belongs to rule violations (hitching outside allowed standards, failed lockout, etc.), not stance preference.",
    practicalAnswer:
      "Choose the stance that lets you brace well, keep the bar path honest, and train hard within your sport’s rules. Compare progress within a style; do not treat internet “ROM shaming” as a strength standard. If you compete, learn your federation’s start and lockout criteria for both stances.",
    nuance:
      "Some sports or coaches prescribe conventional for specificity. Shorter ROM in one style does not automatically mean less training value — joint moments and muscle emphasis still differ. Mocking sumo as cheating usually signals culture, not biomechanics.",
    evidenceLabel: "coaching_consensus",
    topics: ["deadlift", "sumo", "powerlifting", "technique"],
  },
  {
    slug: "high-rep-strength",
    claim: "Does high-rep training build strength?",
    seoTitle: "Does high-rep training build strength?",
    seoDescription:
      "Can high-rep training build strength? A nuanced educational answer: what people say, what evidence suggests, practical programming, and limits — no absolute slogans.",
    whatPeopleSay:
      "One camp says strength only comes from heavy low-rep sets. Another claims high reps “tone” or build the same strength if you go to failure. Social media often collapses hypertrophy, endurance, and 1RM strength into one claim.",
    whatEvidenceSuggests:
      "Strength (especially high-force, low-rep performance) is trained most directly with heavier loads and lower reps, plus practice of the skill of heavy lifting. Higher-rep work can still improve muscle size and work capacity, which may support strength indirectly over time, but it is a weaker primary tool for maximal strength than heavy practice. “High reps build no strength” and “high reps equal heavy strength” are both oversold.",
    practicalAnswer:
      "If the goal is a stronger squat, bench, or deadlift, keep a meaningful share of training in heavier, lower-rep sets (with good technique and recovery). Use higher-rep work as accessory volume, hypertrophy support, or conditioning — not as the only strength method. Match the tool to the outcome.",
    nuance:
      "Beginners often get stronger from almost any progressive program. Advanced lifters need more specificity. Rep ranges are a continuum, not moral categories. Fatigue, proximity to failure, and exercise selection change results as much as the rep number on the spreadsheet.",
    evidenceLabel: "moderate_evidence",
    topics: ["strength", "hypertrophy", "programming", "rep-ranges"],
  },
] as const;
