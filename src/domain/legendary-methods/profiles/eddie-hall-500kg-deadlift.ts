import {
  CONTENT_ACCESS_DATE,
  LEGENDARY_PUBLISH_DATE,
  sectionsWithBodiesForSlug,
} from "@/domain/legendary-methods/profiles/helpers";
import type { LegendaryMethodProfile } from "@/domain/legendary-methods/types";

/**
 * Eddie Hall — 500 kg deadlift training analysis (Prompt 5B).
 * Distinguishes official competition performance, interview claims, footage, and independent coaching interpretation.
 * Does not reproduce any proprietary programme.
 */
export const EDDIE_HALL_500KG_DEADLIFT: LegendaryMethodProfile = {
  slug: "eddie-hall-500kg-deadlift",
  status: "published",
  legalReviewStatus: "passed",
  publishedAt: LEGENDARY_PUBLISH_DATE,
  updatedAt: LEGENDARY_PUBLISH_DATE,
  athleteName: "Eddie Hall",
  profileTitle: "Eddie Hall — Building a 500 kg Deadlift: Training Analysis",
  shortTitle: "500 kg Deadlift Training",
  category: "strongman",
  era: "Modern strongman peak deadlift era (2015–2017 contest window; 9 July 2016 record lift)",
  nationality: "British",
  sportLabel: "Strongman",
  summary:
    "An independent analysis of publicly documented principles around Eddie Hall’s preparation for the first 500 kg strongman deadlift — specificity, speed-emphasised overload, peaking, psychology, bodyweight and recovery cost — clearly separating official competition performance from training footage, interviews, media claims, and coaching interpretation. Not a reproduction of any proprietary programme.",
  introductoryDisclaimer:
    "This profile is an independent educational analysis. It is not affiliated with, authorised by, sponsored by or endorsed by Eddie Hall. Official competition results, public interviews, and recognised event footage are cited as partial evidence. This page does not reproduce proprietary programmes, paid plans, or copyrighted training tables. Modernised examples are original The Strongest Manager interpretations. Do not copy elite bodyweight, calorie intake, or peak training stress.",
  keyCharacteristics: [
    "Deadlift specificity inside a broader strongman calendar",
    "Alternating heavy and speed-oriented deadlift emphases (as described in post-lift interview)",
    "Floor-to-knee speed practice to build first-pull momentum",
    "Progressive peaking toward a planned submaximal speed indicator before the attempt",
    "High bodyweight and recovery demands that ordinary lifters must not copy",
  ],
  bestFor: [
    "Intermediate-plus strength athletes studying deadlift peaking principles",
    "Strongman or powerlifting coaches analysing specificity versus event fatigue",
    "Advanced lifters who already deadlift competently and need safer overload ideas",
  ],
  notRecommendedFor: [
    "Beginners still learning hinge patterning",
    "Lifters without a competent spotter/setup for heavy pulls",
    "Anyone attempting to match elite absolute loads, bodyweight, or reported calorie intake",
  ],
  trainingDays:
    "Public interview framing: deadlift emphasis roughly once weekly, alternating heavy and speed weeks, while other strongman work continued",
  quickProfile: {
    primaryGoal: "Maximal conventional deadlift peaking under strongman rules (straps/suit context)",
    typicalFrequency: "Deadlift once per week in the documented interview account, cycled heavy/speed",
    volumeLevel: "Moderate deadlift set counts with high absolute intensity near the peak",
    intensityProfile: "Heavy pyramids and near-max singles late; speed work at substantially lighter loads",
    recoveryDemand: "Extreme at elite bodyweight and strongman concurrent training",
    technicalDifficulty: "High — first-pull speed, bracing, and equipment familiarity under fatigue",
    bestSuitedFor: "Advanced strength athletes with coaching and recovery capacity",
    evidenceQuality: "moderate",
  },
  scores: {
    strengthPotential: {
      value: 10,
      justification:
        "Directly targets maximal deadlift performance; principles are high-transfer for absolute pulling strength when dosed honestly.",
    },
    hypertrophyPotential: {
      value: 5,
      justification:
        "Heavy pulling and posterior-chain support can grow tissue, but the method’s public story is peaking a single lift, not balanced hypertrophy.",
    },
    recoveryDemand: {
      value: 10,
      justification:
        "Elite absolute loads, large body mass, and concurrent strongman events create recovery costs recreational lifters cannot safely match.",
    },
    technicalDifficulty: {
      value: 8,
      justification:
        "Requires competent deadlift skill, bracing, and disciplined speed/heavy wave management under high psychological arousal.",
    },
    beginnerSuitability: {
      value: 1,
      justification:
        "Beginners need pattern mastery and modest loads; copying peak-prep ideas is unsafe and unproductive.",
    },
    advancedSuitability: {
      value: 9,
      justification:
        "Advanced pullers can borrow speed/heavy alternation, first-pull emphasis, and peaking logic without importing celebrity doses.",
    },
  },
  evidenceQuality: "moderate",
  evidenceQualityNote:
    "Strong primary evidence for the official 9 July 2016 competition lift (Giants Live / World Deadlift Championships). Training-method detail relies heavily on a contemporaneous athlete interview plus later reflective interviews; exact proprietary programme files are not public, so session-level reconstruction stays conservative and labelled as interpretation.",
  lastReviewedAt: CONTENT_ACCESS_DATE,
  sections: sectionsWithBodiesForSlug(
    "eddie-hall-500kg-deadlift",
    {
      "athlete-and-era": `Eddie Hall’s 500 kg deadlift sits inside modern strongman’s arms race for absolute pulling numbers. The official competition performance is clear and dated: on 9 July 2016, at the World Deadlift Championships contested during Giants Live’s Europe’s Strongest Man in Leeds, Hall became the first athlete to deadlift 500 kg under the event’s strongman rules context (including permitted supportive equipment such as straps and a deadlift suit, as contemporaneous reporting noted).

That competition lift is the primary historical fact. Giants Live’s athlete materials also situate Hall’s peak bodyweight around that 2016 window (commonly reported near 197 kg). Separate from the platform result are training footage, interview reconstructions, and later media storytelling about psychology and aftermath. Those layers are useful, but they are not the same evidence class as the judged lift.

Context also matters: Hall has publicly framed the 500 kg project as overlapping a World’s Strongest Man campaign rather than as a pure single-lift retirement plan. Concurrent event practice (yokes, farmers, trucks, and other strongman demands) changes how a deadlift peak should be interpreted. A normal lifter reading only the highlight number often misses that the preparation lived inside a brutal multi-event sport.`,

      "documented-training-method": `Documented method claims should be sorted carefully.

Official competition performance: 500 kg locked out in Leeds on 9 July 2016 (Giants Live / World Deadlift Championships). This is the high-confidence anchor.

Interview-supported training principles (especially a July 2016 JOE interview shortly after the lift): Hall described building the peak around speed work and fast-twitch intent; using a readiness marker of a fast ~450 kg pull about three weeks out (framed as roughly 90% of 500 kg); emphasising explosive speed from the floor to the knees more than lockout-specific grinding; alternating a heavy deadlift week with a lighter speed week (~50% loads, moved fast); training the deadlift about once per week; pyramiding on heavy days and reducing reps while raising load as the contest approached; and continuing hard strongman event training rather than abandoning the sport calendar for a pure deadlift specialisation block.

Later reputable interviews add supporting themes without becoming a full programme reprint. Muscle & Fitness coverage quotes Hall describing heavy leg-press work as a foundational contributor and cueing the deadlift as “leg pressing the earth away.” Separate reflective interviews discuss deliberate psychological preparation for the attempt. Those statements are athlete claims about mindset — valuable, but not a prescription for amateurs to recreate extreme arousal scenarios.

Training footage and secondary “routine” blogs: useful for atmosphere, weak for exact week-to-week programming. This profile does not treat unsourced PDFs as primary evidence and does not claim to reproduce Hall’s proprietary programme.

Independent interpretation (labelled as such): the transferable coaching read is specificity + first-pull speed practice + heavy/speed alternation + a planned peaking indicator + ruthless recovery — not matching 500 kg, elite bodyweight, or reported very-high calorie intake.`,

      "training-structure": `Structurally, the publicly described approach organises deadlift work as a weekly centrepiece with two flavours: heavy overload weeks and speed/recovery-oriented weeks. That wave is a fatigue-management idea as much as a stimulus idea. Hall’s interview framing suggested heavy sessions required substantial recovery, which is why the alternate week stayed lighter and faster.

Volume distribution, in public telling, was not an endless list of deadlift variations. Heavy days built toward a small number of hard sets; closer to the peak, singles at high absolute loads appeared as readiness checks rather than weekly maximal ego tests. Posterior-chain and upper-back work continued inside the broader session, and strongman events remained part of the weekly stress budget.

Where “block pulls” or partials enter the conversation: Hall described floor-to-knee speed pulls as a large share of practice — partial range emphasis from the floor, not a claim that every session was a rack pull above the knee. Secondary writers sometimes blur those categories. This profile keeps the distinction: documented emphasis was first-pull speed and momentum; reconstructed accessory menus beyond that are uncertain without programme files.

Progression toward 500 kg was framed as progressive overload toward a planned indicator (fast 450 kg), then rest and recover into the attempt — classic peaking logic. Recovery structure included sleep, physio, and very high food intake during the broader campaign. Ordinary lifters should not copy bodyweight or calorie claims; those were part of an elite strongman support system, not a lifestyle template.`,

      "volume-intensity-frequency": `Independent analysis: frequency was relatively low for the deadlift itself (about weekly in the interview account), while intensity and absolute load were extreme. That combination can work when the lifter is highly specific, highly recovered, and already close to the target.

Volume was not “junk miles.” Hard sets were limited; the cost was the load and the concurrent strongman calendar. Speed weeks lowered mechanical stress while keeping neuromuscular intent. Heavy weeks raised force demands. Peaking compressed toward fewer, faster high-load singles.

What most recreational programmes get wrong is copying only the intensity pole: maximal singles every week, no speed contrast, no recovery wave, and no respect for event fatigue. Another error is inventing high-frequency 500 kg cosplay. The documented public story is closer to disciplined weekly practice with clear heavy/speed roles than to daily max attempts.

Conflicting secondary claims about exact training PRs exist in popular media. Hall’s contemporaneous interview stated that he did not need to pull above the planned 450 kg indicator before the contest. Treat larger rumoured training numbers as lower-confidence unless corroborated.`,

      "why-it-worked": `Why a 500 kg competition pull could happen for this athlete is multi-factorial. Specificity to the deadlift under strongman rules was high. Progressive overload toward a clear readiness marker created confidence and timing. First-pull speed practice attacked the phase where momentum is won or lost. Posterior-chain and leg-drive capacity (including heavy leg-press emphasis in later interviews) supported the “push the floor away” model. Athlete experience across years of record progression mattered. Bodyweight and energy availability at peak strongman size supported absolute force. Psychological preparation raised arousal and intent on the day. Sport demands rewarded a single historic number inside a contested championship format.

Long-term adaptation is the quiet truth under the myth: the lift was not a two-week stunt. It sat on prior records, technical familiarity, and a lifestyle organised around recovery. Copying the end-state stress without the runway is how normal lifters get hurt.`,

      "what-lifters-get-wrong": `Lifters get this story wrong when they treat the competition number as a programme. They also fail when they copy reported bodyweight or very-high calorie intake as if mass alone creates a deadlift; when they max out weekly without a speed/recovery contrast; when they ignore that Hall was still training strongman events hard; and when they confuse interview principles with a leaked proprietary spreadsheet.

Psychological cosplay is another failure mode. Elite arousal strategies discussed in later media are not a template for unsupervised gym lifters. Safer intent cues and competent coaching beat theatrical “dark place” imitation.

Equipment and rules context matter too. Strongman straps/suit norms are not identical to raw powerlifting standards. Comparing numbers across federations without stating rules is how internet arguments replace training literacy.

Finally, do not claim any reconstructed week is Eddie Hall’s exact programme. If a source cannot show the proprietary plan, keep the claim at principle level.`,

      "risks-and-recovery": `Risks concentrate in lumbar and posterior-chain tissues, blood-pressure spikes under maximal bracing, technical breakdown at high arousal, and systemic under-recovery when strongman events stack on heavy pulling. Contemporaneous reporting noted significant post-lift distress after the 500 kg attempt — a reminder that historic absolute loads are not recreational targets.

Recovery demands scale with body mass, absolute load, and concurrent event work. Normal lifters should reduce load, keep most heavy sets submaximal, use planned deloads, and refuse to match elite calorie or bodyweight claims. This is training-economy guidance, not medical advice.

Practical controls: stop a set when speed dies and form collapses; alternate stressful heavy days with lighter speed or technique days; keep event practice volume honest during a deadlift peak; sleep and physio before adding another maximal single.`,

      "verdict": `The Strongest Manager verdict: Hall’s 500 kg competition deadlift is a landmark official performance. The useful training legacy is specificity, first-pull speed practice, heavy/speed alternation, and planned peaking — not celebrity bodyweight, calorie theatre, or proprietary programme cosplay. Study the principles. Quarantine the dose. Never present a reconstructed week as his exact plan.`,

      "modernised-application": `Modernise by keeping deadlift specificity, a weekly heavy-versus-speed contrast, and a peaking indicator several weeks out — while scaling loads to technical quality and recovery. Beginners should not start here. Intermediates may use one heavy hinge day and one speed/technique day with conservative percentages. Advanced lifters may add limited floor-to-knee speed emphasis and carefully timed heavy singles, still far below elite absolute loads.

Do not copy reported ~10,000-calorie intake narratives or ~197 kg contest bodyweight. Related generic programmes on this site are safer on-ramps for progressive overload and peaking literacy. See modernAdaptation for dose rules.`,

      "example-training-week": `The example week is an original modernised illustration for intermediate-to-advanced pullers. It is not Eddie Hall’s programme, not a reprint of any paid plan, and not a prescription to approach 500 kg.`,

      sources: `Sources prioritise Giants Live / competition documentation for the official lift, contemporaneous athlete interview material for training principles, and reputable magazine reporting for supporting claims. Unsourced routine aggregators are not primary evidence.`,
    },
    {
      "athlete-and-era": [1, 2, 3],
      "documented-training-method": [1, 4, 5, 6],
      "training-structure": [4, 5],
      "volume-intensity-frequency": [4],
      "why-it-worked": [4, 5, 6],
    },
  ),
  trainingStructure: {
    trainingDays:
      "Interview framing: roughly weekly deadlift emphasis with alternating heavy and speed weeks; other strongman sessions continued",
    exerciseFrequency:
      "Deadlift once weekly in the documented account; posterior-chain and event work filled remaining stress",
    volumeDistribution: [
      { label: "Primary deadlift / first-pull emphasis", share: 40 },
      { label: "Upper back / posterior-chain support", share: 25 },
      { label: "Leg-drive support (e.g. press machines)", share: 15 },
      { label: "Strongman events / other", share: 20 },
    ],
    intensityDistribution: [
      { label: "Heavy overload weeks", share: 45 },
      { label: "Speed / lighter intent weeks", share: 35 },
      { label: "Event practice & accessories", share: 20 },
    ],
    primaryMovements: [
      "Conventional deadlift (strongman rules context)",
      "Floor-to-knee speed pulls (as described in interview)",
    ],
    accessoryWork: [
      "Upper-back rowing / pulling variations",
      "Leg-press or similar leg-drive support (athlete-claimed)",
      "Strongman event practice as concurrent demand",
    ],
    progressionApproach:
      "Build toward a planned fast submaximal indicator (interview: ~450 kg speed) then taper/recover into the attempt",
    recoveryStructure:
      "Alternate stressful heavy weeks with lighter speed weeks; sleep, physio, and high energy availability were part of the elite campaign — not recreational targets",
  },
  whyItWorked: {
    specificity:
      "Training and peaking targeted a maximal conventional deadlift under the contest’s strongman equipment norms.",
    volume:
      "Deadlift set counts stayed relatively focused; stress came from absolute load and concurrent events more than endless variation lists.",
    intensity:
      "Heavy weeks and late peaking singles created high neural and mechanical demand; speed weeks preserved intent at lower cost.",
    technicalPractice:
      "Repeated first-pull speed practice and rock-in setup cues refined the start of the lift under intent.",
    athleteExperience:
      "Prior record progression and years of strongman pulling created the runway for a historic attempt.",
    bodyweight:
      "Peak strongman body mass supported absolute force expression; this is not a template for normal lifters.",
    recovery:
      "Sleep, physio, and very high food intake were part of making extreme stress productive at the elite level.",
    sportDemands:
      "The championship format rewarded a single historic pull inside a contested strongman show.",
    longTermAdaptation:
      "The 500 kg result reflected accumulated adaptation and selection, not a sudden copyable programme PDF.",
  },
  whatLiftersGetWrong: [
    "Treating 500 kg as a weekly training target",
    "Copying elite bodyweight or reported very-high calorie intake",
    "Maxing every week without heavy/speed contrast or recovery",
    "Ignoring concurrent strongman event fatigue in the original context",
    "Claiming a blog chart is Hall’s exact proprietary programme",
    "Imitating extreme psychological arousal strategies without coaching safeguards",
  ],
  exampleWeek: {
    title: "Modernised deadlift peak illustration (not an athlete routine)",
    label: "original-modernised-example",
    disclaimer:
      "Original The Strongest Manager example for an intermediate-to-advanced puller. Not Eddie Hall’s programme and not a path to 500 kg. Scale all loads to technical quality.",
    days: [
      {
        dayLabel: "Day 1",
        focus: "Heavy deadlift emphasis",
        notes:
          "Work up to 2–4 hard sets well below failure (e.g. doubles/triples); stop if bar speed dies",
      },
      {
        dayLabel: "Day 2",
        focus: "Upper back + easy conditioning",
        notes: "Rows/pulldowns; keep lumbar fresh",
      },
      {
        dayLabel: "Day 3",
        focus: "Rest or mobility",
        notes: "Sleep and food before adding stress",
      },
      {
        dayLabel: "Day 4",
        focus: "Speed / technique hinge day",
        notes:
          "Lighter conventional pulls or paused first-pull drills; explosive intent, pristine form",
      },
      {
        dayLabel: "Day 5",
        focus: "Squat pattern + accessories",
        notes: "Moderate intensity; optional leg-press support work",
      },
      {
        dayLabel: "Day 6",
        focus: "Optional event or carry practice (advanced)",
        notes: "Keep volume low during a deadlift peak",
      },
      {
        dayLabel: "Day 7",
        focus: "Rest",
        notes: "Deload every 3–5 hard weeks if performance stalls",
      },
    ],
  },
  modernAdaptation: {
    summary:
      "Keep specificity, heavy/speed contrast, first-pull quality, and planned peaking — discard elite absolute loads, bodyweight cosplay, and proprietary-programme myths.",
    beginnerAdjustment:
      "3 days/week full-body; learn hinge pattern; no maximal singles; build consistency for months first.",
    intermediateAdjustment:
      "One heavy deadlift day + one lighter speed/technique day weekly; most top sets at RPE 7–8; track a peaking indicator 2–4 weeks out.",
    advancedAdjustment:
      "Short peaking blocks with limited heavy singles; optional floor-to-knee speed emphasis; concurrent sport stress carefully budgeted; never chase documentary numbers.",
    recommendedFrequency: "1–2 hinge exposures/week depending on recovery and sport schedule",
    recoveryControls: [
      "Alternate stressful heavy days with lighter speed/technique days",
      "Cap true maximal attempts",
      "Reduce event volume during a deadlift peak",
      "Prioritise sleep before adding load",
    ],
    progressionRules: [
      "Raise load only when bar speed and lockout quality remain clean",
      "Use a planned submaximal speed/heavy indicator before a peak attempt",
      "Deload when warm-up weights feel disproportionately heavy for 7–10 days",
    ],
    whenToReduceVolume:
      "Persistent bar-speed loss, rising back irritation, poor sleep, or concurrent sport performances collapsing",
    whoShouldAvoid: [
      "Beginners",
      "Lifters with unmanaged back pain",
      "Anyone trying to match elite bodyweight or calorie claims",
    ],
  },
  relatedProgrammes: [
    {
      slug: "linear-strength-builder",
      title: "Linear Strength Builder",
      href: "/programs/linear-strength-builder",
      relationship:
        "Independent The Strongest Manager programme applying progressive overload and peaking principles — not an athlete-created or endorsed plan",
      conversionPrompt: "Interested in elite deadlift peaking principles?",
    },
  ],
  sources: [
    {
      title: "Eddie Hall — athlete profile (World Deadlift Championships context)",
      publisher: "Giants Live",
      url: "https://giants-live.com/athlete/eddie-hall/",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "official-athlete-source",
      supports: ["athlete-and-era", "documented-training-method"],
    },
    {
      title: "Eddie Hall deadlift 500kg (1102.31lbs)",
      publisher: "Giants Live STRONGMAN (YouTube)",
      url: "https://www.youtube.com/watch?v=T9Y4o_BqC0A",
      publicationDate: "2016-07-09",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "official-athlete-source",
      supports: ["athlete-and-era", "documented-training-method"],
    },
    {
      title: "BREAKING: Eddie Hall Makes History, Becomes First Man to Deadlift 500kg",
      publisher: "BarBend",
      author: "BarBend staff",
      url: "https://barbend.com/news/eddie-hall-makes-history-becomes-first-man-deadlift-500kg/",
      publicationDate: "2016-07-09",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "reputable-publication",
      supports: ["athlete-and-era", "risks-and-recovery"],
    },
    {
      title: "How Eddie Hall trained to pull the monster 500kg world record deadlift",
      publisher: "JOE",
      url: "https://www.joe.co.uk/fitness-health/how-eddie-hall-trained-to-pull-the-monster-500kg-world-record-deadlift-72993",
      publicationDate: "2016-07-13",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "interview",
      supports: [
        "documented-training-method",
        "training-structure",
        "volume-intensity-frequency",
        "why-it-worked",
      ],
    },
    {
      title: "Eddie Hall Reveals the Secret Behind His 500kg Deadlift Record",
      publisher: "Muscle & Fitness",
      url: "https://www.muscleandfitness.com/athletes-celebrities/interviews/eddie-hall-reveals-the-secret-behind-his-500kg-deadlift-record/",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "interview",
      supports: ["documented-training-method", "training-structure"],
    },
    {
      title: "Eddie Hall Reveals Behind-the-Scenes Details of His 500kg Deadlift",
      publisher: "Muscle & Fitness",
      url: "https://www.muscleandfitness.com/athletes-celebrities/news/eddie-hall-reveals-behind-scenes-details-his-500kg-deadlift/",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "interview",
      supports: ["why-it-worked", "what-lifters-get-wrong"],
    },
  ],
  seo: {
    title: "Eddie Hall 500 kg Deadlift Training Analysis",
    description:
      "Independent analysis of Eddie Hall’s publicly documented 500 kg deadlift preparation — specificity, speed work, peaking, recovery cost, and why not to copy elite bodyweight or stress.",
    canonicalPath: "/legendary-methods/eddie-hall-500kg-deadlift",
    keywords: [
      "eddie hall 500kg deadlift analysis",
      "strongman deadlift peaking",
      "deadlift speed work",
      "500 kg deadlift training principles",
    ],
  },
};
