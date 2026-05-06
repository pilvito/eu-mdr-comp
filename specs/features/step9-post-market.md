# SPEC: Step 9 — Post-Market Surveillance
**Spec ID:** FEAT-STEP9
**Route:** /step-9
**Regulation Ref:** EU MDR 2017/745 Articles 83–86 (PMS); Article 87–92 (Vigilance)
**Component:** src/pages/Steps.tsx → Step9, uses src/components/ChecklistStep.tsx
**Machine:** src/machines/checklistMachine.ts (shared, parameterised)
**Tests:** tests/e2e/flows/checklist-completion.spec.ts

---

## 1. Tasks (5 items)

| ID | Title | Description |
|----|-------|-------------|
| 1 | Implement PMS Activities | Regularly collect data on your device in the market. |
| 2 | Vigilance Reporting | Setup procedures for reporting serious incidents and FSCA within strict deadlines. |
| 3 | Post-Market Clinical Follow-up (PMCF) | Conduct proactive clinical data collection. |
| 4 | Periodic Safety Update Report (PSUR) | Draft and submit PSURs for Class IIa/IIb/III devices. |
| 5 | Annual Surveillance Audits | Prepare for yearly check-ins from your Notified Body. |

---

## 2. Behavioral Properties

Inherited from `specs/components/checklist-step.md` with:

- `stepNumber = 9`
- `prevStep = '/step-8'`
- `nextStep = '/'`
- Continue button label: **"Finish"** (not "Continue to Step 10")

**INV-STEP9-01:** □ Continue button shows "Finish" (REACT-CL-04 — stepNumber === 9).
**INV-STEP9-02:** □ Clicking "Finish" navigates to '/' (Dashboard).
**INV-STEP9-03:** □ PMS tasks are advisory — marking them "done" does not close compliance obligations (INV-MDR-04).

---

## 3. Acceptance Criteria

| AC ID | Given | When | Then | Property Ref |
|-------|-------|------|------|-------------|
| AC-STEP9-01 | User is on /step-9 | — | "Finish" button visible (not "Continue to Step 10") | INV-STEP9-01 |
| AC-STEP9-02 | Any state | User clicks "Finish" | Route = '/' | INV-STEP9-02 |

---

## 4. Test References

| Test File | Test ID | Property |
|-----------|---------|----------|
| tests/component/ChecklistStep.test.tsx | `cl.react.04` | INV-STEP9-01 (stepNumber=9 → "Finish") |
| tests/e2e/flows/checklist-completion.spec.ts | `e2e.step9.*` | AC-STEP9-01, AC-STEP9-02 |
