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
      justification: L(
        "Builds substantial strength via compounds, but the primary target is hypertrophy and appearance rather than peaking maximal strength.",
        "Buduje značnou sílu díky základním cvikům, ale primárním cílem je hypertrofie a vzhled, ne vrchol maximální síly.",
      ),
    },
    hypertrophyPotential: {
      value: 9,
      justification: L(
        "Very high weekly set volumes and multi-exercise body-part coverage align with classical hypertrophy stimulus when recovery allows.",
        "Velmi vysoký týdenní objem sérií a pokrytí partie více cviky odpovídá klasickému hypertrofnímu stimulu, pokud to regenerace dovolí.",
      ),
    },
    recoveryDemand: {
      value: 9,
      justification: L(
        "High frequency plus high set counts create large systemic and local fatigue; poorly recovered lifters stall or regress quickly.",
        "Vysoká frekvence spolu s vysokým počtem sérií vytváří velkou systémovou i lokální únavu; špatně zregenerovaní lifteři rychle stagnují nebo regredují.",
      ),
    },
    technicalDifficulty: {
      value: 5,
      justification: L(
        "Movements are mostly standard bodybuilding patterns; difficulty is managing volume, effort, and exercise sequencing—not exotic skill lifts.",
        "Cviky jsou převážně standardní bodybuildingové vzorce; náročnost spočívá ve zvládání objemu, úsilí a pořadí cviků — ne v exotických technických cvicích.",
      ),
    },
    beginnerSuitability: {
      value: 2,
      justification: L(
        "Beginners need pattern mastery and lower absolute volume; copying competition-era set counts is a common failure mode.",
        "Začátečníci potřebují zvládnout základní pohybové vzorce a nižší absolutní objem; kopírování počtu sérií ze závodní éry je běžná chyba.",
      ),
    },
    advancedSuitability: {
      value: 8,
      justification: L(
        "Advanced physique athletes can selectively borrow density tools (antagonist supersets) and frequency ideas with dose control.",
        "Pokročilí physique atleti mohou selektivně přebírat nástroje hustoty (antagonistické supersety) a myšlenky frekvence pod kontrolou dávky.",
      ),
    },
  },
  evidenceQuality: "moderate",
  evidenceQualityNote: L(
    "Primary evidence is athlete-authored or co-authored published books plus later instructional columns on official/reputable channels. Exact session logs vary by period; conflicting popular summaries exist, so claims about any single permanent routine are treated cautiously.",
    "Primárním důkazem jsou knihy napsané nebo spoluautorsky vytvořené atletem, plus pozdější instruktážní sloupky na oficiálních a důvěryhodných kanálech. Přesné tréninkové zápisy se liší podle období; existují protichůdná populární shrnutí, proto jsou tvrzení o jakékoli jediné trvalé rutině posuzována opatrně.",
  ),
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
    trainingDays: L(
      "Competition-oriented templates associated with published teaching often imply near-daily training with rotating body-part emphasis",
      "Závodně orientované šablony spojené s publikovanou výukou často implikují téměř denní trénink s rotujícím důrazem na partie",
    ),
    exerciseFrequency: L(
      "Major muscle groups commonly appear ~2–3 times per week in documented high-frequency examples; exact splits vary by source/period",
      "Hlavní svalové skupiny se v dokumentovaných vysokofrekvenčních příkladech běžně objevují ~2–3× týdně; přesné rozvržení splitu se liší podle zdroje a období",
    ),
    volumeDistribution: [
      {
        label: L(
          "Chest / back compounds & accessories",
          "Hrudník / záda — základní a doplňkové cviky",
        ),
        share: 28,
      },
      {
        label: L("Legs (squat/press + isolation)", "Nohy (dřep/leg press + izolace)"),
        share: 24,
      },
      { label: L("Shoulders & arms", "Ramena a paže"), share: 22 },
      {
        label: L("Calves / midsection / other", "Lýtka / střed těla / ostatní"),
        share: 26,
      },
    ],
    intensityDistribution: [
      {
        label: L("Primary compounds (heavier)", "Primární základní cviky (těžší)"),
        share: 35,
      },
      { label: L("Secondary compounds", "Sekundární základní cviky"), share: 30 },
      {
        label: L("Isolation / density techniques", "Izolační / density techniky"),
        share: 35,
      },
    ],
    primaryMovements: [
      L("Barbell and dumbbell presses", "Tlaky s velkou i s jednoručními činkami"),
      L(
        "Rows and pulldown/pull-up variations",
        "Přítahy a varianty shybů/stahování kladky",
      ),
      L("Squats and leg presses", "Dřepy a leg press"),
      L("Overhead presses", "Tlaky nad hlavu"),
    ],
    accessoryWork: [
      L("Flye / crossover patterns", "Flye / crossover vzorce"),
      L("Leg extensions and curls", "Leg extension a leg curl"),
      L(
        "Curl and extension variations",
        "Varianty bicepsových a tricepsových tahů (curl a extension)",
      ),
      L("Calf raises and midsection work", "Výpony na lýtka a práce na středu těla"),
    ],
    progressionApproach: L(
      "Published teaching emphasises continual improvement in load or completed work; not a single fixed percentage wave",
      "Publikovaná výuka zdůrazňuje trvalé zlepšování zátěže nebo odvedené práce; nejde o jedinou pevnou procentuální vlnu",
    ),
    recoveryStructure: L(
      "Sleep, nutrition, and rest are framed as enabling high volume — not optional add-ons",
      "Spánek, výživa a odpočinek jsou chápány jako podmínka pro vysoký objem — ne jako volitelné doplňky",
    ),
  },
  whyItWorked: {
    specificity: L(
      "Training targeted muscular size and shape for physique competition judging, not a powerlifting total.",
      "Trénink cílil na svalový objem a tvar pro posuzování na physique soutěžích, ne na powerliftingový total.",
    ),
    volume: L(
      "High weekly sets and multi-exercise coverage created large cumulative tension and metabolic stress when recovered.",
      "Vysoký týdenní počet sérií a pokrytí partie více cviky vytvářely při dostatečné regeneraci velké kumulativní napětí a metabolický stres.",
    ),
    intensity: L(
      "Loads were often substantial for bodybuilding, with cultural acceptance of very hard sets and density techniques.",
      "Zátěže byly na bodybuildingové poměry často značné, s kulturním přijetím velmi tvrdých sérií a density technik.",
    ),
    technicalPractice: L(
      "Years of repeated practice on the same movement families refined execution under fatigue.",
      "Roky opakované praxe na stejných skupinách cviků zdokonalily provedení pod únavou.",
    ),
    athleteExperience: L(
      "Long runway of progressive exposure before the highest reported workloads.",
      "Dlouhá dráha postupné expozice předcházela nejvyšším uváděným tréninkovým zátěžím.",
    ),
    bodyweight: L(
      "Competitive bodyweights and stage conditioning goals differed from strength-sport weight-class strategies.",
      "Závodní tělesná hmotnost a cíle stage kondice se lišily od strategií váhových kategorií v silových sportech.",
    ),
    recovery: L(
      "Lifestyle support around training was typically far above recreational norms.",
      "Podpora životního stylu kolem tréninku byla typicky daleko nad rekreačním standardem.",
    ),
    sportDemands: L(
      "Winning required looking a certain way on contest day; programmes chased that outcome.",
      "Vítězství vyžadovalo vypadat určitým způsobem v den soutěže; programy se podřizovaly tomuto výsledku.",
    ),
    longTermAdaptation: L(
      "Visible success reflected decades of adaptation and selection, not a two-week copy of a famous chart.",
      "Viditelný úspěch odrážel desetiletí adaptace a selekce, ne dvoutýdenní kopii slavné tabulky.",
    ),
  },
  whatLiftersGetWrong: [
    L(
      "Treating one popular PDF as the permanent exact Arnold programme",
      "Považovat jedno populární PDF za trvalý přesný Arnoldův program",
    ),
    L(
      "Copying peak competition set counts without peak recovery capacity",
      "Kopírovat počty sérií z vrcholné závodní formy bez odpovídající regenerační kapacity",
    ),
    L(
      "Adding supersets and failure work before technique is stable",
      "Zařazovat supersety a práci do failure dřív, než je technika stabilní",
    ),
    L(
      "Ignoring that documented templates differ across periods and publications",
      "Ignorovat, že dokumentované šablony se liší podle období a publikací",
    ),
    L(
      "Confusing high fatigue with productive hypertrophy stimulus",
      "Zaměňovat vysokou únavu za produktivní hypertrofní stimul",
    ),
  ],
  exampleWeek: {
    title: L(
      "Modernised antagonist-density illustration (not an athlete routine)",
      "Modernizovaná ukázka antagonistické density (nikoli atletova rutina)",
    ),
    label: "original-modernised-example",
    disclaimer: L(
      "Original The Strongest example showing how antagonist pairing and multi-exposure frequency can be dosed for an advanced physique lifter. Not Arnold Schwarzenegger’s exact programme and not a reprint of encyclopedia tables.",
      "Originální příklad The Strongest ukazující, jak lze antagonistické párování a vícenásobnou frekvenci dávkovat pro pokročilého physique liftera. Nejde o přesný program Arnolda Schwarzeneggera ani o reprint tabulek z encyklopedie.",
    ),
    days: [
      {
        dayLabel: L("Day 1", "Den 1"),
        focus: L("Chest / back antagonist density", "Hrudník / záda — antagonistická density"),
        notes: L(
          "Pair a press with a row pattern; keep 1–2 reps in reserve on most sets",
          "Spárujte tlak s přítahem; na většině sérií si nechte 1–2 opakování v rezervě",
        ),
      },
      {
        dayLabel: L("Day 2", "Den 2"),
        focus: L(
          "Squat pattern + posterior chain accessories",
          "Dřepový vzorec + doplňkové cviky na zadní řetězec",
        ),
        notes: L(
          "Moderate hard sets; avoid turning every set into a failure contest",
          "Střední počet tvrdých sérií; nedělejte z každé série soutěž o failure",
        ),
      },
      {
        dayLabel: L("Day 3", "Den 3"),
        focus: L("Shoulders / arms", "Ramena / paže"),
        notes: L(
          "Optional antagonist curl–extension supersets late in session",
          "Volitelné antagonistické supersety curl–extension ke konci tréninku",
        ),
      },
      {
        dayLabel: L("Day 4", "Den 4"),
        focus: L("Rest or easy mobility", "Odpočinek nebo lehká mobilita"),
        notes: L("Protect sleep and food intake", "Chraňte spánek a příjem stravy"),
      },
      {
        dayLabel: L("Day 5", "Den 5"),
        focus: L(
          "Second upper exposure (lighter density)",
          "Druhá expozice horní části těla (lehčí density)",
        ),
        notes: L(
          "Fewer hard sets than Day 1; emphasise quality",
          "Méně tvrdých sérií než Den 1; důraz na kvalitu",
        ),
      },
      {
        dayLabel: L("Day 6", "Den 6"),
        focus: L("Second lower exposure", "Druhá expozice dolní části těla"),
        notes: L(
          "Hinge emphasis or reduced squat volume versus Day 2",
          "Důraz na hinge nebo snížený objem dřepů oproti Dni 2",
        ),
      },
      {
        dayLabel: L("Day 7", "Den 7"),
        focus: L("Rest", "Odpočinek"),
        notes: L(
          "Deload week every 4–6 weeks if performance stalls",
          "Deload týden každé 4–6 týdnů, pokud výkon stagnuje",
        ),
      },
    ],
  },
  modernAdaptation: {
    summary: L(
      "Keep the useful Golden Era ideas — multi-exposure frequency when recovered, antagonist supersets for density, progressive overload — while discarding the assumption that encyclopedia competition volumes are a universal prescription.",
      "Zachovejte užitečné myšlenky Zlaté éry — vícenásobnou frekvenci při dostatečné regeneraci, antagonistické supersety pro density, progresivní přetížení — a zároveň odmítněte předpoklad, že závodní objemy z encyklopedie jsou univerzálním předpisem.",
    ),
    beginnerAdjustment: L(
      "Full-body or upper/lower 3–4 days/week; 6–10 hard sets per major muscle weekly; no failure-first culture; learn compounds before density tricks.",
      "Full-body nebo horní/dolní část těla 3–4 dny týdně; 6–10 tvrdých sérií na hlavní sval týdně; žádná kultura failure za každou cenu; nejprve zvládněte základní cviky, pak density triky.",
    ),
    intermediateAdjustment: L(
      "Push-pull-legs or upper/lower with ~10–16 hard sets per muscle weekly; introduce antagonist supersets on isolation pairings only.",
      "Push-pull-legs nebo horní/dolní část těla s ~10–16 tvrdými sériemi na sval týdně; antagonistické supersety zaváděj jen u izolovaných párování.",
    ),
    advancedAdjustment: L(
      "Short mesocycles with higher density and occasional near-failure finishers; track performance; planned deloads; never chase celebrity set counts for ego.",
      "Krátké mezocykly s vyšší density a příležitostnými finišery blízko failure; sledujte výkon; plánované deloady; nikdy nehoňte počty sérií celebrit pro ego.",
    ),
    recommendedFrequency: L(
      "3–6 training days depending on recovery; major muscles 2×/week as a default modern target",
      "3–6 tréninkových dnů podle regenerace; hlavní svaly 2×/týden jako výchozí moderní cíl",
    ),
    recoveryControls: [
      L(
        "Cap weekly hard sets before adding more exercises",
        "Omezte týdenní počet tvrdých sérií, než přidáte další cviky",
      ),
      L(
        "Limit true failure sets to late isolation work",
        "Omezte skutečné failure série jen na pozdní izolační cviky",
      ),
      L(
        "Deload when bar speed or motivation falls for 7–10 days",
        "Deload, když rychlost činky nebo motivace klesá po dobu 7–10 dní",
      ),
      L(
        "Prioritise sleep and protein before ‘more volume’",
        "Dejte prioritu spánku a bílkovinám před „více objemu“",
      ),
    ],
    progressionRules: [
      L(
        "Add load when all target reps are hit with solid technique",
        "Přidejte zátěž, když jsou splněna všechna cílová opakování se solidní technikou",
      ),
      L(
        "Add a set only after loads stall for 2–3 weeks",
        "Přidejte sérii až po 2–3 týdnech stagnace zátěže",
      ),
      L(
        "Rotate pressing/rowing variations every 6–8 weeks if joints complain",
        "Rotujte varianty tlaků/přítahů každých 6–8 týdnů, pokud si stěžují klouby",
      ),
    ],
    whenToReduceVolume: L(
      "Persistent strength drop, rising resting fatigue, or joint irritation that does not settle with technique fixes",
      "Trvalý pokles síly, narůstající klidová únava nebo dráždění kloubů, které se neuklidní opravou techniky",
    ),
    whoShouldAvoid: [
      L("Beginners", "Začátečníci"),
      L(
        "Lifters in a calorie deficit with poor sleep",
        "Lifteři v kalorickém deficitu se špatným spánkem",
      ),
      L(
        "Athletes peaking maximal strength sports who need lower fatigue",
        "Atleti vrcholící v maximálně silových sportech, kteří potřebují nižší únavu",
      ),
    ],
  },
  relatedProgrammes: [
    {
      slug: "powerbuilding-hybrid",
      title: L("Golden Era High-Volume Hypertrophy", "Vysokoobjemová hypertrofie Zlaté éry"),
      href: "/programs/powerbuilding-hybrid",
      relationship: L(
        "Original The Strongest programme applying related hypertrophy-density principles without athlete naming",
        "Originální program The Strongest, který aplikuje související principy hypertrofie a density bez jmenování atleta",
      ),
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
