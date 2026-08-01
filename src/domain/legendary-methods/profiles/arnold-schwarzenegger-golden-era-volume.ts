import {
  CONTENT_ACCESS_DATE,
  LEGENDARY_PUBLISH_DATE,
  sectionsWithBodiesForSlug,
} from "@/domain/legendary-methods/profiles/helpers";
import { ARNOLD_SECTION_BODIES } from "@/domain/legendary-methods/profiles/arnold-localized-bodies";
import { fromEnglishProfile } from "@/domain/legendary-methods/from-english";
import { L } from "@/domain/legendary-methods/localized";

/**
 * Arnold Schwarzenegger — Golden Era volume analysis (Prompt 5A).
 * Original editorial synthesis from public books/interviews — not a reprint of any routine.
 * Published after editorial content + historical documentation pass (Prompt premium publish).
 */
export const ARNOLD_SCHWARZENEGGER_GOLDEN_ERA_VOLUME = fromEnglishProfile({
  slug: "arnold-schwarzenegger-golden-era-volume",
  status: "published",
  legalReviewStatus: "passed",
  publishedAt: LEGENDARY_PUBLISH_DATE,
  updatedAt: LEGENDARY_PUBLISH_DATE,
  athleteName: "Arnold Schwarzenegger",
  profileTitle: L(
    "Arnold Schwarzenegger — Analysis of Golden Era Volume",
    "Arnold Schwarzenegger — Analýza objemového tréninku Zlaté éry",
  ),
  shortTitle: L("Golden Era Volume", "Objem Zlaté éry"),
  category: "bodybuilding",
  era: L(
    "Golden Era bodybuilding (late 1960s–1970s peak competition years)",
    "Bodybuilding Zlaté éry (konec 60. a 70. léta — vrcholné závodní roky)",
  ),
  nationality: L("Austrian / American", "Rakousko / USA"),
  sportLabel: L("Bodybuilding", "Bodybuilding"),
  summary: L(
    "An independent analysis of high-frequency, high-volume Golden Era bodybuilding as documented in Arnold Schwarzenegger’s major published training texts and later instructional writing — focusing on principles, context, and recovery cost rather than treating any single template as a permanent ‘Arnold programme’.",
    "Nezávislá analýza vysokofrekvenčního, vysokobjemového bodybuildingu Zlaté éry, jak je zdokumentován v hlavních publikovaných tréninkových textech Arnolda Schwarzeneggera a pozdějších instruktážních materiálech — důraz na principy, kontext a cenu regenerace, ne na jeden „věčný Arnold program“.",
  ),
  introductoryDisclaimer: L(
    "This profile is an independent educational analysis. It is not affiliated with, authorised by, sponsored by or endorsed by Arnold Schwarzenegger. Descriptions synthesise publicly available publications; they do not reproduce copyrighted routines, tables, or book chapters. Modernised examples are original The Strongest interpretations.",
    "Tento profil je nezávislá vzdělávací analýza. Není afilován, autorizován, sponzorován ani endorseován Arnoldem Schwarzeneggerem. Popisy syntetizují veřejně dostupné publikace; nereprodukují copyrightované rutiny, tabulky ani kapitoly knih. Modernizované příklady jsou originální interpretace The Strongest.",
  ),
  keyCharacteristics: [
    L(
      "High weekly training frequency for major muscle groups",
      "Vysoká týdenní frekvence pro hlavní svalové skupiny",
    ),
    L(
      "High set volume across multiple exercises per body part",
      "Vysoký objem sérií napříč více cviky na partii",
    ),
    L(
      "Antagonist and same-muscle supersets as intensity/density tools",
      "Antagonistické a same-muscle supersety jako nástroje intenzity a hustoty",
    ),
    L(
      "Progressive overload framed as continual drive in weight or work",
      "Progresivní přetížení jako permanentní tlak na zátěž nebo odvedenou práci",
    ),
    L(
      "Competition-era context that ordinary lifters should not copy wholesale",
      "Závodní kontext, který běžný lifter nemá kopírovat 1:1",
    ),
  ],
  bestFor: [
    L(
      "Intermediate-plus physique-focused lifters with strong recovery capacity",
      "Středně pokročilí a výš — physique lifteři se silnou regenerací",
    ),
    L(
      "Athletes exploring antagonist pairing and training density",
      "Atleti, kteří chtějí antagonistické párování a tréninkovou hustotu",
    ),
    L(
      "Coaches studying historical high-volume hypertrophy culture",
      "Kouči studující historickou kulturu vysokého hypertrofního objemu",
    ),
  ],
  notRecommendedFor: [
    L(
      "Beginners still learning basic squat, hinge, press, and pull patterns",
      "Začátečníci, kteří ještě stabilizují dřep, hinge, tlak a tah",
    ),
    L(
      "Lifters with unresolved joint pain or sleep/nutrition deficits",
      "Lifteři s nevyřešenou bolestí kloubů nebo deficity spánku/výživy",
    ),
    L(
      "Anyone seeking a minimal effective-dose strength programme",
      "Každý, kdo hledá minimální efektivní silový program",
    ),
  ],
  trainingDays: L(
    "Often described as near-daily training in competition phases; frequency varied by era and goal",
    "V závodních fázích často popisováno jako téměř denní trénink; frekvence se měnila podle éry a cíle",
  ),
  quickProfile: {
    primaryGoal: L(
      "Muscular size, shape, and stage conditioning",
      "Svalový objem, tvar a stage kondice",
    ),
    typicalFrequency: L(
      "Major groups often trained ~2–3×/week in documented competition-era templates",
      "Hlavní partie v dokumentovaných závodních šablonách často ~2–3×/týden",
    ),
    volumeLevel: L(
      "Very high relative to modern ‘minimum effective dose’ hypertrophy",
      "Velmi vysoký oproti moderní ‚minimum effective dose‘ hypertrofii",
    ),
    intensityProfile: L(
      "Moderate-to-heavy loads with high effort; frequent failure/near-failure reporting in popular accounts",
      "Střední až těžké zátěže s vysokým úsilím; v populárních účtech časté failure / near-failure",
    ),
    recoveryDemand: L(
      "Very high — sleep, food, and schedule were part of the system",
      "Velmi vysoká — spánek, jídlo a rozvrh byly součástí systému",
    ),
    technicalDifficulty: L(
      "Moderate movement difficulty; high organisational and recovery difficulty",
      "Střední náročnost cviků; vysoká organizační a regenerační náročnost",
    ),
    bestSuitedFor: L(
      "Advanced physique athletes with coaching/support and time",
      "Pokročilí physique atleti s koučinkem, zázemím a časem",
    ),
    evidenceQuality: "moderate",
  },
  scores: {
    strengthPotential: {
      value: 6,
      justification:
        "Builds substantial strength via compounds, but the primary target is hypertrophy and appearance rather than peaking maximal strength.",
    },
    hypertrophyPotential: {
      value: 9,
      justification:
        "Very high weekly set volumes and multi-exercise body-part coverage align with classical hypertrophy stimulus when recovery allows.",
    },
    recoveryDemand: {
      value: 9,
      justification:
        "High frequency plus high set counts create large systemic and local fatigue; poorly recovered lifters stall or regress quickly.",
    },
    technicalDifficulty: {
      value: 5,
      justification:
        "Movements are mostly standard bodybuilding patterns; difficulty is managing volume, effort, and exercise sequencing—not exotic skill lifts.",
    },
    beginnerSuitability: {
      value: 2,
      justification:
        "Beginners need pattern mastery and lower absolute volume; copying competition-era set counts is a common failure mode.",
    },
    advancedSuitability: {
      value: 8,
      justification:
        "Advanced physique athletes can selectively borrow density tools (antagonist supersets) and frequency ideas with dose control.",
    },
  },
  evidenceQuality: "moderate",
  evidenceQualityNote:
    "Primary evidence is athlete-authored or co-authored published books plus later instructional columns on official/reputable channels. Exact session logs vary by period; conflicting popular summaries exist, so claims about any single permanent routine are treated cautiously.",
  lastReviewedAt: CONTENT_ACCESS_DATE,
  sections: sectionsWithBodiesForSlug(
    "arnold-schwarzenegger-golden-era-volume",
    ARNOLD_SECTION_BODIES,
    {
      "athlete-and-era": [1, 2],
      "documented-training-method": [1, 3, 4, 5],
      "training-structure": [1, 2],
      "volume-intensity-frequency": [1, 3],
    },
  ),
  trainingStructure: {
    trainingDays:
      "Competition-oriented templates associated with published teaching often imply near-daily training with rotating body-part emphasis",
    exerciseFrequency:
      "Major muscle groups commonly appear ~2–3 times per week in documented high-frequency examples; exact splits vary by source/period",
    volumeDistribution: [
      { label: "Chest / back compounds & accessories", share: 28 },
      { label: "Legs (squat/press + isolation)", share: 24 },
      { label: "Shoulders & arms", share: 22 },
      { label: "Calves / midsection / other", share: 26 },
    ],
    intensityDistribution: [
      { label: "Primary compounds (heavier)", share: 35 },
      { label: "Secondary compounds", share: 30 },
      { label: "Isolation / density techniques", share: 35 },
    ],
    primaryMovements: [
      "Barbell and dumbbell presses",
      "Rows and pulldown/pull-up variations",
      "Squats and leg presses",
      "Overhead presses",
    ],
    accessoryWork: [
      "Flye / crossover patterns",
      "Leg extensions and curls",
      "Curl and extension variations",
      "Calf raises and midsection work",
    ],
    progressionApproach:
      "Published teaching emphasises continual improvement in load or completed work; not a single fixed percentage wave",
    recoveryStructure:
      "Sleep, nutrition, and rest are framed as enabling high volume — not optional add-ons",
  },
  whyItWorked: {
    specificity:
      "Training targeted muscular size and shape for physique competition judging, not a powerlifting total.",
    volume:
      "High weekly sets and multi-exercise coverage created large cumulative tension and metabolic stress when recovered.",
    intensity:
      "Loads were often substantial for bodybuilding, with cultural acceptance of very hard sets and density techniques.",
    technicalPractice:
      "Years of repeated practice on the same movement families refined execution under fatigue.",
    athleteExperience:
      "Long runway of progressive exposure before the highest reported workloads.",
    bodyweight:
      "Competitive bodyweights and stage conditioning goals differed from strength-sport weight-class strategies.",
    recovery:
      "Lifestyle support around training was typically far above recreational norms.",
    sportDemands:
      "Winning required looking a certain way on contest day; programmes chased that outcome.",
    longTermAdaptation:
      "Visible success reflected decades of adaptation and selection, not a two-week copy of a famous chart.",
  },
  whatLiftersGetWrong: [
    "Treating one popular PDF as the permanent exact Arnold programme",
    "Copying peak competition set counts without peak recovery capacity",
    "Adding supersets and failure work before technique is stable",
    "Ignoring that documented templates differ across periods and publications",
    "Confusing high fatigue with productive hypertrophy stimulus",
  ],
  exampleWeek: {
    title: "Modernised antagonist-density illustration (not an athlete routine)",
    label: "original-modernised-example",
    disclaimer:
      "Original The Strongest example showing how antagonist pairing and multi-exposure frequency can be dosed for an advanced physique lifter. Not Arnold Schwarzenegger’s exact programme and not a reprint of encyclopedia tables.",
    days: [
      {
        dayLabel: "Day 1",
        focus: "Chest / back antagonist density",
        notes: "Pair a press with a row pattern; keep 1–2 reps in reserve on most sets",
      },
      {
        dayLabel: "Day 2",
        focus: "Squat pattern + posterior chain accessories",
        notes: "Moderate hard sets; avoid turning every set into a failure contest",
      },
      {
        dayLabel: "Day 3",
        focus: "Shoulders / arms",
        notes: "Optional antagonist curl–extension supersets late in session",
      },
      {
        dayLabel: "Day 4",
        focus: "Rest or easy mobility",
        notes: "Protect sleep and food intake",
      },
      {
        dayLabel: "Day 5",
        focus: "Second upper exposure (lighter density)",
        notes: "Fewer hard sets than Day 1; emphasise quality",
      },
      {
        dayLabel: "Day 6",
        focus: "Second lower exposure",
        notes: "Hinge emphasis or reduced squat volume versus Day 2",
      },
      {
        dayLabel: "Day 7",
        focus: "Rest",
        notes: "Deload week every 4–6 weeks if performance stalls",
      },
    ],
  },
  modernAdaptation: {
    summary:
      "Keep the useful Golden Era ideas — multi-exposure frequency when recovered, antagonist supersets for density, progressive overload — while discarding the assumption that encyclopedia competition volumes are a universal prescription.",
    beginnerAdjustment:
      "Full-body or upper/lower 3–4 days/week; 6–10 hard sets per major muscle weekly; no failure-first culture; learn compounds before density tricks.",
    intermediateAdjustment:
      "Push-pull-legs or upper/lower with ~10–16 hard sets per muscle weekly; introduce antagonist supersets on isolation pairings only.",
    advancedAdjustment:
      "Short mesocycles with higher density and occasional near-failure finishers; track performance; planned deloads; never chase celebrity set counts for ego.",
    recommendedFrequency: "3–6 training days depending on recovery; major muscles 2×/week as a default modern target",
    recoveryControls: [
      "Cap weekly hard sets before adding more exercises",
      "Limit true failure sets to late isolation work",
      "Deload when bar speed or motivation falls for 7–10 days",
      "Prioritise sleep and protein before ‘more volume’",
    ],
    progressionRules: [
      "Add load when all target reps are hit with solid technique",
      "Add a set only after loads stall for 2–3 weeks",
      "Rotate pressing/rowing variations every 6–8 weeks if joints complain",
    ],
    whenToReduceVolume:
      "Persistent strength drop, rising resting fatigue, or joint irritation that does not settle with technique fixes",
    whoShouldAvoid: [
      "Beginners",
      "Lifters in a calorie deficit with poor sleep",
      "Athletes peaking maximal strength sports who need lower fatigue",
    ],
  },
  relatedProgrammes: [
    {
      slug: "powerbuilding-hybrid",
      title: "Golden Era High-Volume Hypertrophy",
      href: "/programs/powerbuilding-hybrid",
      relationship:
        "Original The Strongest programme applying related hypertrophy-density principles without athlete naming",
    },
  ],
  sources: [
    {
      title: "The New Encyclopedia of Modern Bodybuilding",
      publisher: "Simon & Schuster",
      author: "Arnold Schwarzenegger; Bill Dobbins",
      url: "https://www.simonandschuster.com/books/The-New-Encyclopedia-of-Modern-Bodybuilding/Arnold-Schwarzenegger/9780684857213",
      publicationDate: "1999 (rev. ed. widely circulated; earlier editions exist)",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "book",
      supports: [
        "athlete-and-era",
        "documented-training-method",
        "training-structure",
        "volume-intensity-frequency",
      ],
    },
    {
      title: "Arnold: The Education of a Bodybuilder",
      publisher: "Simon & Schuster",
      author: "Arnold Schwarzenegger; Douglas Kent Hall",
      url: "https://www.simonandschuster.com/books/Arnold/Arnold-Schwarzenegger/9780671797485",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "book",
      supports: ["athlete-and-era", "training-structure"],
    },
    {
      title: "Arnold Schwarzenegger: Super Intense (superset guidelines)",
      publisher: "Muscle & Fitness / FLEX Online",
      author: "Arnold Schwarzenegger",
      url: "https://www.muscleandfitness.com/flexonline/training/arnold-schwarzenegger-super-intense/",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "reputable-publication",
      supports: ["documented-training-method", "volume-intensity-frequency"],
    },
    {
      title: "The Science of Advanced Bodybuilding Exercise Prescription",
      publisher: "schwarzenegger.com",
      url: "https://www.schwarzenegger.com/fitness/post/the-science-of-advanced-bodybuilding-exercise-prescription",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "official-athlete-source",
      supports: ["documented-training-method"],
    },
    {
      title: "Arnold's Bodybuilding for Men",
      publisher: "Simon & Schuster",
      author: "Arnold Schwarzenegger; Bill Dobbins",
      url: "https://www.simonandschuster.com/books/Arnolds-Bodybuilding-for-Men/Arnold-Schwarzenegger/9780671531638",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "book",
      supports: ["documented-training-method"],
    },
  ],
  seo: {
    title: L(
      "Arnold Schwarzenegger Golden Era Volume Training Analysis",
      "Arnold Schwarzenegger — Analýza objemového tréninku Zlaté éry",
    ),
    description: L(
      "Independent analysis of Golden Era high-volume bodybuilding principles associated with Arnold Schwarzenegger — frequency, supersets, recovery cost, and why not to copy peak competition workloads.",
      "Nezávislá analýza vysokobjemových bodybuildingových principů Zlaté éry spojených s Arnoldem Schwarzeneggerem — frekvence, supersety, cena regenerace a proč nekopicovat vrcholné závodní zátěže.",
    ),
    canonicalPath: "/legendary-methods/arnold-schwarzenegger-golden-era-volume",
    keywords: [
      "golden era volume training",
      "arnold schwarzenegger training analysis",
      "antagonist supersets",
      "high volume bodybuilding",
    ],
  },
});
