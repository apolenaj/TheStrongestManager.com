/**
 * Allowlisted calculator definitions (Prompt 168).
 */

import type { CalculatorDefinition } from "@/domain/calculator-suite/constants";

export const CALCULATOR_DEFINITIONS: readonly CalculatorDefinition[] = [
  {
    slug: "estimated-1rm",
    title: "Estimated 1RM",
    shortLabel: "1RM",
    description:
      "Estimate a one-rep max from a multi-rep set using Epley — then log real singles in the app.",
    overview:
      "Multi-rep sets can sketch a one-rep max when you need a planning number. This tool uses the published Epley formula and refuses reps outside a sensible range so you are not handed a fake precision figure. Use the estimate to set training maxes or attempt ceilings, then confirm with logged sessions and PR prediction in the product.",
    precisionNote:
      "Estimate only. Error grows as reps move away from a single. Never treat an e1RM as a verified PR.",
    formulaCitation: "Epley (1985): estimated 1RM ≈ w × (1 + r/30), capped at 2–12 reps.",
    uniqueValueKey: "calc:estimated-1rm-v1",
    primaryCta: { href: "/signup", label: "Log lifts in the app" },
    productLinks: [
      {
        href: "/app/pr-prediction",
        label: "PR prediction",
        reason: "Conservative ranges from logged work — not a single fake number.",
        surface: "app",
      },
      {
        href: "/app/today",
        label: "Today’s workout",
        reason: "Turn the estimate into a session you actually complete.",
        surface: "app",
      },
      {
        href: "/exercises/deadlift",
        label: "Deadlift technique",
        reason: "Strength numbers matter more when the pattern is owned.",
        surface: "public",
      },
      {
        href: "/legendary-methods",
        label: "Legendary Methods",
        reason: "Educational analyses of elite deadlift and strength systems.",
        surface: "public",
      },
    ],
    faqs: [
      {
        question: "Is this as accurate as a tested single?",
        answer:
          "No. It is a published estimate. Fatigue, exercise choice, and proximity to failure all change the result.",
      },
      {
        question: "Why refuse high-rep sets?",
        answer:
          "Beyond about 12 reps, Epley error grows quickly. We refuse rather than invent a precise-looking number.",
      },
    ],
  },
  {
    slug: "plate-calculator",
    title: "Plate calculator",
    shortLabel: "Plates",
    description:
      "Load a bar to a target weight with paired metric plates — then run the session in Today.",
    overview:
      "Gym math should be boring and correct. Enter a target and bar weight; the calculator returns a paired plate stack and flags remainder when your denominations cannot hit the load exactly. Collars and missing plates are your call — we do not pretend every gym has a perfect bumper set.",
    precisionNote:
      "Assumes paired plates and the stated bar. Inventory and collar weight are not modeled.",
    formulaCitation:
      "Greedy paired loading: subtract bar, split remainder per side, assign largest available plates first.",
    uniqueValueKey: "calc:plate-calculator-v1",
    primaryCta: { href: "/signup", label: "Load the session in Today" },
    productLinks: [
      {
        href: "/app/today",
        label: "Today’s workout",
        reason: "Put the loaded bar into a logged set instead of a napkin sketch.",
        surface: "app",
      },
      {
        href: "/app/programs",
        label: "Programs",
        reason: "Follow prescribed loads when a program assigns percentages or kilos.",
        surface: "app",
      },
      {
        href: "/features",
        label: "Product features",
        reason: "See how logging, programs, and technique fit together.",
        surface: "public",
      },
    ],
    faqs: [
      {
        question: "Does this include collar weight?",
        answer:
          "No. Add collar mass to the bar field if you want it included, or leave collars out if your gym ignores them.",
      },
      {
        question: "What if I cannot hit the target exactly?",
        answer:
          "The calculator shows the closest loadable weight and the remainder. Round intentionally for your plate set.",
      },
    ],
  },
  {
    slug: "dots",
    title: "DOTS calculator",
    shortLabel: "DOTS",
    description:
      "Compute a DOTS score from total and bodyweight with cited OpenPowerlifting coefficients.",
    overview:
      "Relative strength scores only belong in the product when the formula is cited and correct. This calculator implements DOTS with OpenPowerlifting coefficients and bodyweight clamps — not invented numbers. Wilks and IPF GL Points stay deferred. Use DOTS to compare totals across bodyweights, then track SBD and meet prep in Powerlifting Mode.",
    precisionNote:
      "DOTS is a published relative-strength curve, not a placing and not IPF GL Points. Federations may use other formulas.",
    formulaCitation:
      "DOTS (OpenPowerlifting / Tim Rohr, 2020): total × 500 / (A + B·bw + C·bw² + D·bw³ + E·bw⁴).",
    uniqueValueKey: "calc:dots-v1",
    primaryCta: { href: "/app/powerlifting", label: "Open Powerlifting Mode" },
    productLinks: [
      {
        href: "/app/powerlifting",
        label: "Powerlifting Mode",
        reason: "SBD, total, competition, and attempt planning without fake federation scores.",
        surface: "app",
      },
      {
        href: "/app/bodyweight-performance",
        label: "Bodyweight performance",
        reason: "Simple e1RM ÷ bodyweight trends when you want a transparent ratio.",
        surface: "app",
      },
      {
        href: "/learn/powerlifting",
        label: "Powerlifting learn pillar",
        reason: "Context for total, attempts, and meet prep language.",
        surface: "public",
      },
    ],
    faqs: [
      {
        question: "Is this the same as IPF GL Points?",
        answer:
          "No. IPF competitions use IPF GL Points. DOTS is a separate OpenPowerlifting formula used widely for rankings.",
      },
      {
        question: "Do you compute Wilks?",
        answer:
          "Not in this suite. We only ship formulas we can cite correctly — DOTS first.",
      },
    ],
  },
  {
    slug: "volume-calculator",
    title: "Volume calculator",
    shortLabel: "Volume",
    description:
      "Sum tonnage from load × reps × sets — then compare to the week you actually log.",
    overview:
      "Volume is easy to over-interpret. This calculator multiplies load, reps, and sets into tonnage so you can compare sessions honestly. It does not claim that more kilograms moved equals a better week. Log the work in Today and review programs when you want prescribed weekly structure.",
    precisionNote:
      "Tonnage ≠ stimulus quality. Proximity to failure, exercise choice, and recovery are not in the formula.",
    formulaCitation: "Tonnage (kg) = load × reps × sets, summed across optional rows.",
    uniqueValueKey: "calc:volume-calculator-v1",
    primaryCta: { href: "/signup", label: "Log volume in Today" },
    productLinks: [
      {
        href: "/app/today",
        label: "Today’s workout",
        reason: "Record sets so tonnage comes from training, not a scratchpad.",
        surface: "app",
      },
      {
        href: "/app/program-builder",
        label: "Program builder",
        reason: "Build weeks with intentional volume instead of guessing sets after the fact.",
        surface: "app",
      },
      {
        href: "/fit",
        label: "Training approach fit",
        reason: "Match volume style to goal and schedule before stacking tonnage.",
        surface: "public",
      },
    ],
    faqs: [
      {
        question: "Should I chase a tonnage PR every week?",
        answer:
          "Usually no. Tonnage is one lens. Technique quality and recovery matter more than a rising spreadsheet total.",
      },
    ],
  },
  {
    slug: "attempt-planner",
    title: "Attempt planner",
    shortLabel: "Attempts",
    description:
      "Sketch opener, second, and conditional third from a planning ceiling — never a guarantee.",
    overview:
      "Meet attempts are strategy under uncertainty. Enter a planning ceiling and risk preference to sketch opener / second / third bands using the same attempt-selector logic as the app. The numbers are planning aids only. Open the full Attempt Selector when you have PR prediction ranges and meet history.",
    precisionNote:
      "Sketches only — never a guarantee that any attempt will be made on the platform.",
    formulaCitation:
      "Risk-banded fractions of a planning ceiling, rounded to 2.5 kg (attempt-selector domain).",
    uniqueValueKey: "calc:attempt-planner-v1",
    primaryCta: { href: "/app/attempt-selector", label: "Full attempt selector" },
    productLinks: [
      {
        href: "/app/attempt-selector",
        label: "Attempt selector",
        reason: "Use strength ranges, history, and goals — not only a single ceiling.",
        surface: "app",
      },
      {
        href: "/app/competition",
        label: "Competition Mode",
        reason: "Countdown, taper sketches, and meet-day context around attempts.",
        surface: "app",
      },
      {
        href: "/goals/powerlifting-program",
        label: "Powerlifting program goal",
        reason: "Route from meet intent into programming and logging features.",
        surface: "public",
      },
      {
        href: "/legendary-methods",
        label: "Legendary Methods",
        reason: "Educational peaking and strength-system analyses.",
        surface: "public",
      },
    ],
    faqs: [
      {
        question: "Will this guarantee opens?",
        answer:
          "No. Openers fail. The tool sketches risk bands; you still make the call on the day.",
      },
    ],
  },
  {
    slug: "training-max",
    title: "Training max",
    shortLabel: "TM",
    description:
      "Set a programming training max (often ~90% of 1RM or e1RM) without pretending it is a tested max.",
    overview:
      "A training max is a coaching convention used to prescribe weekly percentages — commonly about 90% of a tested or estimated 1RM. Enter a 1RM or a multi-rep set, choose a fraction, and get a TM you can feed into programs. Adjust when sessions feel too easy or too heavy; the percentage is not physiology law.",
    precisionNote:
      "TM is a programming construct. It is not a measured max and should be revised when reality disagrees.",
    formulaCitation:
      "TM = 1RM × fraction (default 0.9). Optional 1RM via Epley from a 2–12 rep set.",
    uniqueValueKey: "calc:training-max-v1",
    primaryCta: { href: "/app/programs", label: "Apply in programs" },
    productLinks: [
      {
        href: "/app/programs",
        label: "Programs",
        reason: "Assign percentage-based work from a TM you actually use.",
        surface: "app",
      },
      {
        href: "/app/program-builder",
        label: "Program builder",
        reason: "Build blocks that reference intentional loads, not vanity maxes.",
        surface: "app",
      },
      {
        href: "/tools/estimated-1rm",
        label: "Estimated 1RM tool",
        reason: "Derive an e1RM first when you only have a multi-rep set.",
        surface: "public",
      },
    ],
    faqs: [
      {
        question: "Is 90% mandatory?",
        answer:
          "No. It is a common default (e.g. Wendler-style programming). Change the fraction when your program or experience says otherwise.",
      },
    ],
  },
] as const;

export function getCalculatorDefinition(
  slug: string,
): CalculatorDefinition | undefined {
  return CALCULATOR_DEFINITIONS.find((c) => c.slug === slug);
}

export function allCalculatorSlugs(): string[] {
  return CALCULATOR_DEFINITIONS.map((c) => c.slug);
}
