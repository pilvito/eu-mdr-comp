# SPEC: Step 5 — Technical Documentation
**Spec ID:** FEAT-STEP5
**Route:** /step-5
**Regulation Ref:** EU MDR 2017/745 Annex II (Technical Documentation); Annex III
**Component:** src/pages/Steps.tsx → Step5, uses src/components/ChecklistStep.tsx
**Machine:** src/machines/checklistMachine.ts (shared, parameterised)
**Tests:** tests/e2e/flows/checklist-completion.spec.ts

---

## 1. Tasks (6 items)

| ID | Title | Description |
|----|-------|-------------|
| 1 | Device Description & Intended Use | Draft clear specifications, variants, and accessories. |
| 2 | GSPR Checklist | Complete General Safety & Performance Requirements checking (Annex I). |
| 3 | SW Requirements & Architecture | Document SW Requirements Analysis (5.2) and Architectural Design (5.3). |
| 4 | SW Unit & Integration Testing | Implement units (5.5) and perform Integration Testing (5.6). |
| 5 | SW System Testing & Release | Validate system meets requirements (5.7) and perform safe release (5.8). |
| 6 | Labeling & Instructions for Use | Design MDR-compliant labels, manuals, and software release notes. |

---

## 2. Behavioral Properties

Inherited from `specs/components/checklist-step.md` with:

- `stepNumber = 5`
- `prevStep = '/step-4'`
- `nextStep = '/step-6'`
- Continue button label: "Continue to Step 6"

**INV-STEP5-01:** □ Continue button is always enabled.
**INV-STEP5-02:** □ Progress = `completedCount / 6 * 100`
