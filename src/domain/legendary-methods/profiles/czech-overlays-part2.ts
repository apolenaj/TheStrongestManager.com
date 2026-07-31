import type { CzechProfileOverlay } from "@/domain/legendary-methods/profiles/apply-czech";

/**
 * Czech UI overlays for powerlifting / system profiles (part 2).
 * Merged via applyCzechOverlay — English remains canonical for publish/validation.
 */
export const CZECH_OVERLAYS_PART2: Record<string, CzechProfileOverlay> = {
  "colton-engelbrecht-superheavyweight-powerlifting": {
    profileTitle:
      "Colton Engelbrecht — Analýza elitního superheavyweight silového trojboje",
    shortTitle: "Elitní superheavyweight silový trojboj",
    sportLabel: "Silový trojboj",
    era: "Současný raw/wraps silový trojboj (aktivní od 2019; landmark souhrny 2025–2026)",
    nationality: "Jihoafrická republika",
    summary:
      "Nezávislá analýza veřejně doložené absolutní síly Coltona Engelbrechta: závodní Dřep, Bench press a Mrtvý tah s datem, federací a vybavením, dopady tělesné hmotnosti a Regenerace, technická specializace a tvrdá hranice mezi potvrzenými závodními výkony, exhibition/strapped tréninky, gym záběry a neověřenými programovacími mýty. Nejde o reprodukci žádného privátního koučovacího systému.",
    introductoryDisclaimer:
      "Tento profil je nezávislá vzdělávací analýza. Není spojen s Coltonem Engelbrechtem, není jím autorizován, sponzorován ani doporučován. Závodní čísla citují uznávané databáze a reportáže ze závodů. Gym výkony a sociální sítě jsou označeny odděleně a nejsou považovány za kompletní program. Stránka nespekuluje o dopingu, zdravotním stavu ani privátních koučovacích systémech a nereprodukuje proprietární programy.",
    seoTitle:
      "Colton Engelbrecht — Analýza elitního superheavyweight silového trojboje",
    seoDescription:
      "Nezávislá analýza absolutní síly Coltona Engelbrechta: závod vs gym, vybavení, Regenerace, Progresivní přetížení a bezpečnější moderní aplikace pro Silový trojboj.",
    keyCharacteristics: [
      "Rozvoj absolutní síly napříč Dřepem, Bench pressem a Mrtvým tahem v kompletních závodech",
      "Extrémní závodní souhrny při tělesné hmotnosti daleko pod klasickými unlimited Superheavyweight obry",
      "Interviewem podložené vyšší-rep základové bloky před peakingem",
      "Jasné rozlišení vybavení a pravidel (raw sleeves vs wraps; strapped exhibitions)",
      "Extrémní nároky na Regeneraci, které běžný závodník musí škálovat",
    ],
    bestFor: [
      "Středně pokročilí a vyšší siloví trojbojaři studující stavbu absolutního souhrnu",
      "Koučové analyzující rozdíl mezi závodní evidencí a virálními tréninkovými klipy",
      "Pokročilí atleti, kteří potřebují bezpečnější principy pro dlouhé peaking cykly",
    ],
    notRecommendedFor: [
      "Začátečníky, kteří se teprve učí závodní povely",
      "Závodníky kopírující elitní absolutní zátěže z footage",
      "Kohokoli, kdo bere sociální sítě jako kompletní program",
    ],
    trainingDays:
      "Veřejné interview popisují důraz na všední dny podle zdvihů (např. samostatný důraz Dřep / Bench press / Mrtvý tah); berte jako strukturu hlášenou atletikou, ne jako publikovaný proprietární plán",
    quickProfile: {
      primaryGoal:
        "Maximalizovat raw nebo wraps plný závodní souhrn s elitní absolutní silou",
      typicalFrequency:
        "Veřejné účty popisují dedicované týdenní důrazy na hlavní zdvihy; přesné dlouhodobé šablony nejsou plně publikované",
      volumeLevel:
        "Vysoký základový Objem ve vyšších opakováních; intenzita stoupá do peakingu",
      intensityProfile:
        "Závodní peaking k těžkým singleům; základ zahrnuje náročné vyšší-rep série",
      recoveryDemand:
        "Velmi vysoká při elitních absolutních zátěžích a závodních hmotnostech",
      technicalDifficulty:
        "Vysoká — závodní povely plus technická konzistence sumo/konvenčního tahu pod únavou",
      bestSuitedFor:
        "Pokročilí siloví trojbojaři s koučinkem a kapacitou Regenerace",
    },
    evidenceQualityNote:
      "Závodní výkony mají vysokou důvěryhodnost přes OpenPowerlifting a dobové reportáže. Detail tréninkové metody stojí na veřejných interview/podcastech a musí se brát jako principová atletická tvrzení — ne jako kompletní proprietární program. Sociální sítě jsou slabší evidence pro programování.",
    sections: {
      "athlete-and-era": `Colton Engelbrecht je aktivní jihoafrický silový trojbojař, jehož veřejná kariéra podle OpenPowerlifting běží od roku 2019 pod federacemi včetně WPC-SA, ProRaw a WRPF. Analytický rámec tohoto profilu je stavba absolutního souhrnu — ne biografie a ne spekulace o privátním medicínském nebo farmakologickém kontextu.

Dvě závodní kotvy definují současnou veřejnou debatu. 29. března 2025 na WPC-SA Clash of the Titans OpenPowerlifting zaznamenává wraps výkon ve třídě 125 kg při 120,4 kg: Dřep 470 kg, Bench press 260 kg, Mrtvý tah 470 kg, souhrn 1 200 kg. 11. července 2026 na WRPF Nikolai Kagansky Memorial Cup (Moskva) databáze uvádí raw (sleeves) plný výkon ve třídě 140 kg při 125,3 kg: Dřep 455 kg, Bench press 277,5 kg, Mrtvý tah 492,5 kg, souhrn 1 225 kg. Stejné datum obsahuje i oddělené deadlift-only / exhibition vstupy včetně strapped práce — ty se nesmí slučovat s raw plným souhrnem.

První vzdělávací pravidlo The Strongest: závodní výkony v plném závodě, single-lift vstupy, strapped exhibitions a gym footage jsou různé třídy evidence. Superheavyweight absolutní síla bez této gramotnosti je jen marketingový šum.`,

      "documented-training-method": `Fakt (závod): výše uvedené výkony jsou databázově podložené závodní výsledky s federací, datem, vybavením a tělesnou hmotností.

Fakt (interviewová úroveň témat): ve veřejných dlouhých rozhovorech (včetně Mark Bell’s Power Project po 1 200 kg wraps souhrnu) Engelbrecht popisoval stavbu základů vyšší-rep bloky na hlavních zdvizích, příslušenství hlavně jako sekundární stimulus a organizaci tréninku přes dedicované všední důrazy. Diskutoval i technické priority Sumo mrtvého tahu — „stacked“ pozice a omezení energetických úniků přes boky.

Analýza (označená): tato témata podporují klasické čtení absolutní síly — akumulovat kvalitní práci na závodních zdvizích, postavit vyšší-rep základ, pak peakovat. Neopravňují však přetiskovat týdenní spreadsheet jako „Coltonův program“. Proprietární periodizace, přesné set/týden předpisy a Instagram jako „plán“ zde zůstávají mimo evidenci.`,

      "training-structure": `Veřejně diskutovaná struktura zdůrazňuje specificitu Dřepu, Bench pressu a Mrtvého tahu s dedicovanými důrazovými dny a vyšší-rep základovými fázemi před těžším peakingem. Distribuce Objemu pravděpodobně tíhne k závodním zdvihům; příslušenství zůstává skromné — konzistentní s tím, že produktivní práce žije v hlavních rep blocích.

Distribuce intenzity jde od náročných vyšších opakování k singleům před závodem. Regenerace je při těchto absolutních zátěžích rozhodující: spánek, jídlo a rozestupy mezi stresovými expozicemi vítězí nad novinkami. Gramotnost vybavení patří do struktury — wraps souhrny nejsou identická evidence jako sleeves-raw souhrny a strapped deadlift-only značky nejsou zaměnitelné s raw plným Mrtvým tahem.`,

      "volume-intensity-frequency": `Nezávislá analýza: kariéry absolutní síly na této úrovni snášejí vysokou intenzitu jen tehdy, když jsou Objem a Frekvence periodizované. Interviewová témata vyšší-rep základů implikují, že tvrdé singlee nejsou celý rok.

Frekvence každého hlavního zdvihu vypadá blíže specializovanému týdennímu důrazu než ultra-chaotickému conjugate — podle veřejně popsaného splitů — ale přesné dlouhodobé vlny Frekvence zůstávají neúplně publikované. Proto tento profil odmítá vymyšlené týdenní rutiny.

Co si má vzít běžný závodník: držet většinu tréninku submaximálně, stavět pozice vyšší-rep technikou, zvedat intenzitu blízko závodu a odmítnout kopírovat elitní absolutní zátěže. Co si nemá brát: virální těžké singlee každý týden převlečené za „jak trénuje Colton“. Praktický překlad: základ → síla → peak — ne kontinuální max-out kalendář.`,

      "why-it-worked": `Závodní úspěch sleduje specificitu tří zdvihů, Progresivní přetížení napříč lety (OpenPowerlifting ukazuje růst souhrnu z raných WPC-SA výsledků 2019–2021 do landmarků 2025–2026), technickou praxi pod únavou, zkušenost atleta a tělesné hmotnosti, které — byť nejsou klasický unlimited Superheavyweight — stále podporují obrovskou absolutní sílu vůči lehčím třídám.

Zdroje Regenerace a delší rozestupy mezi některými velkými pokusy (veřejné podcast/mediální framing) pravděpodobně hrají roli. Sportovní poptávka odměňuje souhrn v den závodu, ne nejzábavnější gym klip. Dlouhodobá adaptace je tichá pravda: landmark souhrny sedí na letech zaznamenaných závodů, ne na jednom virálním cyklu.`,

      "what-lifters-get-wrong": `Závodníci to kazí, když lepí gym čísla vedle závodních souhrnů bez štítků; když ignorují wraps versus sleeves; když berou strapped exhibition tahy jako raw plný Mrtvý tah; a když měla inventují týdenní rutinu z jedné podcast anekdoty.

Selhávají také kopírováním absolutních zátěží při rekreační kapacitě Regenerace, nebo předpokladem, že vyšší-rep základ znamená „junk Objem“ bez technických standardů. Nespekulujte o dopingu ani privátních koučovacích systémech. Zůstaňte u doložených výkonů a principových interview tvrzení.

Poslední častá chyba: nazývat každý těžký tréninkový klip „meet prep“. Meet prep je datovaný plán k pravidlům federace. Exhibition tahy a content dny mohou existovat vedle kariéry — stále nejsou zaměnitelná evidence s řádky OpenPowerlifting.`,

      "risks-and-recovery": `Rizika se koncentrují v bederních a kolenních tkáních pod absolutním zatížením, v loktech/ramenou z těžkého Bench pressu a v systémovém pod-zotavení, když je peaking chronický. Tělesná hmotnost podporující elitní souhrny zároveň zvyšuje absolutní kloubní síly.

Moderní kontroly: submaximální top sety většinu týdnů, plánované deloady, očekávání odpovídající vybavení a odmítnutí honit databázová čísla. Pokud spánek, chuť k jídlu nebo rychlost osy ve warmupu padají déle než týden, snižte intenzitu dřív, než přidáte další „world-record attempt“ v gymu. To je ekonomika tréninku, ne lékařská rada.`,

      "verdict": `Verdikt The Strongest: Engelbrechtovy závodní souhrny patří k nejčistším moderním demonstracím absolutní síly v Silovém trojboji. Studujte principy — specificitu, logiku základ→peak, gramotnost vybavení — a karanténujte elitní dávky. Nikdy neprezentujte sociální sítě ani fragmenty interview jako jeho plný proprietární program. Souhrny srovnávejte jen s federací, datem, vybavením a tělesnou hmotností.`,

      "modernised-application": `Modernizace: týden s důrazem na tři zdvihy, vyšší-rep technické bloky v raných mezocyklech a konzervativní peak. Začátečníci sem nepatří. Středně pokročilí mohou jet 3–4 dny s jednou tvrdou expozicí na hlavní zdvih týdně. Pokročilí mohou prodloužit peaking cykly a sledovat jen závodní progres.

Prakticky: zvolte jedno závodní datum, vědomě sleeves nebo wraps, postavte 8–16 týdnů submaximální kvalitní práce, pak peakujte. Nespejte exhibition maxy do stejného mikrocyklu jako plnou závodní simulaci. Související generické programy na tomto webu jsou bezpečnější nájezd než highlight cosplay.`,

      "example-training-week": `Příkladový týden je originální modernizovaná ilustrace pro stavbu souhrnu na úrovni intermediate-to-advanced. Není to program Coltona Engelbrechta a není to cesta k souhrnům 1 200+ kg. Škálujte všechny zátěže na technickou kvalitu a Regeneraci — Progresivní přetížení bez gramotnosti Frekvence je jen ego.`,

      sources: `Primární závodní evidence: OpenPowerlifting a dobové reportáže ze závodů. Tréninková témata: veřejné interview/podcasty. Nesourodé „routine blogy“ nejsou primární evidence.`,

      "core-training-routine": `Poznámka k historické dokumentaci: následující rekonstruuje veřejně hlášené tréninkové vzorce spojené s Engelbrechtovou Superheavyweight raw kariérou. Jde o vzdělávací historii, ne o předpis. Evidence je upřímně tenčí a současnější než u legacy atletů jinde na tomto webu — většina veřejného poznání pochází z jeho vlastního tréninkového footage a vystoupení ve strength-sport podcastech, ne z dlouholeté nezávislé žurnalistiky.

V rámci této omezené evidence se opakuje raw Superheavyweight přístup postavený na časté expozici tří závodních zdvihů — Dřep, Bench press, Mrtvý tah — s fázemi akumulace Objemu při středně těžkých až těžkých sériích, následovanými stlačenějším peakingem, kde Objem klesá a intenzita stoupá k openerům. Veřejný komentář odkazuje na tréninkovou komunitu a setup cueing kolem logistiky zdvihání při Superheavyweight hmotnosti.

Protože většina záznamu je self-published, tento profil nepřiřazuje přesná čísla sérií a opakování s falešnou jistotou. Co lze říct rozumně: vysoká Frekvence dotyků na velké tři, struktura Objem-pak-peak typická pro moderní raw Silový trojboj a závodní výsledky, které kotví kredibilitu, i když session-by-session detail není exhaustivní.`,

      "documented-nutritional-approach": `Poznámka k historické dokumentaci: následující rekonstruuje veřejně hlášené stravovací vzorce spojené s Engelbrechtovou Superheavyweight kariérou. Jde o vzdělávací historii, ne o předpis. Nezávislá nutriční dokumentace je omezená — čtěte s odpovídající váhou důvěry.

Opakované téma ve veřejném komentáři je vysokokalorický, vysokoproteinový přístup konzistentní s budováním hmoty vhodné pro unlimited Superheavyweight raw třídu, kde není strop hmotnosti motivující restriktivní kalorie jako v lehčích třídách. Granulární meal struktury, gramové cíle nebo timing nejsou součástí dobře doloženého nezávislého veřejného záznamu.

The Strongest záměrně nevymýšlí specificitu, která ve veřejném záznamu není. Upřímné historické tvrzení: veřejný komentář podporuje vysokokalorický, vysokoproteinový, mass-supportive pattern typický pro unlimited-class raw Silový trojboj — bez úrovně nezávisle ověřeného granulárního detailu dostupného u déle dokumentovaných atletů.`,
    },
  },

  "john-haack-relative-strength": {
    profileTitle: "John Haack — Elitní síla při nižší tělesné hmotnosti",
    shortTitle: "Elitní síla při nižší tělesné hmotnosti",
    sportLabel: "Silový trojboj",
    era: "Současný raw silový trojboj (IPF classic éra přes multi-fed raw rekordy; aktivní)",
    nationality: "USA",
    summary:
      "Nezávislá analýza veřejně doložené kariéry Relativní síly Johna Haacka: závodní výkony napříč váhovými třídami s federací a tělesnou hmotností, rovnováha Dřep–Bench press–Mrtvý tah, interviewem podložená Frekvence a management únavy, příprava pod IPF classic i multi-fed raw pravidly a proč absolutní souhrny nelze poctivě srovnávat bez kontextu hmotnosti. Nejde o přetisk proprietárního programu.",
    introductoryDisclaimer:
      "Tento profil je nezávislá vzdělávací analýza. Není spojen s Johnem Haackem, není jím autorizován, sponzorován ani doporučován. Závodní čísla citují OpenPowerlifting a reputabilní reportáže. Gym výkony jsou označeny odděleně. Stránka nereprodukuje proprietární programy ani nespekuluje o dopingu, zdravotním stavu či privátních koučovacích systémech.",
    seoTitle: "John Haack — Elitní síla při nižší tělesné hmotnosti",
    seoDescription:
      "Analýza Relativní síly Johna Haacka: závodní evidence, Frekvence, rovnováha tří zdvihů, management tělesné hmotnosti a moderní aplikace pro Silový trojboj.",
    keyCharacteristics: [
      "Elitní souhrny při nižší tělesné hmotnosti než Superheavyweight specialisté",
      "Silná rovnováha Dřep–Bench press–Mrtvý tah napříč fázemi kariéry",
      "Vyšší týdenní Frekvence praxe závodních zdvihů tam, kde je to doloženo v interview",
      "Management únavy přes kontrasty heavy/rep/light",
      "Gramotnost tělesné hmotnosti při srovnávání absolutních souhrnů",
    ],
    bestFor: [
      "Středně pokročilé a vyšší závodníky honící Relativní sílu",
      "Kouče učící DOTS/GLP a srovnání v kontextu třídy",
      "Atlety studující vysokofrekvenční praxi závodních zdvihů s autoregulací",
    ],
    notRecommendedFor: [
      "Začátečníky",
      "Závodníky srovnávající souhrny se Superheavyweight absolutními čísly bez kontextu hmotnosti",
      "Kohokoli, kdo bere interview osnovy jako klon placeného programu",
    ],
    trainingDays:
      "Veřejná interview popisují zhruba pět tréninkových dnů týdně s heavy Dřep+Bench press, heavy Mrtvý tah a sekundárními rep/light dny",
    quickProfile: {
      primaryGoal:
        "Maximalizovat raw souhrn relativně k tělesné hmotnosti / váhové třídě",
      typicalFrequency:
        "Interview účty: ~5 dnů/týden s více Bench press expozicemi a týdenními heavy důrazy Dřep/Mrtvý tah",
      volumeLevel:
        "Střední až vysoký Objem skill praxe; intenzita autoregulovaná",
      intensityProfile:
        "Těžké singlee v primárních dnech; rep práce a lehčí technické dny pro management únavy",
      recoveryDemand:
        "Vysoká při peakingu; zvládnutelnější než unlimited Superheavyweight absolutní loading při kontrole hmotnosti",
      technicalDifficulty:
        "Vysoká — závodní efektivita a standardy povelů napříč federacemi",
      bestSuitedFor: "Pokročilí siloví trojbojaři Relativní síly",
    },
    evidenceQualityNote:
      "Závodní výsledky mají vysokou důvěryhodnost přes OpenPowerlifting. Týdenní struktura pochází z reputabilních dlouhých interview a má se brát jako atletikou hlášené osnovy, které se v čase mění — ne jako permanentní proprietární program.",
    sections: {
      "athlete-and-era": `John Haack je aktivní americký raw silový trojbojař, jehož OpenPowerlifting záznam sahá od IPF/USAPL classic přes pozdější multi-federation raw závody (USPA, WRPF, PLU a další). Vzdělávací téma je Relativní síla: světové souhrny při tělesných hmotnostech daleko pod Superheavyweight specialisty.

Závodní kotvy (pouze competition lifts): 19. 6. 2016 IPF World Classic, 83 kg, 82,8 kg BW — Dřep 298 / Bench press 200 / Mrtvý tah 315, souhrn 813 kg. 29. 7. 2022 WRPF American Pro, 90 kg — 345 / 267,5 / 410, souhrn 1 022,5 kg. 6. 4. 2024 WRPF The Ghost Clash 3, 100 kg — 365 / 252,5 / 426, souhrn 1 043,5 kg. Další 2024–2025 PLU Power Surge řádky drží třídu kolem 90 kg s ~1 010+ kg souhrny.

To jsou závodní výkony s federací, datem, třídou a hmotností. Gym a livestream exhibitions musí být označené odděleně. Protože Haack zůstává aktivní, pozdější závody mohou změnit osobní maxima — tento profil cituje datovanou evidenci, ne věčný slib čísel.`,

      "documented-training-method": `Fakt: výše uvedené závodní výsledky jsou databázově podložené.

Fakt (interviewem podložená témata metody): v Men’s Health / Men’s Fitness Haack popisoval zhruba pět dnů týdně — sobota jako nejtěžší Dřep+Bench press (často k mírně těžkému single), pondělí heavy Mrtvý tah, úterý vyšší-rep Bench press, středa Dřep rep den, čtvrtek lehčí/speed-oriented Bench press a horní příslušenství. Veřejně varoval, že příliš časté maxování a failované opakování jsou běžní řidiči plateau. Technické doladění (těsnější Dřep setup; hip-snap cueing u Mrtvého tahu) bere jako nástroje efektivity — ne jako univerzální recept.

Analýza: trvanlivý příběh metody je vysoká Frekvence praxe na závodních zdvizích, kontrast heavy versus rep pro management únavy a neúprosná specificita. Není to licence publikovat falešný „Haack spreadsheet“.`,

      "training-structure": `Interviewem popsaná struktura rozkládá stres Dřepu, Bench pressu a Mrtvého tahu přes týden místo koncentrace veškeré intenzity do jednoho dne. Bench press dostává více expozic; Dřep a Mrtvý tah heavy den plus sekundární praxi. To je pattern přátelský Relativní síle: technická efektivita roste s častou submaximální praxí, když Regenerace dovolí.

Distribuce Objemu favorizuje závodní trojici. Intenzita používá těžké singlee v primárních dnech a střední opakování ve sekundárních. Progrese je zlepšení ze závodu na závod uvnitř zvolené třídy — ne neomezený nárůst hmoty. Tělesná hmotnost je strukturová proměnná první třídy. Srovnávat Haackovy souhrny s unlimited Superheavyweight bez kontextu hmotnosti je analyticky neplatné.`,

      "volume-intensity-frequency": `Nezávislá analýza: Frekvence je podpis vůči mnoha low-frequency raw šablonám. Intenzita je vysoká ve stanovených heavy dnech, ale ne každý den. Objem ve sekundárních dnech plní roli techniky a hypertrofické podpory bez denních maxim.

Management únavy je omezení. Interview varování proti chronickému failu sugerují autoregulaci: nechte opakování v rezervě, když kvalita padá. Závodní příprava se stlačuje k těžším singleům při zachování dostatku Frekvence pro ostré povely.

Běžní závodníci musí škálovat Frekvenci na Regeneraci. Pět tvrdých dnů závodních zdvihů není začátečnický plán. Pokud je tělesná hmotnost důvod, proč je souhrn impresivní, pak management hmotnosti je součást tréninku — ne dodatek.`,

      "why-it-worked": `Úspěch Relativní síly zde kombinuje technickou efektivitu, vyvážený rozvoj tří zdvihů, častou praxi, zkušenost napříč dlouhou závodní historií a disciplínu tělesné hmotnosti, která ho drží konkurenceschopného v lehčích třídách. Sportovní poptávka v IPF classic odměňovala přesnost povelů; multi-fed raw scény odměňovaly absolutní třídové rekordy na 90/100 kg.

Dlouhodobá adaptace přes dekádu+ OpenPowerlifting záznamu váží víc než jakákoli virální session. Lehčí atlet produkující 1 000+ kg raw souhrn řeší jiný problém než 140+ kg specialista honící all-time absolutní značky. Rovnováha Dřep–Bench press–Mrtvý tah je součástí příběhu — Haackovy veřejné karty nejsou „jen Mrtvý tah“.`,

      "what-lifters-get-wrong": `Závodníci Haacka kazí, když srovnávají jeho souhrny s Colton Engelbrecht–style absolutními značkami bez tělesné hmotnosti; když okamžitě kopírují pět tréninkových dnů; když maxují každou session navzdory jeho veřejným varováním o plateau; a když berou interview osnovy jako placené programy.

Selhávají i ignorováním rozdílů federací (IPF classic povely versus multi-fed raw) a záměnou gym livestream čísel za závodní výsledky. Další chyba: předpokládat, že přesun nahoru o třídu je „zdarma progres“. Absolutní souhrny mohou růst, zatímco relativní postavení padá — nebo naopak. Zvolte srovnávací rámec (třídový rekord, DOTS/GLP, nebo absolutní souhrn) dřív, než prohlásíte program za úspěšný.`,

      "risks-and-recovery": `Rizika zahrnují stres loktů/ramen z vysoké Frekvence Bench pressu, kvadricepsů/adduktorů z častého Dřepu a bederní únavu z týdenního heavy Mrtvého tahu. Váhový cut a změny tříd přidávají další daň Regenerace.

Moderní kontroly: držte sekundární dny skutečně sekundární, autoregulujte top sety a volíte cíle hmotnosti vědomě. Pokud kvalita sekundárních dnů kolabuje, heavy dny jsou příliš drahé — snižte zátěž nebo Objem dřív, než přidáte šestý tréninkový den. To je ekonomika tréninku, ne lékařská rada.`,

      "verdict": `Verdikt The Strongest: Haack ztělesňuje elitní sílu při nižší tělesné hmotnosti skrze Frekvenci, rovnováhu a technickou efektivitu. Používejte srovnání uvědomělá k hmotnosti. Půjčujte si principy. Nevymýšlejte permanentní program z interview. Datované, federací označené výkony jsou evidence; sociální klipy jsou barevný komentář.`,

      "modernised-application": `Modernizace: 4–5 dnů praxe závodních zdvihů, jedna heavy a jedna lehčí expozice tam, kde jste zotavení, a explicitní cíle tělesné hmotnosti. Začátečníci potřebují nejdřív jednodušší třídenní šablony.

Praktická sekvence pro intermediate: stabilní pásmo hmotnosti 8–12 týdnů; trénujte Dřep/Bench press/Mrtvý tah převážně submaximálními top sety; druhý lehčí Bench press den přidejte až po doložené Regeneraci; peakujte k jednomu datovanému souhrnu. Související generické programy jsou bezpečnější nájezd.`,

      "example-training-week": `Originální modernizovaná ilustrace Relativní síly — ne program Johna Haacka. Použijte ji k nácviku rolí dnů (heavy / rep / light), Frekvence Bench pressu a spacingu Regenerace; každou zátěž upravte na technický strop a Progresivní přetížení bez chronického failu.`,

      sources: `OpenPowerlifting pro závodní výkony; Men’s Health / Men’s Fitness / Fit University interview pro témata metody.`,

      "core-training-routine": `Poznámka k historické dokumentaci: následující rekonstruuje veřejně hlášené tréninkové vzorce spojené s Haackovou závodní kariérou. Jde o vzdělávací historii, ne o předpis.

Haack budoval veřejnou reputaci méně na unlimited absolutních souhrnech a více na výjimečně vysokém raw souhrnu relativně k závodní hmotnosti typicky v pásmu ~90–100 kg napříč kariérou. Veřejně diskutované principy z dlouhých podcastů zdůrazňují častou submaximální technickou expozici závodních zdvihů — Dřep, Bench press, Mrtvý tah vícekrát týdně při středních zátěžích — s pravými maximálními pokusy rezervovanými pro peaking okna.

Autoregulace je opakované téma: úprava denních zátěží podle RPE spíš než rigidní procentový graf každou session. Protože velká část záznamu žije v podcastové konverzaci, tento profil to bere jako principovou dokumentaci — vysoká Frekvence technických dotyků, RPE load management a periodizace oddělující akumulaci Objemu od závodního peakingu — ne jako reprodukci konkrétního week-by-week template.`,

      "documented-nutritional-approach": `Poznámka k historické dokumentaci: následující rekonstruuje veřejně hlášené stravovací vzorce spojené s Haackovou kariérou. Jde o vzdělávací historii, ne o předpis. Nutriční dokumentace je výrazně tenčí než tréninková.

Opakované téma je management váhové třídy spíš než pojmenovaný dietní systém — zůstat v dosahu zvolené třídy a zároveň chránit poměr síly k hmotnosti, který definuje jeho reputaci Relativní síly. Interview popisují disciplinovaný, ale ne extrémně restriktivní přístup konzistentní s výkonem a Regenerací uvnitř třídy.

The Strongest je zde konzervativní: poctivý veřejný záznam podporuje „disciplinované, třídově uvědomělé stravování ve službě Relativní síly“, ale nepodporuje detailní rekonstruovaný meal plán. Granulární čísla z fan fór berte jako neověřená.`,
    },
  },

  "jamal-browner-sumo-deadlift": {
    profileTitle: "Jamal Browner — Analýza specializace na sumo mrtvý tah",
    shortTitle: "Specializace na Sumo mrtvý tah",
    sportLabel: "Silový trojboj",
    era: "Současná raw specializace na Mrtvý tah (aktivní; landmark závody 2020–2024)",
    nationality: "USA",
    summary:
      "Nezávislá analýza veřejně doložené specializace Jamala Brownera na Sumo mrtvý tah: závodní tahy s federací a tělesnou hmotností, technická konzistence, overload a variace, management únavy, grip a lockout pod raw pravidly, omezené předpoklady přenosu na konvenční tah a proč jsou elitní sumo specialisté špatné copy cíle. Gym výkony jsou od závodních oddělené.",
    introductoryDisclaimer:
      "Tento profil je nezávislá vzdělávací analýza. Není spojen s Jamalem Brownerem, není jím autorizován, sponzorován ani doporučován. Závodní čísla citují OpenPowerlifting a reputabilní reportáže. Sociální sítě a gym session — včetně strapped overloadů — nejsou brány jako kompletní programy ani jako ekvivalenty závodních výkonů. Stránka nereprodukuje proprietární programy ani nespekuluje o dopingu, zdravotním stavu či privátních koučovacích systémech.",
    seoTitle: "Jamal Browner — Analýza specializace na sumo mrtvý tah",
    seoDescription:
      "Analýza Sumo mrtvého tahu Jamala Brownera: závod vs gym, technika, overload gramotnost, Regenerace a moderní aplikace specializace v Silovém trojboji.",
    keyCharacteristics: [
      "Elitní raw výkony Sumo mrtvého tahu v plných závodech",
      "Vysoká technická konzistence stance, brace a lockout",
      "Jasná mezera závod versus gym ve veřejných médiích",
      "Občasná konvenční praxe pro non-powerlifting rulesety",
      "Management únavy kolem extrémního tahového stresu",
    ],
    bestFor: [
      "Středně pokročilé a vyšší sumo tahouny studující principy specializace",
      "Kouče učící gramotnost evidence závod vs gym",
      "Pokročilé závodníky hodnotící, kdy specificita sumo pomáhá nebo limituje přenos",
    ],
    notRecommendedFor: [
      "Začátečníky bez stabilního hinge patternu",
      "Závodníky kopírující strapped gym overloady jako závodní standard",
      "Pouze-konvenční atlety předpokládající automatický přenos z elitní sumo práce",
    ],
    trainingDays:
      "Veřejná média ukazují častou heavy sumo praxi a občasné konvenční bloky pro strongman-rules projekty; přesné proprietární týdenní plány nejsou publikované",
    quickProfile: {
      primaryGoal:
        "Maximalizovat raw Sumo mrtvý tah (a podpůrný souhrn) pod pravidly Silového trojboje",
      typicalFrequency:
        "Vysoký důraz na tah v doložených tréninkových médiích; přesná dlouhodobá Frekvence nepublikovaná",
      volumeLevel:
        "Střední počty tvrdých sérií s velmi vysokou absolutní intenzitou na peak expozicích",
      intensityProfile:
        "Blízko-maximální závodní pokusy; gym overloady často používají straps/belt podmínky odlišné od závodních pravidel",
      recoveryDemand: "Velmi vysoká kolem maximálních sumo session",
      technicalDifficulty:
        "Velmi vysoká — šířka stance, pozice boků, brace a lockout pod absolutními zátěžemi",
      bestSuitedFor: "Pokročilí sumo specialisté s koučinkem",
    },
    evidenceQualityNote:
      "Závodní Mrtvé tahy a souhrny mají vysokou důvěryhodnost přes OpenPowerlifting. Gym výkony reportované BarBend/Breaking Muscle jsou užitečné pro kontext kapacity, ale slabší evidence pro programování a musí zůstat označené jako non-competition. Proprietární týdenní plány nejsou veřejné.",
    sections: {
      "athlete-and-era": `Jamal Browner je aktivní americký raw silový trojbojař veřejně nejznámější specializací na Sumo mrtvý tah ve třídě 110 kg. OpenPowerlifting uvádí kariéru od 2016 přes USAPL, NAPF, USPA, WRPF a příbuzné závody.

Závodní kotvy: 1. 2. 2020 WRPF Hybrid Showdown II — raw 110 kg třída včetně 440,5 kg Mrtvého tahu uvnitř 990 kg souhrnu. 24. 9. 2022 USPA Pro Raw Championships, 109,4 kg BW — Dřep 370 / Bench press 227,5 / Mrtvý tah 455 (sumo, belt, hook grip dle reportáže), souhrn 1 052,5 kg. 6. 4. 2024 WRPF The Ghost Clash 3 — Mrtvý tah 460 kg uvnitř 1 012,5 kg souhrnu.

To jsou závodní výkony. Odděleně reputabilní média reportovala gym výkony jako strapped sumo triples/quadruples na competition-record zátěžích a konvenční doublee pro strongman-rules soutěže. Ty gym značky nejsou závodní výsledky a často používají straps nepovolené v raw Silovém trojboji. Datumujte každý „rekordní tah“.`,

      "documented-training-method": `Fakt: výše uvedené závodní sumo tahy jsou databázově podložené.

Fakt (médiem doložená témata): Brownerova závodní identita je wide-stance Sumo mrtvý tah s vysokou technickou opakovatelností. Reportáž USPA Pro Raw 2022 zdůrazňuje belt + hook grip pod raw pravidly. Tréninková média často ukazují belt a straps pro overload — rozdíl rulesetu, který musí být řečen vždy, když citujete gym klipy.

Doložená praxe variací zahrnuje konvenční Mrtvý tah při přípravě na strongman kontexty, kde je sumo zakázané. To je adaptace na sportovní pravidla, ne důkaz, že sumo specialisté mají v Silovém trojboji sumo opustit.

Analýza: specializace znamená, že většina high-intensity praxe zůstává v závodním stance; overload variace a občasné konvenční bloky slouží specifickým cílům. Lockout a grip pod raw pravidly zaslouží explicitní pozornost — hook-grip závodní tahy daní ruce jinak než strapped gym overloady. Nic z toho neopravňuje inventovat týdenní rutinu z Instagramu.`,

      "training-structure": `Strukturálně specializace na Sumo mrtvý tah organizuje týden kolem kvalitních sumo expozic, podpůrné práce Dřep/Bench press pro souhrn a příslušenství, které drží boky, záda a grip bez zničení dalšího tahu.

Distribuce intenzity je top-heavy na deadlift dnech. Distribuce Objemu musí zůstat poctivá: pár tvrdých sumo sérií bije nekonečné grindování. Grip a lockout rozhodují pod raw pravidly; strapped gym overloady odstraní grip jako limiter a proto přeceňují přenositelnou závodní připravenost, pokud se špatně čtou.

Přenos na konvenční Mrtvý tah existuje na úrovni obecné síly, ale pozice, nároky na boky a slabá místa se liší. Kopírovat stance a Objem elitního sumo specialisty je špatný plán pro konvenčně primárního závodníka. Frekvence musí klesat, když absolutní intenzita stoupá.`,

      "volume-intensity-frequency": `Nezávislá analýza: Frekvence maximální sumo práce musí padat, jak absolutní intenzita stoupá. Gym média ukazující časté obří tahy nejsou automatickým povolením pro rekreační závodníky maxovat dvakrát týdně.

Objem počítejte jako tvrdé competition-stance série splňující standardy hloubky/lockoutu. Intensity techniky a straps mění profil stresu. Závodní příprava musí prioritizovat raw-rules podmínky (bez straps) před dnem závodu.

Běžní závodníci: jeden hard sumo den, volitelný light technický den, nemilosrdná Regenerace. Nekopírujte strapped 455 kg na opakování jako týdenní identitu. Overload gramotnost je skill, který většina highlight-watcherů postrádá: strapped gym quadruple na competition-record zátěži může být reálný a stále neodpovídat na závodní otázku hook-grip single po Dřepu a Bench pressu.`,

      "why-it-worked": `Elitní sumo výsledky sledují specificitu, technickou konzistenci, Progresivní přetížení napříč lety závodů, výjimečnou zkušenost atleta, tělesnou hmotnost, která stále podporuje obří absolutní tahy ve třídě 110 kg, a sportovní poptávku odměňující nejtěžší legální závodní Mrtvý tah.

Dlouhodobá adaptace a selekční efekty hrají roli: veřejné archivy favorizují atlety, kteří přežijí extrémní tahání. Gym overloady mohou expandovat kapacitu, ale datované raw tahy jsou výkonnostní pravda Silového trojboje.

Konzistence setupu není kosmetika. Wide-stance Sumo mrtvý tah pod 450+ kg trestá hip shift, měkký brace a rané lockout úniky. Specialisté, kteří zůstanou elitní, mají obvykle setup nudně podobný pokus za pokusem — ta nudná opakovatelnost učí víc než jakýkoli virální PR caption.`,

      "what-lifters-get-wrong": `Závodníci Brownera kazí, když berou strapped gym session jako závodní ekvivalenty; když předpokládají, že sumo specializace automaticky staví konvenční závodní tah; když kopírují šířku stance bez struktury boků a mobility; a když inventují programy z highlight reelů.

Selhávají i ignorováním toho, že stavba souhrnu stále vyžadovala příspěvky Dřepu a Bench pressu v rekordních dnech (např. 370/227,5/455 na USPA Pro Raw 2022). Specializace na Mrtvý tah není „jen Mrtvý tah“, pokud je cílem třídový rekord souhrnu.

Další chyba: brát strongman-rules konvenční trénink jako důkaz, že sumo bylo „špatně“. Rulesety mění optimální stance. Powerlifting Sumo mrtvý tah a strongman konvenční jsou příbuzné výrazy síly, ne identické skillsets.`,

      "risks-and-recovery": `Rizika se koncentrují v adduktorech, bocích, bederních tkáních a grip strukturách pod raw maximálním sumo. Konvenční bloky přidávají druhou technickou daň. YOLO max session po závodech zvedají riziko zranění, když je technika rezavá.

Moderní kontroly: raw-rules praxe před závody, omezené strapped overloady, plánované deloady a stance práce uvnitř technického vlastnictví. Pokud boky nebo adduktory stěžují déle než pár snadných dnů, snižte tahovou intenzitu dřív, než přidáte další absolutní test. To je ekonomika tréninku, ne lékařská rada.`,

      "verdict": `Verdikt The Strongest: Browner je case study specializace na Sumo mrtvý tah na absolutní hraně — s povinnou gramotností o podmínkách závod versus gym. Půjčujte si technické standardy a overload poctivost. Nekopírujte elitní zátěže ani nepředpokládejte univerzální přenos na konvenční tah. Datumujte každý claim; označte každý ruleset.`,

      "modernised-application": `Modernizace: priorita competition stance, jeden hard pull den, volitelná light technická práce a jasné označení strapped overloadů jako non-meet praxe. Začátečníci se nejdřív učí hinge pattern.

Středně pokročilí by měli postavit datovaný sumo single pod raw pravidly dřív, než honí gym theatre. Pokročilí mohou použít krátké overload bloky a pak se vrátit k závodním podmínkám v závěrečných týdnech. Související generické programy jsou bezpečnější než highlight cosplay.`,

      "example-training-week": `Originální modernizovaná ilustrace sumo specializace — ne program Jamala Brownera. Použijte ji k nácviku kvality competition stance a spacingu Regenerace; každou zátěž upravte na technický strop. Žádný den není transcript elitní session.`,

      sources: `OpenPowerlifting pro závodní výkony; BarBend/Breaking Muscle/Fitness Volt pro reportáže ze závodů a jasně označené gym výkony.`,

      "core-training-routine": `Poznámka k historické dokumentaci: následující rekonstruuje veřejně hlášené tréninkové vzorce spojené s Brownerovou specializací na Sumo mrtvý tah. Jde o vzdělávací historii, ne o předpis.

Veřejný profil stojí podstatně na self-published tréninkovém footage — deadlift-centric přístup kolem sumo stance spíš než konvenčního tahu. Doložené raw sumo výkony v médiích a na závodech sahají do regionu 400+ kg (běžně kolem 880 lb), potvrzené footage z uznávaných raw federací.

Publikovaný obsah dokumentuje častou expozici deadlift patternu přes týden — včetně deficit tahů, block pulls a banded variací měnících silovou křivku. Objem Dřepu je doložen jako komplementární, byť sekundární, složka. Protože dokumentace je podstatně self-published, tento profil bere široký tvar vysokofrekvenční sumo-specifické práce, koroborovaný závodními výsledky, jako rozumně podpořený — zatímco přesné set/rep předpisy z fan obsahu bere jako aproximace, ne formální program.`,

      "documented-nutritional-approach": `Poznámka k historické dokumentaci: následující rekonstruuje veřejně hlášené stravovací vzorce spojené s Brownerovou kariérou. Jde o vzdělávací historii, ne o předpis.

Veřejně sdílený obsah zahrnuje meal-prep videa odkazující na vysokokalorický přístup konzistentní s těžšími raw třídami — velké porce rýže a masových staples typické pro strength-sport bulking obsah. Jako u tréninku jde o self-published materiál; specifické gramové nebo kalorické cíle berte jako atletikou hlášené, ne third-party potvrzené.

Poctivě doložený pattern: mass-supportive, vysokokalorické stravování sladěné s těžší raw třídou, komunikované primárně vlastními kanály atleta. The Strongest záměrně nerekonstruuje přesný meal-by-meal plán — veřejná evidence to s jistotou nepodporuje.`,
    },
  },

  "boris-sheiko-russian-powerlifting": {
    profileTitle:
      "Boris Sheiko — Porozumění ruským systémům silového trojboje",
    shortTitle: "Ruské systémy silového trojboje",
    sportLabel: "Silový trojboj",
    era: "Ruská / sovětsky ovlivněná koučovací tradice silového trojboje (konec 20. stol.–současná anglická dokumentace)",
    nationality: "Rusko",
    summary:
      "Nezávislá vzdělávací analýza systémů Silového trojboje silně spojených s koučem Borisem Sheikem: vysoká Frekvence závodních zdvihů, submaximální Objem, multi-expozice, technická praxe, bloková progrese a management únavy — plus proč slepé kopírování očíslované internetové šablony není totéž jako porozumět Sheiko principům. Zahrnuje srovnání Sheiko vs Conjugate. Nejde o přetisk copyrightovaných knih ani placených programů.",
    introductoryDisclaimer:
      "Tento profil je nezávislá vzdělávací analýza. Není spojen s Borisem Sheikem, není jím autorizován, sponzorován ani doporučován. Popisy syntetizují veřejně diskutované principy z knih, seminářů a reputabilních publikací. Stránka nereprodukuje copyrightované kapitoly, placené šablony ani kompletní proprietární programy. Očíslované internetové spreadsheety bereme jako popularizace, ne jako oficiální permanentní programy.",
    seoTitle:
      "Boris Sheiko — Porozumění ruským systémům silového trojboje",
    seoDescription:
      "Analýza Sheiko principů: vysoká Frekvence, submaximální Objem, bloková periodizace, Regenerace a srovnání s Conjugate — bez kultu očíslovaných PDF.",
    keyCharacteristics: [
      "Vysoká týdenní Frekvence závodního Dřepu, Bench pressu a Mrtvého tahu",
      "Převážně submaximální zatížení s vysokou technickou kvalitou",
      "Více expozic zdvihů v týdnu a často i v rámci session",
      "Bloková periodizace směrem k závodnímu peakingu",
      "Únava řízená omezením intenzity a vlnovým loadingem spíš než konstantním maxováním",
    ],
    bestFor: [
      "Středně pokročilé a vyšší raw silové trojbojaře, kteří se zotavují z technického Objemu",
      "Kouče studující vysokofrekvenční submaximální stavbu souhrnu",
      "Závodníky, kteří potřebují více praxe závodních zdvihů, ne více novinek",
    ],
    notRecommendedFor: [
      "Absolutní začátečníky stále se učící povely",
      "Závodníky se špatnou Regenerací, kteří nesnesou vysoké týdenní počty zdvihů",
      "Kohokoli, kdo bere uniklý očíslovaný spreadsheet jako personalizovaný koučovací plán",
    ],
    trainingDays:
      "Veřejné účty běžně popisují 3–4+ tréninkové dny se závodními zdvihy vícekrát týdně; přesné kalendáře se liší podle atleta a bloku",
    quickProfile: {
      primaryGoal:
        "Zvednout souhrn Silového trojboje skrze technický Objem a periodizovaný peaking",
      typicalFrequency:
        "Závodní zdvihy často trénované několikrát týdně v doložených Sheiko-asociovaných přístupech",
      volumeLevel: "Vysoký kumulativní tonnage při středních průměrných intenzitách",
      intensityProfile:
        "Převážně submaximální; těžká peaking práce se objevuje později v blocích",
      recoveryDemand:
        "Vysoká kvůli Frekvenci a týdennímu tonnage — ne kvůli denním max singleům",
      technicalDifficulty:
        "Střední obtížnost pohybu; vysoká organizační a disciplinární náročnost",
      bestSuitedFor:
        "Středně pokročilí až pokročilí siloví trojbojaři s koučinkem nebo silnou self-regulací",
    },
    evidenceQualityNote:
      "Primární kotvy zahrnují Sheikovu anglickou knihu Powerlifting: Foundations and Methods, reportáže ze seminářů (např. Juggernaut) a dlouhodobé reputabilní diskuse o ruských vysokofrekvenčních metodách. Cirkulující očíslované šablony (#29–#32 atd.) jsou popularizace/příklady a nesmí se brát jako jediný permanentní oficiální program pro každého závodníka.",
    sections: {
      "athlete-and-era": `Boris Sheiko je ruský kouč Silového trojboje, jehož systémy získaly globální vliv, když západní závodníci hledali vysvětlení ruského závodního úspěchu. Relevantní rámec je koučovací metodologie — ne biografie atleta. Anglický přístup se rozšířil semináři, interview a knihou Powerlifting: Foundations and Methods (Sheiko s Mike Israetelem a Derekem Wilcoxem), která se pozicuje jako průvodce principy návrhu programu, ne jako jediný forever spreadsheet.

Historicky západní internetová kultura potkala Sheika často nejdřív přes očíslované rutiny cirkulující online. Reputabilní explainery poznamenávají, že mnoho těchto sheetů sahá k příkladovým plánům spojeným s překlady materiálů — užitečné jako okna do Objemu a Frekvence, nebezpečné když se berou jako one-size-fits-all koučink. Vzdělávací úkol tohoto profilu: oddělit trvanlivé principy od template cargo-cult.

Sportovní kontext: ruské národní týmové prostředí historicky kombinovalo pečlivé plánování s atlety, kteří už měli vysokou technickou baseline. Rekreační závodníci importující nejhustší veřejné příklady bez tohoto kontextu často pletou „slavné“ s „zotavitelné“.`,

      "documented-training-method": `Doložené principy opakovaně spojené se Sheikovým učením zahrnují: (1) vysokou Frekvenci závodních zdvihů — Dřep, Bench press a Mrtvý tah se objevují často přes týden; (2) submaximální loading — většina tréninku zůstává pod pravými maximálními singley, aby opakování zůstala čistá; (3) vysoký kumulativní Objem — týdenní tonnage roste, protože střední intenzity dovolují více kvalitní práce; (4) multi-expozice — zdvihy mohou být více než jednou v týdnu i v session; (5) periodizované bloky — přípravné fáze zdůrazňují Objem, pozdější fáze zvedají intenzitu a řežou Objem k závodu; (6) individualizace v pravém koučinku — publikovaná anglická kniha zdůrazňuje, že uniklé generické plány byly často psané pro konkrétní atlety.

Management únavy není dodatek: submaximální restraint je to, co dělá vysokou Frekvenci životaschopnou. Tento profil nepřetiskuje copyrightované tabulky ani placené šablony. Kde populární weby diskutují rutiny #29–#32, berte je jako historické popularizace ilustrující vlnový loading — ne jako „oficiální Sheiko program navždy“.`,

      "training-structure": `Strukturálně Sheiko-asociované týdny organizují kolem praxe závodních zdvihů s příslušenstvím v podpůrných rolích. Distribuce Objemu favorizuje tonnage Dřep/Bench press/Mrtvý tah. Distribuce intenzity drží většinu sérií v produktivních středních zónách; těžší práce se objevuje, jak bloky postupují.

Progrese napříč tréninkovými bloky typicky jde od vyššího Objemu / střední intenzity k nižšímu Objemu / vyšší intenzitě před závodem. Management únavy je vestavěný do vlny: tvrdé týdny následují redukované; peaking řeže Frekvenci a Objem. Technická praxe je produkt: stovky kvalitních competition-pattern opakování napříč mezocyklem — podpisová výhoda systému pro závodníky, jejichž limiter je stále pozice a konzistence pod únavou.`,

      "volume-intensity-frequency": `Nezávislá analýza: Sheiko systémy otočí knoflík intenzity dolů, aby mohly otočit knoflíky Frekvence a Objemu nahoru. To řeší klasické napětí Silového trojboje — časté maxování ničí Objem potřebný pro technické mistrovství.

Ve srovnání s Conjugate přístupy je specificita k přesným závodním zdvihům vyšší a rotace cviků nižší. Únava se řídí méně změnou zdvihu každý týden a více poctivými zátěžemi a vlněním týdenního stresu.

Běžné nedorozumění: „Sheiko znamená donekonečna kopírovat jedno očíslované PDF.“ Analýza: principy lze aplikovat mnoha kalendáři; spreadsheet bez kontextu Regenerace není koučink. Další nedorozumění: submaximální znamená snadné. Vysoký týdenní tonnage na 70–80 % může být brutálně tvrdý. Viz také strukturované srovnání Sheiko vs Conjugate na této stránce.`,

      "why-it-worked": `Přístup fungoval pro mnoho koučovaných atletů, protože specificita a Objem technické praxe jsou obrovské, únava je kontrolovaná dost na to, aby ten Objem dovolila, a bloková progrese vytváří závodní peak. Sportovní poptávka classic/raw Silového trojboje odměňuje opakovatelné závodní povely — přirozený fit pro častou submaximální praxi.

Dlouhodobá adaptace přichází z let kvalitních opakování, ne z jednoho virálního čtyřtýdenního sheetu. Selekce atletů a koučovací prostředí v národních týmech historicky také hrály roli; rekreační závodníci musí škálovat. Když metoda ve volné přírodě selže, obvyklá příčina je mismatch dávky — příliš mnoho týdenního tonnage na spánek, jídlo a stresový rozpočet — ne mystická chyba „ruské magie“.`,

      "what-lifters-get-wrong": `Závodníci Sheika kazí, když pastují očíslovanou šablonu bez úpravy na Regeneraci, když přeskakují myšlenku, že plány byly často athlete-specific, když berou každou střední sérii jako junk Objem, a když maxují „aby to bylo těžší“ a ničí logiku metody.

Také pletou Sheiko principy s Conjugate rotací, nebo předpokládají, že vysoká Frekvence vyžaduje denní fail. Rozdíl mezi porozuměním systému a slepým kopírováním očíslované šablony je celý smysl tohoto profilu. Pokud nedokážete vysvětlit, proč je týden tvrdý nebo lehký, aniž byste četli barvu buňky ve spreadsheetu, kopírujete formátování — ne koučujete.`,

      "risks-and-recovery": `Rizika zahrnují overuse z vysokých týdenních počtů zdvihů, kloubní iritaci když technika pod únavou degraduje, a podjídání relativně k tonnage. Nároky na Regeneraci jsou vysoké, i když intenzita je střední.

Moderní kontroly: začněte s méně týdenními expozicemi, držte top sety jasně submaximální, vlněte Objem a deloadujte, když padá rychlost osy nebo motivace. Preferujte uříznutí session před přidáním maximálního single „aby to působilo jako trénink“. To je ekonomika tréninku, ne lékařská rada.`,

      "verdict": `Verdikt The Strongest: Sheiko-asociované ruské systémy patří k nejjasnějším vysokofrekvenčním, submaximálním frameworkům stavby souhrnu ve vzdělávání Silového trojboje. Naučte se principy. Škálujte dávku. Nekulte očíslovaný spreadsheet. Srovnávejte promyšleně s Conjugate nástroji spíš než volbou kmene.`,

      "modernised-application": `Modernizace: předepisujte častou praxi závodních zdvihů při RPE-capped zátěžích, vlněte týdenní Objem a peakujte s redukovaným Objemem. Začátečníci potřebují zjednodušené třídenní verze. Středně pokročilí mohou jet 3–4 dny s více Bench press expozicemi. Pokročilí mohou opatrně zvedat týdenní tonnage s plánovanými lehčími týdny.

Praktická sekvence: auditujte současné týdenní tvrdé série na Dřep/Bench press/Mrtvý tah; přidejte jednu extra kvalitní expozici před zvedáním intenzity; držte missy blízko nule; plánujte lehčí týden každé tři až čtyři tvrdé týdny; taperujte session před závodem. Originální modernizované příklady na této stránce jsou interpretace The Strongest — ne copyrightované tabulky.`,

      "example-training-week": `Viz označený originální modernizovaný příkladový týden. Ilustruje Frekvenci a submaximální kvalitu — ne přetisk jakékoli Sheiko knižní tabulky ani očíslované internetové rutiny. Progresivní přetížení zde žije v tonnage a technice, ne v denním Max effort theatru.`,

      sources: `Primární reference prioritizují Sheikovu publikovanou anglickou knihu, reportáže ze seminářů a reputabilní strength-sport explainery. Neoficiální spreadsheet mirrors jsou sekundární popularizace.`,

      "core-training-routine": `Poznámka k historické dokumentaci: následující rekonstruuje veřejně cirkulující strukturální principy Sheiko systému spojeného s dlouhou kariérou Borise Sheika u ruských národních týmů. Jde o vzdělávací historii popisující koučovací systém, ne osobní celebrity rutinu a ne předpis.

Sheiko systém je mezi záznamy v této kolekci neobvyklý tím, že je dokumentován primárně přes očíslované tréninkové šablony — neformálně „Sheiko programy“ — jejichž podpis je Frekvence typicky čtyřikrát týdně, přičemž každá session sahá alespoň na jeden a často dva ze tří závodních zdvihů (Dřep, Bench press, Mrtvý tah) nebo blízkou technickou variantu.

Místo malého počtu Max effort sérií zdůrazňuje rodina šablon vysoký týdenní Objem při převážně submaximálních zátěžích — pracovní procenta široce citovaná zhruba v pásmu 50–80 % 1RM, rozložená přes mnoho sérií nízkých až středních opakování. Bench press je doložen jako trénovaný vícekrát v témže týdnu napříč většinou variant. Tento profil popisuje obecný tvar, jak byl ve sportu široce reportován, aniž by reprodukoval jakoukoli konkrétní očíslovanou šablonu celou.`,

      "documented-nutritional-approach": `Poznámka k historické dokumentaci: následující rekonstruuje veřejně hlášený nutriční kontext kolem Sheiko koučovacího systému a ruské kultury Silového trojboje, z níž vzešel. Jde o vzdělávací historii, ne o předpis; evidence je explicitně system-level, ne osobní dieta připsaná Borisovi Sheikovi.

Na rozdíl od tréninkové metodologie, která je rozsáhle dokumentována očíslovanými šablonami, existuje málo přeloženého, nezávisle ověřitelného veřejného záznamu specifického osobního dietního systému Sheika. Co lze doložit s rozumnou jistotou: širší nutriční kultura kolem sovětských a postsovětských strength-sport institutů — strukturované, třídově uvědomělé stravování vázané na závodní kalendář, s důrazem na dostatečný protein a sacharidy pro podporu velmi vysokých Objemů, které systém vyžaduje.

The Strongest je záměrně konzervativní: dokumentuje system-level nutriční kulturu kolem Sheiko-style tréninku, spíš než vymýšlí konkrétní meal plán, který by zkreslil tenčí evidenci.`,
    },
  },

  "louie-simmons-conjugate-method": {
    profileTitle: "Louie Simmons — Porozumění Conjugate metodě",
    shortTitle: "Conjugate metoda",
    sportLabel: "Silový trojboj",
    era: "Westside Barbell conjugate tradice (konec 20. stol.–2020s veřejné psaní o metodě)",
    nationality: "USA",
    summary:
      "Nezávislá vzdělávací analýza Conjugate metody silně spojené s Louiem Simmonsem a kulturou Westside Barbell: Max effort práce, Dynamic effort práce, repetition effort, rotující speciální cviky, accommodating resistance, rozvoj slabých míst, historický equipped kontext, raw adaptace a běžná internetová špatná čtení, která z náhodných šablon vyrábějí „oficiální“ Westside metody. Zahrnuje srovnání Sheiko vs Conjugate. Nejde o přetisk copyrightovaných knih, placených šablon ani Westside log/grafik.",
    introductoryDisclaimer:
      "Tento profil je nezávislá vzdělávací analýza. Není spojen s Louiem Simmonsem, Westside Barbell ani příbuznými entitami, není jimi autorizován, sponzorován ani doporučován. Nejsou použity Westside Barbell loga ani copyrightované grafiky. Popisy syntetizují veřejně dostupná method articles a eseje. Stránka nereprodukuje copyrightované knihy, placené šablony ani kompletní proprietární programy. Ne každá moderní ‚conjugate-inspired‘ variace je oficiální Westside metoda.",
    seoTitle: "Louie Simmons — Porozumění Conjugate metodě",
    seoDescription:
      "Analýza Conjugate: Max effort, Dynamic effort, speciální cviky, Regenerace, raw vs equipped a srovnání se Sheiko — bez logo cosplay a kultu šablon.",
    keyCharacteristics: [
      "Souběžný rozvoj absolutní síly a speed-strength",
      "Max effort práce na rotujících hlavních cvicích",
      "Dynamic effort práce se submaximálními zátěžemi pohybovanými explozivně",
      "Repetition-effort speciální cviky pro hypertrofii a slabá místa",
      "Accommodating resistance (bands/chains) jako běžný nástroj — ne povinný cosplay",
    ],
    bestFor: [
      "Pokročilé závodníky potřebující nástroje na slabá místa a souběžné silové kvality",
      "Kouče studující organizaci ME/DE/RE",
      "Equipped nebo raw atlety ochotné poctivě adaptovat rotaci a GPP",
    ],
    notRecommendedFor: [
      "Začátečníky, kteří nejdřív potřebují stabilní praxi závodních zdvihů",
      "Závodníky maxující stejný zdvih týdně a nazývající to Conjugate",
      "Kohokoli, kdo bere náhodné band Instagram workupy jako oficiální Westside programování",
    ],
    trainingDays:
      "Klasický veřejný framing často používá čtyři hlavní dny: Max effort lower/upper a Dynamic effort lower/upper, plus příslušenství",
    quickProfile: {
      primaryGoal:
        "Zvednout absolutní sílu a rate of force development při útoku na slabá místa",
      typicalFrequency:
        "Často čtyři primární Conjugate dny týdně ve veřejných Westside-linked osnovách",
      volumeLevel:
        "Vysoký ve speciální/repetition práci; hlavní Max effort Objem je relativně nízký, ale intenzivní",
      intensityProfile:
        "Týdenní near-max singlee na rotujících zdvizích + rychlá submaximální Dynamic effort práce",
      recoveryDemand:
        "Vysoká — extrémní dny vyžadují spacing a disciplínu rotace",
      technicalDifficulty:
        "Vysoká — výběr cviků, accommodating resistance a skill autoregulace",
      bestSuitedFor: "Pokročilí závodníci s koučovací gramotností",
    },
    evidenceQualityNote:
      "Primární veřejné kotvy zahrnují Westside Barbell method articles a eseje Louieho Simmonse (včetně CrossFit Journal overview Westside Conjugate). Knihy jako The Westside Barbell Book of Methods jsou uznány jako primární literatura, ale zde se nereprodukují. Internetové ‚conjugate‘ šablony se široce liší; mnohé jsou adaptace, ne oficiální Westside programy.",
    sections: {
      "athlete-and-era": `Louie Simmons (1947–2022) byl centrální veřejnou postavou Westside Barbell conjugate strength kultury v Columbusu, Ohio. Relevantní analytický rámec je tréninkový systém, který syntetizoval a učil — ne merchandise, loga ani gym mythology.

Historicky Conjugate ideje čerpají ze sovětského Objemu speciálních cviků a bulgarian-like častých těžkých expozic. Simmonsovo veřejné psaní popisuje spojení těchto proudů do týdenní struktury pro Silový trojboj: trénovat absolutní sílu a speed-strength souběžně, rotovat maximální cviky proti akomodaci a útočit na slabiny speciální prací. Westside reputace se budovala silně v equipped Silovém trojboji; moderní raw aplikace existují, ale musí být označené jako adaptace, když se odchylují od klasické klubové praxe.

Internetová éra znásobila interpretace. Některé jsou pečlivé překlady veřejné Max effort / Dynamic effort / RE logiky; jiné jsou sbírky novelty tyčí bez plánu Regenerace. Tento profil zůstává u veřejně doložených method idejí a explicitně odmítá křtít každou moderní variaci jako oficiální Westside doktrínu.`,

      "documented-training-method": `Veřejné Westside/Simmons psaní opakovaně popisuje tři propojené metody:

Max effort (ME): práce k těžkému top single (nebo dennímu maxu) na hlavním zdvihu, který se často rotuje — různé tyče, box heights, specialty pressy/tahy — aby závodníci mohli trénovat near-maximal zátěže celoročně bez grindování identického závodního zdvihu každý týden. Oficiální Westside explainery zdůrazňují, že přeskočení rotace a maxování stejného zdvihu týdně není Conjugate.

Dynamic effort (DE): zvedání submaximálních zátěží s maximální rychlostí, často proti bands nebo chains (accommodating resistance), aby napětí rostlo přes rozsah. Cíl je rate of force development, ne grindování.

Repetition effort (RE): vyšší-rep speciální cviky pro sval a slabá místa po hlavní ME/DE práci. Veřejné články zahrnují zhruba 72hodinový spacing mezi extrémními session, procentové loading na DE vlnách a konstantní diagnózu slabých míst. Accommodating resistance je doložený nástroj — ne požadavek, že každá garáž musí cosplayovat plný band setup, aby „dělala Conjugate“.`,

      "training-structure": `Běžně publikovaná týdenní kostra je Max effort lower, Max effort upper, Dynamic effort lower, Dynamic effort upper, s RE příslušenstvím připojeným k těmto dnům. Distribuce Objemu tíhne ke speciálním cvikům; distribuce intenzity dává pravý near-max stres na ME dny a důraz na rychlost na DE dny.

Progrese je méně jediná lineární procentová vlna a více conjugate kvalit: zvedejte ME rekordy na rotacích, zlepšujte DE rychlost/zátěže přes vlny a zvětšujte slabé svaly přes RE. Management únavy závisí na rotaci a rolích dnů. Když se role zhroutí do „maxovat všechno“, systém selže.

Equipped versus raw: podpůrné vybavení mění, jak vypadají speciální cviky a peaking. Raw závodníci často potřebují více přímého Objemu závodních zdvihů, než klasické equipped Westside šablony implikují. To je adaptace — řekněte to nahlas.`,

      "volume-intensity-frequency": `Nezávislá analýza: Conjugate systémy drží intenzitu vysokou na Max effort dnech změnou cviku a drží rychlostní kvality naživu Dynamic effort. Objem žije většinou v příslušenství. Frekvence jakékoli jedné závodní variace může být nižší než u Sheiko-style vysokofrekvenční competition praxe, zatímco Frekvence tvrdého lower/upper stresu zůstává vysoká.

Ve srovnání se Sheiko-asociovanými systémy Conjugate používá více variace, více near-max singleů a více speciálního problem-solving. Sheiko používá více identické praxe závodních zdvihů při submaximálních zátěžích. Oba mohou stavět souhrny; řeší jiné bottlenecky.

Běžné internetové chyby: používat accommodating resistance bez speed cíle, sbírat specialty tyče bez racionálu slabého místa a přeskakovat RE práci, protože je méně glamorous než Max effort singlee. Viz strukturované srovnání Sheiko vs Conjugate na této stránce.`,

      "why-it-worked": `Fungovalo to v historickém kontextu prevencí akomodace, tréninkem více silových kvalit týdně a neúprosným útokem na individuální slabá místa uvnitř tvrdé tréninkové kultury. Equipped úspěch amplifikoval výsledky, které speciální cviky a synergie vybavení podporovaly.

Dlouhodobé kariéry byly deklarovaný cíl v Simmonsově psaní: rotace a speciální práce mohou šetřit klouby relativně k věčnému maxování stejných tří zdvihů. Sportovní poptávka multi-ply/equipped éry odměňovala ten toolbox; raw éry si stále půjčují kusy s modifikacemi. Veřejná dlouhověkost metody také přichází z jasných rolí dnů — když jsou respektovány, závodníci mohou trénovat tvrdě roky, aniž by každý pondělí byl stejný failovaný závodní Dřep.`,

      "what-lifters-get-wrong": `Závodníci Conjugate kazí, když maxují stejný Dřep každé pondělí, když přidávají bands bez Dynamic effort plánu, když sbírají specialty tyče jako identitu, a když nazývají jakýkoli čtyřdenní split „Westside“.

Selhávají i ignorováním RE práce na slabá místa, pod-zotavením mezi Max effort dny a předpokladem, že equipped Westside outcomes se beze změny přenášejí na raw začátečníky. Ne každá moderní internetová variace je oficiální Westside metoda. Pokud váš program nikdy nerotuje Max effort zdvih, není to Conjugate — bez ohledu na to, kolik chains je v Instagram rámu.`,

      "risks-and-recovery": `Rizika zahrnují overreaching z týdenních maxim, technický breakdown na novelty zdvizích a kloubní stres z zneužité accommodating resistance. Nároky na Regeneraci jsou vysoké.

Moderní kontroly: rotujte Max effort zdvihy, držte Dynamic effort skutečně rychlé, capujte RE když jste bolaví a zvyšte přímou competition praxi pro raw meet prep. Pokud DE rychlost osy umírá, snižte zátěž dřív, než přidáte band tension. To je ekonomika tréninku, ne lékařská rada.`,

      "verdict": `Verdikt The Strongest: Simmonsova Conjugate syntéza zůstává jedním z nejvlivnějších concurrent strength systémů ve vzdělávání Silového trojboje. Používejte Max effort / Dynamic effort / RE s poctivou rotací. Adaptujte pro raw. Odmítněte logo cosplay a kult neoficiálních šablon. Srovnávejte se Sheiko nástroji místo kulturní války. Principy první; branding poslední.`,

      "modernised-application": `Modernizace: čtyřdenní Max effort / Dynamic effort role, jednoduché ME rotace, volitelná light accommodating resistance a solidní RE na slabá místa. Začátečníci sem nepatří. Středně pokročilí mohou použít zjednodušenou Conjugate osnovu. Pokročilí mohou opatrně expandovat menu speciálních cviků.

Praktická raw-friendly sekvence: zvolte dvě lower a dvě upper Max effort variace k rotaci; jeďte Dynamic effort bez bands, dokud není rychlost osy konzistentně rychlá; přidejte RE na skutečné slabé místo, které se ukáže na závodních pokusech; zvyšte Objem competition stance v závěrečných týdnech před raw závodem. Originální příklady jsou interpretace The Strongest — ne Westside copyrightované programy.`,

      "example-training-week": `Viz označený originální modernizovaný příklad. Ilustruje role Max effort / Dynamic effort bez přetisku proprietárních Westside šablon. Použijte ho jako koučovací sketch rolí dnů a spacingu Regenerace; každou zátěž upravte na technickou kvalitu. Žádný den není oficiální Westside transcript.`,

      sources: `Primární reference prioritizují Westside Barbell veřejné method articles a eseje Louieho Simmonse (včetně CrossFit Journal overview). Knihy jako The Westside Barbell Book of Methods jsou uznány jako literární kotvy bez reprodukce obsahu. Neoficiální internetové spreadsheety jsou adaptace, pokud je Westside explicitně nepublikoval jako takové.`,

      "core-training-routine": `Poznámka k historické dokumentaci: následující rekonstruuje veřejně doložené strukturální principy Louieho Simmonsovy Conjugate metody, jak se praktikovala na Westside Barbell. Jde o vzdělávací historii popisující koučovací systém budovaný desítkami let Simmonsových vlastních článků a interview, ne o předpis.

Týdenní struktura Conjugate je neobvykle dobře dokumentovaná, protože Simmons o ní desítky let psal a mluvil. Jádro: čtyřdenní split Max Effort Lower, Max Effort Upper, Dynamic Effort Lower, Dynamic Effort Upper — maximální práce a rychlostní práce odděleně, ne smíchané v jedné session.

Na Max effort dnech rotuje near-maximal variace — box squaty různých výšek, good mornings, rack pulls, specialty tyče — k pravému 1–3RM pro danou variaci, s rotací cviku zhruba každých 1–3 týdny. Dynamic effort dny: submaximální procenta (veřejně ~50–60 % training maxu pro Dřep/Mrtvý tah) s maximální zamýšlenou rychlostí osy přes více sérií nízkých opakování, často s chains/bands. Speciální práce — reverse hyperextensions, glute-ham raises, sled — doplňuje systém.`,

      "documented-nutritional-approach": `Poznámka k historické dokumentaci: následující rekonstruuje veřejně dostupný kontext výživy uvnitř Westside Barbell tréninkové kultury spojené s Louiem Simmonsem. Jde o vzdělávací historii, ne o předpis; evidence je explicitně tenčí než rozsáhlá dokumentace samotné Conjugate metody.

Simmons je dokumentován téměř výhradně skrze příspěvky k tréninkové metodologii, ne výživě; neexistuje široce cirkulující formálně publikovaný Simmons diet systém srovnatelný s tréninkovými šablonami. Ve veřejném záznamu je většinou anekdotické: interview komentáře a gym culture reference popisující přímočarý, neglamourní, vysokoproteinový přístup Midwestern American strength-sport gym kultury — dostatek jídla pro podporu velmi těžkého tréninku spíš než specifická periodizovaná makro strategie.

The Strongest pojmenovává tuto evidenci gap otevřeně, místo aby ji plnil vymyšlenou specificitou. Conjugate veřejný odkaz je převážně tréninkově-metodologický. Poctivé historické tvrzení: Simmons a Westside komunita jsou doloženi jako prioritizující jednoduché, protein-forward stravování pro podporu těžkého zdvihání — bez formálně publikovaného nebo nezávisle ověřeného osobního dietního systému.`,
    },
  },
};
