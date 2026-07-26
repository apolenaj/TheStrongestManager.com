# Recovery Correlation Insights

**Date:** 2026-07-21  
**Prompt:** 122 — Recovery Correlation Insights  
**Route:** `/app/recovery-correlation`  
**Domain:** `src/domain/recovery-correlation/`  
**Service:** `src/services/recovery-correlation/`  
**Flag:** `recoveryCorrelation` (`NEXT_PUBLIC_FF_RECOVERY_CORRELATION`, default **on**)

---

## Signals

| Signal | Source |
| --- | --- |
| Sleep | `RecoveryEntry.sleepHours` (weekly mean) |
| Stress | `RecoveryEntry.stress` (weekly mean) |
| Soreness | `RecoveryEntry.soreness` (weekly mean) |
| Performance | `TrainingSession.perceivedEffort` (weekly mean session RPE) |

## Sample gates

- ≥ **6** weeks with both recovery and performance signals
- ≥ **3** weeks in each compared group (e.g. sleep &lt;6h vs ≥6h)

Insights that fail the gate are **not shown** as correlations.

## Example

> On weeks where you reported &lt;6 hours sleep, average session RPE was higher.

## Honesty labels

Every published insight is labelled:

- **Observed association**
- **Not causal proof.**

See `RECOVERY_CORRELATION_HONESTY` in domain constants.

## Distinct from

- Cross-domain readiness insights (`docs/CROSS_DOMAIN_INSIGHTS.md`)
- Experiment Mode (personal n=1 interventions)

## Tests

`src/domain/recovery-correlation/recovery-correlation.test.ts`
