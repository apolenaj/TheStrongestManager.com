/**
 * Marketing copy for expanded program families (bodybuilding, lift-specific,
 * strongman, transformation, athletic, weightlifting).
 */

import type { ProgramFamilyContent } from "@/domain/program-catalog/content";

function compactFamily(args: {
  familyId: string;
  displayName: string;
  tagline: string;
  whoFor: string[];
  whoNot: string[];
  weeks: string;
  priceLabel: string;
}): ProgramFamilyContent {
  return {
    familyId: args.familyId,
    displayName: args.displayName,
    tagline: args.tagline,
    whoFor: args.whoFor,
    whoNot: args.whoNot,
    structure: [
      {
        label: "Foundation",
        weeks: "Weeks 1–4",
        intent: "Establish movement quality, work capacity, and baseline loads.",
      },
      {
        label: "Build",
        weeks: "Weeks 5–8",
        intent: "Raise productive stress while keeping technique honest.",
      },
      {
        label: "Realize",
        weeks: args.weeks,
        intent: "Express the adaptation — peak, cut finish, or skill transfer.",
      },
    ],
    comparisonRows: [
      { feature: "Duration", free: "—", full: args.weeks.replace("Weeks ", "") + " weeks" },
      { feature: "Price", free: "—", full: args.priceLabel },
    ],
    faq: [
      {
        question: "Is this a guaranteed result?",
        answer:
          "No. Outcomes depend on execution, recovery, sleep, and starting point. We do not invent success rates.",
      },
      {
        question: "Do I need a coach?",
        answer:
          "Templates are educational. They do not replace individualized coaching for injury, peaking, or complex recovery issues.",
      },
    ],
  };
}

