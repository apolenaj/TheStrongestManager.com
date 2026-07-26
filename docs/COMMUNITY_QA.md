# Community Knowledge Q&A

**Date:** 2026-07-21  
**Prompt:** 81 — Community Knowledge Q&A  
**Domain:** `src/domain/community-qa/`  
**Routes:** `/app/community-qa`, `/app/community-qa/[id]` (flag `communityQa`)  
**Admin:** `/app/admin/community-qa`  
**Models:** `CommunityQuestion`, `CommunityAnswer`, `CommunityVote`, `CommunityQaModerationEvent`

---

## Categories

Technique · Programming · Powerlifting · Bodybuilding · Strongman · Nutrition · Recovery

---

## Features

| Feature | Behavior |
| --- | --- |
| Question | Categorized human post |
| Answers | `human_athlete` or `human_coach` only — never AI authorship |
| Voting | +1 / −1 on questions and answers |
| Accepted answer | Question author selects one published human answer |
| Expert badge | Only when author has a **verified** coach credential at post time |
| AI summary | Stored on the question; labelled “AI summary”; never an Answer row |

---

## Moderation

Community members can **flag**. Staff can **hide / restore / remove / note** via admin queue.

---

## Feature flag

`NEXT_PUBLIC_FF_COMMUNITY_QA` → `communityQa` (default on)
