# SPEC: Step 2 — Device Classification
**Spec ID:** FEAT-STEP2
**Route:** /step-2
**Regulation Ref:** EU MDR 2017/745 Annex VIII (Classification Rules 1–22)
**Visual Ref:** specs/images/mdr-certification-flow.png
**Component:** src/pages/Step2.tsx
**Machine:** src/machines/step2Machine.ts
**Tests:** tests/component/Step2.test.tsx, tests/e2e/flows/classification.spec.ts

---

## 1. Domain Entities

| Entity | Type | Description |
|--------|------|-------------|
| `invasive` | `boolean \| null` | Does device penetrate the body? |
| `active` | `boolean \| null` | Does device use non-body energy source? |
| `duration` | `'transient' \| 'short-term' \| 'long-term' \| ''` | Duration of use |
| `RiskClass` | `'Class I' \| 'Class IIa' \| 'Class IIb' \| 'Class III'` | Determined device class |
| `ClassificationResult` | `{ class: RiskClass; desc: string; color: string } \| null` | Computed result |

> **Important:** The current calculator is a simplified MVP approximation of Annex VIII rules.
> Regulatory caveat shown to user: "Refer to MDR Annex VIII for full rules."
> The spec formalises the MVP logic, not the full 22-rule Annex VIII.

---

## 2. State Machine Definition

```
STATES:
  CONFIGURING     -- not all 3 questions answered
  RESULT_I        -- Class I result computed (invasive=false, active=false, any duration)
  RESULT_IIA      -- Class IIa result (catch-all for IIa conditions)
  RESULT_IIB      -- Class IIb result (active=true, duration=short-term)
  RESULT_III      -- Class III result (invasive=true, duration=long-term)

INITIAL STATE: CONFIGURING

TRANSITIONS:
  CONFIGURING
    → CONFIGURING   on: any_question_answer   guard: not all 3 questions answered
    → RESULT_III    on: any_question_answer   guard: invasive=true ∧ duration='long-term'
    → RESULT_IIB    on: any_question_answer   guard: active=true ∧ duration='short-term'
    → RESULT_I      on: any_question_answer   guard: invasive=false ∧ active=false
    → RESULT_IIA    on: any_question_answer   guard: none of the above (default)

  RESULT_*
    → CONFIGURING   on: any_question_answer   (re-answer resets to configuring then re-evaluates)
    (Result is re-computed on every state change — stays on a RESULT state if still complete)
```

---

## 3. Formal Invariants (□)

**INV-STEP2-01:** □ `riskResult = null` → `continueButton.disabled = true`

**INV-STEP2-02:** □ `riskResult ≠ null` → `continueButton.disabled = false`

**INV-STEP2-03:** □ `(invasive = null ∨ active = null ∨ duration = '')` → `riskResult = null`
> All three questions must be answered before a result is computed.

**INV-STEP2-04:** □ `riskResult.class = 'Class III'` ↔ `(invasive = true ∧ duration = 'long-term')`
> (within the MVP simplified logic)

**INV-STEP2-05:** □ `riskResult.class = 'Class IIb'` ↔ `(active = true ∧ duration = 'short-term' ∧ ¬(invasive = true ∧ duration = 'long-term'))`

**INV-STEP2-06:** □ `riskResult.class = 'Class I'` ↔ `(invasive = false ∧ active = false)`

**INV-STEP2-07:** □ Regulatory caveat text is always visible when any result is shown.
> "Note: This is a simplified calculator. Refer to MDR Annex VIII for full rules."

---

## 4. Progress Properties (◇)

**PROG-STEP2-01:** ◇ `(all 3 questions answered)` → `riskResult ≠ null`

**PROG-STEP2-02:** ◇ `(riskResult ≠ null ∧ user clicks Continue)` → `route = '/step-3'`

---

## 5. Reactive Properties (→)

**REACT-STEP2-01:** `any_question_answer` → `riskResult` re-computed synchronously.

**REACT-STEP2-02:** `riskResult.class = 'Class III'` → result card uses `var(--danger)` color.

**REACT-STEP2-03:** `riskResult.class = 'Class IIb'` → result card uses `var(--warning)` color.

**REACT-STEP2-04:** `riskResult.class = 'Class I'` → result card uses `var(--success)` color.

**REACT-STEP2-05:** `riskResult.class = 'Class IIa'` → result card uses `var(--info)` color.

**REACT-STEP2-06:** `back_button_click` → `navigate('/step-1')`.

---

## 6. Acceptance Criteria

| AC ID | Given | When | Then | Property Ref |
|-------|-------|------|------|-------------|
| AC-STEP2-01 | No answers | — | Continue disabled, no result shown | INV-STEP2-01, INV-STEP2-03 |
| AC-STEP2-02 | invasive=false, active=false, duration=transient | — | Class I shown, Continue enabled | INV-STEP2-06, INV-STEP2-02 |
| AC-STEP2-03 | invasive=false, active=false, duration=transient → change active to true | — | Result updates to IIa or IIb (no longer Class I) | REACT-STEP2-01 |
| AC-STEP2-04 | invasive=true, duration=long-term, active=false | — | Class III shown | INV-STEP2-04 |
| AC-STEP2-05 | active=true, duration=short-term, invasive=false | — | Class IIb shown | INV-STEP2-05 |
| AC-STEP2-06 | Any result showing | Regulatory caveat present | Caveat text visible | INV-STEP2-07 |
| AC-STEP2-07 | Class I result, Continue enabled | User clicks Continue | Route = '/step-3' | PROG-STEP2-02 |
| AC-STEP2-08 | Any state | User clicks Back | Route = '/step-1' | REACT-STEP2-06 |

---

## 7. Component Mapping

| Spec Concept | React Element | File:Line |
|---|---|---|
| `invasive` | `useState(null)` | Step2.tsx:7 |
| `active` | `useState(null)` | Step2.tsx:8 |
| `duration` | `useState('')` | Step2.tsx:9 |
| `calculateClass()` | Decision function | Step2.tsx:11 |
| `riskResult` | `calculateClass()` return value | Step2.tsx:22 |
| Result card | conditional render on `riskResult` | Step2.tsx:110 |
| Continue button | `disabled={!riskResult}` | Step2.tsx:138 |

---

## 8. Test References

| Test File | Test ID | Property |
|-----------|---------|----------|
| tests/component/Step2.test.tsx | `step2.inv.01-03` | INV-STEP2-01 through INV-STEP2-03 |
| tests/component/Step2.test.tsx | `step2.inv.04-07` | INV-STEP2-04 through INV-STEP2-07 |
| tests/unit/machines/step2Machine.test.ts | `step2m.*` | All classification paths |
| tests/e2e/flows/classification.spec.ts | `e2e.step2.*` | AC-STEP2-01 through AC-STEP2-08 |
