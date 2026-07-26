# Activity Feed MVP

**Date:** 2026-07-22  
**Prompt:** 195 — Activity Feed MVP  
**Domain:** `src/domain/activity-feed/`  
**Athlete UI:** `/app/activity-feed`  
**Admin:** `/app/admin/activity-feed`  
**Flag:** `activityFeedMvp` (`NEXT_PUBLIC_FF_ACTIVITY_FEED_MVP`, default **on**)

---

## Principle

An **optional, finite** milestone feed — not a social engagement product.

| Kind | Source |
| --- | --- |
| PRs | PR Intelligence events (lookback) when enabled |
| Competition results | Completed Competition Prep records (not invented placings) |
| Achievements | Earned `AthleteAchievement` rows |
| Shared technique | `TechniqueShare` cards the athlete created |

Empty feed = no matching records for your visibility settings.

---

## User visibility

`ActivityFeedPreference` (per athlete):

- Master `feedEnabled`
- Per-kind: PRs, competition results, achievements, shared technique

Defaults: feed on, all kinds on. Athlete can hide any kind.

---

## No endless engagement dark patterns

Refused:

- Infinite scroll / endless engagement loops  
- Fake like / comment counts  
- Algorithmic ranking (chronological only)  
- Fake urgency / FOMO copy  
- Autoload “next” dopamine patterns  

Hard caps: page size **20**, max **40** items, explicit **End of feed**.

---

## vs Social Graph (Prompt 194)

| | Activity Feed MVP | Social follower feed |
| --- | --- | --- |
| Flag | `activityFeedMvp` (default on) | `socialActivityFeed` (default **off**) |
| Scope | Your opted-in milestones | Followers’ activity network |
| Gate | Product flag + visibility | Moderation readiness checklist |

---

## Tests

```bash
npx vitest run src/domain/activity-feed
```
