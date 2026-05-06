# SPEC: Step 1 — Applicability & Intended Use
**Spec ID:** FEAT-STEP1
**Route:** /step-1
**Regulation Ref:** EU MDR 2017/745 Article 2(1), MDR Annex VIII
**Visual Ref:** specs/images/mdr-certification-flow.png
**Component:** src/pages/Step1.tsx
**Machine:** src/machines/step1Machine.ts
**Tests:** tests/component/Step1.test.tsx, tests/e2e/flows/applicability-check.spec.ts

---

## 1. Domain Entities

| Entity | Type | Description |
|--------|------|-------------|
| `intendedUse` | `string` | Free-text description of product's medical purpose |
| `MedicalClaim` | `Record<ClaimKey, boolean \| null>` | Answers to 4 binary applicability questions |
| `ClaimKey` | `'diagnose' \| 'treat' \| 'monitor' \| 'prevent'` | The four MDR applicability dimensions |
| `isComplete` | `boolean` | `intendedUse.length >= 10 ∧ all answers ≠ null` |
| `isMedicalDevice` | `boolean` | `∃ claim : answers[claim] === true` |

> **Bug found (spec vs. code):** `Step1.tsx:20` uses `intendedUse.length > 10` (strictly greater).
> The spec defines "at least 10 chars" which is `>= 10`. The off-by-one error means a
> 10-character intended use is incorrectly rejected. Machine and tests use `>= 10`.

---

## 2. State Machine Definition

```
STATES:
  IDLE                  -- intendedUse empty, no claims answered
  FILLING               -- intendedUse being typed but < 10 chars OR claims not all answered
  ANSWERING             -- intendedUse >= 10 chars, some but not all claims answered
  RESULT_POSITIVE       -- isComplete AND isMedicalDevice (→ Continue enabled)
  RESULT_NEGATIVE       -- isComplete AND NOT isMedicalDevice (→ Continue disabled)

INITIAL STATE: IDLE

TRANSITIONS:
  IDLE | FILLING
    → FILLING           on: intendedUse_change  guard: length < 10
    → ANSWERING         on: intendedUse_change  guard: length >= 10

  ANSWERING
    → ANSWERING         on: claim_answer(key, value)  guard: not all answered yet
    → RESULT_POSITIVE   on: claim_answer(key, value)  guard: all answered AND any true
    → RESULT_NEGATIVE   on: claim_answer(key, value)  guard: all answered AND none true
    → FILLING           on: intendedUse_change        guard: length < 10 (resets result)

  RESULT_POSITIVE
    → ANSWERING         on: claim_answer(key, value)  guard: un-toggles last true claim
    → RESULT_NEGATIVE   on: claim_answer(key, value)  guard: now all false
    → ANSWERING         on: intendedUse_change        guard: length < 10

  RESULT_NEGATIVE
    → RESULT_POSITIVE   on: claim_answer(key, value)  guard: now some true
    → ANSWERING         on: intendedUse_change        guard: length < 10
```

---

## 3. Formal Invariants (□)

**INV-STEP1-01:** □ `state ∈ {IDLE, FILLING, ANSWERING, RESULT_NEGATIVE}` → `continueButton.disabled = true`

**INV-STEP1-02:** □ `state = RESULT_POSITIVE` ↔ `continueButton.disabled = false`
> Continue is enabled if and only if the result is positive.

**INV-STEP1-03:** □ `intendedUse.length < 10` → `state ∉ {RESULT_POSITIVE, RESULT_NEGATIVE}`
> A short intended-use field can never produce a result.

**INV-STEP1-04:** □ `∃ claim : answers[claim] = null` → `state ∉ {RESULT_POSITIVE, RESULT_NEGATIVE}`
> Partial claim answers cannot produce a result.

**INV-STEP1-05:** □ `state = RESULT_POSITIVE` ↔ `(intendedUse.length >= 10 ∧ ∀ k answers[k] ≠ null ∧ ∃ k answers[k] = true)`
> The positive result has an exact precondition — every part of isComplete AND isMedicalDevice.

---

## 4. Progress Properties (◇)

**PROG-STEP1-01:** ◇ `(intendedUse.length >= 10 ∧ all claims answered ∧ ∃ true)` → `state = RESULT_POSITIVE`

