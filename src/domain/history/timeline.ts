/**
 * History of Strength & Physique Training — educational timeline (Prompt 29).
 *
 * Original summaries only. Do not paste copyrighted book/program text.
 * Related method links point to curated `/methods/[slug]` pages.
 */

export const HISTORY_TIMELINE_TITLE =
  "Evolution of Strength & Physique Training";

export const HISTORY_TIMELINE_DESCRIPTION =
  "An original educational timeline of how strength and physique training culture evolved — from early physical culture through Soviet systems, HIT, conjugate practice, autoregulation, and evidence-informed programming.";

export const HISTORY_HONESTY = [
  "This timeline is an original educational overview, not a reprint of any book, course, or commercial program.",
  "History describes how ideas circulated in coaching culture. It is not an evidence verdict and does not rank methods as scientifically superior.",
  "Where method pages exist, follow those links for deeper historical vs modern interpretation layers.",
] as const;

export type HistoryEra = {
  /** URL slug for /history/[slug] and #anchors */
  slug: string;
  title: string;
  /** Human period label */
  periodLabel: string;
  /** Approximate start year for chronological sort (not a precise dating claim) */
  sortYear: number;
  /** One-line hook for index cards / SEO */
  teaser: string;
  /** Original multi-paragraph narrative */
  narrative: string[];
  /** Short theme chips */
  themes: string[];
  /** Published method catalog slugs */
  relatedMethodSlugs: string[];
  /** Optional caution specific to this era */
  caution?: string;
};

/**
 * Curated eras — original synthesis for education and internal linking.
 * Approximate periods are coaching-history framing, not archival dating.
 */
