# Messaging System

**Date:** 2026-07-21  
**Prompt:** 132 — Messaging System  
**Route:** `/app/messages`  
**Domain:** `src/domain/messaging/`  
**Service:** `src/services/messaging/`  
**Flag:** `messagingSystem` (`NEXT_PUBLIC_FF_MESSAGING_SYSTEM`, default **on**)

---

## Intent

Athlete–coach messaging architecture with:

- Threads
- Attachments
- Workout references (`training_session`)
- Technique references (`technique_analysis`)
- Notifications (`coach_message`)
- Moderation / reporting
- Secure access (active `CoachAthleteAccess` only)

## Secure access

1. Threads are scoped to `(coachUserId, athleteProfileId)`.
2. Writes require an **active** coach access grant; revoked access locks the thread.
3. Org roles never bypass grants.
4. Attachments are private disk keys under `storage/messaging/` — not public URLs.

## Moderation

Participants may **flag** a message (`MessageModerationEvent`).  
Admins may **hide** / **remove** / **restore** (same action set as Community Q&A).

## Notifications

Coach → athlete sends create an in-app `AthleteNotification` with kind `coach_message` (preference-gated via `kindCoachMessage`).

## Persistence

`MessageThread`, `Message`, `MessageAttachment`, `MessageModerationEvent`.

## Tests

`src/domain/messaging/messaging.test.ts`
