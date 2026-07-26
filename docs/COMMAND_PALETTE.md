# Command Palette

**Date:** 2026-07-22  
**Prompt:** 190 — Command Palette  
**Domain:** `src/domain/command-palette/`  
**UI:** App top bar (`CommandPalette`)  
**Admin:** `/app/admin/command-palette`  
**Flag:** `commandPalette` (`NEXT_PUBLIC_FF_COMMAND_PALETTE`, default **on**)

---

## Principle

A power-user **command interface** for fast navigation. Commands jump to real routes — they do not invent workouts, PRs, scores, or coach replies.

---

## Example commands

| Command | Destination |
| --- | --- |
| Log workout | `/app/today` |
| Upload deadlift | `/app/technique` |
| Ask coach | `/app/coach-brain` |
| Find exercise | `/app/exercises` |
| View PR | `/app/prs` |
| Search method | `/app/methods` |

Additional commands cover dashboard, recovery, nutrition, progress, programs, insights, profile, and full content search.

---

## Keyboard accessibility

| Key | Action |
| --- | --- |
| **Ctrl/Cmd+Shift+P** | Open / toggle palette |
| **↑ / ↓** | Move selection |
| **Home / End** | First / last |
| **Enter** | Run selected command |
| **Escape** | Close |

Focus lands in the filter input; list uses `listbox` / `option` roles with `aria-activedescendant`. Modal focus trap applies.

**Note:** **⌘K / Ctrl+K** remains **content search** (`GlobalSearch`) — not this palette.

---

## Filtering

`filterCommands(query)` scores label, description, and keywords deterministically. Empty query lists all commands. No AI ranking.

---

## Tests

```bash
npx vitest run src/domain/command-palette
```