export const PROGRAM_FAMILY_CONTENT_EXPANDED: Record<string, ProgramFamilyContent> =
  {
    "golden-era-hypertrophy": compactFamily({
      familyId: "golden-era-hypertrophy",
      displayName: "Golden Era Hypertrophy",
      tagline:
        "High-volume, high-frequency aesthetic building based on classic principles.",
      whoFor: [
        "Intermediate physique-focused lifters with solid recovery",
        "Athletes who enjoy higher weekly exposure per muscle group",
        "Lifters studying classic hypertrophy culture with modern recovery controls",
      ],
      whoNot: [
        "Beginners still learning squat, hinge, press, and pull patterns",
        "Lifters with poor sleep or high life stress who cannot recover high volume",
        "Anyone treating magazine templates as permanent elite routines",
      ],
      weeks: "Weeks 9–12",
      priceLabel: "£59",
    }),
    "deadlift-310-peak": compactFamily({
      familyId: "deadlift-310-peak",
      displayName: "The 310kg Deadlift Peak",
      tagline:
        "A brutal, highly specific peaking block to maximize your 1RM on the platform.",
      whoFor: [
        "Intermediate-plus deadlifters with a competition or test date",
        "Athletes who can protect the lower back with honest technique limits",
        "Lifters who need a short, specific peaking window — not a year-round plan",
      ],
      whoNot: [
        "Beginners without a consistent deadlift pattern",
        "Anyone with unmanaged back pain or clearance issues",
        "Lifters seeking a full SBD meet peak in one template",
      ],
      weeks: "Weeks 7–8",
      priceLabel: "£49",
    }),
    "squat-overload-base": compactFamily({
      familyId: "squat-overload-base",
      displayName: "Squat Overload Base",
      tagline:
        "Build squat work capacity and overload tolerance before a heavier peaking phase.",
      whoFor: [
        "Lifters whose squat lags the total",
        "Athletes who need more quality squat exposures without endless maxing",
        "Coaches installing a squat-focused accumulation block",
      ],
      whoNot: [
        "Lifters with unresolved knee or hip pain under load",
        "Beginners who still need a balanced full-body base",
      ],
      weeks: "Weeks 9–12",
      priceLabel: "£49",
    }),
    "bench-press-blueprint": compactFamily({
      familyId: "bench-press-blueprint",
      displayName: "Bench Press Blueprint",
      tagline:
        "Structured bench frequency, technique grooves, and accessory work for pressing strength.",
      whoFor: [
        "Powerlifters and press specialists chasing a stronger competition bench",
        "Lifters who respond to multiple weekly bench exposures",
      ],
      whoNot: [
        "Lifters with unmanaged shoulder pain",
        "Anyone expecting a single max day to replace progressive structure",
      ],
      weeks: "Weeks 9–12",
      priceLabel: "£49",
    }),
    "loglift-mastery": compactFamily({
      familyId: "loglift-mastery",
      displayName: "Loglift Mastery",
      tagline:
        "Clean, press, and event-specific practice for a stronger, more repeatable log.",
      whoFor: [
        "Strongman athletes preparing log events",
        "Lifters transitioning from barbell press to log technique",
      ],
      whoNot: [
        "Beginners without a basic overhead press pattern",
        "Athletes without access to a log or close substitute",
      ],
      weeks: "Weeks 9–12",
      priceLabel: "£59",
    }),
    "strongman-base-builder": compactFamily({
      familyId: "strongman-base-builder",
      displayName: "Strongman Base Builder",
      tagline:
        "Raw static strength combined with event-specific conditioning.",
      whoFor: [
        "Strongman athletes building an off-season strength base",
        "Powerlifters cross-training events with honest recovery budgeting",
      ],
      whoNot: [
        "Lifters without access to basic strongman implements or substitutes",
        "Beginners who still need a general strength foundation first",
      ],
      weeks: "Weeks 9–12",
      priceLabel: "£69",
    }),
    "iron-cut-aggressive": compactFamily({
      familyId: "iron-cut-aggressive",
      displayName: "Iron Cut: Aggressive",
      tagline:
        "A relentless, high-deficit protocol for massive weight drops. Built on discipline.",
      whoFor: [
        "Experienced lifters who can protect strength under a steep deficit",
        "Athletes with a clear cut deadline and coaching/nutrition support",
      ],
      whoNot: [
        "Beginners or anyone with a history of disordered eating patterns",
        "Lifters in a peaking meet block who cannot afford performance risk",
        "Anyone treating aggression as a substitute for sleep and protein",
      ],
      weeks: "Weeks 9–12",
      priceLabel: "£59",
    }),
    "iron-recomp-medium": compactFamily({
      familyId: "iron-recomp-medium",
      displayName: "Iron Recomp: Medium",
      tagline:
        "Steady fat loss while defending muscle mass and strength totals.",
      whoFor: [
        "Lifters who want visible recomposition without wrecking the total",
        "Intermediates balancing physique and platform performance",
      ],
      whoNot: [
        "Anyone expecting extreme weekly drops without tradeoffs",
        "Lifters who refuse to track intake or recovery markers",
      ],
      weeks: "Weeks 9–14",
      priceLabel: "£59",
    }),
    "sustainable-lean-quality": compactFamily({
      familyId: "sustainable-lean-quality",
      displayName: "Sustainable Lean: Quality",
      tagline:
        "A slower, highly structured approach to leaning out without losing platform performance.",
      whoFor: [
        "Competitive lifters who need a quality cut that respects meets",
        "Athletes who prefer slower, sustainable body-composition change",
      ],
      whoNot: [
        "Anyone chasing crash cuts or extreme short-term drops",
        "Lifters unwilling to adjust volume when recovery dips",
      ],
      weeks: "Weeks 9–16",
      priceLabel: "£59",
    }),
    "explosive-power-speed": compactFamily({
      familyId: "explosive-power-speed",
      displayName: "Explosive Power & Speed",
      tagline:
        "Dynamic effort, jumps, and speed-strength work to transfer force faster.",
      whoFor: [
        "Athletes who need rate of force development alongside max strength",
        "Lifters installing a dynamic block between heavy strength phases",
      ],
      whoNot: [
        "Beginners without a stable squat/hinge/press pattern",
        "Athletes with uncleared tendon or joint issues under ballistic work",
      ],
      weeks: "Weeks 7–8",
      priceLabel: "£49",
    }),
    "olympic-weightlifting-base": compactFamily({
      familyId: "olympic-weightlifting-base",
      displayName: "Olympic Weightlifting Base",
      tagline:
        "Snatch and clean & jerk foundations with strength support for the classic lifts.",
      whoFor: [
        "Lifters building Olympic weightlifting technique and base strength",
        "Cross-trained athletes who need structured snatch/C&J practice",
      ],
      whoNot: [
        "Beginners without coaching eyes on overhead receiving positions",
        "Athletes with uncleared shoulder or wrist limitations",
      ],
      weeks: "Weeks 9–12",
      priceLabel: "£59",
    }),
  };

