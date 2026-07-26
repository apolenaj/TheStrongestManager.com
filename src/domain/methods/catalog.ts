import type { TrainingMethod } from "@/domain/methods/types";

/**
 * Curated Training Methods catalog (Prompt 27).
 * Historical sections describe systems as they were framed by originators / tradition.
 * modernInterpretation is separate — evidence-aware coaching framing without invented citations.
 */

export const TRAINING_METHODS: TrainingMethod[] = [
  {
    slug: "linear-periodization",
    name: "Linear periodization",
    aliases: ["classic periodization", "linear progression periodization", "LP"],
    categories: ["powerlifting", "weightlifting", "general_strength", "athletic_performance"],
    summary:
      "Classic volume-to-intensity progression across mesocycles — historically foundational, still widely adapted.",
    overview:
      "Linear periodization organizes training into sequential phases that generally move from higher volume / lower relative intensity toward lower volume / higher relative intensity (and often more specificity) as a competition or peak approaches. In classical sport science framing associated with mid-20th-century Soviet periodization literature (often linked in Western coaching to Matveyev’s popularization), the year or macrocycle is divided so that qualities are emphasized in order rather than developed equally every week.",
    origins:
      "Western coaching commonly traces popular “linear” templates to Soviet periodization models described and translated for sport in the mid–late 20th century. Those models were developed for multi-week and multi-month preparation of athletes in formal competitive calendars—not as a single “beginner gym program.” Later commercial strength programs simplified the idea into week-by-week load increases or block sequences labeled “linear.” Historical descriptions should not be collapsed into any one commercial ebook template.",
    corePrinciples: [
      "Phase emphasis shifts over time (e.g., general preparation → specific preparation → competitive).",
      "Volume and intensity are planned as related variables, typically inverse across late phases.",
      "Specificity and competition peaking increase closer to the target event.",
      "Fatigue is managed by changing the training stress profile across mesocycles, not only by “going harder every week.”",
    ],
    bestUseCases: [
      "Athletes with a clear competition date who need a structured peak.",
      "Lifters who respond well to longer phases of similar stimulus before changing emphasis.",
      "Team or club settings that need a shared seasonal calendar.",
    ],
    limitations: [
      "Long exclusive phases can under-maintain qualities not emphasized (e.g., strength during high-volume hypertrophy blocks).",
      "Rigid year-long plans fit poorly when schedules, health, or life stress change weekly.",
      "Beginners often need simpler progressive overload more than elaborate periodization jargon.",
    ],
    fatigueProfile: "variable",
    fatigueNotes:
      "Early/high-volume phases can accumulate substantial systemic fatigue; peaking phases often reduce volume while raising neurological demand. Profile depends entirely on dosing.",
    suitableAthletes: [
      "Intermediate+ strength athletes with a meet or test day",
      "Olympic weightlifters and track athletes on seasonal calendars",
      "General strength trainees who prefer clear phase themes",
    ],
    programmingExample:
      "Example 12-week strength focus (illustrative): Weeks 1–4 accumulation (3–5 sets of 6–10 @ ~65–75% on main lifts, higher accessory volume). Weeks 5–8 intensification (3–5 sets of 3–5 @ ~75–87%). Weeks 9–11 realization / peak (2–4 sets of 1–3 @ ~87–95%+ with reduced accessories). Week 12 test or taper. This is a teaching sketch—not an individualized program.",
    modernInterpretation:
      "Contemporary coaches often keep the phase logic but shorten exclusive blocks, overlap qualities (see block periodization / DUP), and adjust to readiness. Formal evidence on “which periodization is best” is mixed and context-dependent; linear sequencing remains a useful organizing story, not a proven universal optimum. Treat historical Soviet models and modern gym “LP” apps as related but not identical.",
    commonMistakes: [
      "Calling any weekly load increase “linear periodization.”",
      "Skipping accumulation and living permanently in heavy singles.",
      "Ignoring that historical models assumed high training literacy and support systems.",
      "Copying a powerlifting meet peak for a bodybuilding show (different specificity).",
    ],
    relatedMethodSlugs: ["block-periodization", "daily-undulating-periodization", "high-frequency-training"],
    evidenceHonesty:
      "Origins are historical/sport-science tradition. Comparative superiority over other periodization styles is not settled as a single evidence verdict—frame outcomes as coaching practice plus limited, context-bound research.",
    contentStatus: "reviewed",
    isPublished: true,
  },
  {
    slug: "block-periodization",
    name: "Block periodization",
    aliases: ["block training", "concentrated loading", "Issurin blocks"],
    categories: ["athletic_performance", "weightlifting", "powerlifting", "general_strength"],
    summary:
      "Concentrated blocks that prioritize one or few abilities, then sequence residual effects across the plan.",
    overview:
      "Block periodization concentrates training on a limited set of abilities in a mesocycle (“block”), then sequences blocks so residual training effects carry into later stages. Unlike a long classical linear year that spreads many qualities thinly, block models deliberately create focused overload followed by a shift in emphasis.",
    origins:
      "Associated in modern coaching literature especially with Vladimir Issurin’s presentation of block periodization for high-performance sport, building on earlier concentrated-loading ideas in Eastern European sport science. Historical descriptions emphasize highly trained athletes and carefully managed residuals—not generic “do hypertrophy then strength then power” Instagram calendars alone.",
    corePrinciples: [
      "Few abilities receive primary emphasis per block.",
      "Blocks are sequenced to exploit residual effects of prior concentrated work.",
      "Volume and intensity are organized around the block’s target quality.",
      "Monitoring and timely transition matter when residuals fade.",
    ],
    bestUseCases: [
      "Advanced athletes needing concentrated overload without year-long dilution.",
      "Sports with multiple peaks or short preparation windows.",
      "Strength athletes rotating hypertrophy, strength, and peaking emphases deliberately.",
    ],
    limitations: [
      "Poor sequencing can leave a quality cold when it is needed.",
      "Highly concentrated loading can be brutal if recovery and life stress are ignored.",
      "Novices rarely need true concentrated blocks.",
    ],
    fatigueProfile: "high",
    fatigueNotes:
      "Accumulation-style blocks can drive high fatigue by design; transition/realization blocks should manage that fatigue while expressing performance.",
    suitableAthletes: [
      "Advanced competitive athletes",
      "Weightlifters and track & field athletes",
      "Experienced powerlifters structuring meet prep",
    ],
    programmingExample:
      "Illustrative 3-block strength sequence: Accumulation (3 weeks) — higher volume squat/bench/deadlift variations @ RPE 6–8, 4–6 work sets. Transmutation (3 weeks) — competition lifts prioritized, 3–5 sets of 2–4 @ RPE 7–9. Realization (2 weeks) — lower volume, heavier singles/doubles, taper into test. Residuals and timing are the point—adjust rather than copy blindly.",
    modernInterpretation:
      "Coaches borrow block language widely; fidelity to Issurin’s high-performance framing varies. Modern strength sport often blends block ideas with undulating weekly variation. Evidence comparing block vs other periodization is not a simple winner-takes-all result—use the model for concentration and residuals, not as marketing certainty.",
    commonMistakes: [
      "Running “blocks” that still train everything equally.",
      "Stacking high-fatigue blocks without a planned transition.",
      "Applying elite concentrated loading to beginners.",
    ],
    relatedMethodSlugs: ["linear-periodization", "daily-undulating-periodization", "conjugate"],
    evidenceHonesty:
      "Block theory is rooted in sport-science literature and elite practice. Broad RCT-style proof that block always beats alternatives for gym trainees is limited—keep historical theory and modern gym adaptations distinct.",
    contentStatus: "reviewed",
    isPublished: true,
  },
  {
    slug: "daily-undulating-periodization",
    name: "Daily undulating periodization (DUP)",
    aliases: ["DUP", "undulating periodization", "daily undulating"],
    categories: ["powerlifting", "general_strength", "bodybuilding", "athletic_performance"],
    summary:
      "Frequent variation of intensity/volume/rep targets within the week rather than long exclusive phases.",
    overview:
      "Daily undulating periodization varies training stimuli across sessions in a microcycle—e.g., hypertrophy, strength, and power/intensity days in the same week—instead of dedicating multi-week blocks to a single exclusive emphasis. The historical research conversation often contrasts undulating models with linear models for strength development.",
    origins:
      "Undulating periodization concepts appear in periodization literature as alternatives to strictly linear sequencing. In strength coaching communities (especially powerlifting-oriented online education from the 2000s onward), “DUP” became a popular label for weekly rotation of rep ranges and loads on the same lifts. Academic and coach uses of “undulating” are related but not always identical to forum shorthand.",
    corePrinciples: [
      "Stimulus varies within the week (load, reps, proximity to failure, or exercise focus).",
      "Main lifts can be trained frequently with different session roles.",
      "Avoids long exclusive neglect of a quality when weekly undulation maintains it.",
      "Still requires planned progression—not random workout roulette.",
    ],
    bestUseCases: [
      "Lifters who stall on monotonous linear weeks.",
      "Powerlifters training competition lifts 2–4+ times weekly with varied intents.",
      "Hypertrophy-focused trainees who want heavy and moderate days without long blocks.",
    ],
    limitations: [
      "Poorly designed undulation becomes noise without progressive overload.",
      "High frequency plus high fatigue on every day can bury recovery.",
      "Not automatically superior for every population.",
    ],
    fatigueProfile: "moderate_high",
    fatigueNotes:
      "Frequency can distribute fatigue, but multiple hard days per week still accumulate. Session RPE and weekly hard-set budgets matter.",
    suitableAthletes: [
      "Intermediate powerlifters",
      "General strength trainees with 3–5 training days",
      "Bodybuilders using heavy/light/moderate rotations",
    ],
    programmingExample:
      "Illustrative squat week: Day A — 4×6–8 @ RPE 7 (hypertrophy). Day B — 5×3 @ RPE 8 (strength). Day C — 6×2 @ RPE 7 with pauses or speed emphasis. Progress by adding load or reps within the day’s target zone across weeks.",
    modernInterpretation:
      "DUP is often treated as a default “smart” template online. Research comparing undulating vs linear designs shows mixed results depending on population and exact programming. Modern use is best framed as flexible weekly variation with clear progression rules—not as a guaranteed evidence-based superiority claim.",
    commonMistakes: [
      "Changing exercises every session and calling it DUP.",
      "Making every undulating day an all-out PR attempt.",
      "Ignoring weekly volume when frequency rises.",
    ],
    relatedMethodSlugs: ["linear-periodization", "block-periodization", "high-frequency-training"],
    evidenceHonesty:
      "Some experimental comparisons exist for undulating vs linear schemes; findings are not universal. Separate the research conversation from popular powerlifting DUP blogs.",
    contentStatus: "reviewed",
    isPublished: true,
  },
  {
    slug: "conjugate",
    name: "Conjugate method",
    aliases: ["conjugate periodization", "Westside conjugate", "concurrent max effort / dynamic effort"],
    categories: ["powerlifting", "strongman", "general_strength"],
    summary:
      "Concurrent max-effort, dynamic-effort, and repetition work with frequent variation—popularized in powerlifting via Westside.",
    overview:
      "In strength sport coaching, “conjugate” usually refers to concurrent development of maximal strength, speed-strength, and hypertrophy/work capacity within the same weekly structure, using rotating max-effort variations, dynamic-effort (speed) work, and repetition methods. It is often associated with Louie Simmons / Westside Barbell’s presentation of conjugate training for powerlifters, itself drawing on broader Soviet concurrent/complex ideas—though commercial Westside practice is its own evolved system.",
    origins:
      "Soviet sport science discussed concurrent and complex training of multiple abilities. Westside Barbell’s conjugate system (late 20th / early 21st century U.S. powerlifting culture) operationalized a specific weekly template: max effort upper/lower, dynamic effort upper/lower, endless special exercises, and accommodating resistance. Historical honesty requires separating (1) Soviet concurrent concepts, (2) Westside’s documented gym practice, and (3) internet “conjugate” clones that only rotate box squats.",
    corePrinciples: [
      "Maximal strength trained via rotating variations to near-max loads.",
      "Speed-strength trained with submaximal loads and intent (often with bands/chains in Westside practice).",
      "Repetition / hypertrophy / GPP work supports structure and work capacity.",
      "Special exercises address weak points rather than only competition form year-round.",
    ],
    bestUseCases: [
      "Advanced powerlifters with equipment and coaching literacy.",
      "Strongman athletes needing varied strengths and GPP.",
      "Lifters bored or stalled on narrow peaking-only templates.",
    ],
    limitations: [
      "Complex to autoregulate well without experience.",
      "Max-effort days are neurologically costly if overdone.",
      "Raw beginners do not need full Westside machinery.",
    ],
    fatigueProfile: "high",
    fatigueNotes:
      "Frequent heavy variations plus volume work can produce high systemic and joint stress. Dynamic days are not “light” if volume or accommodating resistance is aggressive.",
    suitableAthletes: [
      "Advanced powerlifters",
      "Strongman competitors",
      "Experienced general strength athletes with recovery capacity",
    ],
    programmingExample:
      "Illustrative week: ME Lower — work up to a heavy 1–3 on a squat/deadlift variation. DE Lower — 8–12×2 box squats @ ~50–60% + bands (if used) with short rests. ME Upper — heavy press variation. DE Upper — speed bench triples. Accessory repetition work for back, hamstrings, and triceps. Rotate ME variations weekly or biweekly.",
    modernInterpretation:
      "Many athletes run “conjugate-inspired” programs with less accommodating resistance and fewer exotic specials. Outcomes depend on variation quality, recovery, and whether max-effort truly means trained maxes. Do not treat Westside lore, Soviet texts, and Reddit spreadsheets as one evidence hierarchy—they are different layers.",
    commonMistakes: [
      "Max-effort every session without rotation or recovery.",
      "Dynamic effort with slow bar speed and junk fatigue.",
      "Copying geared Westside volumes for raw beginners.",
    ],
    relatedMethodSlugs: ["block-periodization", "high-frequency-training", "cluster-sets"],
    evidenceHonesty:
      "Conjugate-as-Westside is largely practice-based high-performance coaching culture. Formal evidence for the full commercial system as a package is limited; discuss history and practice separately from “proven best method” claims.",
    contentStatus: "reviewed",
    isPublished: true,
  },
  {
    slug: "high-frequency-training",
    name: "High-frequency training",
    aliases: ["HFT", "high frequency lifting", "frequent exposure"],
    categories: ["powerlifting", "weightlifting", "general_strength", "athletic_performance"],
    summary:
      "Training a lift or muscle group often across the week to distribute volume and practice skill.",
    overview:
      "High-frequency training increases how often a movement or muscle group is trained per week—often while managing per-session volume so weekly volume remains productive. In strength sports this can mean squatting or clean & jerking many times weekly; in hypertrophy contexts it can mean hitting a muscle 3–6+ times with smaller sessions.",
    origins:
      "Frequent practice is historically normal in weightlifting and many sports. Bodybuilding culture swung between high-frequency and low-frequency “bro-split” eras. Modern online strength education revived high-frequency competition-lift exposure as a contrast to once-weekly specialization. There is no single inventor—frequency is a programming variable with a long practical history.",
    corePrinciples: [
      "Skill and technique benefit from frequent, quality exposures.",
      "Weekly volume can be fractionated across days to manage per-session fatigue.",
      "Intensity and proximity to failure must be constrained so frequency remains sustainable.",
      "Frequency without progressive overload is just calendar density.",
    ],
    bestUseCases: [
      "Technical lifts (Olympic lifts, squat, bench) needing practice.",
      "Lifters who recover better from smaller, repeated sessions.",
      "Peaking phases where frequent heavy technique is prioritized carefully.",
    ],
    limitations: [
      "Joint and connective tissue may lag behind muscle recovery.",
      "Life schedule constraints make true HFT impractical for many.",
      "Junk volume rises if every session is pushed hard.",
    ],
    fatigueProfile: "moderate_high",
    fatigueNotes:
      "Per-session fatigue may be lower; weekly and tissue fatigue can still be high. Watch cumulative hard sets and sleep.",
    suitableAthletes: [
      "Weightlifters",
      "Powerlifters emphasizing competition lifts",
      "Intermediates with recovery and time",
    ],
    programmingExample:
      "Illustrative bench frequency: 4 days — (1) 5×5 @ RPE 7, (2) 6×3 paused @ RPE 7.5, (3) 3×8 close-grip @ RPE 7, (4) 8×2 speed @ RPE 6–7. Total hard sets managed weekly; add load slowly.",
    modernInterpretation:
      "Evidence on optimal frequency for hypertrophy often suggests multiple exposures can work when volume is equated; strength skill clearly benefits from practice. “Higher frequency is always better” is an oversimplification—equated volume, intensity distribution, and individual recovery dominate.",
    commonMistakes: [
      "Turning every frequent day into a meet attempt.",
      "Ignoring tendons while chasing frequency PRs.",
      "Equating frequency with ignoring progressive overload.",
    ],
    relatedMethodSlugs: ["daily-undulating-periodization", "cluster-sets", "linear-periodization"],
    evidenceHonesty:
      "Frequency literature exists (especially hypertrophy volume-equated comparisons) but is not a mandate for maximal frequency. Historical sport practice and modern studies should be cited carefully and not blended into slogans.",
    contentStatus: "reviewed",
    isPublished: true,
  },
  {
    slug: "high-intensity-training",
    name: "High-intensity training (HIT)",
    aliases: ["HIT", "Heavy Duty", "Mentzer HIT", "one-set-to-failure training"],
    categories: ["bodybuilding", "general_strength"],
    summary:
      "Low-volume, high-effort bodybuilding approach—often brief workouts taken near or to failure—distinct from “high %1RM intensity.”",
    overview:
      "In bodybuilding history, High-intensity Training (HIT) refers to brief, infrequent sessions emphasizing very high effort (often to failure or beyond with intensity techniques), associated especially with Arthur Jones and later Mike Mentzer’s Heavy Duty philosophy. This is not the same as strength-sport “intensity” meaning percentage of 1RM. Confusing those terms is a common modern error.",
    origins:
      "Arthur Jones (Nautilus) promoted brief, hard, infrequent training in the 1970s. Mike Mentzer developed Heavy Duty as a HIT-derived system emphasizing recovery and extreme effort. These are historical bodybuilding philosophies with strong rhetorical claims; they should be described as such—not rewritten as contemporary evidence consensus.",
    corePrinciples: [
      "Effort per set is extremely high; volume is deliberately low.",
      "Recovery between sessions is treated as a limiting factor.",
      "Progression is sought via load/reps under strict effort conditions.",
      "Workouts are short relative to high-volume bodybuilding norms.",
    ],
    bestUseCases: [
      "Trainees with limited time who recover poorly from high volume.",
      "Temporary low-volume resets after junk-volume phases.",
      "Machines or controlled environments where failure is safer to manage.",
    ],
    limitations: [
      "Skill practice for complex barbell lifts may be underdosed.",
      "Failure-heavy training can be joint-stressful and hard to progress long-term for some.",
      "Historical HIT claims of universal superiority were stronger than the evidence base.",
    ],
    fatigueProfile: "moderate",
    fatigueNotes:
      "Session duration is short, but per-set fatigue and systemic stress from failure can still be large. Frequency is typically low by design.",
    suitableAthletes: [
      "Bodybuilding-oriented trainees preferring low volume",
      "Time-constrained intermediates",
      "Lifters who overreach on high-volume plans",
    ],
    programmingExample:
      "Illustrative HIT-inspired day (not Mentzer dogma): 1–2 working sets per movement to near-failure on machine leg press, chest press, row, and pulldown; 2–4 workouts weekly with full-body or split layouts. Track load×reps; add when targets are exceeded. Avoid treating this as medical advice or guaranteed maximal growth.",
    modernInterpretation:
      "Modern hypertrophy research generally finds volume (hard sets) matters within recoverable ranges; very low volume can work for some but is not uniquely optimal for all. Keep HIT’s historical philosophy distinct from today’s volume-landmark discussions. Also keep HIT distinct from powerlifting “high intensity” peaking.",
    commonMistakes: [
      "Confusing HIT with training at 90%+ of 1RM.",
      "Going to failure on every barbell squat variation weekly.",
      "Assuming Mentzer-era absolutism equals current evidence.",
    ],
    relatedMethodSlugs: ["rest-pause", "myo-reps", "german-volume-training"],
    evidenceHonesty:
      "HIT/Heavy Duty are historical coaching philosophies. Contemporary evidence does not crown single-set-to-failure as universally best; present origins as history and modern takeaways as interpretation.",
    contentStatus: "reviewed",
    isPublished: true,
  },
  {
    slug: "rest-pause",
    name: "Rest-pause",
    aliases: ["rest pause training", "rest-pause sets"],
    categories: ["bodybuilding", "general_strength", "powerlifting"],
    summary:
      "Broken sets with short intra-set rests to extend effective reps near failure without full set resets.",
    overview:
      "Rest-pause training performs a set near failure, rests briefly (often 10–30 seconds), then continues with the same load for additional mini-sets. It is an intensity technique for accumulating hard reps when straight sets become impractical, used across bodybuilding and sometimes strength contexts.",
    origins:
      "Rest-pause appears throughout mid/late-20th-century bodybuilding practice and instructional media as an intensification method. It is a technique lineage more than a single inventor’s trademarked system—though specific coaches branded particular rest-pause templates.",
    corePrinciples: [
      "Short rests keep the set in a high-effort zone.",
      "Total effective reps rise without immediately dropping the load.",
      "Best applied selectively, not on every exercise every day.",
      "Form standards must stay intact across mini-sets.",
    ],
    bestUseCases: [
      "Hypertrophy work on machines or stable movements.",
      "Time-efficient hard sets for accessories.",
      "Advanced bodybuilding intensification blocks.",
    ],
    limitations: [
      "Risky on technical free-weight max-effort lifts if form collapses.",
      "Easy to turn into ego failure and excessive fatigue.",
      "Not a complete program by itself.",
    ],
    fatigueProfile: "moderate_high",
    fatigueNotes:
      "Metabolic and local muscular fatigue can be high relative to straight sets at the same load. Systemic cost rises if used broadly.",
    suitableAthletes: [
      "Intermediate+ bodybuilding trainees",
      "Lifters needing accessory density",
      "Not ideal as default for beginners on squat/deadlift",
    ],
    programmingExample:
      "Illustrative: Leg press — load for ~8–12 reps @ RPE 9, rest 20 seconds, repeat mini-sets until 15–20 total effective reps. Use on 1–2 movements per session.",
    modernInterpretation:
      "Rest-pause is a practical way to organize proximity-to-failure volume. Modern hypertrophy coaching often values hard sets; rest-pause is one tool among drop sets, myo-reps, and clusters. Evidence specifically crowning rest-pause is limited—frame as coaching practice.",
    commonMistakes: [
      "Rest-pausing competition peaking singles as “volume.”",
      "Rests so long the method becomes ordinary straight sets.",
      "Sacrificing range of motion to chase extra reps.",
    ],
    relatedMethodSlugs: ["myo-reps", "cluster-sets", "high-intensity-training"],
    evidenceHonesty:
      "Primarily coaching-practice intensification. Do not invent trial citations; describe historical gym use and modern programming role separately.",
    contentStatus: "reviewed",
    isPublished: true,
  },
  {
    slug: "myo-reps",
    name: "Myo-reps",
    aliases: ["myoreps", "Myo-Reps"],
    categories: ["bodybuilding", "general_strength"],
    summary:
      "Activation set plus short rest-pause mini-sets aimed at efficient hypertrophic stimulus.",
    overview:
      "Myo-reps is a structured rest-pause style popularized by Borge Fagerli: an activation set taken near failure in a moderate rep range, followed by short rests and mini-sets that accumulate effective reps while managing fatigue. It is a branded modern programming heuristic rooted in rest-pause tradition.",
    origins:
      "Developed and popularized by Borge Fagerli in the contemporary evidence-aware bodybuilding coaching space (2000s–2010s onward). It should be presented as a modern method with a named originator, not as ancient tradition—and not as a synonym for every rest-pause variant.",
    corePrinciples: [
      "Activation set reaches a high level of motor unit recruitment.",
      "Mini-sets use brief rests to maintain effective stimulus efficiently.",
      "Total effective reps are the target, not endless junk sets.",
      "Auto-regulation stops the series when performance drops off criteria.",
    ],
    bestUseCases: [
      "Hypertrophy accessories and machine work.",
      "Time-efficient muscle-building sessions.",
      "Trainees who understand proximity to failure.",
    ],
    limitations: [
      "Poor candidate for highly technical maximal lifts.",
      "Easy to underdose if activation sets are too easy.",
      "Requires honest RPE/failure awareness.",
    ],
    fatigueProfile: "moderate",
    fatigueNotes:
      "Often lower time cost than many straight sets to the same effective-rep target; local fatigue can still be substantial.",
    suitableAthletes: [
      "Intermediate bodybuilding trainees",
      "Busy lifters seeking efficient volume",
      "Athletes using evidence-aware hypertrophy programming",
    ],
    programmingExample:
      "Illustrative: Cable row — activation 12 reps @ ~RPE 9, rest 5–10 breaths, then mini-sets of 3–5 reps until 3–5 mini-sets completed or reps fall off. Progress load when upper end is easy.",
    modernInterpretation:
      "Myo-reps sits within modern hypertrophy thinking about effective reps and recruitment. It is coaching methodology with a clear author; treat claims about optimality as interpretation, not settled universal physiology law.",
    commonMistakes: [
      "Calling any rest-pause “Myo-reps.”",
      "Using Myo-reps for heavy competition deadlifts routinely.",
      "Stopping far from failure and expecting maximal stimulus.",
    ],
    relatedMethodSlugs: ["rest-pause", "cluster-sets", "high-intensity-training"],
    evidenceHonesty:
      "Modern authored method. Supporting ideas draw on hypertrophy reasoning used in coaching communities; do not fabricate specific paper support on this page.",
    contentStatus: "reviewed",
    isPublished: true,
  },
  {
    slug: "cluster-sets",
    name: "Cluster sets",
    aliases: ["clusters", "cluster training", "intra-set rest"],
    categories: ["powerlifting", "weightlifting", "athletic_performance", "general_strength"],
    summary:
      "Intra-set rests that preserve output quality for strength, power, or high-quality volume.",
    overview:
      "Cluster sets break a target rep scheme into smaller chunks with short planned rests (e.g., 15–45+ seconds) so bar speed, technique, or load can stay higher than in unbroken straight sets. Used in strength and power training to accumulate high-quality reps.",
    origins:
      "Cluster and flexible set structures appear in strength & conditioning practice and literature discussing intra-set rest for maintaining power output. They are programming tools with research and coaching lineages—not a single social-media invention—though online strength culture popularized specific cluster templates.",
    corePrinciples: [
      "Short rests protect velocity/technique under fatigue.",
      "Total reps can match or exceed straight sets at higher quality.",
      "Rest intervals are planned, not accidental scrolling breaks.",
      "Intent (strength vs power vs hypertrophy) changes cluster design.",
    ],
    bestUseCases: [
      "Heavy strength work where unbroken sets degrade form.",
      "Olympic lift and thrower power sessions.",
      "Accumulating volume at higher percentages with cleaner reps.",
    ],
    limitations: [
      "Sessions take longer than straight sets.",
      "Hypertrophy metabolic stress may differ from unbroken sets.",
      "Overcomplicated for beginners who need simple progression.",
    ],
    fatigueProfile: "moderate",
    fatigueNotes:
      "Neurological quality stays higher; session density and total tonnage still drive fatigue. Not automatically “easy.”",
    suitableAthletes: [
      "Weightlifters and power athletes",
      "Powerlifters on heavy technique volume",
      "Intermediates with time for longer sessions",
    ],
    programmingExample:
      "Illustrative strength cluster: Squats 5 clusters of (2+2) @ ~80–85% with 20–30s inside the cluster and 2–3 min between clusters. Record best bar speed/feel; progress load when clusters stay crisp.",
    modernInterpretation:
      "Clusters are widely used in S&C for quality under load. Research on intra-set rest often focuses on power maintenance; hypertrophic comparisons depend on design. Keep the tool framed as programming practice with situational evidence—not a miracle set structure.",
    commonMistakes: [
      "Clusters so loose they become ordinary rest-pause failure training.",
      "Using clusters to hide that the load is simply too heavy.",
      "Ignoring total session time and weekly volume.",
    ],
    relatedMethodSlugs: ["rest-pause", "conjugate", "high-frequency-training"],
    evidenceHonesty:
      "Supported by S&C practice and some experimental work on intra-set rest/power; not a blanket evidence claim for all goals. Separate historical/practical use from overstated marketing.",
    contentStatus: "reviewed",
    isPublished: true,
  },
  {
    slug: "german-volume-training",
    name: "German Volume Training (GVT)",
    aliases: ["GVT", "10×10 training", "ten sets of ten"],
    categories: ["bodybuilding", "general_strength"],
    summary:
      "High-volume template classically associated with 10×10 at moderate loads—demanding and easy to mismanage.",
    overview:
      "German Volume Training typically refers to performing 10 sets of 10 reps on a major lift at a moderate load (often around ~60% 1RM in popular presentations), with fixed rests, aiming for hypertrophy and work capacity. It is a high-volume challenge program more than a complete historical “German national system.”",
    origins:
      "Popularized in English-language coaching media especially via Charles Poliquin’s presentations of “German Volume Training,” drawing on high-volume hypertrophy practices associated with mid-century European weight training culture. Exact historical purity claims vary; treat popular GVT as a branded modern template inspired by high-volume traditions—not as a single archival protocol everyone in Germany followed.",
    corePrinciples: [
      "High set count on primary movements (classically 10×10).",
      "Moderate loads that become extremely hard as sets accumulate.",
      "Strict rest intervals to keep density high.",
      "Accessory work is limited because the main dose is already large.",
    ],
    bestUseCases: [
      "Short hypertrophy specialization blocks for intermediates who recover well.",
      "Off-season bodybuilding volume challenges with machine or stable variations.",
      "Lifters who underdose volume and need a supervised shock phase.",
    ],
    limitations: [
      "Very high fatigue; joint and motivation costs can be severe.",
      "Form breakdown across late sets is common.",
      "Poor fit near strength peaks or for beginners.",
    ],
    fatigueProfile: "high",
    fatigueNotes:
      "Among the more fatiguing popular hypertrophy templates when run as true 10×10. Sleep, stress, and deloads matter.",
    suitableAthletes: [
      "Intermediate bodybuilding-oriented trainees",
      "Lifters with solid technique and recovery",
      "Not recommended as year-round default",
    ],
    programmingExample:
      "Illustrative GVT-inspired week: Bench press 10×10 @ starting load you can complete with ~60–90s rests; when all 10×10 succeed, add load next cycle. Pair with a lighter antagonistic movement. Run 4–6 weeks max, then return to moderate volume. Modify to 8×8 or 6×10 if recovery fails—dogmatic 10×10 is not mandatory.",
    modernInterpretation:
      "Modern hypertrophy thinking often achieves growth with less extreme set counts if hard sets are high quality. GVT remains a valid high-volume specialization tool, but popular claims of unique superiority should be treated skeptically. Distinguish Poliquin-era popularization from vague “European secret” mythology.",
    commonMistakes: [
      "Starting too heavy so sets 6–10 become grind junk.",
      "Running GVT year-round.",
      "Adding full bro-split volume on top of 10×10 primaries.",
    ],
    relatedMethodSlugs: ["high-intensity-training", "rest-pause", "linear-periodization"],
    evidenceHonesty:
      "GVT as commonly practiced is a popular coaching template with historical high-volume roots. Strong unique-evidence claims are not established here—label history/popularization vs modern volume science interpretation clearly.",
    contentStatus: "reviewed",
    isPublished: true,
  },
];

export function getPublishedMethods(): TrainingMethod[] {
  return TRAINING_METHODS.filter((m) => m.isPublished);
}

export function getMethodBySlug(slug: string): TrainingMethod | undefined {
  return getPublishedMethods().find((m) => m.slug === slug);
}
