# Training Method Knowledge Graph

**Date:** 2026-07-21  
**Prompt:** 110 — Training Method Knowledge Graph  
**Route:** `/app/method-graph`  
**Domain:** `src/domain/training-method-knowledge-graph/`  
**Service:** `src/services/training-method-knowledge-graph/`  
**Flag:** `trainingMethodKnowledgeGraph` (`NEXT_PUBLIC_FF_TRAINING_METHOD_KNOWLEDGE_GRAPH`, default **on**)

---

## Intent

Connect educational entities:

| Node kind | Examples |
| --- | --- |
| Training methods | Conjugate, block, DUP, HIT, GVT, … |
| Historical coaches / practice | Westside Barbell, Louie Simmons, Matveyev, Issurin, Jones, Mentzer |
| Sports | Powerlifting, bodybuilding, weightlifting, … |
| Goals | Fit goals (strength, hypertrophy, powerlifting, …) |
| Volume strategies | Special-exercise volume, 10×10, undulating, concentrated blocks |
| Intensity strategies | Max effort, dynamic effort, repetition method, progressive intensity |
| Recovery demands | High / moderate–high / moderate / variable |

**Hard rule:** Keep educational and accurate. Separate Soviet concurrent ideas, Westside gym practice, and internet clones. Never invent biographies or arbitrary similarity edges.

---

## Featured exploration path

**Conjugate → Westside → Max effort → Dynamic effort → Powerlifting**

Interactive explorer: play the featured path, jump breadcrumb steps, and expand curated neighbors.

---

## Tests

`src/domain/training-method-knowledge-graph/training-method-knowledge-graph.test.ts`
