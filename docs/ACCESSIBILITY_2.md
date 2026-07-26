# Accessibility 2.0

**Date:** 2026-07-22  
**Prompt:** 151 — Accessibility 2.0  
**Domain:** `src/domain/accessibility-system/`  
**Service:** `src/services/accessibility-system/`  
**UI fixes:** ScoreRing · Modal/Drawer focus traps · TrendChart · TechniqueVideoTimeline · FormField  
**Dashboard:** `/app/admin/accessibility` (admin)  
**Flag:** `accessibilitySystem` (`NEXT_PUBLIC_FF_ACCESSIBILITY_SYSTEM`, default **on**)

---

## Intent

Advanced WCAG-oriented audit and fixes for:

| Surface | Focus |
| --- | --- |
| Keyboard-only flows | Skip link, focus-visible, tab widgets, chart arrows |
| Screen readers | Landmarks, alerts, chart data tables, score announcements |
| Charts | `role="img"` + sr-only table + keyboard points |
| Video analysis | Native controls, labeled phase buttons (not color-only) |
| Forms | Labels, `aria-describedby`, error alerts |
| Modals / drawers | Dialog semantics + **focus traps** + restore focus |
| Color blindness | Score text + symbols (● ◆ ▲ ■) |
| Technique scores | **Must not rely only on color** |

## Score presentation rule

```text
numeric value + text label + non-color symbol
color = reinforcement only
```

`ScoreRing`, score `Badge`s, and explicit score `ProgressBar` tones follow this rule.

## Related

- Design system: `Modal`, `Drawer`, `FormField`, `ScoreRing`, `TrendChart`
- Trust Center scoring honesty

## Tests

`src/domain/accessibility-system/accessibility-system.test.ts`
