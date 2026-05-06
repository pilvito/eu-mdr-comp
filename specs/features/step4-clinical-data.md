# SPEC: Step 4 — Clinical & Safety Evidence
**Spec ID:** FEAT-STEP4
**Route:** /step-4
**Regulation Ref:** EU MDR 2017/745 Article 61; Annex XIV (Clinical Evaluation)
**Component:** src/pages/Steps.tsx → Step4, uses src/components/ChecklistStep.tsx
**Machine:** src/machines/checklistMachine.ts (shared, parameterised)
**Tests:** tests/e2e/flows/checklist-completion.spec.ts

---

## 1. Tasks (5 items)

| ID | Title | Description |
|----|-------|-------------|
| 1 | Clinical Evaluation Plan (CEP) | Draft a plan on how you will demonstrate safety and performance. |
| 2 | Literature Review | Conduct a systematic literature review on equivalent devices. |
| 3 | Determine Trial Need | Decide if dedicated clinical trials (investigations) are necessary. |
| 4 | Risk Management File | Compile hazard analysis and risk-benefit justification. |
| 5 | Clinical Evaluation Report (CER) | Synthesize all data into your final CER. |

---

## 2. Behavioral Properties

Inherited from `specs/components/checklist-step.md` with:

- `stepNumber = 4`
- `prevStep = '/step-3'`
- `nextStep = '/step-5'`
- Continue button label: "Continue to Step 5"

**INV-STEP4-01:** □ Continue button is always enabled (advisory completion model).
**INV-STEP4-02:** □ Progress = `completedCount / 5 * 100`

---

## 3. Acceptance Criteria

| AC ID | Given | When | Then | Property Ref |
|-------|-------|------|------|-------------|
| AC-STEP4-01 | User is on /step-4 | — | 5 tasks visible | — |
| AC-STEP4-02 | All 5 tasks checked | — | Progress = 100% | INV-STEP4-02 |
| AC-STEP4-03 | Any state | User clicks Continue | Route = '/step-5' | INV-STEP4-01 |

---

## 4. Test References

| Test File | Test ID | Property |
|-----------|---------|----------|
| tests/e2e/flows/checklist-completion.spec.ts | `e2e.step4.*` | AC-STEP4-01 through AC-STEP4-03 |
