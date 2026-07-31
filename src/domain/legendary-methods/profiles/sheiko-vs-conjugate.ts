import { L } from "@/domain/legendary-methods/localized";
import type { SystemComparison } from "@/domain/legendary-methods/types";

/**
 * Shared Sheiko vs Conjugate comparison (Prompt 5D).
 * Original educational synthesis — not a reprint of copyrighted programme tables.
 */
const COMPARISON_SUMMARY = L(
  `Sheiko-associated Russian powerlifting systems and Louie Simmons’ conjugate synthesis answer maximal strength with different primary tools. Sheiko emphasises frequent, submaximal practice of the competition lifts and block progression toward a meet. Conjugate emphasises concurrent max-effort, dynamic-effort and repetition-effort work with rotating special exercises and accommodating resistance. Neither internet “numbered spreadsheet” nor every modern “conjugate-inspired” template is automatically the official system. Choose tools by lifter need, equipment context and recovery — not by brand loyalty.`,
  `Ruské systémy silového trojboje spojené se Sheikem a conjugate syntéza Louieho Simmonse řeší maximální sílu jinými primárními nástroji. Sheiko tlačí vysokou frekvenci submaximální praxe závodních cviků a blokovou progresi k závodu. Conjugate drží současně max-effort, dynamic-effort a repetition-effort práci s rotací speciálních cviků a accommodating resistance. Ani internetový „očíslovaný spreadsheet“, ani každá moderní „conjugate-inspired“ šablona není automaticky oficiální systém. Vol nástroje podle potřeby liftera, vybavení a regenerace — ne podle brand loyalty.`,
);

