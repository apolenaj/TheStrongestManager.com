import type {
  ExerciseRelationSeed,
  ExerciseSeedRecord,
} from "@/domain/exercises/types";

/**
 * Priority Exercise Intelligence seed (Prompt 13).
 * All instructional fields are general coaching practice — not evidence claims.
 * No citations are attached; EvidenceClaim rows are intentionally empty.
 */
export const PRIORITY_EXERCISES: ExerciseSeedRecord[] = [
  {
    slug: "back-squat",
    name: "Back Squat",
    aliases: ["Barbell Back Squat", "Squat", "High-Bar Squat", "Low-Bar Squat"],
    description:
      "Bilateral barbell squat with the bar on the upper back — a foundational lower-body strength pattern.",
    category: "compound",
    movementPattern: "squat",
    primaryMuscles: ["quads", "glutes"],
    secondaryMuscles: ["hamstrings", "adductors", "erectors", "abs"],
    equipment: ["barbell", "rack", "plates"],
    difficulty: "intermediate",
    laterality: "bilateral",
    sportRelevance: {
      powerlifting: "high",
      bodybuilding: "high",
      strongman: "moderate",
      weightlifting: "high",
      general_strength: "high",
      hybrid: "high",
    },
    executionOverview:
      "Unrack a loaded barbell on the upper back, squat to a depth you can control with a braced trunk, then stand to full hip and knee extension.",
    setup:
      "Set the bar in a squat rack at about mid-chest height. Step under the bar, place it on the upper traps (high-bar) or rear delts (low-bar), create a rigid upper back, and walk out with short, controlled steps to a stable stance roughly shoulder-width or slightly wider.",
    execution:
      "Brace, break at the hips and knees together, keep mid-foot pressure, and descend under control. Reach a depth you own (often near parallel or below while maintaining position). Drive up by pushing the floor away, keeping the bar stacked over mid-foot, and finish tall without hyperextending the lumbar spine.",
    breathingBracing:
      "Take a breath into the trunk before the descent, brace as if preparing for contact, hold through the bottom and early ascent, then exhale near lockout or between reps as appropriate for load and set length.",
    commonMistakes: [
      "Losing bracing and folding at the lumbar spine under load",
      "Knees collapsing inward without control",
      "Rising hips first into a good-morning pattern on the ascent",
      "Walking out too far or with unstable foot placement",
      "Cutting depth inconsistently between reps when depth is a training target",
    ],
    regressions: [
      {
        label: "Goblet squat",
        note: "Front-loaded squat pattern with easier balance and depth feedback.",
      },
      {
        label: "Box squat (to a target)",
        note: "Defines depth and reduces ambiguity for newer lifters.",
      },
      {
        label: "Leg press",
        relatedSlug: "leg-press",
        note: "Machine-supported quad/glute loading with less axial demand.",
      },
    ],
    progressions: [
      {
        label: "Pause back squat",
        note: "Removes stretch-reflex reliance and exposes position errors.",
      },
      {
        label: "Front squat",
        relatedSlug: "front-squat",
        note: "More upright torso demand and quad emphasis.",
      },
      {
        label: "Competition-depth strength work",
        note: "Program specificity once technique is stable under fatigue.",
      },
    ],
    variations: [
      {
        label: "High-bar back squat",
        note: "Bar higher on traps; typically more upright torso.",
      },
      {
        label: "Low-bar back squat",
        note: "Bar lower on rear delts; common in powerlifting.",
      },
      {
        label: "Safety-bar squat",
        note: "Alters loading and can reduce shoulder demand.",
      },
    ],
    programmingUses:
      "Primary lower-body strength lift, hypertrophy volume work, or specificity for squat-based sports. Dose via intensity, sets, and proximity to failure according to the program — not generic “burnout” sets by default.",
    safetyNotes:
      "Use collars, set safeties where available, and respect depth and bracing you can own. Pain (especially sharp joint pain) is a stop signal — this catalog does not diagnose injury. Seek qualified coaching or clinical care when needed.",
  },
  {
    slug: "bench-press",
    name: "Bench Press",
    aliases: ["Barbell Bench Press", "Flat Bench"],
    description:
      "Horizontal barbell press from a bench — primary upper-body pushing strength lift.",
    category: "compound",
    movementPattern: "push",
    primaryMuscles: ["chest", "triceps", "front_delts"],
    secondaryMuscles: ["upper_back", "abs"],
    equipment: ["barbell", "bench", "rack", "plates"],
    difficulty: "intermediate",
    laterality: "bilateral",
    sportRelevance: {
      powerlifting: "high",
      bodybuilding: "high",
      strongman: "moderate",
      weightlifting: "low",
      general_strength: "high",
      hybrid: "high",
    },
    executionOverview:
      "Press a barbell from the chest to lockout while maintaining a stable back position and controlled bar path.",
    setup:
      "Lie on a flat bench with eyes roughly under the bar. Plant feet, set shoulder blades down and together, grip the bar evenly, and unrack to a start position above the chest/shoulders with elbows stacked under the bar.",
    execution:
      "Lower the bar under control to the chest/touch point used in your standard, keep wrists stacked, then press on a slight arc toward lockout over the shoulders. Maintain leg drive and upper-back tension without bouncing the bar off the chest.",
    breathingBracing:
      "Inhale and brace before the descent on heavy reps; hold through the press or use a short breath cycle between reps on lighter sets. Avoid losing upper-back set while gasping.",
    commonMistakes: [
      "Flaring elbows aggressively without scapular stability",
      "Butt leaving the bench or feet dancing under load",
      "Uncontrolled bounce off the chest",
      "Uneven grip or crooked bar path",
      "Pressing without a defined touch point or range standard",
    ],
    regressions: [
      {
        label: "Dumbbell bench press",
        relatedSlug: "dumbbell-bench-press",
        note: "Independent arms and often easier joint-friendly ranges.",
      },
      {
        label: "Push-up",
        relatedSlug: "push-up",
        note: "Bodyweight horizontal push with scalable elevation.",
      },
      {
        label: "Machine chest press",
        relatedSlug: "machine-chest-press",
        note: "Guided horizontal press with lower skill demand.",
      },
    ],
    progressions: [
      {
        label: "Pause bench",
        note: "Builds strength off the chest without rebound.",
      },
      {
        label: "Close-grip bench",
        note: "Increases triceps demand; useful accessory for lockout.",
      },
      {
        label: "Competition pause and commands practice",
        note: "For powerlifting specificity once basics are stable.",
      },
    ],
    variations: [
      { label: "Incline bench press", note: "Shifts emphasis toward upper chest and shoulders." },
      { label: "Touch-and-go bench", note: "Different from paused competition style." },
      { label: "Wide / narrow grip", note: "Changes joint angles and muscle bias." },
    ],
    programmingUses:
      "Main press for strength blocks, volume for hypertrophy, or technique emphasis with pauses. Pair with upper-back work to support shoulder position.",
    safetyNotes:
      "Use a spotter or safeties for heavy sets. Do not force a painful shoulder position. This is coaching guidance, not medical advice.",
  },
  {
    slug: "deadlift",
    name: "Deadlift",
    aliases: ["Conventional Deadlift", "Barbell Deadlift"],
    description:
      "Floor pull to lockout — a primary hinge-dominant total-body strength lift.",
    category: "compound",
    movementPattern: "hinge",
    primaryMuscles: ["hamstrings", "glutes", "erectors"],
    secondaryMuscles: ["quads", "upper_back", "lats", "traps", "forearms", "abs"],
    equipment: ["barbell", "plates"],
    difficulty: "intermediate",
    laterality: "bilateral",
    sportRelevance: {
      powerlifting: "high",
      bodybuilding: "moderate",
      strongman: "high",
      weightlifting: "moderate",
      general_strength: "high",
      hybrid: "high",
    },
    executionOverview:
      "Pull a barbell from the floor to a standing lockout with a braced trunk and hips/shoulders finishing together.",
    setup:
      "Stand with mid-foot under the bar, hinge to grip, set the back position you can own (neutral-ish lumbar), pull slack out of the bar, and brace before the plates leave the floor.",
    execution:
      "Push the floor away, keep the bar close, and extend hips and knees to lockout. Stand tall with glutes finished; do not lean back aggressively. Lower with control by hinging first, then bending the knees as the bar passes them.",
    breathingBracing:
      "Big brace before the pull; hold through lockout on heavy singles/doubles. Reset breath between reps on touch-and-go only if position stays honest.",
    commonMistakes: [
      "Yanking the bar before the brace is set",
      "Bar drifting forward away from the shins/thighs",
      "Hips shooting up early into a pure back round",
      "Overextending the lumbar spine at lockout",
      "Losing grip integrity and chasing ugly reps",
    ],
    regressions: [
      {
        label: "Romanian deadlift",
        relatedSlug: "romanian-deadlift",
        note: "Hinge pattern from a standing start with less floor-pull complexity.",
      },
      {
        label: "Block / rack pull",
        note: "Shortens range; use carefully so it does not become ego loading.",
      },
      {
        label: "Trap-bar deadlift",
        note: "Often more quad-friendly and easier for some lifters to position.",
      },
    ],
    progressions: [
      {
        label: "Paused deadlift off the floor",
        note: "Improves start position and patience under tension.",
      },
      {
        label: "Deficit deadlift",
        note: "Increases range — only when positions remain solid.",
      },
      {
        label: "Competition pulls with commands",
        note: "Sport-specific practice for powerlifting.",
      },
    ],
    variations: [
      { label: "Sumo deadlift", note: "Wider stance, more upright torso for many lifters." },
      { label: "Conventional deadlift", note: "Narrower stance hinge from the floor." },
      { label: "Touch-and-go deadlift", note: "Different fatigue and position demands than reset reps." },
    ],
    programmingUses:
      "Primary strength hinge, posterior-chain development, or meet specificity. Volume must respect recovery — deadlifts are costly.",
    safetyNotes:
      "Prioritize position over load. Use mixed/hook grip or straps according to goals. Stop for sharp pain; seek professional help when needed. No diagnosis is implied here.",
  },
  {
    slug: "overhead-press",
    name: "Overhead Press",
    aliases: ["Strict Press", "Military Press", "Barbell Shoulder Press"],
    description:
      "Standing barbell press from the shoulders to overhead lockout without leg drive.",
    category: "compound",
    movementPattern: "push",
    primaryMuscles: ["front_delts", "triceps"],
    secondaryMuscles: ["side_delts", "upper_back", "traps", "abs", "glutes"],
    equipment: ["barbell", "plates", "rack"],
    difficulty: "intermediate",
    laterality: "bilateral",
    sportRelevance: {
      powerlifting: "moderate",
      bodybuilding: "high",
      strongman: "high",
      weightlifting: "moderate",
      general_strength: "high",
      hybrid: "high",
    },
    executionOverview:
      "Press a barbell from the front rack/shoulder position to full overhead lockout while keeping the trunk braced and legs quiet.",
    setup:
      "Unrack or clean the bar to the shoulders, grip just outside shoulder width, ribs down, glutes lightly squeezed, and elbows slightly forward under the bar.",
    execution:
      "Press the bar up and slightly back into a stable overhead position. Move the head through (“window”) as the bar passes the face. Lock out with biceps near ears and shoulders packed; lower under control to the start.",
    breathingBracing:
      "Brace before the press; avoid excessive lumbar extension when inhaling. Short breaths between reps are fine if the ribcage stays stacked.",
    commonMistakes: [
      "Turning the lift into a push press with uncontrolled knee dip",
      "Excessive lumbar lean to get the bar up",
      "Flared ribs and lost trunk position",
      "Pressing forward instead of up and into the pocket",
      "Incomplete lockout or shrugging the finish",
    ],
    regressions: [
      {
        label: "Seated dumbbell press",
        note: "Removes some balance demand and allows independent arms.",
      },
      {
        label: "Landmine press",
        note: "Angled press that can feel friendlier for some shoulders.",
      },
      {
        label: "Pike push-up",
        note: "Bodyweight vertical press pattern.",
      },
    ],
    progressions: [
      {
        label: "Push press",
        note: "Adds leg drive for overload once strict press is solid.",
      },
      {
        label: "Pause at the chin / forehead",
        note: "Builds strength in a weak range.",
      },
      {
        label: "Behind-the-neck press",
        note: "Only for lifters with suitable mobility and no pain — optional, not required.",
      },
    ],
    variations: [
      { label: "Dumbbell overhead press", note: "Independent loading and mobility feedback." },
      { label: "Z-press", note: "Seated on the floor; exposes trunk weakness." },
      { label: "Push press", note: "Different skill — not a strict press substitute in logging." },
    ],
    programmingUses:
      "Primary vertical press for strength or shoulder development. Useful for strongman and general athletic pressing capacity.",
    safetyNotes:
      "Overhead work requires adequate shoulder and thoracic position. Do not force painful ranges. Use a rack and collars for heavy barbell sets.",
  },
  {
    slug: "romanian-deadlift",
    name: "Romanian Deadlift",
    aliases: ["RDL", "Barbell RDL"],
    description:
      "Hip-hinge deadlift variation starting from standing, emphasizing hamstrings and glutes with a soft knee.",
    category: "compound",
    movementPattern: "hinge",
    primaryMuscles: ["hamstrings", "glutes"],
    secondaryMuscles: ["erectors", "upper_back", "forearms", "abs"],
    equipment: ["barbell", "plates"],
    difficulty: "intermediate",
    laterality: "bilateral",
    sportRelevance: {
      powerlifting: "moderate",
      bodybuilding: "high",
      strongman: "moderate",
      weightlifting: "moderate",
      general_strength: "high",
      hybrid: "high",
    },
    executionOverview:
      "From standing, hinge the hips back while keeping a soft knee bend and the bar close, then return to standing by driving the hips forward.",
    setup:
      "Stand tall with the bar at the thighs, feet roughly hip-width, lats engaged, and a soft bend in the knees that stays relatively constant.",
    execution:
      "Push the hips back, keep the bar close to the legs, and lower until you reach a useful hamstring stretch without losing back position. Reverse by squeezing the glutes and standing tall. This is not a stiff-leg round-back pull.",
    breathingBracing:
      "Brace before hinging; exhale near lockout or between reps. Maintain pressure through the whole foot.",
    commonMistakes: [
      "Turning it into a squat by bending the knees excessively",
      "Rounding the lumbar spine to chase depth",
      "Bar drifting away from the legs",
      "Hyperextending at lockout instead of finishing the hips",
      "Using bounce and momentum instead of controlled hinges",
    ],
    regressions: [
      {
        label: "Hip hinge with dowel",
        note: "Pattern education before loading.",
      },
      {
        label: "Dumbbell RDL",
        note: "Easier to position and self-limit load.",
      },
      {
        label: "Glute bridge / hip thrust",
        relatedSlug: "hip-thrust",
        note: "Hip extension emphasis with less hinge complexity.",
      },
    ],
    progressions: [
      {
        label: "Pause RDL",
        note: "Removes stretch-reflex cheating at the bottom.",
      },
      {
        label: "Single-leg RDL",
        note: "Adds balance and unilateral demand.",
      },
      {
        label: "Deadlift from floor",
        relatedSlug: "deadlift",
        note: "Full pull once hinge competence is reliable.",
      },
    ],
    variations: [
      { label: "Dumbbell / kettlebell RDL", note: "Implement swap." },
      { label: "Snatch-grip RDL", note: "Longer range and upper-back demand." },
      {
        label: "Stiff-leg deadlift",
        relatedSlug: "stiff-leg-deadlift",
        note: "Less knee bend — not identical to RDL.",
      },
    ],
    programmingUses:
      "Posterior-chain accessory, hypertrophy for hamstrings/glutes, or technical hinge practice with lighter loads than floor deadlifts.",
    safetyNotes:
      "Depth is limited by hamstring capacity and back position — not ego. Stop if you feel sharp pain. Coaching cues are not a diagnosis.",
  },
  {
    slug: "stiff-leg-deadlift",
    name: "Stiff-Leg Deadlift",
    aliases: ["Stiff Leg Deadlift", "SLDL", "Straight-Leg Deadlift"],
    description:
      "Hip-hinge pattern with minimal knee bend — greater hamstring length demand than a typical Romanian deadlift.",
    category: "compound",
    movementPattern: "hinge",
    primaryMuscles: ["hamstrings", "glutes"],
    secondaryMuscles: ["erectors", "upper_back", "forearms", "abs"],
    equipment: ["barbell", "plates"],
    difficulty: "intermediate",
    laterality: "bilateral",
    sportRelevance: {
      powerlifting: "moderate",
      bodybuilding: "high",
      strongman: "low",
      weightlifting: "low",
      general_strength: "moderate",
      hybrid: "moderate",
    },
    executionOverview:
      "Hinge at the hips with soft-but-nearly-straight knees, keeping the bar close and the trunk braced, then return to standing without turning the lift into a rounded-back pull.",
    setup:
      "Start standing with a shoulder-width stance, soft knees that stay relatively fixed, brace the trunk, and set the bar over mid-foot with a grip you can hold without shrugging into the neck.",
    execution:
      "Push the hips back while keeping knee angle nearly constant. Lower only as far as you can keep a back position you own and feel load in the hamstrings — not as a forced touch to the floor. Drive the hips forward to stand tall without hyperextending the lumbar spine.",
    breathingBracing:
      "Brace before the hinge; hold through the bottom of controlled reps. Reset breath between reps if position starts to drift.",
    commonMistakes: [
      "Locking the knees hard and forcing lumbar flexion to reach depth",
      "Turning the set into a conventional deadlift by bending the knees freely",
      "Rounding the upper back to chase range of motion",
      "Using loads that exceed the position you can own",
    ],
    regressions: [
      {
        label: "Romanian deadlift",
        relatedSlug: "romanian-deadlift",
        note: "More knee bend usually makes the hinge easier to own.",
      },
      {
        label: "Hip hinge with dowel",
        note: "Pattern practice before loading.",
      },
    ],
    progressions: [
      {
        label: "Deficit stiff-leg hinge",
        note: "Only when position is already reliable — not a default.",
      },
    ],
    variations: [
      {
        label: "Dumbbell stiff-leg deadlift",
        note: "Independent implements; still keep knee angle honest.",
      },
      {
        label: "Romanian deadlift",
        relatedSlug: "romanian-deadlift",
        note: "Soft knees with more intentional knee flexion than SLDL.",
      },
    ],
    programmingUses:
      "Hamstring-biased accessory hinge when you specifically want less knee bend than an RDL. Dose carefully — range and fatigue can climb quickly.",
    safetyNotes:
      "Minimal knee bend is not an excuse for a rounded back. Stop for sharp pain. This is coaching guidance, not medical advice or a diagnosis.",
  },
  {
    slug: "front-squat",
    name: "Front Squat",
    aliases: ["Barbell Front Squat"],
    description:
      "Squat with the barbell racked on the front of the shoulders — upright torso and strong quad demand.",
    category: "compound",
    movementPattern: "squat",
    primaryMuscles: ["quads", "glutes"],
    secondaryMuscles: ["abs", "upper_back", "adductors", "erectors"],
    equipment: ["barbell", "rack", "plates"],
    difficulty: "advanced",
    laterality: "bilateral",
    sportRelevance: {
      powerlifting: "moderate",
      bodybuilding: "high",
      strongman: "moderate",
      weightlifting: "high",
      general_strength: "high",
      hybrid: "high",
    },
    executionOverview:
      "Squat while holding the bar in a front rack, keeping elbows up and the torso more vertical than a typical low-bar back squat.",
    setup:
      "Set the bar in a rack, establish a front rack (clean grip or cross-arm), lift the elbows, brace, and walk out with a stable stance.",
    execution:
      "Descend with upright posture and knees tracking over mid-foot. Stay tall in the bottom you can own, then drive up without collapsing the elbows or dumping the bar forward.",
    breathingBracing:
      "Brace before the descent; the front rack makes breathing feel tighter — use quality breaths between reps rather than losing the rack.",
    commonMistakes: [
      "Elbows dropping and losing the rack",
      "Excessive forward torso lean",
      "Heels rising from poor balance or stance",
      "Cutting depth inconsistently",
      "Using a rack position that pain-forces the wrists/shoulders",
    ],
    regressions: [
      {
        label: "Goblet squat",
        note: "Teaches upright squat mechanics with simpler loading.",
      },
      {
        label: "Back squat",
        relatedSlug: "back-squat",
        note: "Often easier racking while building general squat strength.",
      },
      {
        label: "Leg press",
        relatedSlug: "leg-press",
        note: "Quad loading without front-rack mobility demands.",
      },
    ],
    progressions: [
      {
        label: "Pause front squat",
        note: "Builds strength in the bottom with posture integrity.",
      },
      {
        label: "Olympic clean-grip front squat volume",
        note: "Supports weightlifting-specific rack endurance.",
      },
      {
        label: "Front squat + overhead work pairing",
        note: "Common in athletic programs once positions are stable.",
      },
    ],
    variations: [
      { label: "Clean-grip front squat", note: "Full rack with fingers under the bar." },
      { label: "Cross-arm front squat", note: "Alternative when wrist mobility limits clean grip." },
      { label: "Straddle / heel-elevated front squat", note: "Mobility accommodations — use deliberately." },
    ],
    programmingUses:
      "Quad-dominant squat strength, weightlifting support, or accessory to back squat. Loads are typically lower than back squat for the same athlete.",
    safetyNotes:
      "Do not force a painful front rack. Use straps or cross-arm if needed. Safeties and collars still apply.",
  },
  {
    slug: "barbell-row",
    name: "Barbell Row",
    aliases: ["Bent-Over Barbell Row", "Pendlay Row"],
    description:
      "Hip-hinged horizontal pull with a barbell — builds upper-back and arm strength.",
    category: "compound",
    movementPattern: "pull",
    primaryMuscles: ["upper_back", "lats"],
    secondaryMuscles: ["rear_delts", "biceps", "erectors", "hamstrings", "forearms"],
    equipment: ["barbell", "plates"],
    difficulty: "intermediate",
    laterality: "bilateral",
    sportRelevance: {
      powerlifting: "moderate",
      bodybuilding: "high",
      strongman: "moderate",
      weightlifting: "moderate",
      general_strength: "high",
      hybrid: "high",
    },
    executionOverview:
      "From a hinged position, row the barbell toward the torso and lower under control while keeping the trunk angle stable.",
    setup:
      "Deadlift the bar to hang, hinge to a torso angle you can brace (often near 30–45° from horizontal depending on style), grip the bar, and set the lats/upper back.",
    execution:
      "Pull elbows toward the hip/ribcage line used in your standard, squeeze the upper back at the top without turning it into a shrug-cheat, then lower with control. Avoid using a violent hip pop unless the variation explicitly allows it.",
    breathingBracing:
      "Brace the trunk in the hinge; exhale as appropriate between reps without losing the set back position.",
    commonMistakes: [
      "Turning every rep into a mini clean with no back tension",
      "Standing more upright as fatigue rises",
      "Rounding hard under load to chase range",
      "Yank-and-drop with no eccentric control",
      "Excessive elbow flare without intent",
    ],
    regressions: [
      {
        label: "Chest-supported row",
        note: "Removes lower-back limiter for many lifters.",
      },
      {
        label: "Seated cable row",
        note: "Stable torso and easy load progression.",
      },
      {
        label: "Pull-up / assisted pull-up",
        relatedSlug: "pull-up",
        note: "Vertical pull alternative for back development.",
      },
    ],
    progressions: [
      {
        label: "Pendlay row",
        note: "Dead-stop from the floor each rep — strict torso.",
      },
      {
        label: "Pause rows",
        note: "Improves control at the torso.",
      },
      {
        label: "Heavier hinged rows with straps",
        note: "When grip limits overload and back is the target.",
      },
    ],
    variations: [
      { label: "Pendlay row", note: "Bar rests on the floor between reps." },
      { label: "Yates row", note: "More upright torso angle." },
      { label: "Underhand barbell row", note: "More elbow path bias toward lats/biceps for some lifters." },
    ],
    programmingUses:
      "Horizontal pull accessory for strength balance, hypertrophy, or upper-back support for pressing and pulling sports.",
    safetyNotes:
      "Hinged rows load the lumbar spine — keep positions you can own. Stop for sharp pain. Coaching text is not a clinical assessment.",
  },
  {
    slug: "pull-up",
    name: "Pull-up",
    aliases: ["Overhand Pull-up", "Chin-up (related)", "Bodyweight Pull-up"],
    description:
      "Vertical bodyweight pull bringing the chest/chin toward a fixed bar.",
    category: "compound",
    movementPattern: "pull",
    primaryMuscles: ["lats", "upper_back"],
    secondaryMuscles: ["biceps", "rear_delts", "forearms", "abs"],
    equipment: ["bodyweight", "other"],
    difficulty: "intermediate",
    laterality: "bilateral",
    sportRelevance: {
      powerlifting: "low",
      bodybuilding: "high",
      strongman: "moderate",
      weightlifting: "moderate",
      general_strength: "high",
      hybrid: "high",
    },
    executionOverview:
      "Hang from a bar and pull until the chin clears or the chest meets the intended standard, then lower under control to a full hang you can own.",
    setup:
      "Grip the bar (usually overhand for a classic pull-up), set the shoulders (pack without excessive shrug), brace lightly, and start from a dead hang or a controlled scapular set depending on your standard.",
    execution:
      "Pull elbows down and toward the pockets/ribs, avoid excessive kipping unless training a kipping variation, reach your top standard, then lower without losing shoulder control.",
    breathingBracing:
      "Exhale toward the top or between reps; keep a light brace so the ribs do not dump into a hard arch.",
    commonMistakes: [
      "Half-reps that never leave a consistent bottom or top",
      "Excessive kipping when strict strength is the goal",
      "Chin reaching by pecking the neck instead of pulling the body up",
      "Uncontrolled dropping through the bottom",
      "Grip width so wide that shoulders feel unstable",
    ],
    regressions: [
      {
        label: "Assisted pull-up (band or machine)",
        note: "Scales load while keeping the pattern.",
      },
      {
        label: "Negative pull-up",
        note: "Jump/step to the top; lower slowly.",
      },
      {
        label: "Inverted row",
        note: "Horizontal bodyweight pull progression.",
      },
    ],
    progressions: [
      {
        label: "Weighted pull-up",
        note: "Add load once strict reps are consistent.",
      },
      {
        label: "Chest-to-bar standards",
        note: "Higher top position — only when earned.",
      },
      {
        label: "L-sit or toes-to-bar adjacent skills",
        note: "Different skills; not automatic progressions.",
      },
    ],
    variations: [
      { label: "Chin-up (supinated)", note: "Often more biceps contribution." },
      { label: "Neutral-grip pull-up", note: "Common shoulder-friendly grip." },
      { label: "Kipping pull-up", note: "Gymnastics skill — log separately from strict." },
    ],
    programmingUses:
      "Vertical pull strength, relative strength, or accessory volume. Track assistance and added load honestly.",
    safetyNotes:
      "Shoulder irritation is a stop signal for many lifters — change grip or regress. Do not fabricate “perfect” form claims as medical clearance.",
  },
  {
    slug: "leg-press",
    name: "Leg Press",
    aliases: ["Machine Leg Press", "45-Degree Leg Press"],
    description:
      "Machine lower-body press — high load potential with reduced axial loading versus barbell squats.",
    category: "compound",
    movementPattern: "squat",
    primaryMuscles: ["quads", "glutes"],
    secondaryMuscles: ["hamstrings", "adductors", "calves"],
    equipment: ["machine"],
    difficulty: "beginner",
    laterality: "bilateral",
    sportRelevance: {
      powerlifting: "moderate",
      bodybuilding: "high",
      strongman: "low",
      weightlifting: "low",
      general_strength: "moderate",
      hybrid: "moderate",
    },
    executionOverview:
      "Press a loaded sled through a controlled knee/hip bend and extension while keeping the lower back in contact with the pad per machine design.",
    setup:
      "Adjust the seat/sled so depth is available without the pelvis tucking aggressively. Place feet on the platform in a stance that matches your goal (often mid-platform, shoulder-ish width).",
    execution:
      "Unlock the safeties if required, lower under control to the intended depth, then press to near lockout without violently slamming the knees. Keep heels down unless a specific variation says otherwise.",
    breathingBracing:
      "Brace lightly through the descent; do not hold a maximal Valsalva for endless high-rep sets without reason. Breathe rhythmically on longer sets.",
    commonMistakes: [
      "Excessive range that rounds the lumbar spine off the pad",
      "Partial reps when full controlled depth was the prescription",
      "Locking out aggressively with uncontrolled knee snap",
      "Feet too high/low without intent for the training goal",
      "Ego loading that forces uncontrolled depth",
    ],
    regressions: [
      {
        label: "Shorter range with full control",
        note: "Own the range before expanding it.",
      },
      {
        label: "Goblet squat",
        note: "Free-pattern squat with light load.",
      },
    ],
    progressions: [
      {
        label: "Feet-lower quad bias / controlled deep presses",
        note: "Only when pelvis stays stable.",
      },
      {
        label: "Single-leg / crossover leg press",
        note: "Unilateral machine progressions.",
      },
      {
        label: "Back squat",
        relatedSlug: "back-squat",
        note: "Transfer to free-weight squat when ready.",
      },
    ],
    variations: [
      { label: "Horizontal vs 45° sled", note: "Machine geometry changes feel and loading." },
      { label: "High-foot vs low-foot stance", note: "Bias shifts — not magic, just levers." },
      { label: "Narrow / wide stance", note: "Comfort and emphasis changes." },
    ],
    programmingUses:
      "Hypertrophy volume, beginner strength exposure, or deload-friendly lower-body loading when axial fatigue is high.",
    safetyNotes:
      "Never release safeties carelessly. Keep the lumbar position the machine intends. Machine brands differ — learn the specific unit.",
  },
  {
    slug: "hip-thrust",
    name: "Hip Thrust",
    aliases: ["Barbell Hip Thrust", "Shoulder-Elevated Hip Thrust"],
    description:
      "Horizontal hip-extension pattern with the upper back on a bench — strong glute emphasis.",
    category: "compound",
    movementPattern: "hinge",
    primaryMuscles: ["glutes"],
    secondaryMuscles: ["hamstrings", "abs", "adductors", "quads"],
    equipment: ["barbell", "bench", "plates", "other"],
    difficulty: "beginner",
    laterality: "bilateral",
    sportRelevance: {
      powerlifting: "moderate",
      bodybuilding: "high",
      strongman: "low",
      weightlifting: "low",
      general_strength: "moderate",
      hybrid: "moderate",
    },
    executionOverview:
      "Drive the hips upward against a load until near full hip extension, then lower under control without losing a braced trunk.",
    setup:
      "Sit on the floor with the upper back against a stable bench, roll a padded barbell over the hips, plant feet so shins can finish near vertical at the top, and brace before lifting.",
    execution:
      "Drive through the mid-foot/heels as programmed, extend the hips to a strong glute finish without over-arching the lumbar spine, pause briefly if prescribed, then lower with control.",
    breathingBracing:
      "Brace before the drive; avoid turning the top into a rib-flared backbend. Breathe between reps on higher-volume sets.",
    commonMistakes: [
      "Overextending the lumbar spine instead of finishing with the hips",
      "Feet too far forward/back so the top position feels weak or stressful",
      "Cutting the range and calling it lockout",
      "Sliding on an unstable bench setup",
      "Letting the bar dig in without padding when load is high",
    ],
    regressions: [
      {
        label: "Glute bridge (floor)",
        note: "Shorter range, simpler setup.",
      },
      {
        label: "Shoulder-elevated bodyweight thrust",
        note: "Pattern first, load second.",
      },
    ],
    progressions: [
      {
        label: "Paused / longer tempo thrusts",
        note: "Increases time under tension without chasing load.",
      },
      {
        label: "Single-leg hip thrust",
        note: "Unilateral progression.",
      },
      {
        label: "Heavier barbell thrusts with pad",
        note: "Progress load once positions are consistent.",
      },
    ],
    variations: [
      { label: "Glute bridge", note: "Shoulders on the floor." },
      { label: "Smith-machine hip thrust", note: "Fixed bar path." },
      { label: "Band-resisted thrust", note: "Accommodating resistance at lockout." },
    ],
    programmingUses:
      "Glute strength/hypertrophy accessory, posterior-chain balance, or return-to-hinge options when axial loading is limited.",
    safetyNotes:
      "Pad the bar. Keep the bench stable. Stop for sharp lumbar or hip pain. This section is coaching practice, not a rehab protocol.",
  },
  {
    slug: "dumbbell-bench-press",
    name: "Dumbbell Bench Press",
    aliases: ["DB Bench", "Dumbbell Flat Press"],
    description:
      "Horizontal press with dumbbells on a flat bench — chest-focused push with independent arms.",
    category: "compound",
    movementPattern: "push",
    primaryMuscles: ["chest", "triceps", "front_delts"],
    secondaryMuscles: ["abs", "upper_back"],
    equipment: ["dumbbell", "bench"],
    difficulty: "beginner",
    laterality: "bilateral",
    sportRelevance: {
      powerlifting: "moderate",
      bodybuilding: "high",
      strongman: "low",
      weightlifting: "low",
      general_strength: "high",
      hybrid: "high",
    },
    executionOverview:
      "Press dumbbells from chest height to lockout while keeping scapulae set on the bench.",
    setup:
      "Sit on a flat bench with dumbbells on thighs, lie back carefully, and bring the weights to a start position above the chest with wrists stacked and shoulder blades gently retracted.",
    execution:
      "Lower the dumbbells under control toward the outer chest with elbows tracking in a sustainable path, then press to lockout without slamming the bells together. Keep feet planted and hips on the bench.",
    breathingBracing:
      "Inhale on the descent for heavier sets; brace through the press. Use a short breath cycle between reps on lighter hypertrophy work.",
    commonMistakes: [
      "Flaring elbows aggressively into an uncomfortable shoulder position",
      "Bouncing out of the bottom without control",
      "Uneven arm paths or dropping one side",
      "Arching the low back off the bench to finish reps",
    ],
    regressions: [
      {
        label: "Push-up",
        relatedSlug: "push-up",
        note: "Bodyweight horizontal push when dumbbells are unavailable.",
      },
      {
        label: "Machine chest press",
        relatedSlug: "machine-chest-press",
        note: "Guided path with lower balance demand.",
      },
    ],
    progressions: [
      {
        label: "Barbell bench press",
        relatedSlug: "bench-press",
        note: "Higher specificity for powerlifting and heavier loading.",
      },
    ],
    variations: [
      { label: "Incline dumbbell press", note: "Upper-chest and shoulder bias." },
      { label: "Neutral-grip dumbbell press", note: "Often friendlier for shoulders." },
    ],
    programmingUses:
      "Main press when a barbell is unavailable, chest hypertrophy volume, or a lower-skill horizontal press option.",
    safetyNotes:
      "Get a spot or use conservative loads when getting into position. Stop for sharp shoulder or elbow pain — this is coaching guidance, not medical advice.",
  },
  {
    slug: "machine-chest-press",
    name: "Machine Chest Press",
    aliases: ["Chest Press Machine", "Seated Chest Press"],
    description:
      "Guided horizontal press on a chest-press machine — lower skill demand for chest and triceps loading.",
    category: "compound",
    movementPattern: "push",
    primaryMuscles: ["chest", "triceps", "front_delts"],
    secondaryMuscles: ["abs"],
    equipment: ["machine"],
    difficulty: "beginner",
    laterality: "bilateral",
    sportRelevance: {
      powerlifting: "low",
      bodybuilding: "high",
      strongman: "none",
      weightlifting: "none",
      general_strength: "moderate",
      hybrid: "moderate",
    },
    executionOverview:
      "Press machine handles from a chest-level start to full arm extension while keeping the trunk braced against the pad.",
    setup:
      "Adjust seat height so handles align near mid-chest, set the start range per machine design, plant feet, and brace the upper back into the pad.",
    execution:
      "Press through a controlled path to lockout without shrugging, then return under control to the start position. Keep elbows tracking in a pain-free line and avoid bouncing off the stops.",
    breathingBracing:
      "Exhale through the press or hold a brace on heavier sets. Match breathing to the machine’s cadence without losing trunk contact with the pad.",
    commonMistakes: [
      "Seat height that forces an awkward shoulder angle",
      "Partial range that never reaches a meaningful stretch or lockout",
      "Using momentum or bouncing off the stack",
      "Lifting the low back off the pad to finish reps",
    ],
    regressions: [
      {
        label: "Push-up",
        relatedSlug: "push-up",
        note: "Bodyweight option when machines are busy.",
      },
    ],
    progressions: [
      {
        label: "Dumbbell bench press",
        relatedSlug: "dumbbell-bench-press",
        note: "Free-weight horizontal press with more stabilization.",
      },
      {
        label: "Barbell bench press",
        relatedSlug: "bench-press",
        note: "Higher specificity and loading potential.",
      },
    ],
    variations: [
      { label: "Incline machine press", note: "Upper-chest bias when available." },
      { label: "Neutral-grip machine press", note: "Handle orientation varies by brand." },
    ],
    programmingUses:
      "Chest strength/hypertrophy when free weights are limited, fatigue-friendly pressing volume, or skill-conservative substitutes for bench.",
    safetyNotes:
      "Learn the specific machine’s safeties and seat settings. Stop for sharp joint pain. Coaching practice only — not a diagnosis.",
  },
  {
    slug: "push-up",
    name: "Push-Up",
    aliases: ["Press-Up", "Floor Push-Up"],
    description:
      "Bodyweight horizontal push — scalable chest and triceps pattern with minimal equipment.",
    category: "compound",
    movementPattern: "push",
    primaryMuscles: ["chest", "triceps", "front_delts"],
    secondaryMuscles: ["abs", "upper_back"],
    equipment: ["bodyweight"],
    difficulty: "beginner",
    laterality: "bilateral",
    sportRelevance: {
      powerlifting: "low",
      bodybuilding: "moderate",
      strongman: "low",
      weightlifting: "low",
      general_strength: "high",
      hybrid: "high",
    },
    executionOverview:
      "Lower the chest toward the floor under control, then press back to a plank lockout while keeping a braced trunk.",
    setup:
      "Place hands roughly under the shoulders, set a rigid plank from head to heels, and choose a hand width you can own without shoulder discomfort.",
    execution:
      "Descend until the chest approaches the floor or a defined target, keep elbows tracking sustainably, then push the floor away to full arm extension without sagging the hips.",
    breathingBracing:
      "Inhale on the way down, brace through the press, and exhale near lockout — or use short breath cycles for higher-rep sets.",
    commonMistakes: [
      "Hips sagging or piking to avoid loading the trunk",
      "Partial range that never challenges the chest",
      "Flaring elbows into an uncomfortable shoulder position",
      "Losing a rigid plank before pressing",
    ],
    regressions: [
      {
        label: "Incline push-up (hands elevated)",
        note: "Reduces load while keeping the same pattern.",
      },
      {
        label: "Knee push-up",
        note: "Shortens the lever for beginners.",
      },
    ],
    progressions: [
      {
        label: "Dumbbell bench press",
        relatedSlug: "dumbbell-bench-press",
        note: "External load when bodyweight becomes easy.",
      },
      {
        label: "Barbell bench press",
        relatedSlug: "bench-press",
        note: "Higher loading and sport specificity.",
      },
    ],
    variations: [
      { label: "Feet-elevated push-up", note: "Harder horizontal push." },
      { label: "Tempo push-up", note: "Adds control and time under tension." },
    ],
    programmingUses:
      "Equipment-free chest strength practice, warm-up pattern, or fatigue-friendly volume when barbells and machines are unavailable.",
    safetyNotes:
      "Scale elevation or knees before forcing depth into a painful shoulder position. Not medical advice.",
  },
];

