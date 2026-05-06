# SPEC: IEC 62304 — SaMD Planning
**Spec ID:** FEAT-SAMD
**Route:** /sw-planning
**Regulation Ref:** IEC 62304:2006+AMD1:2015 §5.1 (Software Development Planning)
**Visual Ref:** specs/images/iec62304-dev-planning.png
**Component:** src/pages/SaMDPlanning.tsx, uses src/components/ChecklistStep.tsx
**Machine:** src/machines/checklistMachine.ts (shared, parameterised)
**Tests:** tests/component/SaMDPlanning.test.tsx, tests/e2e/flows/samd-lifecycle.spec.ts

---

## 1. Tasks (11 items — IEC 62304 §5.1 activities)

| ID | Title | IEC 62304 Reference |
|----|-------|-------------------|
| 1 | Responsibilities | Team role definition |
| 2 | Project & Doc Planning | Timeline, milestones by Safety Class |
| 3 | SW Dev Process | Methodology selection (Agile/Waterfall/V-Cycle) |
| 4 | Standards, Methods, Tools | Infrastructure (Jira, GitHub, Azure DevOps, Confluence) |
| 5 | Traceability | Requirements ↔ tests bidirectional traceability |
| 6 | SW Integration & Testing | SOUP integration and testing |
| 7 | SW Verification | Release milestones and acceptance criteria |
| 8 | Identification & Avoidance of Defects | Bug tracking loop (Identification → Analysis → Resolution) |
| 9 | SW Risk Management | Global risk assessment per software item (ISO 14971) |
| 10 | SW Configuration Management | Version control, change tracking |
| 11 | SW Maintenance Plan | Post-release issue handling and hotfix deployment |

---

## 2. Behavioral Properties

Inherited from `specs/components/checklist-step.md` with:

- `stepNumber = "IEC 62304"` (string — not a numeric step)
- `prevStep = '/'` (Dashboard)
- `nextStep = '/step-5'` (Tech File — IEC 62304 docs feed into Tech File)
- Continue button label: derived from `stepNumber === 9` check — since `"IEC 62304" !== 9`, it renders "Continue to Step IEC 62304 + 1" which is "Continue to Step IEC 623041".

> **Bug found:** The `ChecklistStep` component uses `` `Continue to Step ${stepNumber + 1}` `` (Step1.tsx:93).
> When `stepNumber = "IEC 62304"` (a string), JavaScript string concatenation produces
> "Continue to Step IEC 623041" instead of something meaningful.
> The label should be hardcoded as "Continue to Tech File" for this route.
> Tracked as: BUG-SAMD-01.

**INV-SAMD-01:** □ Continue button is always enabled.
**INV-SAMD-02:** □ Progress = `completedCount / 11 * 100`
**INV-SAMD-03 (future, after BUG-SAMD-01 fix):** □ Continue label = "Continue to Tech File".

---

## 3. Domain Properties (□)

**INV-SAMD-04:** □ Safety Class (A, B, or C) must be determined before task 2 (Project Planning) can be meaningfully completed — this is a domain constraint not yet enforced in the UI.

**INV-SAMD-05:** □ SOUP items must be explicitly listed as part of task 6 (SW Integration & Testing).

---

## 4. Acceptance Criteria

| AC ID | Given | When | Then | Property Ref |
|-------|-------|------|------|-------------|
| AC-SAMD-01 | User is on /sw-planning | — | 11 tasks visible | — |
| AC-SAMD-02 | All tasks unchecked | User checks task 1 | Progress ≈ 9% (1/11) | INV-SAMD-02 |
| AC-SAMD-03 | Any state | User clicks Back | Route = '/' | — |
| AC-SAMD-04 | Any state | User clicks Continue | Route = '/step-5' | INV-SAMD-01 |

---

## 5. Test References

| Test File | Test ID | Property |
|-----------|---------|----------|
| tests/component/SaMDPlanning.test.tsx | `samd.inv.01-02` | INV-SAMD-01, INV-SAMD-02 |
| tests/e2e/flows/samd-lifecycle.spec.ts | `e2e.samd.*` | AC-SAMD-01 through AC-SAMD-04 |
