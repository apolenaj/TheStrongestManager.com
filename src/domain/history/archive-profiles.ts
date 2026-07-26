/**
 * Curated Historical Training Archive profiles (Prompt 111).
 * Original educational synthesis — principles only, no program reprints.
 */

import type { HistoricalArchiveProfile } from "@/domain/history/archive-types";

export const HISTORICAL_ARCHIVE_PROFILES: readonly HistoricalArchiveProfile[] = [
  // —— Systems ——
  {
    slug: "soviet-weightlifting-systems",
    kind: "system",
    title: "Soviet weightlifting systems",
    subtitle: "Long-horizon planning enters Western coaching vocabulary",
    periodLabel: "1950s – 1980s (influence ongoing)",
    teaser:
      "Periodized multi-year athlete development popularized through weightlifting success — planning literacy more than a single printable template.",
    principlesSummary: [
      "Think in phases across weeks and seasons, not only session to session.",
      "Vary intensity and volume deliberately across mesocycles.",
      "Treat technical practice and fatigue management as co-equal planning problems.",
      "Develop strength qualities over long horizons rather than chasing novelty every week.",
    ],
    whatWasInnovative: [
      "Made multi-year and multi-phase planning a mainstream coaching expectation in strength sports.",
      "Exported vocabulary (preparatory vs competitive phases, mesocycles) that Western coaches still use.",
      "Treated weightlifting success as evidence that structured variation beats random hard training.",
    ],
    whatRemainsUseful: [
      "Phase thinking and fatigue management across blocks remain foundational for serious athletes.",
      "Technical frequency with managed fatigue still matters for Olympic lifts and skilled strength sports.",
      "Separating “plan the season” from “choose today’s sets” is still good coaching hygiene.",
    ],
    whatModernEvidenceQuestions: [
      "“Soviet system” is often used as a slogan — decades of coaching debate are not one package.",
      "National-system results are confounded by selection, support, and era-specific contexts.",
      "Modern literature rarely validates whole classical templates as superior to well-dosed alternatives.",
    ],
    relatedEraSlugs: ["soviet-weightlifting-systems"],
    relatedMethodSlugs: [
      "linear-periodization",
      "block-periodization",
      "high-frequency-training",
    ],
    relatedGraphNodeIds: ["matveyev", "issurin"],
  },
  {
    slug: "westside-conjugate-system",
    kind: "system",
    title: "Westside conjugate practice",
    subtitle: "Concurrent max effort, dynamic effort, and special exercises",
    periodLabel: "1980s – 2000s (ongoing influence)",
    teaser:
      "A high-performance powerlifting practice culture — not a controlled trial of a commercial package, and not identical to Soviet concurrent science.",
    principlesSummary: [
      "Train maximal strength with rotating near-max variations.",
      "Train speed-strength with submaximal loads and high intent.",
      "Use special exercises to attack weak points rather than living only on competition lifts.",
      "Manage fatigue under frequent heavy exposure through variation and recovery literacy.",
    ],
    whatWasInnovative: [
      "Operationalized concurrent ME / DE / repetition logic into a weekly Western powerlifting template.",
      "Normalized rotating special exercises as a first-class programming tool.",
      "Spread through seminars, forums, and athlete results more than through single RCTs of the full system.",
    ],
    whatRemainsUseful: [
      "Variation of heavy efforts can manage skill and joint stress better than endless competition-lift maxes.",
      "Intentional speed work and weak-point accessories remain useful when dosed honestly.",
      "Separating Soviet concurrent concepts, Westside gym practice, and internet clones improves coaching decisions.",
    ],
    whatModernEvidenceQuestions: [
      "Formal evidence for the full commercial Westside package as a unit is limited.",
      "Accommodating resistance and exotic specials are practice tools — not proven universal requirements.",
      "Raw beginners rarely need the full machinery; copying geared volumes is a common failure mode.",
    ],
    relatedEraSlugs: ["westside-conjugate"],
    relatedMethodSlugs: ["conjugate", "cluster-sets"],
    relatedGraphNodeIds: ["westside-barbell", "louie-simmons", "max-effort", "dynamic-effort"],
  },
  {
    slug: "early-physical-culture",
    kind: "system",
    title: "Early physical culture",
    subtitle: "Strength as spectacle, health reform, and progressive practice",
    periodLabel: "Late 1800s – 1930s",
    teaser:
      "Strongmen, magazines, and early barbell culture established that strength could be trained — before modern federations and evidence norms.",
    principlesSummary: [
      "Deliberate practice with progressive resistance.",
      "Public demonstration and private training fed each other culturally.",
      "Courses and systems sold self-improvement alongside equipment — commercial and moral language mixed.",
      "No single “correct” program defined the era; cultural foundations mattered more than one template.",
    ],
    whatWasInnovative: [
      "Normalized the idea that muscular strength and physique could be systematically developed.",
      "Created mass media pathways (magazines, mail-order) for training ideas.",
      "Seeded barbell exercise standards that later sports refined.",
    ],
    whatRemainsUseful: [
      "Progressive overload as a cultural habit still underpins modern strength training.",
      "Recognizing commercial incentives in fitness media remains a useful skepticism skill.",
      "Training as practiced craft — not only inherited talent — is still the right default story.",
    ],
    whatModernEvidenceQuestions: [
      "Era claims about vitality and character are not physiological evidence.",
      "Mail-order systems were marketing vehicles; principles should be separated from sales copy.",
      "Approximate dates are cultural framing, not archival precision.",
    ],
    relatedEraSlugs: ["early-physical-culture"],
    relatedMethodSlugs: ["linear-periodization", "high-intensity-training"],
    relatedGraphNodeIds: [],
  },

  // —— Coaches ——
  {
    slug: "louie-simmons",
    kind: "coach",
    title: "Louie Simmons",
    subtitle: "Westside Barbell and conjugate presentation in powerlifting",
    periodLabel: "Late 20th – early 21st century",
    teaser:
      "Closely associated with popularizing Westside’s conjugate presentation — practice-based high-performance culture, not a lab package.",
    principlesSummary: [
      "Rotate max-effort variations to train strength while managing skill staleness.",
      "Use dynamic effort to train speed-strength with intent.",
      "Attack weak points with special exercises.",
      "Treat recovery and variation as part of high-frequency heavy training — not afterthoughts.",
    ],
    whatWasInnovative: [
      "Brought a specific concurrent ME/DE weekly logic into Western powerlifting coaching culture at scale.",
      "Made special-exercise selection a visible coaching craft in public forums and seminars.",
      "Influenced how athletes talk about bands, chains, and box-squat variations — for better and worse.",
    ],
    whatRemainsUseful: [
      "Weak-point thinking and variation under heavy loading remain transferable ideas.",
      "Honest discussion of fatigue under frequent heavy work still matters.",
      "Distinguishing Westside practice from Soviet texts and Reddit clones remains useful pedagogy.",
    ],
    whatModernEvidenceQuestions: [
      "Athlete results and gym culture are not controlled evidence for a universal best method.",
      "Equipment, gear eras, and selection effects confound “Westside worked because of X” stories.",
      "This archive does not reproduce proprietary wave charts or copyrighted templates.",
    ],
    relatedEraSlugs: ["westside-conjugate"],
    relatedMethodSlugs: ["conjugate"],
    relatedGraphNodeIds: ["louie-simmons", "westside-barbell"],
  },
  {
    slug: "arthur-jones",
    kind: "coach",
    title: "Arthur Jones",
    subtitle: "HIT lineage and machine-era intensity arguments",
    periodLabel: "1970s – 1990s popularization",
    teaser:
      "Associated with high-intensity training arguments for brief, hard sessions — a counter-movement to high-volume physique culture.",
    principlesSummary: [
      "Emphasize high effort density over accumulating many easy sets.",
      "Treat recovery between rare hard sessions as a primary constraint.",
      "Keep vocabulary clear: bodybuilding HIT ≠ training at a high % of 1RM.",
      "Question whether more volume is always better when effort is already extreme.",
    ],
    whatWasInnovative: [
      "Forced a public debate about how hard and how often is enough for hypertrophy.",
      "Challenged volume-as-default assumptions in mid-century physique culture.",
      "Tied machine design and training philosophy in a commercially visible way.",
    ],
    whatRemainsUseful: [
      "Proximity to failure and recovery still belong in hypertrophy conversations.",
      "Skepticism toward endless junk volume remains healthy.",
      "Clear language about “intensity” prevents programming errors across sports.",
    ],
    whatModernEvidenceQuestions: [
      "Single-set absolutism is not well supported as a universal rule for trained lifters.",
      "Machine-era marketing claims should not be read as modern evidence summaries.",
      "Individual volume needs vary; HIT’s useful questions are not HIT’s strongest slogans.",
    ],
    relatedEraSlugs: ["high-intensity-training"],
    relatedMethodSlugs: ["high-intensity-training", "rest-pause"],
    relatedGraphNodeIds: ["arthur-jones"],
  },
  {
    slug: "mike-mentzer",
    kind: "coach",
    title: "Mike Mentzer",
    subtitle: "Heavy Duty and HIT-influenced physique coaching",
    periodLabel: "1970s – 1990s",
    teaser:
      "Heavy Duty / HIT-influenced bodybuilding coaching — educational association with effort, recovery, and sparse hard training.",
    principlesSummary: [
      "Prioritize recovery and infrequent all-out efforts over high weekly set counts.",
      "Use intensification tactics thoughtfully rather than endless submaximal volume.",
      "Treat training as a stimulus that must be recovered from — not only performed.",
      "Separate coaching philosophy from contest-era mythology and later internet absolutism.",
    ],
    whatWasInnovative: [
      "Amplified HIT-family arguments inside mainstream bodybuilding culture.",
      "Made recovery between rare hard sessions a central public talking point.",
      "Influenced later low-volume / high-effort schools (for better and worse).",
    ],
    whatRemainsUseful: [
      "Recovery literacy and honest proximity-to-failure still matter.",
      "Questioning volume for volume’s sake remains a useful coaching habit.",
      "Reading principles instead of reprinting branded routines keeps education legal and clear.",
    ],
    whatModernEvidenceQuestions: [
      "Extremely low weekly volumes are not automatically optimal for all intermediates.",
      "Contest outcomes and coaching charisma are not dose-response evidence.",
      "This profile summarizes principles only — no Heavy Duty program text is reproduced.",
    ],
    relatedEraSlugs: ["high-intensity-training", "golden-era-bodybuilding"],
    relatedMethodSlugs: ["high-intensity-training", "rest-pause", "myo-reps"],
    relatedGraphNodeIds: ["mike-mentzer"],
  },
  {
    slug: "matveyev",
    kind: "coach",
    title: "L.P. Matveyev",
    subtitle: "Classical periodization framing in sport history",
    periodLabel: "Mid–late 20th century influence",
    teaser:
      "Often cited in classical linear / periodization history — historical description, not a modern evidence crown.",
    principlesSummary: [
      "Organize training into planned phases rather than perpetual random hard work.",
      "Expect volume and intensity characters to shift across a season.",
      "Treat athlete development as multi-month construction, not week-to-week novelty.",
      "Keep origins distinct from later Western reinterpretations and spreadsheet clones.",
    ],
    whatWasInnovative: [
      "Helped codify periodization as a teachable planning framework in sport culture.",
      "Influenced how coaches talk about preparatory and competitive phases.",
      "Gave later methods a historical foil — linear vs undulating vs block debates.",
    ],
    whatRemainsUseful: [
      "Seasonal planning literacy still beats improvisation for competitive athletes.",
      "Separating historical models from modern evidence claims prevents false authority.",
      "Progressive intensity character remains a useful default for many intermediates.",
    ],
    whatModernEvidenceQuestions: [
      "Classical models are historical frameworks — not automatically “what science proves today.”",
      "Western teaching often simplifies Matveyev-era debates into one diagram.",
      "Individual sports and athlete ages need different phase structures than textbook sketches.",
    ],
    relatedEraSlugs: ["soviet-weightlifting-systems"],
    relatedMethodSlugs: ["linear-periodization"],
    relatedGraphNodeIds: ["matveyev"],
  },
  {
    slug: "issurin",
    kind: "coach",
    title: "Vladimir Issurin",
    subtitle: "Block periodization and concentrated loading ideas",
    periodLabel: "Late 20th – early 21st century presentations",
    teaser:
      "Associated with block periodization / concentrated loading — focused overload windows rather than flat concurrent everything.",
    principlesSummary: [
      "Concentrate development of selected qualities in focused blocks.",
      "Sequence blocks so residual effects and competition timing make sense.",
      "Accept that concentrated loading is often deliberately fatiguing.",
      "Require monitoring literacy — novices rarely need true concentrated blocks.",
    ],
    whatWasInnovative: [
      "Popularized a clear alternative to flat concurrent development: concentrate, then shift.",
      "Gave coaches language for residual training effects across sequenced blocks.",
      "Influenced athletic-performance planning beyond single-lift powerlifting templates.",
    ],
    whatRemainsUseful: [
      "Focused overload windows remain useful for advanced athletes with clear competition dates.",
      "Honest fatigue expectations during concentrated loading prevent surprise burnout.",
      "Sequencing literacy still beats “train everything hard forever.”",
    ],
    whatModernEvidenceQuestions: [
      "Block superiority is context-dependent — not a universal ranking over DUP or linear models.",
      "Poor sequencing leaves qualities cold; the model is only as good as its transitions.",
      "Popular summaries can oversell residual-effect certainty beyond what evidence cleanly shows.",
    ],
    relatedEraSlugs: ["soviet-weightlifting-systems", "evidence-informed-programming"],
    relatedMethodSlugs: ["block-periodization"],
    relatedGraphNodeIds: ["issurin"],
  },

  // —— Famous methods ——
  {
    slug: "conjugate-method",
    kind: "method",
    title: "Conjugate method",
    subtitle: "Concurrent max effort, dynamic effort, and repetition work",
    periodLabel: "Popularized in Western powerlifting via Westside practice",
    teaser:
      "Famous concurrent method — principles summarized; no proprietary Westside templates reprinted.",
    principlesSummary: [
      "Develop max strength, speed-strength, and work capacity in the same weekly structure.",
      "Rotate max-effort variations; train dynamic effort with intent.",
      "Support with repetition / hypertrophy / GPP work and special exercises.",
      "Autoregulate complexity — advanced practice, not a beginner default.",
    ],
    whatWasInnovative: [
      "Made concurrent ME/DE logic famous in Western powerlifting coaching culture.",
      "Centered weak-point specials beside competition lifts.",
      "Forced a clearer split between Soviet concurrent ideas and Westside gym practice.",
    ],
    whatRemainsUseful: [
      "Variation under heavy loading and intentional speed work remain transferable tools.",
      "Weak-point accessories still beat endless identical competition-lift grinding for many lifters.",
      "Method pages on this site keep historical vs modern layers separate — use them.",
    ],
    whatModernEvidenceQuestions: [
      "Package claims for the full commercial system outrun formal evidence.",
      "Internet “conjugate” clones that only rotate box squats miss the programming logic.",
      "High systemic stress is real when ME frequency and accessories stack poorly.",
    ],
    relatedEraSlugs: ["westside-conjugate"],
    relatedMethodSlugs: ["conjugate"],
    relatedGraphNodeIds: ["westside-barbell", "max-effort", "dynamic-effort"],
  },
  {
    slug: "high-intensity-training-method",
    kind: "method",
    title: "High-intensity training (HIT)",
    subtitle: "Brief, hard sessions and recovery as the constraint",
    periodLabel: "1970s – 1990s popularization",
    teaser:
      "Famous anti-volume physique method family — effort density and recovery, not %1RM intensity language.",
    principlesSummary: [
      "Prefer shorter workouts and lower frequency with very high effort.",
      "Treat recovery between hard sessions as a primary programming limit.",
      "Do not confuse HIT with strength-sport “high intensity” (%1RM) language.",
      "Question whether more sets always equal more progress when effort is already extreme.",
    ],
    whatWasInnovative: [
      "Created a durable counter-narrative to high-volume bodybuilding defaults.",
      "Put failure proximity and session rarity at the center of physique debates.",
      "Influenced later intensification tactics and low-volume schools.",
    ],
    whatRemainsUseful: [
      "Recovery and proximity-to-failure still belong in hypertrophy programming.",
      "Clear intensity vocabulary prevents cross-sport confusion.",
      "Useful as a critique of junk volume — even when absolutist versions are rejected.",
    ],
    whatModernEvidenceQuestions: [
      "Single-set-for-everyone rules do not match typical dose-response findings for trained lifters.",
      "HIT branding spans multiple coaches and eras — not one validated protocol.",
      "Principles are summarized here; copyrighted HIT / Heavy Duty routines are not reproduced.",
    ],
    relatedEraSlugs: ["high-intensity-training"],
    relatedMethodSlugs: ["high-intensity-training", "rest-pause", "myo-reps"],
    relatedGraphNodeIds: ["arthur-jones", "mike-mentzer"],
  },
  {
    slug: "german-volume-training",
    kind: "method",
    title: "German volume training",
    subtitle: "High-set hypertrophy character (e.g. 10×10 framing)",
    periodLabel: "Late 20th century popularization",
    teaser:
      "Famous high-volume hypertrophy method character — educational principles only, not a reprinted commercial plan.",
    principlesSummary: [
      "Use high set counts at moderate loads to create a large hypertrophy stimulus.",
      "Expect recovery cost to rise when intensity is not dialed appropriately.",
      "Treat 10×10-style framing as a historical character, not a mandatory exact template.",
      "Progress by managing fatigue and load — not by collecting sets forever.",
    ],
    whatWasInnovative: [
      "Made extreme set-count hypertrophy blocks famous in Western gym culture.",
      "Gave coaches a clear (if blunt) tool for volume accumulation phases.",
      "Highlighted the trade-off between stimulus size and recovery demand.",
    ],
    whatRemainsUseful: [
      "Volume accumulation phases remain useful when recovery and exercise selection are honest.",
      "Moderate loads with higher sets can spare joints vs endless heavy grinding for some athletes.",
      "Teaching “volume has a recovery price” is still valuable.",
    ],
    whatModernEvidenceQuestions: [
      "Fixed 10×10 dogma is not required for hypertrophy — dose-response is more flexible.",
      "High set counts without intensity control become junk fatigue quickly.",
      "Commercial GVT write-ups vary; this archive does not reprint proprietary plans.",
    ],
    relatedEraSlugs: ["golden-era-bodybuilding"],
    relatedMethodSlugs: ["german-volume-training"],
    relatedGraphNodeIds: ["german-volume-10x10"],
  },
  {
    slug: "linear-periodization",
    kind: "method",
    title: "Linear periodization",
    subtitle: "Progressive intensity across a planned season",
    periodLabel: "Classical sport-science framing → modern coaching use",
    teaser:
      "Famous planning method: intensity rises across the plan while volume character typically shifts.",
    principlesSummary: [
      "Raise relative intensity across a block or season with a planned structure.",
      "Expect volume character to change as intensity climbs.",
      "Use phases to peak or test strength rather than maxing year-round.",
      "Keep historical models separate from modern evidence interpretation.",
    ],
    whatWasInnovative: [
      "Gave generations of coaches a simple seasonal story: build, then intensify.",
      "Made peaking and phase transitions teachable to large coaching audiences.",
      "Became the default foil for later undulating and block models.",
    ],
    whatRemainsUseful: [
      "Intermediates often thrive on clear progressive intensity structures.",
      "Seasonal peaking logic still fits many strength sports.",
      "Simplicity aids adherence when complexity is not yet earned.",
    ],
    whatModernEvidenceQuestions: [
      "Linear is not automatically superior to undulating or block models for all goals.",
      "Rigid percentage calendars ignore readiness noise that autoregulation later addressed.",
      "Classical diagrams are educational history — not a citation for every modern claim.",
    ],
    relatedEraSlugs: ["soviet-weightlifting-systems", "evidence-informed-programming"],
    relatedMethodSlugs: ["linear-periodization", "block-periodization"],
    relatedGraphNodeIds: ["matveyev", "progressive-intensity"],
  },
  {
    slug: "block-periodization",
    kind: "method",
    title: "Block periodization",
    subtitle: "Concentrated loading in sequenced focus blocks",
    periodLabel: "Modern coaching presentations (Issurin-associated lineage)",
    teaser:
      "Famous alternative to flat concurrent development — concentrate qualities, then sequence residuals.",
    principlesSummary: [
      "Concentrate selected qualities in a block rather than developing everything equally every week.",
      "Sequence blocks with competition timing and residual effects in mind.",
      "Expect concentrated loading to be fatiguing by design.",
      "Reserve true concentrated blocks for athletes with monitoring literacy.",
    ],
    whatWasInnovative: [
      "Offered a clear structural alternative to perpetual concurrent training.",
      "Centered residual-effect thinking in popular coaching education.",
      "Fit short preparation windows for advanced athletic performance contexts.",
    ],
    whatRemainsUseful: [
      "Focused overload remains valuable for advanced athletes with clear targets.",
      "Honest fatigue budgeting during concentration phases prevents surprise decline.",
      "Sequencing beats “everything hard, always” for many competitive calendars.",
    ],
    whatModernEvidenceQuestions: [
      "Block vs DUP vs linear debates are context-heavy — not settled supremacy contests.",
      "Poor transitions leave qualities cold; the model is fragile to bad sequencing.",
      "Residual-effect certainty is often oversold relative to individual variance.",
    ],
    relatedEraSlugs: ["soviet-weightlifting-systems", "evidence-informed-programming"],
    relatedMethodSlugs: ["block-periodization", "daily-undulating-periodization"],
    relatedGraphNodeIds: ["issurin", "concentrated-block-volume"],
  },
] as const;

export type HistoricalArchiveSlug =
  (typeof HISTORICAL_ARCHIVE_PROFILES)[number]["slug"];
