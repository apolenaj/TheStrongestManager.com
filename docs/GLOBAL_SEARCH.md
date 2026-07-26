# Global Search

**Date:** 2026-07-21  
**Prompt:** 40 — Intelligent search  
**Domain:** `src/domain/search/`  
**UI:** Command palette (`GlobalSearch`) · `/search` mobile/full page

---

## Scope

| Category | Source |
| --- | --- |
| Exercises | Priority exercise catalog (+ aliases) |
| Methods | Published training methods (+ aliases) |
| Articles | SEO `/learn` pillars + History eras |
| Academy | Published courses |
| Programs | Empty until public programs exist |

Basic search is **deterministic** keyword/alias ranking. AI is **not** required.

---

## Aliases

Example: `RDL` → **Romanian Deadlift** (`/exercises/romanian-deadlift`).  
Alias hits rank above keyword-only matches and show an “Alias” badge.

---

## UI

| Surface | Behavior |
| --- | --- |
| Desktop | Command palette modal from header / app top bar |
| Mobile | `/search` page (icon links here) |
| Shortcut | ⌘K / Ctrl+K toggles palette (optional; skipped while typing in fields) |
| Results | Grouped by category; matching terms highlighted |

---

## Honesty

- No fake program results  
- No pretend AI answers for basic search  
- `/search` is `noindex` (utility page)