**PROG-STEP1-02:** ◇ `(state = RESULT_POSITIVE ∧ user clicks Continue)` → `route = '/step-2'`

**PROG-STEP1-03:** ◇ `(all claims answered as false ∧ intendedUse.length >= 10)` → `state = RESULT_NEGATIVE`

---

## 5. Reactive Properties (→)

**REACT-STEP1-01:** `intendedUse_change` → re-evaluate `isComplete` synchronously (same render, no debounce).

**REACT-STEP1-02:** `claim_answer(key, value)` → re-evaluate `isMedicalDevice` and `isComplete` synchronously.

**REACT-STEP1-03:** `state → RESULT_NEGATIVE` → result card shows `AlertTriangle` icon + danger color + disabled Continue.

**REACT-STEP1-04:** `state → RESULT_POSITIVE` → result card shows `CheckCircle` icon + success color + enabled Continue.

**REACT-STEP1-05:** `back_button_click` → `navigate('/')` (Dashboard). No state loss requirement for Step 1 in MVP.

---

## 6. Acceptance Criteria

| AC ID | Given | When | Then | Property Ref |
|-------|-------|------|------|-------------|
| AC-STEP1-01 | User is on /step-1 | Intended use is empty, no claims | Continue disabled | INV-STEP1-01 |
| AC-STEP1-02 | Intended use = "hello" (5 chars), all claims true | — | No result shown, Continue disabled | INV-STEP1-03 |
| AC-STEP1-03 | Intended use = 12 chars, "diagnose" = true, others null | — | No result shown | INV-STEP1-04 |
| AC-STEP1-04 | Intended use = 12 chars, all claims false | — | Negative result card, Continue disabled | PROG-STEP1-03, INV-STEP1-01 |
| AC-STEP1-05 | Intended use = 12 chars, all claims answered, diagnose = true | — | Positive result card, Continue enabled | PROG-STEP1-01, INV-STEP1-02 |
| AC-STEP1-06 | Positive result showing | User sets diagnose to false (now all false) | Negative result replaces positive | REACT-STEP1-02 |
| AC-STEP1-07 | Any state | User clicks Back | Route = '/' | REACT-STEP1-05 |
| AC-STEP1-08 | Positive result, Continue enabled | User clicks Continue | Route = '/step-2' | PROG-STEP1-02 |
| AC-STEP1-09 | Intended use exactly 10 chars, all claims true | — | Positive result shown (>= 10 passes) | INV-STEP1-05 (bug fix) |

---

## 7. Component Mapping

| Spec Concept | React Element | File:Line |
|---|---|---|
| `intendedUse` | `useState('')` | Step1.tsx:7 |
| `answers` (claims) | `useState({diagnose:null,...})` | Step1.tsx:8 |
| `handleAnswer` | `(key,val) => setAnswers(...)` | Step1.tsx:15 |
| `isMedicalDevice` | `Object.values(answers).some(a => a === true)` | Step1.tsx:19 |
| `isComplete` | `intendedUse.length > 10 && ...` ← **bug: should be >= 10** | Step1.tsx:20 |
| Result card | conditional render on `isComplete` | Step1.tsx:88 |
| Continue button | `disabled={!isComplete \|\| !isMedicalDevice}` | Step1.tsx:116 |
| Back button | `onClick={() => navigate('/')}` | Step1.tsx:24 |

---

## 8. Test References

| Test File | Test ID | Property |
|-----------|---------|----------|
| tests/component/Step1.test.tsx | `step1.inv.01` | INV-STEP1-01 |
| tests/component/Step1.test.tsx | `step1.inv.02` | INV-STEP1-02 |
| tests/component/Step1.test.tsx | `step1.inv.03` | INV-STEP1-03 |
| tests/component/Step1.test.tsx | `step1.inv.04` | INV-STEP1-04 |
| tests/component/Step1.test.tsx | `step1.inv.05.bugfix` | INV-STEP1-05 (10-char boundary) |
| tests/component/Step1.test.tsx | `step1.react.01-02` | REACT-STEP1-01, REACT-STEP1-02 |
| tests/unit/machines/step1Machine.test.ts | `step1m.*` | All state transitions |
| tests/e2e/flows/applicability-check.spec.ts | `e2e.step1.*` | AC-STEP1-01 through AC-STEP1-09 |
