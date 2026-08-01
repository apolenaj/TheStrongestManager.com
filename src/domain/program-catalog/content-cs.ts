/**
 * Czech marketing copy for commercial program families (public detail pages).
 * Mirrors src/domain/program-catalog/content.ts — same families, same structure,
 * professional powerlifting terminology, aggressive premium The Strongest tone.
 */

import type { ProgramFamilyContent } from "./content";

export const PROGRAM_FAMILY_CONTENT_CS: Record<
  string,
  Omit<ProgramFamilyContent, "familyId"> & { familyId: string }
> = {
  "linear-strength-builder": {
    familyId: "linear-strength-builder",
    displayName: "Lineární silový systém",
    tagline:
      "Jasná cesta od objemu k intenzitě, když chceš měřitelnou sílu bez zbytečné komplikace.",
    whoFor: [
      "Začátečníky a mírně pokročilé, kterým vyhovuje jednoduchý příběh progrese",
      "Lifery vracející se po pauze, kteří potřebují strukturu bez vysoké variability",
      "Sportovce, kterým sedí víceté fáze před změnou zaměření",
    ],
    whoNot: [
      "Pokročilé lifery, kteří už stagnují na dlouhých exkluzivních fázích",
      "Sportovce, kteří potřebují týdenní undulaci nebo vysokou rotaci cviků, aby zůstali zdraví",
      "Kohokoli, kdo od samotné šablony čeká personalizovaný plán od koučem",
    ],
    structure: [
      {
        label: "Akumulace",
        weeks: "Týdny 1–4",
        intent: "Vybuduj pracovní kapacitu s mírnou intenzitou a jasným progresivním přetížením.",
      },
      {
        label: "Intenzifikace",
        weeks: "Týdny 5–8",
        intent: "Zvyšuj relativní intenzitu a zároveň ořízni přebytečný objem.",
      },
      {
        label: "Realizace",
        weeks: "Týdny 9–12",
        intent: "Projev síly s nižším objemem a těžšími jedničkami/dvojkami.",
      },
    ],
    comparisonRows: [
      { feature: "Délka", free: "4 týdny", full: "12 týdnů" },
      { feature: "Pokrytí fází", free: "Pouze akumulace", full: "Celý cyklus až po realizaci" },
      { feature: "Možnosti rozvrhu", free: "3denní / 4denní", full: "3denní / 4denní" },
      {
        feature: "Nastavení tréninkového maxima",
        free: "Startovní nastavení",
        full: "Kompletní pravidla progrese cyklu",
      },
      { feature: "Cena", free: "Zdarma", full: "£49" },
    ],
    faq: [
      {
        question: "Je zdarma verze celý program?",
        answer:
          "Ne. Bezplatný blok je 4týdenní starter, díky kterému posoudíš, jestli ti systém sedí. Placený cyklus pokračuje přes intenzifikaci až po realizaci.",
      },
      {
        question: "Potřebuji koučem?",
        answer:
          "Šablony jsou edukativní. Nenahrazují individualizovaný koučing, pokud máš zranění, blížící se závod nebo komplexní problémy s regenerací.",
      },
      {
        question: "Zaručí mi to nové osobní maximum?",
        answer:
          "Ne. Výsledky závisí na provedení, regeneraci, spánku a výchozí úrovni. Nevymýšlíme si úspěšnost ani neslibujeme výsledky.",
      },
    ],
  },
  "dup-powerlifting-system": {
    familyId: "dup-powerlifting-system",
    displayName: "DUP systém silového trojboje",
    tagline:
      "Týdenní undulace zaměření na dřep, bench press a mrtvý tah pro lifery, kterým vyhovuje variabilita uvnitř mikrocyklu.",
    whoFor: [
      "Středně pokročilé silové trojbojaře, kteří trénují 3–4 dny týdně",
      "Lifery, kteří stagnují na dlouhých lineárních fázích a potřebují variabilitu během týdne",
      "Sportovce budující formu na závod, kteří nechtějí žít jen z těžkých jedniček",
    ],
    whoNot: [
      "Skutečné začátečníky, kteří ještě potřebují jeden jednoduchý model progrese",
      "Lifery, kteří se nedokážou zregenerovat z častého zatížení soutěžních cviků",
      "Kohokoli, kdo hledá čistě kulturistický program na hypertrofii",
    ],
    structure: [
      {
        label: "Základní undulace",
        weeks: "Týdny 1–4",
        intent: "Ustal role dnů pro hypertrofii, sílu a intenzitu.",
      },
      {
        label: "Progrese zátěže",
        weeks: "Týdny 5–10",
        intent: "Postupuj v tréninkových maximech a zpřesni specifičnost pro soutěž.",
      },
      {
        label: "Vrcholové okno",
        weeks: "Týdny 11–14",
        intent: "Sniž únavu a projev soutěžní cviky.",
      },
    ],
    comparisonRows: [
      { feature: "Délka", free: "4 týdny", full: "14 týdnů" },
      { feature: "Undulující dny", free: "Úvodní vzorec", full: "Kompletní cyklus zaměřený na závod" },
      { feature: "Možnosti rozvrhu", free: "3denní / 4denní", full: "3denní / 4denní" },
      { feature: "Struktura doplňkových cviků", free: "Základní sada", full: "Kompletní progrese slabých míst" },
      { feature: "Cena", free: "Zdarma", full: "£59" },
    ],
    faq: [
      {
        question: "Co znamená DUP?",
        answer:
          "Denní undulující periodizace — cíle intenzity a objemu se mění mezi tréninky v rámci stejného týdne, místo aby jedno zaměření platilo mnoho týdnů.",
      },
      {
        question: "Můžu to absolvovat bez termínu závodu?",
        answer:
          "Ano. Poslední týdny pojmi jako testovací okno, ne jako vrchol na federační závod.",
      },
      {
        question: "Je to totéž jako záznam v encyklopedii metod?",
        answer:
          "Je to postavené na principech DUP. Encyklopedie vysvětluje metodu; tento produkt je konkrétní tréninkový cyklus.",
      },
    ],
  },
  "block-periodisation": {
    familyId: "block-periodisation",
    displayName: "Bloková periodizace",
    tagline:
      "Koncentrované bloky, které prioritizují jednu kvalitu najednou a pak sekvencují reziduály do výkonu.",
    whoFor: [
      "Středně pokročilé až pokročilé lifery s jasným přípravným oknem",
      "Sportovce, kterým prospívá soustředěné přetížení místo rovnoměrného rozložení na vše",
      "Lifery, kterým nevadí upravovat program, jakmile reziduály slábnou",
    ],
    whoNot: [
      "Nováčky, kteří potřebují spíš jednoduché progresivní přetížení než koncentrované bloky",
      "Lifery se slabou regenerací, kteří nesnesou akumulační zátěž",
      "Kohokoli, kdo chce permanentně vysokou variabilitu v každém tréninku",
    ],
    structure: [
      {
        label: "Akumulace",
        weeks: "Týdny 1–4",
        intent: "Koncentrovaný objem a pracovní kapacita na primárních kvalitách.",
      },
      {
        label: "Transmutace",
        weeks: "Týdny 5–8",
        intent: "Přesun směrem k soutěžním cvikům a vyšší intenzitě.",
      },
      {
        label: "Realizace",
        weeks: "Týdny 9–12",
        intent: "Projev výkonu se sníženým objemem a řízenou únavou.",
      },
    ],
    comparisonRows: [
      { feature: "Délka", free: "4 týdny", full: "12 týdnů" },
      { feature: "Sekvence bloků", free: "Ukázka akumulace", full: "Kompletní sekvence 3 bloků" },
      { feature: "Možnosti rozvrhu", free: "4denní / 5denní", full: "4denní / 5denní" },
      { feature: "Nároky na regeneraci", free: "Vysoké úvodní", full: "Vysoké — plánované přechody" },
      { feature: "Cena", free: "Zdarma", full: "£59" },
    ],
    faq: [
      {
        question: "Proč jsou nároky na regeneraci vysoké?",
        answer:
          "Akumulační bloky záměrně koncentrují zátěž. Pokud je nestabilní spánek, stres nebo zdraví kloubů, zvol nejdřív systém s nižšími nároky.",
      },
      {
        question: "Je bloková periodizace vždy lepší?",
        answer:
          "Ne. Srovnávací výzkum závisí na kontextu. Bloky používej, když potřebuješ koncentraci — ne jako marketingovou jistotu.",
      },
    ],
  },
  "conjugate-strength-system": {
    familyId: "conjugate-strength-system",
    displayName: "Conjugate silový systém",
    tagline:
      "Rotace max-effort a dynamic-effort metod se speciálními cviky pro pokročilé silové sportovce.",
    whoFor: [
      "Pokročilé lifery, kteří zvládnou vysokou neurologickou zátěž",
      "Silové trojbojaře, kteří potřebují variabilitu, aby soutěžní cviky zůstaly zdravé",
      "Sportovce se znalostí koučování kolem speciálních cviků",
    ],
    whoNot: [
      "Začátečníky, kteří si ještě nevydřeli základní techniku dřepu, bench pressu a mrtvého tahu",
      "Lifery hledající jednoduchou lineární šablonu",
      "Kohokoli, kdo se nezregeneruje z častých těžkých pokusů",
    ],
    structure: [
      {
        label: "Ustavení rolí ME / DE",
        weeks: "Týdny 1–4",
        intent: "Nauč se strukturu tréninků max-effort a dynamic-effort.",
      },
      {
        label: "Zaměření na speciální cviky",
        weeks: "Týdny 5–12",
        intent: "Rotuj varianty a zároveň postupuj v absolutní síle.",
      },
      {
        label: "Blok specifičnosti",
        weeks: "Týdny 13–16",
        intent: "Zvyšuj specifičnost soutěžních cviků směrem k testovacímu oknu.",
      },
    ],
    comparisonRows: [
      { feature: "Délka", free: "4 týdny", full: "16 týdnů" },
      { feature: "Struktura ME / DE", free: "Úvodní týdny", full: "Kompletní conjugate cyklus" },
      { feature: "Možnosti rozvrhu", free: "4denní", full: "4denní" },
      { feature: "Knihovna variant", free: "Základní sada", full: "Rozšířené speciální cviky" },
      { feature: "Cena", free: "Zdarma", full: "£69" },
    ],
    faq: [
      {
        question: "Je tohle Westside?",
        answer:
          "Používá logiku ME/DE ve stylu conjugate. Nejde o nárok na privátní programování nebo výsledky žádné konkrétní posilovny.",
      },
      {
        question: "Můžou to absolvovat středně pokročilí?",
        answer:
          "Jen pokud je regenerace a technika už na solidní úrovni. Většině středně pokročilých lépe poslouží nejdřív DUP nebo lineární systémy.",
      },
    ],
  },
  "high-frequency-sbd": {
    familyId: "high-frequency-sbd",
    displayName: "Vysokofrekvenční SBD",
    tagline:
      "Časté vystavení dřepu, bench pressu a mrtvému tahu s cíleným řízením únavy.",
    whoFor: [
      "Středně pokročilé+ silové trojbojaře, kteří se dobře regenerují z častého tréninku",
      "Lifery, kteří potřebují víc technických expozic na soutěžních cvikách",
      "Sportovce, kteří si dokážou ochránit spánek a klouby při vyšší frekvenci",
    ],
    whoNot: [
      "Lifery s nevyřešenou bolestí kloubů zhoršovanou častým SBD tréninkem",
      "Začátečníky, kteří se ještě učí základní polohy",
      "Kohokoli s výrazně omezenou regenerací (práce na směny, vysoký životní stres) bez úpravy objemu",
    ],
    structure: [
      {
        label: "Úvod do frekvence",
        weeks: "Týdny 1–4",
        intent: "Zvyš expozici při zachování mírné intenzity.",
      },
      {
        label: "Hustota zátěže",
        weeks: "Týdny 5–8",
        intent: "Zvyš počet kvalitních sérií během týdne s řízeným RPE.",
      },
      {
        label: "Zaměření na výkon",
        weeks: "Týdny 9–12",
        intent: "Udrž frekvenci, zvyš specifičnost, ořízni zbytečný objem.",
      },
    ],
    comparisonRows: [
      { feature: "Délka", free: "4 týdny", full: "12 týdnů" },
      { feature: "Týdenní expozice", free: "Úvodní frekvence", full: "Kompletní plán s vysokou frekvencí" },
      { feature: "Možnosti rozvrhu", free: "4–6denní", full: "4–6denní" },
      { feature: "Řízení únavy", free: "Startovní pravidla", full: "Kompletní poznámky k autoregulaci" },
      { feature: "Cena", free: "Zdarma", full: "£69" },
    ],
    faq: [
      {
        question: "Znamená vysoká frekvence maxovat každý den?",
        answer:
          "Ne. Frekvence je o hustotě praxe. Většina tréninků zůstává výrazně pod hranicí selhání s jasnými limity RPE.",
      },
      {
        question: "Co když mám jen tři dny?",
        answer:
          "Zvol raději 3denní systém z katalogu. Vtěsnat vysokou frekvenci do málo dnů obvykle selže na regeneraci.",
      },
    ],
  },
  "powerbuilding-hybrid": {
    familyId: "powerbuilding-hybrid",
    displayName: "Powerbuilding hybrid",
    tagline:
      "Hlavní cviky zaměřené na sílu s hypertrofickými doplňky pro lifery, kteří chtějí výkon i svaly.",
    whoFor: [
      "Středně pokročilé, kterým záleží na síle i fyzice ve stejném bloku",
      "Lifery, kteří chtějí těžší základní cviky bez čistě kulturistického objemu",
      "Sportovce se 4–5 tréninkovými dny a solidní regenerací",
    ],
    whoNot: [
      "Soutěžní silové trojbojaře ve striktním vrcholu na závod, kteří potřebují maximální specifičnost",
      "Kulturisty hledající čistě hypertrofickou periodizaci",
      "Začátečníky, kteří ještě potřebují jednoduše zaměřený silový základ",
    ],
    structure: [
      {
        label: "Silový základ",
        weeks: "Týdny 1–4",
        intent: "Ustal progresi hlavních cviků s mírným objemem doplňkových cviků.",
      },
      {
        label: "Hybridní rozvoj",
        weeks: "Týdny 5–12",
        intent: "Postupuj v základních cvicích a rozšiřuj hypertrofické doplňky.",
      },
      {
        label: "Projev",
        weeks: "Týdny 13–16",
        intent: "Otestuj sílu a konsoliduj práci na fyzice bez zbytečných kilometrů.",
      },
    ],
    comparisonRows: [
      { feature: "Délka", free: "4 týdny", full: "16 týdnů" },
      { feature: "Zaměření na hlavní cviky", free: "Úvodní blok", full: "Kompletní cyklus síla + hypertrofie" },
      { feature: "Možnosti rozvrhu", free: "4denní / 5denní", full: "4denní / 5denní" },
      { feature: "Hloubka doplňkových cviků", free: "Základní sada", full: "Kompletní progrese doplňků" },
      { feature: "Cena", free: "Zdarma", full: "£59" },
    ],
    faq: [
      {
        question: "Budu tak silný jako na čistě silovém plánu?",
        answer:
          "Ne nutně. Hybridní plány vyměňují část specifičnosti za doplňky zaměřené na svaly. Vyber podle priority.",
      },
      {
        question: "Stačí bezplatný měsíc na posouzení vhodnosti?",
        answer:
          "Ukáže tvar tréninku a nároky na regeneraci. Kompletní cyklus je tam, kde se progrese síly a hypertrofie skládají.",
      },
    ],
  },
  "complete-method-collection": {
    familyId: "complete-method-collection",
    displayName: "Kompletní kolekce metod",
    tagline:
      "Všech šest kompletních placených programových rodin v jednom startovním balíčku — přepínej systémy podle toho, jak se mění tvé cíle.",
    whoFor: [
      "Lifery, kteří chtějí více systémů bez nutnosti kupovat každý zvlášť",
      "Trenéry budující si osobní referenční knihovnu strukturovaných cyklů",
      "Sportovce, kteří rotují metody v průběhu tréninkových let",
    ],
    whoNot: [
      "Někoho, kdo právě teď potřebuje jen jeden jasný startovní systém",
      "Kupující, kteří čekají šest současně běžících programů najednou",
      "Kohokoli, kdo v rámci ceny balíčku hledá personalizovaný koučing 1:1",
    ],
    structure: [
      {
        label: "Vyber systém",
        weeks: "Start",
        intent: "Vyber jednu rodinu, která odpovídá tvému aktuálnímu cíli a rozvrhu.",
      },
      {
        label: "Absolvuj celý cyklus",
        weeks: "12–16 týdnů",
        intent: "Dokonči jeden program, než přejdeš na další — nekombinuj systémy najednou.",
      },
      {
        label: "Rotuj cíleně",
        weeks: "Později",
        intent: "Měň rodiny, když se změní cíle, regenerace nebo termíny závodů.",
      },
    ],
    comparisonRows: [
      {
        feature: "Zahrnuté programy",
        free: "Použij jednotlivé bezplatné startery",
        full: "Všech 6 placených rodin",
      },
      {
        feature: "Startovní cena",
        free: "Zdarma za starter",
        full: "£199 balíček",
      },
      {
        feature: "Nejlepší pro",
        free: "Testování jedné metody",
        full: "Vlastnictví celého katalogu",
      },
      {
        feature: "Souběžné použití",
        free: "Jeden starter najednou",
        full: "Stále jeden aktivní cyklus najednou",
      },
    ],
    faq: [
      {
        question: "Získám i bezplatné startery?",
        answer:
          "Bezplatné startery zůstávají dostupné v katalogu. Balíček odemyká šest kompletních placených cyklů.",
      },
      {
        question: "Je £199 časově omezená cena?",
        answer:
          "Toto je zveřejněná startovní cena. Na této stránce nepoužíváme countdown časovače ani falešnou nedostatkovost.",
      },
    ],
  },
};

export function getProgramFamilyContentCs(
  familyId: string | null | undefined,
): (Omit<ProgramFamilyContent, "familyId"> & { familyId: string }) | null {
  if (!familyId) return null;
  return PROGRAM_FAMILY_CONTENT_CS[familyId] ?? null;
}
