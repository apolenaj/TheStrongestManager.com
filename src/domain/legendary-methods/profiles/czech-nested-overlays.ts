import type { CzechProfileOverlay } from "@/domain/legendary-methods/profiles/apply-czech";

/**
 * Czech overlays for the nested structured fields (scores, trainingStructure,
 * whyItWorked, whatLiftersGetWrong, exampleWeek, modernAdaptation,
 * relatedProgrammes) of every non-Arnold Legendary Methods profile.
 *
 * Merged onto the base section-body overlays in czech-overlays.ts. English
 * remains canonical for publish/validation — this only drives the `/cs` UI.
 */
export const CZECH_NESTED_OVERLAYS: Record<string, Partial<CzechProfileOverlay>> = {
  "tom-platz-extreme-leg-training": {
    scores: {
      strengthPotential: {
        justification:
          "Těžký dřep na vysoká opakování buduje značnou silovou vytrvalost a pracovní kapacitu, i když to není klasická peakingová metoda pro 1RM.",
      },
      hypertrophyPotential: {
        justification:
          "Kombinace náročných vah s vysokými opakováními vytváří obrovský mechanický a metabolický stimul pro kvadricepsy, když je tělo zregenerované.",
      },
      recoveryDemand: {
        justification:
          "Slavné jednotky jsou regenerační noční můra; opakovat je týdně bez adaptace a podpory je běžná cesta k overreachingu.",
      },
      technicalDifficulty: {
        justification:
          "Udržet hloubku, bracing a dráhu činky při vysokých opakováních pod zátěží je kvalifikovaná práce — kolaps techniky násobí riziko.",
      },
      beginnerSuitability: {
        justification:
          "Začátečníci nemají honit kulturu 30–50 opakování v dřepu; potřebují techniku a postupné zatěžování.",
      },
      advancedSuitability: {
        justification:
          "Pokročilí zdvihači mohou pečlivě periodizovat high-rep dřepové bloky a brát spektakulární série jako vzácné expozice.",
      },
    },
    whatLiftersGetWrong: [
      "Proměnit legendární jednorázový set na dvakrát týdenní programování",
      "Vysoká opakování s nekontrolovanou hloubkou nebo zhrouceným bracingem",
      "Ignorování Platzových vlastních slov o míchání těžkého a vyššího hypertrofického důrazu",
      "Kopírování seznamů asistenčních cviků z nesourcovaných blogů jako evangelia",
      "Podcenění Regenerace po skutečně vysokorepovém těžkém dřepu",
    ],
    trainingStructure: {
      trainingDays:
        "Dny s těžkým důrazem na nohy jsou centrem týdne; zbylé dny musí respektovat zbytkovou únavu",
      exerciseFrequency:
        "Brutální dřepové jednotky bývají popisovány jako relativně řídké; lehčí technika nebo umírněná hypertrofická práce vyplňují mezery",
      volumeDistribution: [
        { label: "Dřep na zádech / primární dřepová práce", share: 45 },
        { label: "Hack squat / leg press (kvadricepsy)", share: 20 },
        { label: "Extenze / zakopávání", share: 20 },
        { label: "Lýtka / ostatní", share: 15 },
      ],
      intensityDistribution: [
        { label: "Náročná váha × vysoká opakování", share: 55 },
        { label: "Umírněné hypertrofické asistence", share: 30 },
        { label: "Lehká technika / regenerační práce", share: 15 },
      ],
      primaryMovements: [
        "Dřep s činkou na zádech",
        "Hack squat nebo varianty leg pressu",
      ],
      accessoryWork: [
        "Extenze na kvadricepsy",
        "Zakopávání (leg curls)",
        "Výpony na lýtka",
      ],
      progressionApproach:
        "Veřejné rámování zdůrazňuje splnění předem daných tvrdých cílů opakování/váhy s plným úsilím; míchejte těžký a vyšší hypertrofický důraz napříč dny",
      recoveryStructure:
        "Rozestupujte extrémní jednotky; berte zbytkovou bolestivost a výkon jako řídící ukazatele",
    },
    whyItWorked: {
      specificity: "Trénink cílil na výjimečný rozvoj kvadricepsů pro fyzickou soutěž.",
      volume:
        "High-rep dřepové série vytvářely obrovský kumulativní objem práce při zachování smysluplné váhy.",
      intensity:
        "Váhy zůstávaly náročné, ne „lehké pumpové“ zátěže, u mnoha slavných výkonů.",
      technicalPractice:
        "Roky praxe dřepu pod únavou zdokonalily signatický pohybový vzorec.",
      athleteExperience:
        "Extrémní jednotky stály na dlouhé základně — ne na experimentu nováčka.",
      bodyweight: "Závodní fyzická hmotnost podporovala tréninkový cíl svalnatých nohou.",
      recovery:
        "Tvrdé jednotky implikují velké regenerační investice mezi brutálními expozicemi.",
      sportDemands: "Kulturistika odměňovala vizuální výsledek této specializované práce.",
      longTermAdaptation: "Slavné série byly vrcholy dlouhého procesu, ne proces sám.",
    },
    exampleWeek: {
      title: "Modernizovaný kontrast hard/easy pro spodní polovinu těla (ne rutina atleta)",
      disclaimer:
        "Originální ilustrace The Strongest. Není to přesný program Toma Platze ani rekonstrukce žádné jednotlivé virální jednotky jako týdenního zákona.",
      days: [
        {
          dayLabel: "Den 1",
          focus: "Tvrdý dřepový důraz (náročná váha, vyšší opakování)",
          notes:
            "Příkladová cílová zóna: několik kvalitních sérií v tvrdém, ale kontrolovaném high-rep pásmu — zastavte před technickým kolapsem",
        },
        {
          dayLabel: "Den 2",
          focus: "Horní polovina těla",
          notes: "Udržte systémovou únavu zvládnutelnou",
        },
        {
          dayLabel: "Den 3",
          focus: "Lehká regenerace nohou / technika",
          notes: "Lehký hinge nebo kolo; mobilita; žádné ego loading",
        },
        {
          dayLabel: "Den 4",
          focus: "Horní polovina těla",
          notes: "Standardní hypertrofická práce",
        },
        {
          dayLabel: "Den 5",
          focus: "Umírněné asistence na kvadricepsy",
          notes: "Extenze/press varianty; nechte opakování v rezervě",
        },
        {
          dayLabel: "Den 6–7",
          focus: "Odpočinek nebo lehká kondice",
          notes:
            "Pokud byl Den 1 skutečně tvrdý, nepřidávejte tento týden další maximální spodní jednotku",
        },
      ],
    },
    modernAdaptation: {
      summary:
        "Půjčte si Platzův respekt k tvrdému, vysokorepovému zatížení a psychologickému chunkování, zatímco programujete opakovatelnou týdenní práci a karanténujete spektakulární série.",
      beginnerAdjustment:
        "Naučte se hloubku dřepu a bracing na submaximálních sériích 5–10; žádné testy nad 30 opakování.",
      intermediateAdjustment:
        "Jeden týdenní tvrdý dřepový den v sousedství 10–20 opakování s kontrolovaným RPE; asistence umírněné.",
      advancedAdjustment:
        "Krátké bloky s top sety ve vyšších opakováních při náročných váhách; používejte chunking psychologicky; rozestupujte tvrdé dny 7–14 dní, jak roste brutalita.",
      recommendedFrequency:
        "1 tvrdá spodní jednotka týdně pro většinu; pokročilí mohou přidat lehký technický den",
      recoveryControls: [
        "Safety pins / kompetentní spotting v tvrdých dnech",
        "Zastavte série, když degraduje hloubka nebo bracing",
        "Extra lehké dny po průlomových high-rep výkonech",
        "Sledujte symptomy kolen/kyčlí a snižte dávku brzy",
      ],
      progressionRules: [
        "Zvyšujte váhu, jen když jsou všechna cílová opakování čistá",
        "Progresujte cíl opakování před váhou při budování high-rep kapacity",
        "Držte extrémní testovací dny vzácné a naplánované",
      ],
      whenToReduceVolume:
        "Přetrvávající bolest kolen, bederní únava, nebo druhá tvrdá jednotka, která se nestihne zregenerovat před dalším týdnem",
      whoShouldAvoid: [
        "Začátečníci",
        "Zdvihači s nevyřešenými zraněními spodní poloviny těla",
        "Atleti v těžkém silovém peaking cyklu",
      ],
    },
    relatedProgrammes: [
      {
        title: "Blok extrémního rozvoje nohou",
        relationship:
          "Originální program The Strongest aplikující příbuzný důraz na hypertrofii spodní poloviny těla bez jmenování atleta",
      },
    ],
  },

  "ronnie-coleman-heavy-high-volume-training": {
    scores: {
      strengthPotential: {
        justification:
          "Coleman je široce dokumentován jako výjimečně silný na kulturistu; těžké compoundy na opakování budují seriózní silovou kapacitu.",
      },
      hypertrophyPotential: {
        justification:
          "Vysoké objemy na jednotku na základních pohybech plus asistence vytvářejí velký hypertrofický stimul při zregenerování.",
      },
      recoveryDemand: {
        justification:
          "Těžké compoundy plus vysoké objemy vytvářejí obrovský systémový a kloubní stres; regenerační kapacita se stává limiterem.",
      },
      technicalDifficulty: {
        justification:
          "Pohyby jsou základní, ale bezpečné provedení při colemanovsky vysokém relativním úsilí vyžaduje pokročilou dovednost a disciplínu.",
      },
      beginnerSuitability: {
        justification:
          "Kopírování dokumentárních vah nebo objemů začátečníky je jedním z nejhorších failure módů v populární kulturistice.",
      },
      advancedSuitability: {
        justification:
          "Pokročilí atleti mohou přijmout compound-first kulturistiku s vysokým úsilím — pečlivě dávkovanou a škálovanou.",
      },
    },
    whatLiftersGetWrong: [
      "Kopírování dokumentárních vah bez progresivní základny",
      "Zaměňování nafilmovaných jednotek za kompletní roční periodizovaný plán",
      "Proměna každé série v ošklivý grind",
      "Ignorování Regenerace při přidávání Objemu",
      "Braní asistencí jako volitelných po maximálních compoundech",
    ],
    trainingStructure: {
      trainingDays:
        "Vícedenní body-part split napříč týdnem (přesné názvy dnů se liší podle zdroje/roku)",
      exerciseFrequency:
        "Každá hlavní partie typicky jednou nebo dvakrát týdně podle popsané varianty splitu; compoundy se opakují napříč mezocykly",
      volumeDistribution: [
        { label: "Primární free-weight compoundy", share: 50 },
        { label: "Sekundární compoundy", share: 25 },
        { label: "Izolační asistence", share: 25 },
      ],
      intensityDistribution: [
        { label: "Těžké compoundy na vyšší opakování", share: 60 },
        { label: "Umírněné asistence", share: 30 },
        { label: "Lehká technika / warm-up práce", share: 10 },
      ],
      primaryMovements: [
        "Varianty Dřepu",
        "Mrtvý tah / těžká hinge práce",
        "Bench press a tlaky nad hlavu",
        "Přítahy a varianty shybů/kladky",
      ],
      accessoryWork: [
        "Jednoručkové tlaky a upažování",
        "Extenze/zakopávání jako výplň",
        "Izolace na paže",
        "Detailní práce na zadní delty a horní záda",
      ],
      progressionApproach:
        "Veřejné účty zdůrazňují Progresivní přetížení na stejných základních zdvizích napříč lety — ne novinku pro novinku samotnou",
      recoveryStructure:
        "Vysoce únavové dny vyžadují silnou podporu spánku/výživy a ochotu zpomalit, když technika upadá",
    },
    whyItWorked: {
      specificity: "Trénink cílil extrémní svalovou velikost pro kritéria Olympie.",
      volume:
        "Velké objemy na jednotku na compoundech a asistencích nasčítaly obrovské týdenní napětí.",
      intensity:
        "Absolutní váhy byly výjimečné pro kulturistiku a zvyšovaly mechanické napětí na opakování.",
      technicalPractice:
        "Roky opakování stejných základů pod vysokým úsilím budovaly dovednost a toleranci.",
      athleteExperience:
        "Elitní silová základna a dlouhý náběh předcházely slavným nafilmovaným jednotkám.",
      bodyweight: "Vysoké tělesné hmotnosti podporovaly velké absolutní zatížení na compoundech.",
      recovery:
        "Lifestyle a kultura tréninkových partnerů podporovaly brutální jednotky víc než rekreační rozvrhy.",
      sportDemands: "Sport odměňoval velikost a dominanci na pódiu.",
      longTermAdaptation: "Dokumenty ukazují vrcholy dlouhého procesu, ne celý proces.",
    },
    exampleWeek: {
      title: "Modernizovaná ilustrace compound-first splitu (ne rutina atleta)",
      disclaimer:
        "Originální příklad The Strongest inspirovaný veřejně popsanou logikou splitu. Není to přesný program Ronnieho Colemana ani přepis dokumentárního footage.",
      days: [
        {
          dayLabel: "Den 1",
          focus: "Důraz na prsa — tlakové compoundy + asistence",
          notes:
            "Tvrdé série v kontrolovaném hypertrofickém pásmu opakování; nechte technická opakování v rezervě",
        },
        {
          dayLabel: "Den 2",
          focus: "Tloušťka zad / hinge-row důraz",
          notes: "Prioritizujte přítahy a hinge vzorce; řiďte bederní únavu",
        },
        {
          dayLabel: "Den 3",
          focus: "Ramena",
          notes: "Tlaky + upažování; nenechte tlakovou práci sklouznout k maximálním singlům",
        },
        {
          dayLabel: "Den 4",
          focus: "Nohy — dřepový vzorec + zadní asistence",
          notes: "Kvalitní hloubka a bracing místo cosplaye váhy",
        },
        {
          dayLabel: "Den 5",
          focus: "Paže / asistence na slabá místa",
          notes: "Umírněný Objem; zregenerujte se na compoundy příští týden",
        },
        {
          dayLabel: "Den 6–7",
          focus: "Odpočinek nebo lehká kondice",
          notes: "Pokud se hromadí kloubní stres, deloadujte váhy o 40–50 % na týden",
        },
      ],
    },
    modernAdaptation: {
      summary:
        "Držte compound-first kulturistiku, Progresivní přetížení a tvrdé tréninkové standardy — při škálování vah na techniku a ochraně Regenerace.",
      beginnerAdjustment:
        "Celotělový nebo upper/lower; naučte se dřep/hinge/tlak/přítah; žádné maximální ego loading.",
      intermediateAdjustment:
        "4–5denní split; 10–16 tvrdých sérií na sval týdně; compoundy první; dvojciferná opakování na RPE 7–9.",
      advancedAdjustment:
        "Vyšší objemy na jednotku v krátkých blocích; střídejte varianty důrazu; plánované deloady; nikdy nehoňte dokumentární čísla.",
      recommendedFrequency: "4–6 tréninkových dnů týdně podle Regenerace",
      recoveryControls: [
        "Zastavte série před technickým selháním na těžkých compoundech",
        "Střídejte stance/úchop napříč mezocykly",
        "Naplánujte deloady každých 4–6 tvrdých týdnů",
        "Sledujte ranní připravenost a zpomalte brzy",
      ],
      progressionRules: [
        "Přidejte váhu, když jsou cílová opakování čistá napříč předepsanými sériemi",
        "Progresujte asistence, až jsou compoundy stabilní",
        "Snižte Objem před snížením Frekvence při overreachingu",
      ],
      whenToReduceVolume:
        "Kloubní bolest, kolaps rychlosti osy napříč jednotkami, nebo narušení spánku trvající víc než pár dní",
      whoShouldAvoid: [
        "Začátečníci",
        "Zdvihači s nespravovanými zraněními páteře nebo kolen",
        "Kdokoliv v agresivním kalorickém deficitu bez podpory Regenerace",
      ],
    },
    relatedProgrammes: [
      {
        title: "Těžký vysokoobjemový kulturistický trénink",
        relationship:
          "Originální program The Strongest aplikující příbuzné compound-first hypertrofické principy bez jmenování atleta",
      },
    ],
  },

  "eddie-hall-500kg-deadlift": {
    scores: {
      strengthPotential: {
        justification:
          "Přímo cílí na maximální výkon v mrtvém tahu; principy mají vysoký přenos pro absolutní tahovou sílu, když jsou poctivě dávkované.",
      },
      hypertrophyPotential: {
        justification:
          "Těžké tahání a podpora zadního řetězce mohou růst tkáň, ale veřejný příběh metody je peaking jednoho zdvihu, ne vyvážená Hypertrofie.",
      },
      recoveryDemand: {
        justification:
          "Elitní absolutní váhy, velká tělesná hmotnost a souběžné strongman eventy vytvářejí regenerační náklady, které rekreační zdvihači nemohou bezpečně splnit.",
      },
      technicalDifficulty: {
        justification:
          "Vyžaduje kompetentní dovednost mrtvého tahu, bracing a disciplinovaný management speed/heavy vlny pod vysokým psychologickým arousalem.",
      },
      beginnerSuitability: {
        justification:
          "Začátečníci potřebují mistrovství vzorce a skromné váhy; kopírování peak-prep idejí je nebezpečné a neproduktivní.",
      },
      advancedSuitability: {
        justification:
          "Pokročilí tahouni si mohou půjčit alternaci speed/heavy, first-pull důraz a peaking logiku bez importu celebrity dávek.",
      },
    },
    whatLiftersGetWrong: [
      "Braní 500 kg jako týdenního tréninkového cíle",
      "Kopírování elitní tělesné hmotnosti nebo reportovaného velmi vysokého kalorického příjmu",
      "Maxování každý týden bez kontrastu heavy/speed",
      "Ignorování souběžné únavy ze strongman eventů v originálním kontextu",
      "Tvrzení, že blogová tabulka je Hallův přesný proprietární program",
      "Imitace extrémních psychologických arousal strategií bez koučovacích pojistek",
    ],
    trainingStructure: {
      trainingDays:
        "Interview rámování: zhruba týdenní důraz na mrtvý tah se střídáním těžkých a speed týdnů; ostatní strongman jednotky pokračovaly",
      exerciseFrequency:
        "Mrtvý tah jednou týdně v dokumentovaném účtu; práce zadního řetězce a eventů vyplňovala zbylý stres",
      volumeDistribution: [
        { label: "Primární mrtvý tah / first-pull důraz", share: 40 },
        { label: "Podpora horních zad / zadního řetězce", share: 25 },
        { label: "Podpora leg-drive (např. leg press)", share: 15 },
        { label: "Strongman eventy / ostatní", share: 20 },
      ],
      intensityDistribution: [
        { label: "Těžké overload týdny", share: 45 },
        { label: "Speed / lehčí intent týdny", share: 35 },
        { label: "Praxe eventů a asistence", share: 20 },
      ],
      primaryMovements: [
        "Konvenční mrtvý tah (kontext strongman pravidel)",
        "Floor-to-knee speed tahy (dle interview)",
      ],
      accessoryWork: [
        "Přítahy horních zad / varianty tažení",
        "Leg press nebo podobná podpora leg-drive (tvrzení atleta)",
        "Praxe strongman eventů jako souběžný nárok",
      ],
      progressionApproach:
        "Budování k plánovanému rychlému submaximálnímu ukazateli (interview: ~450 kg rychle), poté taper/regenerace do pokusu",
      recoveryStructure:
        "Střídejte stresové těžké týdny s lehčími speed týdny; spánek, fyzioterapie a vysoká energetická dostupnost byly součástí elitní kampaně — ne rekreační cíle",
    },
    whyItWorked: {
      specificity:
        "Trénink a peaking cílily maximální konvenční mrtvý tah pod výstrojovými normami strongman pravidel závodu.",
      volume:
        "Počty sérií mrtvého tahu zůstaly relativně zaměřené; stres pocházel z absolutní váhy a souběžných eventů víc než z nekonečných seznamů variant.",
      intensity:
        "Těžké týdny a pozdní peaking singlee vytvářely vysoký nervový a mechanický nárok; speed týdny udržovaly intent za nižší cenu.",
      technicalPractice:
        "Opakovaná praxe first-pull rychlosti a rock-in setup cues zdokonalily start zdvihu pod intentem.",
      athleteExperience:
        "Předchozí progrese rekordů a roky strongman tahání vytvořily náběh pro historický pokus.",
      bodyweight:
        "Vrcholová strongman tělesná hmotnost podporovala absolutní silový projev; toto není šablona pro normální zdvihače.",
      recovery:
        "Spánek, fyzioterapie a velmi vysoký příjem jídla byly součástí toho, co dělalo extrémní stres produktivním na elitní úrovni.",
      sportDemands:
        "Šampionátní formát odměňoval jeden historický tah uvnitř contested strongman show.",
      longTermAdaptation:
        "Výsledek 500 kg odrážel akumulovanou adaptaci a selekci, ne náhle zkopírovatelné PDF programu.",
    },
    exampleWeek: {
      title: "Modernizovaná ilustrace peakingu mrtvého tahu (ne rutina atleta)",
      disclaimer:
        "Originální příklad The Strongest pro intermediate-to-advanced tahouna. Není to program Eddieho Halla a není to cesta k 500 kg. Škálujte všechny váhy na technickou kvalitu.",
      days: [
        {
          dayLabel: "Den 1",
          focus: "Těžký důraz na mrtvý tah",
          notes:
            "Vypracujte se ke 2–4 tvrdým sériím dobře pod selháním (např. dvojice/trojice); zastavte, pokud umře rychlost osy",
        },
        {
          dayLabel: "Den 2",
          focus: "Horní záda + lehká kondice",
          notes: "Přítahy/kladky; udržte bedra svěží",
        },
        {
          dayLabel: "Den 3",
          focus: "Odpočinek nebo mobilita",
          notes: "Spánek a jídlo před přidáním stresu",
        },
        {
          dayLabel: "Den 4",
          focus: "Speed / technický hinge den",
          notes:
            "Lehčí konvenční tahy nebo pauzované first-pull dríly; explozivní intent, čistá forma",
        },
        {
          dayLabel: "Den 5",
          focus: "Dřepový vzorec + asistence",
          notes: "Umírněná intenzita; volitelná podpora leg pressu",
        },
        {
          dayLabel: "Den 6",
          focus: "Volitelná praxe eventu nebo carry (pokročilí)",
          notes: "Držte Objem nízký během peakingu mrtvého tahu",
        },
        {
          dayLabel: "Den 7",
          focus: "Odpočinek",
          notes: "Deloadujte každých 3–5 tvrdých týdnů, pokud výkon stagnuje",
        },
      ],
    },
    modernAdaptation: {
      summary:
        "Držte specificitu, kontrast heavy/speed, kvalitu first-pull a plánovaný peaking — zahoďte elitní absolutní váhy, cosplay tělesné hmotnosti a mýty proprietárního programu.",
      beginnerAdjustment:
        "3 dny týdně celotělově; naučte se hinge vzorec; žádné maximální singlee; budujte konzistenci měsíce nejdřív.",
      intermediateAdjustment:
        "Jeden těžký den mrtvého tahu + jeden lehčí speed/technický den týdně; většina top setů na RPE 7–8; sledujte peaking ukazatel 2–4 týdny předem.",
      advancedAdjustment:
        "Krátké peaking bloky s omezenými těžkými singly; volitelný floor-to-knee speed důraz; souběžný sportovní stres pečlivě rozpočtovaný; nikdy nehoňte dokumentární čísla.",
      recommendedFrequency: "1–2 hinge expozice týdně podle Regenerace a sportovního rozvrhu",
      recoveryControls: [
        "Střídejte stresové těžké dny s lehčími speed/technickými dny",
        "Omezte skutečné maximální pokusy",
        "Snižte Objem eventů během peakingu mrtvého tahu",
        "Prioritizujte spánek před přidáním váhy",
      ],
      progressionRules: [
        "Zvyšujte váhu, jen když zůstává rychlost osy a kvalita lockoutu čistá",
        "Používejte plánovaný submaximální speed/heavy ukazatel před peaking pokusem",
        "Deloadujte, když se warm-up váhy cítí nepřiměřeně těžké 7–10 dní",
      ],
      whenToReduceVolume:
        "Přetrvávající ztráta rychlosti osy, rostoucí podráždění zad, špatný spánek, nebo kolaps souběžných sportovních výkonů",
      whoShouldAvoid: [
        "Začátečníci",
        "Zdvihači s nespravovanou bolestí zad",
        "Kdokoliv se snaží párovat elitní tělesnou hmotnost nebo kalorická tvrzení",
      ],
    },
    relatedProgrammes: [
      {
        title: "Lineární budování síly",
        relationship:
          "Nezávislý program The Strongest aplikující principy Progresivního přetížení a peakingu — ne plán vytvořený nebo schválený atletem",
        conversionPrompt: "Máte zájem o principy elitního peakingu mrtvého tahu?",
      },
    ],
  },

  "hafthor-bjornsson-strongman-strength": {
    scores: {
      strengthPotential: {
        justification:
          "Kariéra zahrnuje sílu na úrovni WSM a několik datovaných světově elitních výkonů v mrtvém tahu pod strongman normami.",
      },
      hypertrophyPotential: {
        justification:
          "Velké absolutní zatížení může růst tkáň, ale veřejný důraz je na výkonnostní výsledky napříč sporty, ne na hypertrofické programování.",
      },
      recoveryDemand: {
        justification:
          "Hustota eventů, maximální tahy a fáze velké tělesné hmotnosti vytvářejí extrémní regenerační nároky.",
      },
      technicalDifficulty: {
        justification:
          "Strongman nářadí plus měnící se ruleset (straps/suit vs raw powerlifting povely) zvyšují obtížnost dovednosti a plánování.",
      },
      beginnerSuitability: {
        justification:
          "Začátečníci potřebují obecné silové základy; elitní vícefázové kariéry jsou špatné copy cíle.",
      },
      advancedSuitability: {
        justification:
          "Pokročilí atleti si mohou půjčit logiku periodizace: sladit trénink s sportovním cílem aktuálního bloku, ne s highlight reelem.",
      },
    },
    whatLiftersGetWrong: [
      "Braní jedné kariérní fáze jako permanentního programu",
      "Kopírování rekordních vah mrtvého tahu z footage",
      "Ztotožňování strapped strongman tahů s raw powerliftingovým mrtvým tahem",
      "Ignorování rozdílů v Kondiční přípravě mezi strongman a powerliftingovou přípravou",
      "Vynechávání dat u časově citlivých tvrzení o aktivním atletovi",
    ],
    trainingStructure: {
      trainingDays:
        "Podle periody: husté multi-event strongman týdny v kontestových sezonách; specializovanější silové týdny v projektech mrtvého tahu nebo Silového trojboje",
      exerciseFrequency:
        "Eventy a support zdvihy se objevují vícekrát týdně ve strongman přípravě; specializované peaky zužují důraz",
      volumeDistribution: [
        { label: "Primární silové zdvihy (dřep/tlak/hinge)", share: 35 },
        { label: "Praxe eventů / nářadí (strongman fáze)", share: 30 },
        { label: "Sekundární silová podpora", share: 20 },
        { label: "Kondiční / regenerační práce", share: 15 },
      ],
      intensityDistribution: [
        { label: "Těžké silové expozice", share: 40 },
        { label: "Event-speed / dovednostní úsilí", share: 35 },
        { label: "Lehká technika / regenerace", share: 25 },
      ],
      primaryMovements: [
        "Varianty mrtvého tahu vhodné pro ruleset bloku",
        "Podpora dřepového vzorce",
        "Podpora tlaků nad hlavu pro strongman fáze",
      ],
      accessoryWork: [
        "Asistence horních zad a zadního řetězce",
        "Varianty nošení a loadingu ve strongman blocích",
        "Bench-zaměřená práce v powerliftingových blocích",
      ],
      progressionApproach:
        "Progresujte kvality, které vyhrávají příští datovaný cíl; změňte menu, když se změní sportovní cíl",
      recoveryStructure:
        "Peakujte méně často, než naznačují sociální sítě; chraňte spánek a snižte nespecifickou únavu před rekordními nebo závodními dny",
    },
    whyItWorked: {
      specificity:
        "Každý velký úspěch odpovídal nárokům sportovního cíle dané periody (WSM eventy, specializovaný mrtvý tah, nebo povely Silového trojboje).",
      volume:
        "Kontestové sezony rozkládají tvrdou práci napříč eventy; specializované peaky koncentrují kvalitní expozice.",
      intensity:
        "Maximální úsilí je použito jako checkpoint uvnitř delší adaptace, ne jako denní identita.",
      technicalPractice:
        "Roky praxe s nářadím a činkou pod únavou budovaly spolehlivou dovednost při absolutních váhách.",
      athleteExperience:
        "Dlouhá mezinárodní kariéra vytvořila náběh pro pozdější specializační projekty.",
      bodyweight:
        "Fáze s vyšší hmotností podporovaly historickou absolutní sílu; fáze s nižší hmotností měnily souhrny a atletické trade-offy.",
      recovery:
        "Elitní podpora, čas a plánované peaky dělaly extrémní stres produktivním v krátkých oknech.",
      sportDemands:
        "Strongman vítězství a rekordní mrtvé tahy odměňují jiné týdenní struktury než čistý souhrn Silového trojboje.",
      longTermAdaptation:
        "Kariérní dlouhověkost a změny fází záleží víc než jakákoli jednotlivá virální jednotka.",
    },
    exampleWeek: {
      title: "Modernizovaná ilustrace síla-plus-atleticismus (ne rutina atleta)",
      disclaimer:
        "Originální příklad The Strongest pro pokročilého intermediate. Není to program Hafþóra Björnssona a není to šablona rekordního pokusu. Škálujte všechny váhy na technickou kvalitu.",
      days: [
        {
          dayLabel: "Den 1",
          focus: "Těžký hinge + horní záda",
          notes: "Varianta mrtvého tahu na RPE 7–8; přítahy; zastavte před kolapsem formy",
        },
        {
          dayLabel: "Den 2",
          focus: "Tlaková síla + lehký carry",
          notes:
            "Důraz na tlak nad hlavu nebo bench podle cíle bloku; krátké farmer nebo suitcase carries",
        },
        {
          dayLabel: "Den 3",
          focus: "Odpočinek nebo mobilita",
          notes: "Chraňte spánek",
        },
        {
          dayLabel: "Den 4",
          focus: "Dřepový vzorec + zadní asistence",
          notes: "Umírněná intenzita; udržte zotavitelný Objem",
        },
        {
          dayLabel: "Den 5",
          focus: "Dovednost eventu nebo speed tahy (pokročilí)",
          notes: "Nízkoobjemová praxe nářadí nebo lehčí speed mrtvé tahy — ne maximální pokusy",
        },
        {
          dayLabel: "Den 6",
          focus: "Volitelná kondice",
          notes: "Krátké tvrdé intervaly jen když zregenerováni; přeskočte blízko peaku",
        },
        {
          dayLabel: "Den 7",
          focus: "Odpočinek",
          notes: "Deloadujte každých 3–5 tvrdých týdnů",
        },
      ],
    },
    modernAdaptation: {
      summary:
        "Sladťe trénink s datovaným cílem bloku — strongman atleticismus, peak mrtvého tahu, nebo souhrn Silového trojboje — a odmítněte import elitních absolutních vah nebo cosplay tělesné hmotnosti.",
      beginnerAdjustment:
        "Celotělová síla 3 dny týdně; naučte se dřep/hinge/tlak; žádné maxy s nářadím; budujte pracovní kapacitu pomalu.",
      intermediateAdjustment:
        "4denní silová šablona s jedním volitelným dnem dovednosti eventu; držte top sety submaximální; 8–12týdenní cílové bloky.",
      advancedAdjustment:
        "Krátké specializační peaky s plánovanými deloady; střídejte fáze širokého atleticismu a úzké silové fáze; nikdy nehoňte dokumentární váhy.",
      recommendedFrequency:
        "3–5 tréninkových dnů týdně podle Regenerace a sportovního rozvrhu",
      recoveryControls: [
        "Jeden primární cíl na blok",
        "Snižte nespecifickou kondici blízko peaků",
        "Omezte maximální pokusy",
        "Sledujte změny tělesné hmotnosti jako trade-offy, ne morální skóre",
      ],
      progressionRules: [
        "Progresujte zdvihy/eventy, které rozhodují o příštím cíli",
        "Změňte výstrojová očekávání, když se změní ruleset",
        "Deloadujte, když výkon napříč dvěma klíčovými jednotkami klesá",
      ],
      whenToReduceVolume:
        "Přetrvávající pokles síly, rostoucí kloubní podráždění, špatný spánek, nebo kolaps dovednosti eventu pod únavou",
      whoShouldAvoid: [
        "Začátečníci",
        "Zdvihači bez regenerační kapacity pro vysoce únavový trénink",
        "Kdokoliv kopírující váhy z rekordních pokusů",
      ],
    },
    relatedProgrammes: [
      {
        title: "Hybrid síly a atleticismu",
        relationship:
          "Originální program The Strongest aplikující příbuzné principy maximální síly a atletické podpory bez jmenování atleta",
      },
    ],
  },

  "colton-engelbrecht-superheavyweight-powerlifting": {
    scores: {
      strengthPotential: {
        justification:
          "Závodně datované výkony ho řadí mezi nejvyšší absolutní souhrny a mrtvé tahy v historii raw Silového trojboje.",
      },
      hypertrophyPotential: {
        justification:
          "Vyšší-rep základové bloky mohou růst tkáň, ale veřejné zaměření na výsledek je závodní souhrn, ne programování fyzična.",
      },
      recoveryDemand: {
        justification:
          "Elitní absolutní váhy a dlouhé peaking cykly vytvářejí regenerační náklady, které rekreační zdvihači nemohou bezpečně splnit.",
      },
      technicalDifficulty: {
        justification:
          "Vyžaduje stabilní závodní techniku napříč třemi zdvihy plus pečlivou gramotnost vybavení/pravidel.",
      },
      beginnerSuitability: {
        justification:
          "Začátečníci potřebují mistrovství vzorce a skromné váhy; elitní cosplay absolutní síly je kontraproduktivní.",
      },
      advancedSuitability: {
        justification:
          "Pokročilí zdvihači si mohou půjčit periodizovanou logiku základ-k-peaku a disciplínu meet prep bez kopírování vah.",
      },
    },
    whatLiftersGetWrong: [
      "Lepení gym čísel vedle závodních souhrnů bez štítků",
      "Ignorování rozdílu wraps versus sleeves",
      "Braní strapped exhibition tahů jako raw plného Mrtvého tahu",
      "Vymýšlení týdenní rutiny z jedné podcast anekdoty",
      "Speculace o dopingu, zdravotním stavu nebo privátních koučovacích systémech",
    ],
    trainingStructure: {
      trainingDays:
        "Interview reportovaný weekday split podle hlavních zdvihů; přesné proprietární kalendáře nepublikované",
      exerciseFrequency:
        "Veřejné účty naznačují dedikovaný týdenní důraz na Dřep/Bench press/Mrtvý tah spíš než denní maxování",
      volumeDistribution: [
        { label: "Závodní dřepová práce", share: 30 },
        { label: "Závodní práce na Bench press", share: 25 },
        { label: "Závodní práce na Mrtvý tah", share: 30 },
        { label: "Asistence / ostatní", share: 15 },
      ],
      intensityDistribution: [
        { label: "Základové / vyšší-rep bloky", share: 40 },
        { label: "Silová / těžká práce", share: 40 },
        { label: "Peak singlee / týden závodu", share: 20 },
      ],
      primaryMovements: [
        "Závodní Dřep",
        "Závodní Bench press",
        "Závodní Mrtvý tah (často sumo ve veřejném footage/závodech)",
      ],
      accessoryWork: [
        "Lokální asistence jako sekundární stimul (interview zmiňují zakopávání/extenze)",
        "Podpora horních zad dle potřeby",
      ],
      progressionApproach:
        "Budujte základ vyšší-rep bloky na hlavních zdvizích, pak zvedejte intenzitu k závodně datovaným singlům",
      recoveryStructure:
        "Delší rozestupy mezi některými velkými závody diskutované veřejně; spánek/jídlo jsou nesmlouvatelné při elitních absolutních váhách",
    },
    whyItWorked: {
      specificity:
        "Trénink a peaking cílí tři závodní zdvihy pod deklarovanými výstrojovými pravidly.",
      volume:
        "Vyšší-rep základové bloky vytvářejí poziční a tkáňovou kapacitu před peakingem.",
      intensity:
        "Závodní výkony ukazují ochotu jít do blízko-maximálních pokusů, když je atlet připraven.",
      technicalPractice: "Roky závodní praxe zdokonalily povely a konzistenci sumo/tahu.",
      athleteExperience:
        "Doložená závodní historie od roku 2019 ukazuje progresivní růst souhrnu.",
      bodyweight:
        "Závodní tělesné hmotnosti v pásmu ~120–125+ kg podporují absolutní sílu bez vyžadování klasické unlimited SHW hmoty — stále daleko nad většinou rekreačních zdvihačů.",
      recovery:
        "Elitní regenerační zdroje a plánovaný rozestup závodů podporují vysoký absolutní stres.",
      sportDemands:
        "Honba za all-time souhrnem odměňuje výkon v plném závodě, ne izolované gym divadlo.",
      longTermAdaptation: "Landmark souhrny 2025–2026 sedí na víceleté zaznamenané progresi.",
    },
    exampleWeek: {
      title: "Modernizovaná ilustrace absolutní síly (ne rutina atleta)",
      disclaimer:
        "Originální příklad The Strongest pro intermediate-to-advanced silového trojbojaře. Není to program Coltona Engelbrechta. Škálujte všechny váhy na technickou kvalitu.",
      days: [
        {
          dayLabel: "Den 1",
          focus: "Důraz na Dřep",
          notes: "Vypracujte se k tvrdým sériím na RPE 7–8; volitelný lehký technický Objem",
        },
        {
          dayLabel: "Den 2",
          focus: "Důraz na Bench press",
          notes: "Závodní styl Bench pressu + skromné asistence",
        },
        {
          dayLabel: "Den 3",
          focus: "Odpočinek nebo lehká mobilita",
          notes: "Chraňte spánek",
        },
        {
          dayLabel: "Den 4",
          focus: "Důraz na Mrtvý tah",
          notes: "Praxe závodního stance; zastavte, když umře rychlost",
        },
        {
          dayLabel: "Den 5",
          focus: "Sekundární horní / záda",
          notes: "Přítahy a lehké tlakové varianty; udržte zotavitelné",
        },
        {
          dayLabel: "Den 6–7",
          focus: "Odpočinek",
          notes: "Deloadujte každých 3–5 tvrdých týdnů",
        },
      ],
    },
    modernAdaptation: {
      summary:
        "Držte specificitu tří zdvihů, logiku základ-k-peaku a gramotnost vybavení — zahoďte elitní absolutní váhy a mýty proprietárního programu.",
      beginnerAdjustment:
        "Celotělově nebo upper/lower 3 dny týdně; naučte se povely; žádné maximální singlee; budujte konzistenci měsíce.",
      intermediateAdjustment:
        "4 dny týdně s jednou tvrdou expozicí na hlavní zdvih; vyšší-rep technické bloky brzy v cyklech; top sety na RPE 7–8.",
      advancedAdjustment:
        "Delší mezocykly; pečlivý peaking; sledujte jen závodně datovaný progres pro tvrzení „PR“; nikdy nehoňte databázové absolutní váhy.",
      recommendedFrequency: "3–5 dnů týdně podle Regenerace",
      recoveryControls: [
        "Omezte skutečné maximální pokusy",
        "Oddělte přípravu na plný závod od exhibition ego tahů",
        "Deloadujte, když rychlost osy padá 7–10 dní",
        "Prioritizujte spánek a jídlo před přidáním Objemu",
      ],
      progressionRules: [
        "Přidejte váhu, když technika zůstává čistá napříč plánovanými sériemi",
        "Zvyšujte intenzitu, až jsou základové bloky zvládnuté",
        "Zaznamenávejte vybavení a federaci s každým tvrzením o závodě",
      ],
      whenToReduceVolume:
        "Přetrvávající pokles síly, rostoucí kloubní podráždění, nebo špatný spánek napříč dvěma tvrdými jednotkami",
      whoShouldAvoid: [
        "Začátečníci",
        "Zdvihači bez regenerační kapacity pro vysoké absolutní zatížení",
        "Kdokoliv kopírující maxy ze sociálních sítí",
      ],
    },
    relatedProgrammes: [
      {
        title: "Budovatel absolutní síly souhrnu",
        relationship:
          "Originální program The Strongest aplikující příbuzné principy budování souhrnu a peakingu bez jmenování atleta",
      },
    ],
  },

  "john-haack-relative-strength": {
    scores: {
      strengthPotential: {
        justification:
          "Závodně datované třídové souhrny a vítězné výkony IPF classic demonstrují elitní silový projev; absolutní váhy jsou záměrně nižší než u SHW specialistů.",
      },
      hypertrophyPotential: {
        justification:
          "Trénink podporuje sval potřebný pro sílu, ale veřejné cíle jsou závodní souhrny a výkon ve třídě, ne hypertrofické programování.",
      },
      recoveryDemand: {
        justification:
          "Pětidenní Frekvence závodních zdvihů zvyšuje nároky na management únavy, i když tělesná hmotnost je typicky daleko pod unlimited SHW.",
      },
      technicalDifficulty: {
        justification:
          "Vyžaduje efektivní techniku a federací-gramotný peaking napříč IPF-style a multi-fed raw rulesety.",
      },
      beginnerSuitability: {
        justification:
          "Začátečníci potřebují nižší Frekvenci a jednodušší progrese před přijetím elitních rozvrhů Relativní síly.",
      },
      advancedSuitability: {
        justification:
          "Pokročilí zdvihači si mohou půjčit Frekvenci, kontrasty heavy/rep a cíle uvědomělé k tělesné hmotnosti.",
      },
    },
    whatLiftersGetWrong: [
      "Srovnávání jeho souhrnů s absolutními značkami stylu Coltona Engelbrechta bez tělesné hmotnosti",
      "Okamžité kopírování pěti tréninkových dnů",
      "Maxování každou session navzdory jeho veřejným varováním o plateau",
      "Braní interview osnov jako placených programů",
      "Míchání gym livestream čísel se závodně datovanými výsledky",
    ],
    trainingStructure: {
      trainingDays: "Interview rámování: ~5 dnů týdně se sobotním těžkým startem Dřep+Bench press",
      exerciseFrequency:
        "Bench press vícekrát týdně; Dřep a Mrtvý tah s heavy + sekundárními expozicemi ve veřejných účtech",
      volumeDistribution: [
        { label: "Praxe Dřepu", share: 30 },
        { label: "Praxe Bench pressu", share: 35 },
        { label: "Praxe Mrtvého tahu", share: 25 },
        { label: "Asistence", share: 10 },
      ],
      intensityDistribution: [
        { label: "Těžké primární dny", share: 40 },
        { label: "Rep / sekundární dny", share: 40 },
        { label: "Lehká technika / prokrvovací práce", share: 20 },
      ],
      primaryMovements: ["Závodní Dřep", "Závodní Bench press", "Závodní Mrtvý tah"],
      accessoryWork: [
        "Close-grip nebo jednoručkové tlaky jako práce na slabá místa",
        "Asistence horních zad a paží v lehčích dnech",
      ],
      progressionApproach:
        "Zlepšujte závodně datované souhrny uvnitř zvolené třídy; opatrně zvyšujte těžké singlee při zachování produktivních sekundárních dnů",
      recoveryStructure:
        "Kontrasty heavy/rep/light; vyhněte se chronickým failovaným maxům; řiďte tělesnou hmotnost záměrně",
    },
    whyItWorked: {
      specificity:
        "Téměř veškerá tvrdá práce slouží výkonu v Dřepu, Bench pressu a Mrtvém tahu pod pravidly závodu.",
      volume: "Sekundární dny přidávají praxi bez vyžadování denního maximálního zatížení.",
      intensity: "Vyhrazené těžké dny zvyšují silový výstup; peaking koncentruje kvalitní singlee.",
      technicalPractice: "Vysoká týdenní Frekvence zostřuje povely a pozice.",
      athleteExperience:
        "Dlouhá historie OpenPowerlifting od raného USAPL/IPF přes multi-fed raw rekordy.",
      bodyweight:
        "Závodění primárně v pásmu 83–100 kg dělá z Relativní síly správný srovnávací rámec.",
      recovery: "Autoregulace a jasnost rolí dnů řídí únavu napříč pěti tréninkovými dny.",
      sportDemands:
        "Třídové rekordy a klasické světové tituly odměňují efektivitu při omezené tělesné hmotnosti.",
      longTermAdaptation: "Dekádová progrese poráží krátkodobou maxovací kulturu.",
    },
    exampleWeek: {
      title: "Modernizovaná ilustrace Relativní síly (ne rutina atleta)",
      disclaimer:
        "Originální příklad The Strongest. Není to program Johna Haacka. Škálujte váhy na technickou kvalitu a Regeneraci.",
      days: [
        {
          dayLabel: "Den 1",
          focus: "Těžký Dřep + těžký Bench press",
          notes: "Vypracujte se k pevným singlům nebo dvojicím na RPE 7–8,5; volitelné lehké back-off série",
        },
        {
          dayLabel: "Den 2",
          focus: "Odpočinek",
          notes: "Spánek a jídlo",
        },
        {
          dayLabel: "Den 3",
          focus: "Těžký Mrtvý tah",
          notes: "Jedna tvrdá hinge expozice; asistence na slabá místa",
        },
        {
          dayLabel: "Den 4",
          focus: "Rep Bench press",
          notes: "Série v umírněném pásmu opakování; držte se dál od selhání",
        },
        {
          dayLabel: "Den 5",
          focus: "Rep Dřep",
          notes: "Objem zaměřený na techniku",
        },
        {
          dayLabel: "Den 6",
          focus: "Lehký Bench press / asistence horní části těla",
          notes: "Rychlost nebo lehká technika; priorita Regenerace",
        },
        {
          dayLabel: "Den 7",
          focus: "Odpočinek",
          notes: "Deloadujte, když výkon stagnuje",
        },
      ],
    },
    modernAdaptation: {
      summary:
        "Držte častou praxi závodních zdvihů, kontrasty heavy/rep a cíle uvědomělé k tělesné hmotnosti — zahoďte elitní váhy a cosplay programu.",
      beginnerAdjustment:
        "3 dny týdně celotělově nebo upper/lower; jedna expozice na hlavní zdvih; žádné pětidenní elitní rozvrhy.",
      intermediateAdjustment:
        "4 dny týdně; přidejte druhý lehčí den Bench pressu nebo Dřepu; držte top sety submaximální.",
      advancedAdjustment:
        "Až 5 dnů, pokud zregenerováni; autoregulujte těžké singlee; volte třídu/tělesnou hmotnost záměrně; peakujte jen pro závodně datované výkony.",
      recommendedFrequency: "3–5 dnů týdně",
      recoveryControls: [
        "Nefailujte grindery týdně",
        "Držte lehké dny skutečně lehké",
        "Řiďte změny tělesné hmotnosti pomalu",
        "Deloadujte každých 3–6 tvrdých týdnů",
      ],
      progressionRules: [
        "Sledujte závodně datované souhrny podle třídy",
        "Zlepšujte kvalitu sekundárních dnů, než přidáte váhu do těžkých dnů",
        "Měňte jen jednu proměnnou najednou při peakingu",
      ],
      whenToReduceVolume:
        "Padající rychlost osy, rostoucí kloubní podráždění, nebo hromadící se zmeškaná opakování v sekundárních dnech",
      whoShouldAvoid: [
        "Začátečníci",
        "Zdvihači s nespravovanými tendinopatiemi horní části těla",
        "Kdokoliv ignorující tělesnou hmotnost při nastavování cílů souhrnu",
      ],
    },
    relatedProgrammes: [
      {
        title: "Silový trojboj Relativní síly",
        relationship:
          "Originální program The Strongest aplikující příbuzné principy Frekvence a Relativní síly bez jmenování atleta",
      },
    ],
  },

  "jamal-browner-sumo-deadlift": {
    scores: {
      strengthPotential: {
        justification:
          "Závodně datované raw sumo tahy nad 450 kg ho řadí mezi nejsilnější třídové tahouny v moderním raw Silovém trojboji.",
      },
      hypertrophyPotential: {
        justification:
          "Specializace zdůrazňuje nervovou a technickou maximální sílu víc než vyváženou hypertrofickou programaci.",
      },
      recoveryDemand: {
        justification:
          "Absolutní sumo zatížení a časté tvrdé expozice vytvářejí velké systémové a kyčelní/adduktorové regenerační náklady.",
      },
      technicalDifficulty: {
        justification:
          "Elitní sumo pozice pod 450+ kg vyžadují výjimečnou konzistenci; malé úniky jsou trestány.",
      },
      beginnerSuitability: {
        justification:
          "Začátečníci by se měli nejdřív naučit obecnou dovednost mrtvého tahu; elitní sumo specializace je nástroj pozdní fáze.",
      },
      advancedSuitability: {
        justification:
          "Pokročilí sumo tahouni si mohou půjčit technické standardy, gramotnost overloadu a management únavy — ne váhy.",
      },
    },
    whatLiftersGetWrong: [
      "Braní strapped gym sessions jako závodních ekvivalentů",
      "Předpoklad, že sumo specializace automaticky staví konvenční závodní tah",
      "Kopírování šířky stance bez struktury boků a mobility",
      "Ignorování příspěvků Dřepu/Bench pressu v rekordních dnech",
      "Vymýšlení programů z highlight reelů",
    ],
    trainingStructure: {
      trainingDays:
        "Vysoce-důrazové tahové týdny ve veřejných tréninkových médiích; přesný proprietární split nepublikovaný",
      exerciseFrequency:
        "Sumo jako primární těžká expozice; konvenční použit v dokumentovaných obdobích strongman přípravy",
      volumeDistribution: [
        { label: "Competition-stance sumo", share: 45 },
        { label: "Podpora souhrnu Dřep / Bench press", share: 30 },
        { label: "Konvenční / variační práce (fázově závislá)", share: 15 },
        { label: "Asistence", share: 10 },
      ],
      intensityDistribution: [
        { label: "Těžké competition-stance tahy", share: 50 },
        { label: "Overload / variační expozice", share: 25 },
        { label: "Technické / regenerační tahy", share: 25 },
      ],
      primaryMovements: ["Raw Sumo mrtvý tah (závodní pravidla)", "Závodní Dřep a Bench press pro souhrn"],
      accessoryWork: [
        "Asistence zadního řetězce a horních zad",
        "Práce na úchop pod raw-rules podmínkami",
        "Konvenční praxe, když to ruleset vyžaduje",
      ],
      progressionApproach:
        "Progresujte závodně datované raw sumo; používejte gym overloady opatrně a označte rozdíly ve vybavení",
      recoveryStructure:
        "Rozestupujte maximální expozice; deloadujte po brutálních jednotkách; prioritizujte svěžest v raw-rules podmínkách před závody",
    },
    whyItWorked: {
      specificity: "Většina vysoce-intenzitní praxe odpovídá závodnímu sumo rulesetu.",
      volume: "Tvrdé série zůstávají zaměřené; kvalita poráží nekonečné grindování.",
      intensity: "Závodní pokusy a pečlivě zvolené overloady zvyšují absolutní sílu.",
      technicalPractice: "Roky konzistence wide-stance pod únavou.",
      athleteExperience: "Víceletá progrese OpenPowerlifting do závodních tahů nad 450 kg.",
      bodyweight: "Tělesné hmotnosti třídy 110 kg stále podporují obrovské absolutní mrtvé tahy.",
      recovery: "Elitní regenerační kapacita kolem řídkých maximálních testů.",
      sportDemands: "Třídové rekordy mrtvého tahu a souhrnu odměňují nejtěžší legální závodní tah.",
      longTermAdaptation: "Rekordní závody sedí na letech specializované praxe, ne na jednom virálním týdnu.",
    },
    exampleWeek: {
      title: "Modernizovaná ilustrace sumo specializace (ne rutina atleta)",
      disclaimer:
        "Originální příklad The Strongest. Není to program Jamala Brownera. Preferujte raw-rules podmínky pro přípravu na závod. Škálujte váhy na technickou kvalitu.",
      days: [
        {
          dayLabel: "Den 1",
          focus: "Těžké sumo (raw pravidla)",
          notes: "Vypracujte se ke 2–4 tvrdým sériím; belt OK; žádné straps, pokud peakujete pro raw závody",
        },
        {
          dayLabel: "Den 2",
          focus: "Bench press + horní záda",
          notes: "Udržte zotavitelné pro další tah",
        },
        {
          dayLabel: "Den 3",
          focus: "Odpočinek",
          notes: "Regenerace kyčlí a adduktorů",
        },
        {
          dayLabel: "Den 4",
          focus: "Důraz na Dřep",
          notes: "Umírněná intenzita",
        },
        {
          dayLabel: "Den 5",
          focus: "Lehká sumo technika nebo volitelný konvenční tah (cíl fáze)",
          notes: "Rychlost/technika; zastavte svěží",
        },
        {
          dayLabel: "Den 6–7",
          focus: "Odpočinek",
          notes: "Deloadujte po jakémkoli týdnu maximálního testu",
        },
      ],
    },
    modernAdaptation: {
      summary:
        "Prioritizujte competition-stance sumo pod pravidly, podle kterých budete posuzováni; poctivě označujte gym overloady; nepředpokládejte konvenční přenos.",
      beginnerAdjustment:
        "Naučte se konvenční nebo sumo hinge se skromnými váhami 2×/týdně; žádná maximální specializace.",
      intermediateAdjustment:
        "Jeden tvrdý sumo den + jeden lehký technický den; budujte souhrn s Dřepem/Bench pressem; raw-rules praxe před závody.",
      advancedAdjustment:
        "Krátké overload bloky s jasnými štítky vybavení; volitelné konvenční fáze jen když to pravidla vyžadují; plánované deloady po maximálních testech.",
      recommendedFrequency: "1–2 expozice mrtvého tahu týdně podle intenzity",
      recoveryControls: [
        "Omezte strapped overloady blízko raw závodů",
        "Deloadujte po maximálních testech",
        "Sledujte adduktory/kyčle",
        "Držte sekundární dny skutečně lehké",
      ],
      progressionRules: [
        "Progresujte nejdřív závodně datované raw tahy",
        "Přidejte overload, až je competition-stance technika stabilní",
        "Měňte projekty stance po jednom bloku",
      ],
      whenToReduceVolume:
        "Podráždění kyčlí/adduktorů, ztráta kvality lockoutu, nebo opakované failované gym maxy",
      whoShouldAvoid: [
        "Začátečníci",
        "Zdvihači s nespravovanou bolestí kyčlí",
        "Konvenčně-primární atleti slepě kopírující elitní sumo Objem",
      ],
    },
    relatedProgrammes: [
      {
        title: "Síla specializace na mrtvý tah",
        relationship:
          "Originální program The Strongest aplikující příbuzné principy specializace na mrtvý tah bez jmenování atleta",
      },
    ],
  },

  "boris-sheiko-russian-powerlifting": {
    scores: {
      strengthPotential: {
        justification:
          "Vysoce specifická praxe závodních zdvihů a strukturovaný peaking jsou silné nástroje pro rozvoj souhrnu, když to Regenerace dovolí.",
      },
      hypertrophyPotential: {
        justification:
          "Vysoký tonáž může růst tkáň, ale veřejná identita systému je síla a technika pro Silový trojboj, ne programování fyzična.",
      },
      recoveryDemand: {
        justification:
          "Časté expozice a vysoký týdenní Objem vytvářejí značnou únavu, i když průměrná intenzita zůstává umírněná.",
      },
      technicalDifficulty: {
        justification:
          "Zdvihy jsou standardní powerliftingové; obtížnost je ve vykonávání vysoce kvalitního Objemu a řízení komplexních týdenních plánů.",
      },
      beginnerSuitability: {
        justification:
          "Začátečníci profitují z důrazu na techniku, ale často se nedokážou zregenerovat z plných vysokoobjemových šablon bez zjednodušení.",
      },
      advancedSuitability: {
        justification:
          "Pokročilí raw zdvihači mohou produktivně používat Frekvenci, submaximální zatížení a blokové vlny s kontrolou dávky.",
      },
    },
    whatLiftersGetWrong: [
      "Slepé kopírování očíslované internetové šablony jako personalizovaného plánu",
      "Přidávání maximálních singlů, které ničí submaximální logiku",
      "Ignorování Regenerace při vysokých týdenních počtech zdvihů",
      "Předpoklad, že každé Sheiko-označené PDF je stejně oficiální nebo aktuální",
      "Zaměňování Sheiko Frekvence s conjugate max-effort rotací",
    ],
    trainingStructure: {
      trainingDays:
        "Běžně 3–4+ dny týdně ve veřejných Sheiko-asociovaných příkladech; athlete-specific plány se liší",
      exerciseFrequency:
        "Dřep, Bench press a Mrtvý tah se často objevují vícekrát týdně; Frekvence Bench pressu bývá nejvyšší",
      volumeDistribution: [
        { label: "Závodní práce na Dřepu", share: 30 },
        { label: "Závodní práce na Bench pressu", share: 35 },
        { label: "Závodní práce na Mrtvém tahu", share: 25 },
        { label: "Asistence / ostatní", share: 10 },
      ],
      intensityDistribution: [
        { label: "Submaximální kvalitní Objem", share: 70 },
        { label: "Těžší silová / peaking práce", share: 25 },
        { label: "Lehká technika / regenerace", share: 5 },
      ],
      primaryMovements: ["Závodní Dřep", "Závodní Bench press", "Závodní Mrtvý tah"],
      accessoryWork: [
        "Cílená asistence na slabá místa dle koučinku",
        "Obecná fyzická připravenost dle potřeby",
      ],
      progressionApproach:
        "Zvyšujte a pak taperujte Objem napříč bloky, zatímco průměrná intenzita trenduje nahoru směrem k závodu",
      recoveryStructure:
        "Vlnění tvrdých a lehčích týdnů; snižování jednotek/Objemu v peakingu; držte většinu tréninku submaximální",
    },
    whyItWorked: {
      specificity: "Tréninkový čas se koncentruje na zdvihy, které jsou posuzovány v den závodu.",
      volume:
        "Vysoký týdenní tonáž při zvládnutelných intenzitách buduje technickou a specifickou kapacitu.",
      intensity: "Submaximální zdrženlivost chrání kvalitu; peaking fáze vyjadřují sílu, když záleží.",
      technicalPractice: "Časté expozice vytvářejí masivní praxi dovednosti pod zotavitelnou únavou.",
      athleteExperience:
        "Kontexty koučinku národních týmů historicky spojovaly metody s dovednými atlety.",
      bodyweight: "Aplikovatelné napříč třídami; dávka stále škáluje s absolutními váhami a Regenerací.",
      recovery: "Stropy intenzity a týdenní vlny dělají vysokou Frekvenci přežitelnou.",
      sportDemands: "Classic/raw Silový trojboj odměňuje opakovatelnou závodní techniku.",
      longTermAdaptation: "Roky kvalitního Objemu překonávají krátké maxovací série.",
    },
    exampleWeek: {
      title: "Modernizovaná vysokofrekvenční submaximální ilustrace (ne Sheiko tabulka)",
      disclaimer:
        "Originální příklad The Strongest ukazující Frekvenci závodních zdvihů při submaximálním úsilí. Není to přetisk tabulek Powerlifting: Foundations and Methods ani očíslovaná internetová rutina.",
      days: [
        {
          dayLabel: "Den 1",
          focus: "Dřep + Bench press (kvalitní Objem)",
          notes: "Více umírněných sérií; zastavte s opakováními v rezervě; bezchybné povely",
        },
        {
          dayLabel: "Den 2",
          focus: "Důraz na Bench press + lehký hinge",
          notes: "Druhá expozice Bench pressu; lehká technika Mrtvého tahu nebo RDL",
        },
        {
          dayLabel: "Den 3",
          focus: "Odpočinek nebo lehké GPP",
          notes: "Chůze, mobilita; chraňte spánek",
        },
        {
          dayLabel: "Den 4",
          focus: "Dřep + Mrtvý tah",
          notes: "Umírněná intenzita; vyhněte se grindovaným singlům",
        },
        {
          dayLabel: "Den 5",
          focus: "Bench press + horní asistence",
          notes: "Třetí dotyk Bench pressu, pokud zregenerováni; jinak jen technika",
        },
        {
          dayLabel: "Den 6–7",
          focus: "Odpočinek",
          notes: "Vlňte lehčí týden každé 3–4 tvrdé týdny",
        },
      ],
    },
    modernAdaptation: {
      summary:
        "Držte vysokou Frekvenci závodních zdvihů a submaximální kvalitu — zahoďte fantazii, že jedna očíslovaná šablona je univerzální koučink.",
      beginnerAdjustment: "3 dny týdně; jedna expozice na hlavní zdvih; naučte se povely; nízký týdenní tonáž.",
      intermediateAdjustment:
        "3–4 dny; přidejte druhý den Bench pressu; držte top sety ~RPE 6–8; vlňte Objem týdně.",
      advancedAdjustment:
        "Vyšší týdenní počty zdvihů s plánovanými lehčími týdny a záměrným peakem; nikdy záměrně nemissete opakování.",
      recommendedFrequency: "3–5 dnů týdně podle Regenerace",
      recoveryControls: [
        "Omezte intenzitu tak, aby technika nikdy nekolabovala",
        "Vlňte tvrdé/lehké týdny",
        "Snižte expozice před přidáním váhy",
        "Deloadujte, když rychlost osy padá na týden",
      ],
      progressionRules: [
        "Přidejte Objem před intenzitou v raných blocích",
        "Zvyšujte intenzitu a snižujte Objem směrem k závodům",
        "Měňte jednu proměnnou najednou",
      ],
      whenToReduceVolume:
        "Zmeškaná opakování, rostoucí kloubní podráždění, nebo přetrvávající pokles výkonu napříč dvěma jednotkami",
      whoShouldAvoid: [
        "Začátečníci potřebující nejdřív dovednostní základy",
        "Zdvihači v těžkých deficitech se špatným spánkem",
        "Kdokoliv neochotný sledovat Regeneraci",
      ],
    },
    relatedProgrammes: [
      {
        title: "Vysokofrekvenční budovatel souhrnu",
        relationship:
          "Originální program The Strongest aplikující příbuzné principy Frekvence a submaximálního Objemu bez jmenování kouče",
      },
    ],
  },

  "louie-simmons-conjugate-method": {
    scores: {
      strengthPotential: {
        justification:
          "Max-effort praxe a speciální cviky na slabá místa jsou mocné nástroje absolutní síly, když je respektovaná rotace.",
      },
      hypertrophyPotential: {
        justification:
          "Repetition-effort asistence mohou hnát podstatný růst tkáně podporující souhrn.",
      },
      recoveryDemand: {
        justification: "Týdenní maximální expozice plus vysoké objemy asistencí jsou systémově nákladné.",
      },
      technicalDifficulty: {
        justification:
          "Vyžaduje kompetentní rotaci cviků, standardy setupu a (pokud se používá) gramotnost bands/chains.",
      },
      beginnerSuitability: {
        justification:
          "Začátečníci obvykle potřebují stabilní vzorce před ME rotací a komplexitou akomodujícího odporu.",
      },
      advancedSuitability: {
        justification:
          "Pokročilí atleti mohou produktivně používat souběžné ME/DE/RE a speciální cviky s poctivými pravidly Regenerace.",
      },
    },
    whatLiftersGetWrong: [
      "Maxování stejného závodního zdvihu každý týden a nazývání toho conjugate",
      "Používání bands/chains bez jasného plánu dynamic effort",
      "Ignorování repetition-effort práce na slabá místa",
      "Braní každé internetové „conjugate“ šablony jako oficiální Westside metody",
      "Kopírování equipped předpokladů do raw začátečnického programování",
    ],
    trainingStructure: {
      trainingDays: "Běžný veřejný obrys: čtyři primární dny (ME lower, ME upper, DE lower, DE upper)",
      exerciseFrequency:
        "Hlavní ME zdvihy rotují týdně; DE používá opakovanou speed práci s vlnovým loadingem; asistence se objevují často",
      volumeDistribution: [
        { label: "Max-effort hlavní práce", share: 15 },
        { label: "Dynamic-effort hlavní práce", share: 20 },
        { label: "Repetition / speciální cviky", share: 50 },
        { label: "GPP / ostatní", share: 15 },
      ],
      intensityDistribution: [
        { label: "Near-max ME singlee", share: 35 },
        { label: "Rychlá submaximální DE práce", share: 30 },
        { label: "Hypertrofické / RE asistence", share: 35 },
      ],
      primaryMovements: [
        "Rotující varianty ME Dřepu/Mrtvého tahu",
        "Rotující varianty ME Bench pressu",
        "Dynamický Dřep a Bench press proti akomodujícímu odporu, pokud se používá",
      ],
      accessoryWork: [
        "Speciální cviky na zaostávající svaly/rozsahy",
        "RE práce na zadní řetězec a horní záda",
        "GPP jako podpora Regenerace a pracovní kapacity",
      ],
      progressionApproach:
        "Honíte ME rekordy na rotacích, zlepšujte DE rychlost/zátěž napříč vlnami, zvětšujte slabá místa přes RE",
      recoveryStructure:
        "Rozestupujte extrémní dny (~72 hodin ve veřejném psaní); rotujte ME zdvihy; deloadujte, když si stěžuje rychlost osy a klouby",
    },
    whyItWorked: {
      specificity: "Speciální cviky jsou vybírány tak, aby se přenášely na závodní slabá místa zdvihače.",
      volume: "Vysoké objemy asistencí budují tkáně, které podporují maximální pokusy.",
      intensity: "Týdenní ME expozice udržují absolutní sílu vysokou bez akomodace na identickém zdvihu.",
      technicalPractice: "DE rychlostní práce a speciální zdvihy zdokonalují pozice pod různými omezeními.",
      athleteExperience:
        "Westside kultura spojovala metody se zkušenými equipped zdvihači a koučovací zpětnou vazbou.",
      bodyweight: "Aplikovatelné napříč třídami; absolutní ME stres stále škáluje s velikostí a výstrojí.",
      recovery: "Rotace a role dnů řídí únavu lépe než chronické maxování stejného zdvihu.",
      sportDemands:
        "Equipped Silový trojboj historicky odměňoval toolbox speciálních cviků; raw použití vyžaduje adaptaci.",
      longTermAdaptation:
        "Souběžné kvality a variace podporují delší tréninkové kariéry, když jsou správně dávkované.",
    },
    exampleWeek: {
      title: "Modernizovaná ME/DE ilustrace (ne Westside proprietární program)",
      disclaimer:
        "Originální příklad The Strongest rolí conjugate dnů. Není to přetisk Westside knih/šablon ani oficiální Westside program. Žádná loga ani copyrightovaná grafika.",
      days: [
        {
          dayLabel: "Den 1",
          focus: "Max effort lower",
          notes: "Rotujte variantu dřep/hinge týdně; vypracujte se k tvrdému singlu; pak RE asistence",
        },
        {
          dayLabel: "Den 2",
          focus: "Max effort upper",
          notes: "Rotujte tlakovou variantu; tvrdý singl; triceps/horní záda RE",
        },
        {
          dayLabel: "Den 3",
          focus: "Odpočinek nebo lehké GPP",
          notes: "Chraňte 72hodinovou ideu mezi extrémními dny",
        },
        {
          dayLabel: "Den 4",
          focus: "Dynamic effort lower",
          notes: "Rychlé submaximální dřepové série; volitelné lehké bands/chains; zadní řetězec RE",
        },
        {
          dayLabel: "Den 5",
          focus: "Dynamic effort upper",
          notes: "Rychlá práce na Bench press; asistence na slabá místa",
        },
        {
          dayLabel: "Den 6–7",
          focus: "Odpočinek",
          notes: "Deloadujte, když stagnuje ME výkon i DE rychlost",
        },
      ],
    },
    modernAdaptation: {
      summary:
        "Držte ME rotaci, DE rychlostní práci a RE trénink slabých míst — zahoďte logo cosplay a absolutismus neoficiálních šablon. Adaptujte Objem závodních zdvihů nahoru pro raw meet prep.",
      beginnerAdjustment:
        "3 dny týdně síla; žádná týdenní ME rotace; nejdřív se naučte Dřep/Bench press/hinge.",
      intermediateAdjustment:
        "Čtyřdenní ME/DE obrys s jednoduchými variantami; DE nejdřív bez bands; skromné RE.",
      advancedAdjustment:
        "Širší ME menu, volitelný akomodující odpor, cílená RE; víc přímé závodní praxe blízko raw závodů.",
      recommendedFrequency: "3–4 tvrdé dny týdně pro většinu; pokročilí mohou opatrně přidat GPP",
      recoveryControls: [
        "Rotujte ME zdvihy týdně nebo dvoutýdně",
        "Držte DE rychlost osy vysokou — snižte váhu, pokud grinduje",
        "Rozestupujte extrémní dny",
        "Snižte RE, když klouby protestují",
      ],
      progressionRules: [
        "Zaznamenávejte ME varianty a rekordy odděleně",
        "Vlňte DE zátěže napříč krátkými cykly",
        "Volte speciální cviky z diagnostikovaných slabých míst, ne z novinky",
      ],
      whenToReduceVolume:
        "Padající ME výkon, pomalá DE rychlost osy, nebo rostoucí kloubní podráždění na 7–10 dní",
      whoShouldAvoid: [
        "Začátečníci",
        "Zdvihači odmítající rotovat max-effort zdvihy",
        "Kdokoliv ztotožňující fotky s bands s kompletní metodou",
      ],
    },
    relatedProgrammes: [
      {
        title: "Souběžný silový systém",
        relationship:
          "Originální program The Strongest aplikující příbuzné principy souběžné síly bez Westside brandingu",
      },
    ],
  },
};
