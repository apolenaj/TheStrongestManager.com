# Content Moderation

**Date:** 2026-07-21  
**Prompt:** 139 — Content Moderation  
**Staff queue:** `/app/moderation`  
**Domain:** `src/domain/content-moderation/`  
**Service:** `src/services/content-moderation/`  
**Flag:** `contentModeration` (`NEXT_PUBLIC_FF_CONTENT_MODERATION`, default **on**)

---

## Intent

Unified moderation architecture for:

| Target | Examples |
| --- | --- |
| Community | Questions / answers |
| Marketplace | Program listings |
| Coach profiles | Marketplace coach listings |
| User-generated content | Messages, expert articles, other UGC |

## Features

| Feature | Behavior |
| --- | --- |
| **Report** | Authenticated users file `ContentModerationReport` + audit `report` |
| **Review** | Staff mark `in_review` |
| **Remove** | Adapter mutates domain status (community remove/hide, message remove, etc.) |
| **Suspend** | Adapter suspends marketplace listing or coach profile |
| **Audit log** | Append-only `ContentModerationAuditLog` for every action |

## Adapters

Does not replace domain event tables — wraps them:

- Community → `moderateCommunityContent`
- Messages → `moderateMessage`
- Program listings → `reviewProgramMarketplaceListing(... suspended/published)`
- Coach profiles → `listingStatus: suspended` + `suspendedAt`

## Honesty

- Empty queue stays empty — never invent reports
- Staff-only review (`requireAdmin` / `isAdmin`)
- Fail closed when flag off
- Details/notes never sent to analytics

## Analytics

`content_moderation_reported|reviewed|removed|suspended`

## Tests

`src/domain/content-moderation/content-moderation.test.ts`
