# Shareable Performance Cards

**Date:** 2026-07-21  
**Prompt:** 73 — Shareable performance cards  
**Domain:** `src/domain/share-cards/`  
**UI:** `ShareCardStudio` on `/app/prs` · public `/share/pr/[token]`

---

## Intent

Premium social-share cards, e.g.:

```text
NEW DEADLIFT PR
260 KG × 7
Technique: 82 → 86
Estimated 1RM: +8 kg
The Strongest
```

### Formats

| Format | Size |
| --- | --- |
| Instagram Story | 1080×1920 |
| Instagram Post | 1080×1080 |
| TikTok | 1080×1920 |
| X / LinkedIn | 1200×675 (optional) |

---

## Privacy

- **Headline + brand** always on the card  
- Technique delta, estimated 1RM delta, volume, PR types, date are **opt-in**  
- Private by default — nothing extra ships unless the athlete selects it  
- PNG export + share link only include selected metrics  

---

## Branding

Charcoal + gold (`#d4a017`) matching product tokens — clean, not purple/glow AI cliché.

---

## Feature flag

Uses `prIntelligence` (`NEXT_PUBLIC_FF_PR_INTELLIGENCE`) — same gate as Personal Record Intelligence.
