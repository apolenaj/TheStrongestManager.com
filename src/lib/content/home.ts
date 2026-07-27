export const homeCopy = {
  brand: "The Strongest Manager",
  /** Canonical hero lines — never swapped by personalization. */
  heroLines: [
    "Od hrubé síly",
    "k absolutnímu leadershipu.",
  ],
  heroSupport:
    "Systém pro ty, kteří vyžadují maximální výkon v byznysu i pod činkou.",
  ambition:
    "Žádné motivační plakáty. Přesný plán, měřitelný progres a disciplína, která se přenáší z platformy do boardroomu.",
  ctaPrimary: "Zahájit trénink",
  ctaSecondary: "O tréninkových metodách",
  about: {
    eyebrow: "O mně",
    title: "Lídr, který měří výkon stejně pod činkou i v operacích",
    paragraphs: [
      "Vedl jsem masivní retailové a logistické operace, kde se výkon neomlouvá — počítá se throughput, přesnost a schopnost rozhodnout pod tlakem. Stejný mentální model přenáším do silového tréninku: jasný cíl, kontrolovaný proces, tvrdá zpětná vazba z reality.",
      "Zázemí v IT mi dává návyk stavět systémy, ne nálady. Data, periodizace a biomechanika nejsou dekorace — jsou řídicí vrstva. Psychologie managementu doplňuje techniku: disciplína, klid a accountability, když je série těžká nebo rozhodnutí nepohodlné.",
      "Soutěžní powerlifting beru striktně dle IPF pravidel. Hloubka, lockout a standardy platformy nejsou detail — jsou kontrakt s výsledkem. The Strongest Manager spojuje tyto světy do jednoho operačního systému pro sílu i leadership.",
    ],
    closing:
      "Optimalizace výkonu není motivace. Je to řízení: plán, provedení, měření, korekce.",
  },
  pillars: [
    {
      id: "powerlifting",
      title: "Silový trojboj",
      body: "Dřep, bench press a mrtvý tah jako základ síly. Technika, zátěž a progres řízené podle reálných tréninků — ne podle sloganů.",
    },
    {
      id: "mental",
      title: "Mentální odolnost",
      body: "Disciplína z těžkých sérií se přenáší do byznysu: klid pod tlakem, dlouhodobá konzistence a rozhodnutí bez emocionálního šumu.",
    },
    {
      id: "data",
      title: "Datová analýza progresu",
      body: "Sleduj objem, intenzitu a trendy jen z dat, která opravdu zaloguješ. Žádné vymyšlené skóre ani falešné úspěšnosti.",
    },
  ],
  approach: {
    eyebrow: "Tréninkový přístup",
    title: "Profesionální silový systém, ne fitness trend",
    description:
      "Přístup postavený na periodizaci, biomechanice a standardech soutěžního powerliftingu — se striktním plánováním každého cyklu.",
    items: [
      {
        id: "periodization",
        title: "Přesná periodizace",
        body: "Bloková a undulující struktura: zátěž, objem a intenzita se plánují dopředu a upravují podle odvedené práce.",
        span: "lg:col-span-2",
      },
      {
        id: "biomechanics",
        title: "Biomechanika",
        body: "Technická zpětná vazba k hlavním zdvihům. Pozorované vs. odhadované poznatky jsou vždy jasně označené.",
        span: "lg:col-span-1",
      },
      {
        id: "ipf",
        title: "IPF standardy",
        body: "Příprava respektuje pravidla a standardy IPF — hloubka, lockout, vybavení a soutěžní kontext, kde dávají smysl.",
        span: "lg:col-span-1",
      },
      {
        id: "planning",
        title: "Striktní plánování",
        body: "Každý týden má konkrétní záměr. Dnešní trénink, deload i peak nejsou náhoda — jsou rozhodnutí z plánu.",
        span: "lg:col-span-2",
      },
    ],
  },
  finalCta: {
    title: "Začni budovat sílu, která unese tlak.",
    body: "Vytvoř účet, založ profil a zahaj první strukturovaný cyklus. Data a doporučení přijdou až z reálného tréninku.",
  },
  intelligence: [
    {
      title: "Athlete profile",
      body: "Goals, training history, and reported readiness in one place.",
    },
    {
      title: "Labeled scores",
      body: "Scores state whether a value was observed, estimated, athlete-reported, or recommended.",
    },
    {
      title: "Next action",
      body: "Today and the dashboard point to the next useful step — usually the next workout.",
    },
  ],
  audiences: [
    "Powerlifting",
    "Bodybuilding",
    "Strongman",
    "Weightlifting",
    "General strength",
    "Hybrid athletes",
    "Coaches",
  ],
  faq: [
    {
      question: "Je The Strongest Manager generátor náhodných workoutů?",
      answer:
        "Ne. Spojuje profil atleta, programování, logování, technickou zpětnou vazbu a progress. Negeneruje náhodný trénink ze sloganu.",
    },
    {
      question: "Dokáže produkt diagnostikovat zranění?",
      answer:
        "Ne. Nediagnostikuje zranění ani onemocnění. Při bolesti sniž zátěž a konzultuj kvalifikovaného klinika.",
    },
    {
      question: "Jak přesná je analýza techniky?",
      answer:
        "Pohybová analýza běží, když to umožní úhel kamery a pose data. Poznatky jsou označené jako observed, estimated, athlete-reported nebo recommended.",
    },
    {
      question: "Je napojení Mealnexio live?",
      answer:
        "Zatím ne. Nutrition ukazuje stav připojení a prázdné cíle, dokud nedorazí reálný API adapter. Makra si nevymýšlíme.",
    },
    {
      question: "Jak funguje pricing?",
      answer:
        "Free, Pro a Performance jsou na stránce Pricing. Self-serve checkout se otevře jen když je nakonfigurovaný Stripe.",
    },
    {
      question: "Publikujete úspěšnost nebo počty atletů?",
      answer:
        "Jen z reálných produkčních dat. Do té doby ukazujeme schopnosti produktu a empty states — ne vymyšlené testimonials.",
    },
    {
      question: "Pro koho je to určené?",
      answer:
        "Pro atlety a manažery, kteří berou silový trénink stejně vážně jako výkon v byznysu — powerlifting, síla, koučové.",
    },
  ],
} as const;
