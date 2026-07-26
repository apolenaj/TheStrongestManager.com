# Content Quality & Trust Audit

**Date:** 2026-07-21  
**Prompt:** 45 — Customer-facing copy  
**Locale:** American English (Oxford commas preferred; `labeled` / `canceled`)

---

## Goal

Polished, native-level English. Confident and expert without cringe motivation or AI filler. Every claim must match what the product actually does.

---

## Removed / rewritten patterns

| Anti-pattern | Action |
| --- | --- |
| “Unlock your potential” / “revolutionize” / “next level” | Not present; blocked by style |
| “TRAIN SMARTER. GET STRONGER…” | → concrete loop: upload / see / change |
| “Global standard for coaching intelligence” | → outcomes from logged sessions |
| “Performance OS / intelligence / knowledge engine / SEO content engine” | → plain product nouns |
| “Explore Platform” / “Train with intent” | → “See what’s included” / “Create a free account…” |
| “Architecture ready” on coaching | → what will be listed when coaches publish |
| Overclaim AI / Mealnexio live | → deadlift MVP + planned sync |
| Honesty theater (“not marketing theater”) | → concrete capability limits |

---

## Tone checklist

- **Confident:** state what ships (Today, deadlift analysis, catalog prices).  
- **Expert:** fitness terms used correctly (e1RM, RPE, periodization) without academic mush.  
- **Clear:** short sentences; CTAs name the next action.  
- **Scientific without robotic:** label observed vs estimated; skip meta disclaimers as brand.  
- **Motivational without cringe:** no slogan stacks; push to log the next session.

---

## Files touched (primary)

- `src/lib/content/home.ts`, `src/config/site.ts`
- `src/components/marketing/Home*.tsx`, `PricingExperience.tsx`
- Marketing routes: features, pricing, learn, methods, fit, compare, exercises
- `MarketplaceBrowse.tsx`, `PublicFooter.tsx`
- Billing catalog taglines + customer-facing honesty strings
- Marketplace honesty spelling (`labeled`)

---

## Defensibility rules (ongoing)

1. Do not claim live Stripe checkout, Mealnexio sync, or multi-lift technique scoring unless true.  
2. Do not invent testimonials, athlete counts, or success rates.  
3. Prefer “upload / log / compare / cancel” verbs over platform metaphors.  
4. Legal pages stay clearly marked as drafts for counsel review.

---

## Residual

- Long-form SEO cluster bodies in `src/domain/seo/clusters.ts` and academy lesson copy were not fully re-edited this pass; they already avoid medical overclaims. Spot-check on publish.  
- In-app empty states still use “unlock” for plan gates — acceptable product English, not lifestyle AI filler.
