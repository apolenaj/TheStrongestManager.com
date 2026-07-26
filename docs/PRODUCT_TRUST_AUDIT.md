# Product Trust Audit

**Date:** 2026-07-22  
**Prompt:** 182 — Product Trust Audit  
**Domain:** `src/domain/product-trust-audit/`  
**UI chrome:** `AiTrustChrome`, Certainty block in `WhyAmISeeingThis`  
**Admin:** `/app/admin/product-trust-audit`  
**Flag:** `productTrustAudit` (`NEXT_PUBLIC_FF_PRODUCT_TRUST_AUDIT`, default **on**)

---

## Questions (every AI feature)

| Criterion | Question |
| --- | --- |
| **provenance** | Does the user understand where the result came from? |
| **confidence** | Is confidence shown? |
| **certainty_risk** | Could this be mistaken for medical/scientific certainty? (pass = risk controlled) |
| **challenge** | Can the user challenge or correct it? |

Shared certainty line:

> Coaching estimate from your logged data and product rules — not medical advice, diagnosis, or scientific certainty.

---

## Gaps found → fixed

| Surface | Gap | Fix |
| --- | --- | --- |
| Coach Brain | No athlete challenge controls | `AiTrustChrome` + feedback |
| Coach Chat | No feedback on turns | Feedback + correct-logs link |
| PR prediction | Inputs only; no Why / certainty / feedback | `fromPrPrediction` + chrome |
| Goal progress | Why text; no confidence badge / feedback | Badge + Why panel + chrome |
| Exercise prescription | Why only | Confidence + Why panel + chrome |
| Weak points / Daily brief / Fatigue / Deload | Explainable UI; no challenge | Feedback + correct links |

Surfaces already strong (Copilot Accept/Edit/Reject, Insights feedback, Adaptations, Technique, Research summarizer review) stay documented as pass/partial without forced chrome churn.

---

## Registry

`PRODUCT_TRUST_AI_FEATURES` in `src/domain/product-trust-audit/registry.ts`.  
Overall status is the **worst** criterion. Open failures must stay empty.

```bash
npx vitest run src/domain/product-trust-audit
```

---

## Related

- `docs/EXPLAINABLE_AI_UI.md` — Why am I seeing this?
- `docs/TRUST_CENTER.md` / `/trust` — public honesty hub
- `docs/NO_HALLUCINATION_AUDIT.md` — marketing/copy claims
- `docs/MODEL_FEEDBACK.md` — helpful / not helpful
