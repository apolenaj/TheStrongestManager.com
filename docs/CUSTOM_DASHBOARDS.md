# Custom Dashboards

**Date:** 2026-07-22  
**Prompt:** 189 — Custom Dashboards  
**Domain:** `src/domain/custom-dashboards/`  
**UI:** `/app/dashboard` (Command Center + focus picker when flagged)  
**Admin:** `/app/admin/custom-dashboards`  
**Flag:** `customDashboards` (`NEXT_PUBLIC_FF_CUSTOM_DASHBOARDS`, default **on**)  
**Related:** `docs/COMMAND_CENTER.md`

---

## Principle

Athletes customize the dashboard by choosing a **focus**, applying **smart defaults**, and **saving layout**. Presets rearrange Command Center widgets — they never invent scores, macros, or medical claims.

---

## Focus choices

| Focus | Above fold (smart default) |
| --- | --- |
| Strength | TODAY + Performance |
| Technique | TODAY + Technique |
| Recovery | TODAY + Recovery |
| Nutrition | TODAY + Nutrition |
| Competition | TODAY + Goal trajectory |
| Bodybuilding | TODAY + Training |

Remaining widgets stay below the fold in a focus-aware order.

---

## Smart defaults

- `layoutPreferencesForFocus(focusId)` builds widget visibility / fold / order.
- `suggestDashboardFocus(signals)` picks a starting focus from discipline, preferred sports, and goal categories when present — otherwise Strength with an explicit fallback reason.
- Profile suggestion is a hint; the athlete’s saved choice wins after first hydrate.

---

## Save layout

Persisted in device `localStorage` under `tsm.custom_dashboard.v1`:

```ts
{ version, focusId, layout, savedAt, customizedAfterPreset }
```

- **Apply focus** → replace layout with that preset’s smart defaults, clear “edited” flag, stamp `savedAt`.
- **Customize widgets** → marks `customizedAfterPreset`.
- **Save layout** → stamps `savedAt` on the current layout + focus.
- Legacy Command Center prefs (`tsm.command_center.layout.v1`) migrate in when present.

---

## Honesty

Choosing Competition does not invent meet attempts or weight-cut protocols. Choosing Nutrition does not invent macros. Empty widgets stay empty.

---

## Tests

```bash
npx vitest run src/domain/custom-dashboards
```
