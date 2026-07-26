# Year in Review

**Date:** 2026-07-22  
**Prompt:** 193 — Year in Review  
**Domain:** `src/domain/year-in-review/`  
**Athlete UI:** `/app/year-in-review`  
**Share:** `/share/year/[token]`  
**Admin:** `/app/admin/year-in-review`  
**Flag:** `yearInReview` (`NEXT_PUBLIC_FF_YEAR_IN_REVIEW`, default **on**)

---

## Principle

An **annual athlete report** as a high-energy card deck (“Iron Almanac”) — Spotify Wrapped–style *momentum*, but an **original** design (bronze/ink ledger, not green duotone playlists). Stats are never invented.

---

## Cards

| Card | Content |
| --- | --- |
| Intro | Year + athlete |
| Training sessions | Completed session count |
| PRs | Count + highlights (when PR Intelligence has events) |
| Technique | First→last score delta |
| Top exercises | By working-set volume |
| Most consistent month | Max sessions in a calendar month |
| Competition | Competition Prep records that year |
| Closer | Honesty closer |

Empty cards stay empty with an honest note.

---

## Shareable cards

`YearInReviewShare` freezes the public-safe deck to `/share/year/[token]`.

---

## vs Performance Story

| | Year in Review | Performance Story |
| --- | --- | --- |
| Shape | Stat cards / deck | Month-by-month narrative lines |
| Energy | Almanac wrap deck | Chronological chapters |
| Share | `/share/year/...` | `/share/story/...` |

---

## Tests

```bash
npx vitest run src/domain/year-in-review
```
