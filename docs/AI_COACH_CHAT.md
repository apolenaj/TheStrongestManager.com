# AI Coach conversational interface

**Date:** 2026-07-21  
**Prompt:** 53 — Coaching chat grounded in athlete data  
**Route:** `/app/coach-brain`  
**UI:** `src/components/coach-brain/CoachChat.tsx`  
**Domain:** `src/domain/coach-brain/chat.ts`  
**Service:** `src/services/coach-brain/chat-service.ts`

---

## Intent

An intelligent coaching **chat** that answers from the user’s actual logs via Coach Brain tools + Performance Intelligence — not a generic chatbot.

Example questions:

- Should I increase my deadlift next week?  
- Why did my bench stop progressing?  
- Should I deload?  
- Which accessory should I change?  
- How am I progressing toward a 300 kg deadlift?

---

## Honesty rule

Never pretend unavailable data is known.

**Bad:** “Your recovery has been poor.”  
**Good:** “You logged only two recovery check-ins this week, so there is not enough data to conclude that recovery is the main issue.”

---

## Flow

```text
User question
  → askCoachChatAction
  → gatherCoachBrainTools + AthleteState
  → classifyCoachChatIntent
  → buildCoachChatAnswer (deterministic, grounded)
  → CoachChat UI (content + data refs + deep links)
  → CoachBrainAuditLog action chat.answered
```

---

## Data references & deep links

Each assistant reply can include `dataRefs`:

| Kind | Typical href |
| --- | --- |
| `training_session` | `/app/training/[sessionId]` |
| `technique_analysis` | `/app/technique/[analysisId]` |
| `progress` | `/app/progress` |
| `recovery` | `/app/recovery` |
| `adaptations` | `/app/adaptations` |

Athletes open sessions, technique reports, and progress charts directly from the response cards.

---

## Related

`docs/AI_COACH_BRAIN.md` — structured recommendation pipeline (Prompt 52).