function compactFamilyCs(args: {
  familyId: string;
  displayName: string;
  tagline: string;
  whoFor: string[];
  whoNot: string[];
  weeksLabel: string;
  priceLabel: string;
}): ProgramFamilyContent {
  return {
    familyId: args.familyId,
    displayName: args.displayName,
    tagline: args.tagline,
    whoFor: args.whoFor,
    whoNot: args.whoNot,
    structure: [
      {
        label: "Základ",
        weeks: "Týdny 1–4",
        intent: "Ustal kvalitu pohybu, pracovní kapacitu a startovní váhy.",
      },
      {
        label: "Stavba",
        weeks: "Týdny 5–8",
        intent: "Zvyšuj produktivní stres a drž techniku pod kontrolou.",
      },
      {
        label: "Realizace",
        weeks: args.weeksLabel,
        intent: "Projev adaptaci — peak, finish řezu, nebo přenos dovednosti.",
      },
    ],
    comparisonRows: [
      { feature: "Délka", free: "—", full: args.weeksLabel },
      { feature: "Cena", free: "—", full: args.priceLabel },
    ],
    faq: [
      {
        question: "Je to záruka výsledku?",
        answer:
          "Ne. Výsledky závisí na provedení, regeneraci, spánku a výchozí úrovni. Nevymýšlíme úspěšnost.",
      },
      {
        question: "Potřebuji kouče?",
        answer:
          "Šablony jsou edukativní. Nenahrazují individualizovaný koučing při zranění, peaku nebo komplexní regeneraci.",
      },
    ],
  };
}

export const PROGRAM_FAMILY_CONTENT_EXPANDED_CS: Record<
  string,
  ProgramFamilyContent
