# Performance OS Command Center

**Date:** 2026-07-22  
**Prompt:** 188 — Performance OS Command Center  
**Domain:** `src/domain/command-center/`  
**Athlete UI:** `/app/dashboard` (when flag on)  
**Admin:** `/app/admin/command-center`  
**Flag:** `commandCenter` (`NEXT_PUBLIC_FF_COMMAND_CENTER`, default **on**)

---

## Principle

The Command Center is the **ultimate dashboard shell**: sectioned widgets, adaptive density, and user customization. It organizes existing Performance OS surfaces — it does **not** invent scores, macros, or medical claims.

---

## Sections

| Section | Default fold | Deep link |
| --- | --- | --- |
| TODAY | **Above** | `/app/today` |
| Performance | Below | `/app/progress` |
| Training | Below | `/app/programs` |
| Technique | Below | `/app/technique` |
| Recovery | Below | `/app/recovery` |
| Nutrition | Below | `/app/nutrition` |
| Goal trajectory | Below | `/app/goal-progress` |
| AI Coach | Below | `/app/coach-brain` |

**Do not place everything above the fold.** Defaults keep only TODAY in the first viewport; the rest form the scrollable “command deck.”

---

## Adaptive layout

Density resolves from viewport width unless the user overrides:

| Width | Density |
| --- | --- |
| ≤ 639px | `compact` |
| ≤ 1023px | `comfortable` |
| larger | `spacious` |

Grid: 1 column on narrow, 2 columns from `md`, with optional full-width span (TODAY).

---

## Customize widgets

Athletes can:

- Show / hide widgets  
- Move widgets above or below the fold  
- Reorder  
- Override density or stay adaptive  

Preferences persist in **device `localStorage`** (`tsm.command_center.layout.v1`) until a synced prefs store exists. Corrupt prefs normalize against the catalog — unknown widgets are dropped.

---

## Data honesty

Widget snippets map from `DashboardView` via `buildWidgetSnippets`. Empty states stay empty. Nutrition never invents macros.

When `commandCenter` is off, `/app/dashboard` keeps the classic `PerformanceDashboard`.

Focus presets (Strength → Bodybuilding), smart defaults, and **Save layout** ship under Prompt 189 — see `docs/CUSTOM_DASHBOARDS.md` (`customDashboards` flag).

---

## Tests

```bash
npx vitest run src/domain/command-center
```