export const PRIORITY_EXERCISE_RELATIONS: ExerciseRelationSeed[] = [
  {
    fromSlug: "back-squat",
    toSlug: "front-squat",
    relationType: "progression",
    note: "Front squat typically demands more upright posture and rack skill.",
  },
  {
    fromSlug: "back-squat",
    toSlug: "leg-press",
    relationType: "regression",
    note: "Machine squat-pattern loading with less skill and axial demand.",
  },
  {
    fromSlug: "deadlift",
    toSlug: "romanian-deadlift",
    relationType: "regression",
    note: "Standing hinge without a floor pull.",
  },
  {
    fromSlug: "romanian-deadlift",
    toSlug: "deadlift",
    relationType: "progression",
    note: "Full floor pull once hinge competence is reliable.",
  },
  {
    fromSlug: "romanian-deadlift",
    toSlug: "stiff-leg-deadlift",
    relationType: "variation",
    note: "Less knee bend than a typical RDL — not identical.",
  },
  {
    fromSlug: "stiff-leg-deadlift",
    toSlug: "romanian-deadlift",
    relationType: "variation",
    note: "More knee bend usually makes the hinge easier to own.",
  },
  {
    fromSlug: "romanian-deadlift",
    toSlug: "hip-thrust",
    relationType: "variation",
    note: "Related hip-extension emphasis with different body orientation.",
  },
  {
    fromSlug: "front-squat",
    toSlug: "back-squat",
    relationType: "variation",
    note: "Same squat pattern family; different bar position.",
  },
  {
    fromSlug: "barbell-row",
    toSlug: "pull-up",
    relationType: "variation",
    note: "Horizontal vs vertical pull for back development.",
  },
  {
    fromSlug: "bench-press",
    toSlug: "dumbbell-bench-press",
    relationType: "regression",
    note: "Same horizontal push with independent arms and lower skill demand.",
  },
  {
    fromSlug: "bench-press",
    toSlug: "machine-chest-press",
    relationType: "regression",
    note: "Guided chest press when a barbell is unavailable.",
  },
  {
    fromSlug: "bench-press",
    toSlug: "push-up",
    relationType: "regression",
    note: "Bodyweight horizontal push with scalable difficulty.",
  },
  {
    fromSlug: "dumbbell-bench-press",
    toSlug: "bench-press",
    relationType: "progression",
    note: "Barbell bench for heavier loading and competition specificity.",
  },
];
