# Training Method Comparison

**Date:** 2026-07-20  
**Prompt:** 28 — Training method comparison  
**Route:** `/compare?methods=slug-a,slug-b[,slug-c]`  
**Domain:** `src/domain/methods/compare.ts`, `comparison-profiles.ts`  
**UI:** `src/components/methods/MethodCompareExperience.tsx`

---

## Behavior

- Compare **2–3** published methods side by side.
- Shareable URL: `/compare?methods=daily-undulating-periodization,block-periodization`
- Default landing shows the DUP vs Block example.
- Copy share link from the UI.

## Dimensions (qualitative only)

Primary purpose · Complexity · Frequency · Volume · Intensity · Fatigue · Skill requirement · Best suited for · Limitations

Bands (`low` → `high` / `variable`) are **readable contrast labels**, not validated scores. There is **no** numeric total or invented ranking.

## Honesty

- Science does not justify precise superiority scores across methods → prefer qualitative comparison.
- Profiles are coaching-practice descriptors curated per method.

## Flags

`compare` defaults **on** when unset. Set `NEXT_PUBLIC_FF_COMPARE=false` to hide from nav.