export const HISTORY_ERAS: readonly HistoryEra[] = [
  {
    slug: "early-physical-culture",
    title: "Early physical culture",
    periodLabel: "Late 1800s – 1930s",
    sortYear: 1890,
    teaser:
      "Strongmen, health reformers, and early barbell culture turn strength into public spectacle and personal practice.",
    narrative: [
      "Before modern sport federations, strength and physique training grew out of physical culture: stage strongmen, health magazines, club gymnasiums, and early barbell systems. Public demonstrations mattered as much as private progress. Contests mixed odd lifts, bodyweight feats, and emerging “standard” barbell exercises.",
      "Coaches and entrepreneurs sold courses by mail, framed training as character and vitality, and popularized progressive loading with crude equipment. The language was often moral and commercial at once — self-improvement sold alongside products. That dual identity still echoes in fitness media.",
      "What endured was not a single program, but a cultural foundation: deliberate practice with resistance, public fascination with muscular development, and the idea that strength could be trained rather than merely inherited. Later bodybuilding and power sports inherit this stage, even when they reject its theatrics.",
    ],
    themes: [
      "Spectacle & health reform",
      "Early barbells",
      "Mail-order systems",
    ],
    relatedMethodSlugs: ["linear-periodization", "high-intensity-training"],
    caution:
      "Era labels and dates are approximate cultural framing, not a claim of precise archival boundaries.",
  },
  {
    slug: "golden-era-bodybuilding",
    title: "Golden-era bodybuilding",
    periodLabel: "1950s – 1970s",
    sortYear: 1960,
    teaser:
      "Physique sport becomes mass culture: volume, splits, and aesthetic ideals reshape how people train for muscle.",
    narrative: [
      "Mid-century bodybuilding moved physique training from niche clubs into mass media. Contests, magazines, and gym culture rewarded visible muscle, symmetry, and stage presentation. Training culture emphasized higher weekly volume, body-part specialization, and a growing vocabulary of isolation and machine work alongside free weights.",
      "“Golden era” is a popular label, not a scientific period. It points to a coaching climate where pump, volume, and aesthetic priorities often outranked maximal strength metrics. Many templates later sold as classics were simplified commercial snapshots of that climate — useful as history, unreliable as universal rules.",
      "The lasting influence is cultural: split routines, physique goals as mainstream motivation, and a persistent tension between looking strong and being strong. Modern hypertrophy methods still argue with — and borrow from — that era’s habits.",
    ],
    themes: ["Physique aesthetics", "Volume culture", "Split routines"],
    relatedMethodSlugs: [
      "german-volume-training",
      "rest-pause",
      "myo-reps",
      "high-intensity-training",
    ],
    caution:
      "We do not reproduce proprietary contest prep plans or copyrighted magazine programs — only original historical framing.",
  },
  {
    slug: "soviet-weightlifting-systems",
    title: "Soviet weightlifting systems",
    periodLabel: "1950s – 1980s (influence ongoing)",
    sortYear: 1955,
    teaser:
      "Planned periodization and multi-year athlete development enter Western coaching vocabulary through weightlifting success.",
    narrative: [
      "Soviet and Eastern Bloc weightlifting popularized long-horizon planning: preparatory and competitive phases, variation of intensity and volume across mesocycles, and deliberate technical practice under fatigue management. Western coaches encountered these ideas through competition results, translated literature, and later sport-science teaching.",
      "“Soviet system” is often used loosely. Classical periodization models, block-style concentration of qualities, and high technical frequency in the snatch and clean & jerk are related but not identical packages. Popular summaries sometimes flatten decades of coaching debate into one slogan.",
      "The durable export was planning literacy: think in phases, manage fatigue across weeks, and treat strength qualities as trainable over seasons — not only session to session. Those habits shaped later powerlifting and athletic periodization far beyond Olympic lifting alone.",
    ],
    themes: [
      "Periodization literacy",
      "Technical frequency",
      "Long-horizon planning",
    ],
    relatedMethodSlugs: [
      "linear-periodization",
      "block-periodization",
      "high-frequency-training",
      "cluster-sets",
    ],
    caution:
      "National-system labels are coaching shorthand. Individual coaches and eras differed widely.",
  },
  {
    slug: "high-intensity-training",
    title: "High-intensity training",
    periodLabel: "1970s – 1990s popularization",
    sortYear: 1975,
    teaser:
      "Brief, hard sessions and failure-focused effort become a counter-movement to high-volume bodybuilding culture.",
    narrative: [
      "High-intensity Training (HIT), in the bodybuilding sense, argued for shorter workouts, lower weekly frequency, and very high effort — often to muscular failure — rather than accumulating many submaximal sets. Associated coaching philosophies treated recovery between rare hard sessions as a primary constraint.",
      "Important vocabulary note: HIT here is not “training at a high percentage of 1RM.” Confusing bodybuilding HIT with strength-sport intensity language still causes programming errors. The historical claim was about effort density and recovery, not a universal load prescription.",
      "HIT’s legacy is the ongoing debate over how hard, how often, and how many hard sets are enough. Modern evidence-informed hypertrophy work often rejects single-set absolutism while still taking recovery and proximity-to-failure seriously — a conversation HIT helped force into the open.",
    ],
    themes: ["Effort density", "Recovery emphasis", "Anti-volume reaction"],
    relatedMethodSlugs: [
      "high-intensity-training",
      "rest-pause",
      "myo-reps",
    ],
    caution:
      "HIT and later “Heavy Duty” branding are historical coaching philosophies — not reproduced program text.",
  },
  {
    slug: "westside-conjugate",
    title: "Westside / conjugate practice",
    periodLabel: "1980s – 2000s (ongoing influence)",
    sortYear: 1985,
    teaser:
      "Max-effort, dynamic-effort, and rotation of special exercises enter Western powerlifting coaching culture.",
    narrative: [
      "Conjugate-style practice in Western powerlifting — often associated with Westside Barbell coaching culture — emphasized rotating maximal and speed-oriented work, special exercises to attack weak points, and frequent exposure to heavy efforts without living exclusively on competition lifts.",
      "“Conjugate” is used in multiple senses across sport science and gym culture. Popular internet versions are practice traditions: highly coach-dependent, equipment- and athlete-specific, and easy to caricature as box squats and bands alone. The historical interest is the programming logic — variation, specificity trade-offs, and fatigue management under high intensity — not a single printable template.",
      "Influence spread through seminars, forums, and athlete results more than through controlled trials of the full commercial package. Treat the era as high-performance coaching history; evaluate methods on athlete context, not brand loyalty.",
    ],
    themes: [
      "Max & dynamic effort",
      "Special exercises",
      "High-intensity rotation",
    ],
    relatedMethodSlugs: ["conjugate", "cluster-sets", "high-frequency-training"],
    caution:
      "No copyrighted Westside templates or proprietary wave charts are reproduced here — link to our method overview instead.",
  },
  {
    slug: "modern-autoregulation",
    title: "Modern autoregulation",
    periodLabel: "2000s – present",
    sortYear: 2005,
    teaser:
      "RPE, RIR, velocity, and flexible daily undulation make load selection more responsive to readiness.",
    narrative: [
      "Autoregulation reframes prescription as a conversation with readiness: ratings of perceived exertion, reps in reserve, bar-speed feedback, and flexible progression rules adjust today’s work when fatigue, sleep, or stress change capacity. Daily undulating models often sit alongside these tools because quality targets can rotate within a week.",
      "The cultural shift is away from rigid percentage-only calendars toward decision rules athletes and coaches can apply in the gym. That does not erase planning — it changes how plans absorb noise. Poorly implemented autoregulation becomes guesswork; well-implemented versions still need constraints and review.",
      "Modern apps and education popularized the language quickly. The honest timeline point is methodological: training load became more conditional, not that any single RPE chart ended periodization debates.",
    ],
    themes: ["RPE / RIR", "Flexible progression", "Readiness-aware dosing"],
    relatedMethodSlugs: [
      "daily-undulating-periodization",
      "block-periodization",
      "high-frequency-training",
      "cluster-sets",
    ],
  },
  {
    slug: "evidence-informed-programming",
    title: "Evidence-informed programming",
    periodLabel: "2010s – present",
    sortYear: 2012,
    teaser:
      "Coaches increasingly separate mechanistic stories from measured outcomes — without pretending the literature settles every gym decision.",
    narrative: [
      "Evidence-informed programming tries to keep coaching claims tethered to what research can actually support: dose-response patterns for volume, proximity to failure, specificity, and recovery — while admitting large individual differences and sport constraints that trials rarely capture cleanly.",
      "This era is not “science replaced coaching.” It is a cultural push against overconfident mythology: invented citations, one-method supremacy, and marketing dressed as physiology. Good practice still blends measurement, athlete feedback, and conservative interpretation of studies.",
      "On this site, that honesty shows up as labeled layers — historical description, modern interpretation, coaching practice — and as refusal to invent numeric superiority scores across methods. The timeline ends here on purpose: the work continues in method pages, comparison tools, and athlete programming — not in a final ranking of eras.",
    ],
    themes: [
      "Dose-response literacy",
      "Anti-mythology",
      "Coaching + evidence humility",
    ],
    relatedMethodSlugs: [
      "block-periodization",
      "daily-undulating-periodization",
      "linear-periodization",
      "myo-reps",
    ],
    caution:
      "Evidence-informed does not mean every claim has a citation on this page. See method pages for honesty notes and limits.",
  },
] as const;

export type HistoryEraSlug = (typeof HISTORY_ERAS)[number]["slug"];

export function listHistoryEras(): HistoryEra[] {
  return [...HISTORY_ERAS].sort((a, b) => a.sortYear - b.sortYear);
}

export function getHistoryEraBySlug(slug: string): HistoryEra | undefined {
  return HISTORY_ERAS.find((era) => era.slug === slug);
}

export function allHistoryEraSlugs(): string[] {
  return HISTORY_ERAS.map((era) => era.slug);
}

export function historyEraPath(slug: string): string {
  return `/history/${slug}`;
}

export function historyTimelinePath(): string {
  return "/history";
}