> = {
  "golden-era-hypertrophy": compactFamilyCs({
    familyId: "golden-era-hypertrophy",
    displayName: "Zlatá éra hypertrofie",
    tagline:
      "Vysokoobjemový a vysokofrekvenční trénink pro estetiku založený na klasických principech.",
    whoFor: [
      "Středně pokročilé physique lifery se solidní regenerací",
      "Atlety, kteří snesou vyšší týdenní expozici na partii",
      "Lifery studující klasickou hypertrofii s moderní kontrolou regenerace",
    ],
    whoNot: [
      "Začátečníky bez základních vzorců dřep/hinge/tlak/tah",
      "Lifery se špatným spánkem nebo vysokým stresem",
      "Kohokoli, kdo bere magazínové šablony jako věčný elitní program",
    ],
    weeksLabel: "Týdny 9–12",
    priceLabel: "£59",
  }),
  "deadlift-310-peak": compactFamilyCs({
    familyId: "deadlift-310-peak",
    displayName: "Vrcholná fáze mrtvého tahu",
    tagline:
      "Brutální a vysoce specifický peaking blok pro maximalizaci 1RM na závodním prkně.",
    whoFor: [
      "Středně pokročilé a výš — deadliftery s datem testu nebo závodu",
      "Atlety, kteří umí chránit bedra upřímnými technickými limity",
    ],
    whoNot: [
      "Začátečníky bez konzistentního vzorce mrtvého tahu",
      "Kohokoli s neřešenou bolestí zad",
    ],
    weeksLabel: "Týdny 7–8",
    priceLabel: "£49",
  }),
  "squat-overload-base": compactFamilyCs({
    familyId: "squat-overload-base",
    displayName: "Přetížení dřepu",
    tagline:
      "Buduj pracovní kapacitu a toleranci přetížení v dřepu před těžším peakingem.",
    whoFor: [
      "Lifery, kterým dřep zaostává za totálem",
      "Atlety, kteří potřebují více kvalitních dřepových expozic",
    ],
    whoNot: [
      "Lifery s neřešenou bolestí kolen nebo kyčlí",
      "Začátečníky, kteří ještě potřebují vyvážený full-body základ",
    ],
    weeksLabel: "Týdny 9–12",
    priceLabel: "£49",
  }),
  "bench-press-blueprint": compactFamilyCs({
    familyId: "bench-press-blueprint",
    displayName: "Plán pro Bench Press",
    tagline:
      "Strukturovaná frekvence bench pressu, technické drážky a asistence pro tlakovou sílu.",
    whoFor: [
      "Powerliftery a specialisty na tlak, kteří chtějí silnější závodní bench",
      "Lifery, kteří reagují na více týdenních expozic bench pressu",
    ],
    whoNot: [
      "Lifery s neřešenou bolestí ramen",
      "Kohokoli, kdo čeká, že jeden max den nahradí strukturu",
    ],
    weeksLabel: "Týdny 9–12",
    priceLabel: "£49",
  }),
  "loglift-mastery": compactFamilyCs({
    familyId: "loglift-mastery",
    displayName: "Mistrovství v Logliftu",
    tagline:
      "Clean, press a event-specific praxe pro silnější a opakovatelný log.",
    whoFor: [
      "Strongman atlety připravující log disciplíny",
      "Lifery přecházející z osy na techniku logu",
    ],
    whoNot: [
      "Začátečníky bez základního overhead pressu",
      "Atlety bez přístupu k logu nebo blízké náhradě",
    ],
    weeksLabel: "Týdny 9–12",
    priceLabel: "£59",
  }),
  "strongman-base-builder": compactFamilyCs({
    familyId: "strongman-base-builder",
    displayName: "Budování strongman základu",
    tagline:
      "Hrubá statická síla v kombinaci s kondicí specifickou pro strongman disciplíny.",
    whoFor: [
      "Strongman atlety budující off-season silový základ",
      "Powerliftery křížově trénující eventy s poctivým rozpočtem regenerace",
    ],
    whoNot: [
      "Lifery bez přístupu k základním strongman náčiním nebo náhradám",
      "Začátečníky bez obecného silového základu",
    ],
    weeksLabel: "Týdny 9–12",
    priceLabel: "£69",
  }),
  "iron-cut-aggressive": compactFamilyCs({
    familyId: "iron-cut-aggressive",
    displayName: "Železný řez: Agresivní transformace",
    tagline:
      "Nelítostný protokol s vysokým deficitem pro masivní shazování. Postaveno na čisté disciplíně.",
    whoFor: [
      "Zkušené lifery, kteří umí chránit sílu pod strmým deficitem",
      "Atlety s jasným deadlinem řezu a podporou výživy/koučinku",
    ],
    whoNot: [
      "Začátečníky nebo kohokoli s rizikem poruch příjmu potravy",
      "Lifery v peaking bloku, kteří si nemohou dovolit riziko výkonu",
    ],
    weeksLabel: "Týdny 9–12",
    priceLabel: "£59",
  }),
  "iron-recomp-medium": compactFamilyCs({
    familyId: "iron-recomp-medium",
    displayName: "Železná rekompozice: Střední tempo",
    tagline:
      "Stabilní pálení tuku při obraně svalové hmoty a silových výkonů.",
    whoFor: [
      "Lifery, kteří chtějí viditelnou rekompozici bez zničení totálu",
      "Středně pokročilé, kteří balancují physique a výkon na prkně",
    ],
    whoNot: [
      "Kohokoli, kdo čeká extrémní týdenní úbytky bez tradeoffů",
      "Lifery, kteří odmítají sledovat příjem nebo regeneraci",
    ],
    weeksLabel: "Týdny 9–14",
    priceLabel: "£59",
  }),
  "sustainable-lean-quality": compactFamilyCs({
    familyId: "sustainable-lean-quality",
    displayName: "Udržitelná čistá hmota: Kvalita",
    tagline:
      "Pomalejší, vysoce strukturovaný přístup k vysekání bez ztráty výkonu na závodech.",
    whoFor: [
      "Závodní lifery, kteří potřebují kvalitní řez s respektem k závodům",
      "Atlety preferující pomalejší, udržitelnou změnu kompozice",
    ],
    whoNot: [
      "Kohokoli honícího crash cut nebo extrémní krátkodobé shozy",
      "Lifery neochotné upravit objem, když regenerace klesá",
    ],
    weeksLabel: "Týdny 9–16",
    priceLabel: "£59",
  }),
  "explosive-power-speed": compactFamilyCs({
    familyId: "explosive-power-speed",
    displayName: "Explozivní síla a rychlost",
    tagline:
      "Dynamické úsilí, skoky a speed-strength práce pro rychlejší přenos síly.",
    whoFor: [
      "Atlety, kteří potřebují RFD vedle maximální síly",
      "Lifery instalující dynamický blok mezi těžké silové fáze",
    ],
    whoNot: [
      "Začátečníky bez stabilního dřepu/hinge/tlaku",
      "Atlety s neprověřenými šlachovými nebo kloubními problémy při balistické práci",
    ],
    weeksLabel: "Týdny 7–8",
    priceLabel: "£49",
  }),
  "olympic-weightlifting-base": compactFamilyCs({
    familyId: "olympic-weightlifting-base",
    displayName: "Základ olympijského vzpírání",
    tagline:
      "Základy marketu a nadhozu se silovou podporou klasických vzpěračských cviků.",
    whoFor: [
      "Lifery budující techniku olympijského vzpírání a silový základ",
      "Křížově trénované atlety, kteří potřebují strukturovanou praxi snatch/C&J",
    ],
    whoNot: [
      "Začátečníky bez koučovského dohledu nad overhead pozicemi",
      "Atlety s neprověřenými omezeními ramen nebo zápěstí",
    ],
    weeksLabel: "Týdny 9–12",
    priceLabel: "£59",
  }),
};
