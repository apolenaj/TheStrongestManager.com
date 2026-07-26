# Personal Record Intelligence

**Date:** 2026-07-21  
**Prompt:** 72 — Personal record intelligence  
**Domain:** `src/domain/pr-intelligence/`  
**Routes:** `/app/prs` (flag `prIntelligence`) · public share `/share/pr/[token]`

---

## PR types

| Type | Meaning |
| --- | --- |
| **1RM** | New best single (reps = 1) |
| **Estimated 1RM** | New best Epley estimate from multi-rep work — never a verified meet PR |
| **Rep PR** | More reps at ~same load |
| **Volume PR** | New best set tonnage (load × reps) |
| **Technical PR** | New best technique overall score for the lift |

### Example card

```text
NEW PR
260 kg × 7
Estimated 1RM increased.
Technique score also improved.
```

---

## Timeline

Events are detected chronologically from working sets, progress metrics, and technique analyses (365-day lookback), then shown newest-first.

---

## Sharing

Athletes open **Create share card** on a PR:

1. Pick format (Story / Post / TikTok / X·LinkedIn)  
2. Opt into metrics (private by default)  
3. **Download PNG** or **Copy share link**  

Public page `/share/pr/[token]` renders the branded card when a share-card snapshot was saved.

See also `docs/SHAREABLE_PERFORMANCE_CARDS.md` (Prompt 73).

---

## Feature flag

`NEXT_PUBLIC_FF_PR_INTELLIGENCE` → `prIntelligence` (default on)