const ROWS_SHEIKO_FIRST = [
  {
    dimension: L("Specificity", "Specificita"),
    thisSystem: L(
      "Very high to competition squat, bench and deadlift patterns across the week",
      "Velmi vysoká vůči závodnímu dřepu, benchi a mrtvému tahu napříč týdnem",
    ),
    otherSystem: L(
      "Mix of competition lifts and frequently rotated special exercises that transfer to the total",
      "Mix závodních cviků a často rotovaných speciálních cviků s přenosem do totálu",
    ),
  },
  {
    dimension: L("Exercise variation", "Variace cviků"),
    thisSystem: L(
      "Comparatively stable main-lift menu; variation is secondary to technical repetition",
      "Relativně stabilní menu hlavních cviků; variace je sekundární vůči technické praxi",
    ),
    otherSystem: L(
      "High — max-effort and special-exercise rotation is a core fatigue/adaptation tool",
      "Vysoká — rotace max-effort a speciálních cviků je klíčový nástroj únavy a adaptace",
    ),
  },
  {
    dimension: L("Frequency", "Frekvence"),
    thisSystem: L(
      "High competition-lift frequency (often multiple exposures per lift each week)",
      "Vysoká frekvence závodních cviků (často více expozic na cvik týdně)",
    ),
    otherSystem: L(
      "Typically four hard lower/upper contrasts (ME/DE) plus accessories; variation replaces endless identical maxes",
      "Typicky čtyři tvrdé lower/upper kontrasty (ME/DE) plus doplňky; variace nahrazuje nekonečné stejné maxy",
    ),
  },
  {
    dimension: L("Intensity", "Intenzita"),
    thisSystem: L(
      "Mostly submaximal quality work; average intensity often discussed near ~70% across phases in seminar accounts",
      "Převážně submaximální kvalitní práce; průměrná intenzita se v seminar účtech často uvádí kolem ~70 % napříč fázemi",
    ),
    otherSystem: L(
      "Weekly near-max singles on rotating lifts (ME) plus fast submaximal DE work",
      "Týdenní near-max single na rotovaných cvicích (ME) plus rychlá submaximální DE práce",
    ),
  },
  {
    dimension: L("Volume", "Objem"),
    thisSystem: L(
      "Can be high in absolute weekly tonnage while keeping most reps submaximal",
      "Může být vysoký v absolutním týdenním tonáži, zatímco většina opakování zůstává submaximální",
    ),
    otherSystem: L(
      "Volume is managed via exercise rotation and effort buckets rather than endless identical competition-lift sets",
      "Objem se řídí rotací cviků a effort buckety — ne nekonečnými stejnými sériemi závodních cviků",
    ),
  },
  {
    dimension: L("Recovery management", "Řízení regenerace"),
    thisSystem: L(
      "Fatigue managed by keeping most work away from daily maxes and by block peaking",
      "Únava se řídí tím, že většina práce zůstává daleko od denních maxů, a blokovým peakingem",
    ),
    otherSystem: L(
      "Fatigue managed by rotating max-effort lifts and special exercises so the same joint stress is not hammered identically every week",
      "Únava se řídí rotací max-effort cviků a speciálů, aby stejný kloubní stres nebyl každý týden kladívkován stejně",
    ),
  },
  {
    dimension: L("Beginner suitability", "Vhodnost pro začátečníky"),
    thisSystem: L(
      "Better when coached; beginners can drown in density without technical standards",
      "Lepší s koučem; začátečníci se v hustotě utopí bez technických standardů",
    ),
    otherSystem: L(
      "Poor default for beginners — ME culture and special-exercise menus reward experience",
      "Špatný default pro začátečníky — ME kultura a menu speciálů odměňují zkušenost",
    ),
  },
  {
    dimension: L("Advanced suitability", "Vhodnost pro pokročilé"),
    thisSystem: L(
      "Excellent for skilled lifters who need high technical practice and meet peaking structure",
      "Výborné pro zkušené liftery, kteří potřebují vysokou technickou praxi a strukturu peakingu k závodu",
    ),
    otherSystem: L(
      "Excellent for advanced lifters needing weak-point tools; historically strong in equipped contexts",
      "Výborné pro pokročilé liftery potřebující nástroje na slabá místa; historicky silné v equipped kontextech",
    ),
  },
  {
    dimension: L("Raw vs equipped application", "Raw vs equipped aplikace"),
    thisSystem: L(
      "Widely applied to raw/classic competition-lift practice and meet peaking",
      "Široce aplikované na raw/classic praxi závodních cviků a peaking k závodu",
    ),
    otherSystem: L(
      "Born and proven heavily in equipped Westside culture; raw use requires honest adaptation, not cargo-cult gear assumptions",
      "Zrozené a ověřené v equipped Westside kultuře; raw použití vyžaduje poctivou adaptaci, ne cargo-cult předpoklady o gearu",
    ),
  },
] as const;

export function sheikoVersusConjugateComparison(): SystemComparison {
  return {
    title: L("Sheiko vs Conjugate", "Sheiko vs Conjugate"),
    counterpartSlug: "louie-simmons-conjugate-method",
    counterpartName: L(
      "Conjugate Method (Louie Simmons)",
      "Conjugate metoda (Louie Simmons)",
    ),
    summary: COMPARISON_SUMMARY,
    rows: ROWS_SHEIKO_FIRST.map((row) => ({
      dimension: row.dimension,
      thisSystem: row.thisSystem,
      otherSystem: row.otherSystem,
    })),
  };
}

export function conjugateVersusSheikoComparison(): SystemComparison {
  return {
    title: L("Sheiko vs Conjugate", "Sheiko vs Conjugate"),
    counterpartSlug: "boris-sheiko-russian-powerlifting",
    counterpartName: L(
      "Russian Powerlifting Systems (Boris Sheiko)",
      "Ruské systémy silového trojboje (Boris Sheiko)",
    ),
    summary: COMPARISON_SUMMARY,
    rows: ROWS_SHEIKO_FIRST.map((row) => ({
      dimension: row.dimension,
      thisSystem: row.otherSystem,
      otherSystem: row.thisSystem,
    })),
  };
}
