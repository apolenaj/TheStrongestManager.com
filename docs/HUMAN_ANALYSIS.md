# Premium Expert Technique Review (Human Analysis)

**Date:** 2026-07-21  
**Prompt:** 96 — Premium Human Analysis Product  
**Domain:** `src/domain/human-analysis/`  
**Service:** `src/services/human-analysis/`  
**Schema:** `HumanAnalysisOrder`  
**Flag:** `humanAnalysisProduct` (`NEXT_PUBLIC_FF_HUMAN_ANALYSIS_PRODUCT`, default on)  
**Surfaces:** `/app/human-analysis` · `/app/human-analysis/[orderId]` · `/app/human-analysis/expert`

---

## Products

| SKU | Product |
| --- | --- |
| `single_lift_review` | Single lift review |
| `full_training_review` | Full training review |
| `competition_prep_review` | Competition preparation review |

Prices: env only (`PRICING_HUMAN_*_CENTS`, `STRIPE_PRICE_HUMAN_*`). Never hard-coded in UI. “Price not published” when unset.

---

## Flow & status

```
awaiting_purchase → purchased → awaiting_upload → queued → in_review → report_ready
                         ↘ canceled / refunded
```

1. **Purchase** — order created; payment via billing adapter / webhook (`activateHumanAnalysisPayment`). Dev-only waive outside production.  
2. **Upload** — attach technique analysis / program / competition prep.  
3. **Queue** — athlete submits when artifacts present.  
4. **Expert review** — verified Expert Contributor claims → writes report.  
5. **Report** — athlete sees expert summary on order page.

Separate from free optional review (Prompt 95) — see `docs/TECHNIQUE_HUMAN_REVIEW.md`.

---

## Turnaround honesty

- `HUMAN_ANALYSIS_INTAKE_OPEN=true` opens capacity messaging.  
- `HUMAN_ANALYSIS_TURNAROUND_DAYS` only shown when intake is open **and** days &gt; 0.  
- **Never** promise turnaround time unless operational capacity is published.  
- Status tracking always available.

---

## Checkout

Requires `billingCheckout` + ready Stripe adapter + published Stripe price ids. Until then orders remain `awaiting_purchase` — no invented charges.
