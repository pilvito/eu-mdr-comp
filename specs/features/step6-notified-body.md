# SPEC: Step 6 — Notified Body
**Spec ID:** FEAT-STEP6
**Route:** /step-6
**Regulation Ref:** EU MDR 2017/745 Articles 51–58 (Notified Bodies); Annex IX–XI
**Component:** src/pages/Steps.tsx → Step6, uses src/components/ChecklistStep.tsx
**Machine:** src/machines/checklistMachine.ts (shared, parameterised)
**Tests:** tests/e2e/flows/checklist-completion.spec.ts

---

## 1. Tasks (5 items)

| ID | Title | Description |
|----|-------|-------------|
| 1 | Select a Notified Body | Find an NB designated for your specific device code. |
| 2 | Submit Application | Send your formal application to the selected NB. |
| 3 | Stage 1 Audit (QMS Readiness) | Pass the initial documentation review of your QMS. |
| 4 | Stage 2 Audit (QMS & Tech File) | Undergo full on-site (or remote) assessments. |
| 5 | Address Non-Conformities | Resolve any findings issued by the auditors. |

---

## 2. Behavioral Properties

Inherited from `specs/components/checklist-step.md` with:

- `stepNumber = 6`
- `prevStep = '/step-5'`
- `nextStep = '/step-7'`
- Continue button label: "Continue to Step 7"

**INV-STEP6-01:** □ Continue button is always enabled.

> **Domain note:** Class I non-sterile/non-measuring devices do not require a Notified Body (INV-MDR-02).
> In a future version, this step should show a "Not Required" state for Class I devices.
> This is not yet implemented — tracked as a future enhancement.
