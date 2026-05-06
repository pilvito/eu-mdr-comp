# SPEC: Step 3 — Quality Management System
**Spec ID:** FEAT-STEP3
**Route:** /step-3
**Regulation Ref:** EU MDR 2017/745 Article 10(9); ISO 13485; IEC 62304 §5.1
**Component:** src/pages/Steps.tsx → Step3, uses src/components/ChecklistStep.tsx
**Machine:** src/machines/checklistMachine.ts (shared, parameterised)
**Tests:** tests/component/ChecklistStep.test.tsx, tests/e2e/flows/checklist-completion.spec.ts

---

## 1. Tasks (6 items)

| ID | Title | Description |
|----|-------|-------------|
| 1 | Design Controls | Establish procedures for controlling the design of your medical device. |
| 2 | Risk Management | Implement ISO 14971 compliant risk management processes. |
| 3 | Software Dev Planning | Define responsibilities, tools, and methodologies (IEC 62304 §5.1). |
| 4 | Traceability System | Setup top-down and bottom-up traceability from requirements to tests. |
| 5 | Supplier Control | Qualify and evaluate critical suppliers, including SOUPs. |
| 6 | Document & Configuration Control | Set up versioning, issue tracking, and approval workflows. |

---

## 2. Behavioral Properties

Inherited from `specs/components/checklist-step.md` with the following overrides:

- `stepNumber = 3`
- `prevStep = '/step-2'`
- `nextStep = '/step-4'`
- Continue button label: "Continue to Step 4"

**INV-STEP3-01:** □ Continue button is always enabled (advisory completion model — INV-CL-06).

**INV-STEP3-02:** □ Progress = `completedCount / 6 * 100`

---

## 3. Acceptance Criteria

| AC ID | Given | When | Then | Property Ref |
|-------|-------|------|------|-------------|
| AC-STEP3-01 | User is on /step-3 | — | 6 tasks visible | — |
| AC-STEP3-02 | All tasks unchecked | User checks "Design Controls" | Progress = 17% | INV-STEP3-02 |
| AC-STEP3-03 | Any state | User clicks Continue | Route = '/step-4' | INV-STEP3-01 |
| AC-STEP3-04 | Any state | User clicks Back | Route = '/step-2' | PROG-CL-03 |

---

## 4. Test References

| Test File | Test ID | Property |
|-----------|---------|----------|
| tests/e2e/flows/checklist-completion.spec.ts | `e2e.step3.*` | AC-STEP3-01 through AC-STEP3-04 |
