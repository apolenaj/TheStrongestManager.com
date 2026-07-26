# Social Graph Prep

**Date:** 2026-07-22  
**Prompt:** 194 — Social Graph Prep  
**Domain:** `src/domain/social-graph/`  
**Admin:** `/app/admin/social-graph`  
**Athlete (gated):** `/app/activity-feed`  
**Flags:**
- `socialGraphPrep` (`NEXT_PUBLIC_FF_SOCIAL_GRAPH_PREP`, default **on**) — architecture + admin
- `socialActivityFeed` (`NEXT_PUBLIC_FF_SOCIAL_ACTIVITY_FEED`, default **off**) — live feed; stay off until moderation ready

---

## Principle

Document **follow athletes**, **follow coaches**, **private accounts**, and **activity feeds** without launching a social network. Empty follows and empty feeds are honest — never invent engagement.

**Do not launch a full social feed unless moderation is ready.**

For an **optional personal milestone feed** (PRs, competition, achievements, shared technique) see Prompt 195 — `docs/ACTIVITY_FEED.md` (`activityFeedMvp`). That MVP is separate from the gated follower network.

---

## Follow graph (contract)

| Target | Meaning |
| --- | --- |
| `athlete` | Follow an athlete profile (`targetAthleteProfileId`) |
| `coach` | Follow a coach user (`targetCoachUserId`) |

| Status | Meaning |
| --- | --- |
| `pending` | Private account — awaiting accept |
| `accepted` | Can receive opted-in activity |
| `declined` | Rejected request |
| `blocked` | Mute / block edge |

Private accounts **default on**. New follows on private accounts start **pending**; public social settings may auto-accept when that target kind is allowed.

Athlete public profile (`AthletePublicProfile`, Prompt 75) remains a separate surface from follower feeds.

---

## Activity feed

Planned item kinds (contract only): workout completed, PR logged, technique shared, program started, competition prep, public coach note, follow accepted.

`listSocialActivityFeed` returns **no items** unless `evaluateSocialFeedLaunchGate` says `mayLaunchFullFeed`. Even then, persistence is not shipped yet — empty stays honest.

Athlete route `/app/activity-feed` shows Coming Soon while the gate is closed. It is **not** in primary nav.

---

## Moderation launch gate

Checklist (all required + prep flag):

1. `contentModeration` flag on  
2. Report queue available (wired with content moderation)  
3. UGC / social-capable surface in moderation targets  
4. Block / mute contract (`status=blocked`)  
5. `socialActivityFeed` explicitly **ON**

Admin console at `/app/admin/social-graph` shows live checklist status.

---

## Future persistence (not shipped)

When follows go live, expect tables along the lines of:

- `SocialAccountPrivacy` — `isPrivate`, allow athlete/coach follows, `publishActivityToFollowers`
- `SocialFollow` — follower → athlete|coach + status
- `SocialActivityEvent` — optional feed projection

Until then, domain types + gates are the source of truth.

---

## Tests

```bash
npx vitest run src/domain/social-graph
```
