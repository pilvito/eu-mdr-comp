# SPEC: Step 8 — CE Marking & Go to Market
**Spec ID:** FEAT-STEP8
**Route:** /step-8
**Regulation Ref:** EU MDR 2017/745 Articles 20 (CE marking), 19 (Declaration of Conformity)
**Component:** src/pages/Steps.tsx → Step8, uses src/components/ChecklistStep.tsx
**Machine:** src/machines/checklistMachine.ts (shared, parameterised)
**Tests:** tests/e2e/flows/checklist-completion.spec.ts

---

## 1. Tasks (5 items)

| ID | Title | Description |
|----|-------|-------------|
| 1 | Receive MDR Certificate | Obtain your certificate from the Notified Body. |
| 2 | Sign Declaration of Conformity (DoC) | Legally declare that you comply with MDR. |
| 3 | Affix CE Mark | Apply the CE mark (and NB number) to your product and labeling. |
| 4 | Register Device in EUDAMED | Assign Basic UDI-DI and register the device. |
| 5 | Start Selling | Launch commercially in the European Union. |

---

## 2. Behavioral Properties

Inherited from `specs/components/checklist-step.md` with:

- `stepNumber = 8`
- `prevStep = '/step-7'`
- `nextStep = '/step-9'`
- Continue button label: "Continue to Step 9"

**INV-STEP8-01:** □ Continue button is always enabled.

> **Domain note (INV-MDR-03):** CE Marking is only reached after Declaration of Conformity is prepared.
> In the application, task 2 (Sign DoC) must logically precede task 3 (Affix CE Mark).
> The current advisory checklist does not enforce ordering — this is noted as a future constraint.
