# Unit system

**Date:** 2026-07-21  
**Prompt:** 149 — Unit System  
**Domain:** `src/domain/unit-system/`  
**Service:** `src/services/unit-system/`, `src/services/units/convert.ts` (compat re-export)  
**UI:** Profile unit preference · Strongman distance/mass display · `/app/admin/unit-system`  
**Flag:** `unitSystem` (`NEXT_PUBLIC_FF_UNIT_SYSTEM`, default **on**)

---

## Intent

Complete global units:

| Quantity | Canonical store | Presentation |
| --- | --- | --- |
| Mass | **kg** | kg / lb |
| Length / height | **cm** | cm / ft+in |
| Distance | **m** | m·km / ft·mi (auto short vs long) |

**Store canonical values. Convert presentation only.** Switching preference never rewrites historical rows.

## Architecture

```text
Input (preferred unit) → parse* → canonical kg|cm|m → DB
DB canonical → format* (preference) → UI
Calculations always use canonical numbers
```

Athlete preference: `AthleteProfile.units` (`kg` | `lb`; legacy `metric`/`imperial` normalize on read).

| Preference | Mass | Height | Short distance | Long distance |
| --- | --- | --- | --- | --- |
| Metric | kg | cm | m | km |
| Imperial | lb | ft + in | ft | mi |

## Tests

`src/domain/unit-system/unit-system.test.ts` — round-trips, ft/in parse, km/mi presentation, honesty.

Legacy suite: `src/services/units/convert.test.ts` (re-exports).

## Related

- Profile editor unit toggle
- Strongman Mode PR badges (presentation conversion)
- `docs/DATA_MODEL.md` field conventions
