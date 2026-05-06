# SPEC: Step 7 — EU-Specific Requirements
**Spec ID:** FEAT-STEP7
**Route:** /step-7
**Regulation Ref:** EU MDR 2017/745 Articles 11 (EC REP), 15 (PRRC), 29–44 (EUDAMED/UDI)
**Component:** src/pages/Steps.tsx → Step7, uses src/components/ChecklistStep.tsx
**Machine:** src/machines/checklistMachine.ts (shared, parameterised)
**Tests:** tests/e2e/flows/checklist-completion.spec.ts

---

## 1. Tasks (4 items)

| ID | Title | Description |
|----|-------|-------------|
| 1 | Appoint an EU Rep (EC REP) | Sign an agreement with an EU-based representative (if manufacturer is outside EU). |
| 2 | Assign a PRRC | Appoint a Person Responsible for Regulatory Compliance. |
| 3 | Obtain a Single Registration Number (SRN) | Register as a manufacturer in EUDAMED. |
| 4 | Register Importers/Distributors | Ensure economic operators are compliant. |

---

## 2. Behavioral Properties

Inherited from `specs/components/checklist-step.md` with:

- `stepNumber = 7`
- `prevStep = '/step-6'`
- `nextStep = '/step-8'`
- Continue button label: "Continue to Step 8"

**INV-STEP7-01:** □ Continue button is always enabled.
**INV-STEP7-02:** □ Progress = `completedCount / 4 * 100`
