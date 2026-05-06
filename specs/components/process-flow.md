# SPEC: ProcessFlow Component
**Spec ID:** COMP-FLOW
**Component:** src/components/ProcessFlow.tsx
**Machine:** (no dedicated machine — stateless presentational component)
**Tests:** tests/component/ProcessFlow.test.tsx (to be created)

---

## 1. Domain Entities

```typescript
interface FlowStep {
  id: string
  label: string
  description: string
  route: string        // target path on click
  icon?: LucideIcon
  status: 'complete' | 'in_progress' | 'pending'
}

interface ProcessFlowProps {
  steps: FlowStep[]
  currentStepId: string
}
```

The component renders the visual roadmap diagram (used on the Dashboard and in SaMD Planning).

---

## 2. Formal Invariants (□)

**INV-FLOW-01:** □ Steps are rendered in the order provided in the `steps` array — no sorting or reordering.

**INV-FLOW-02:** □ Exactly one step has `status = 'in_progress'` at any time (the current step).

**INV-FLOW-03:** □ All steps before `currentStepId` in the array have `status = 'complete'`.
> The progress model is sequential; you cannot be on Step 5 with Step 3 still pending.

**INV-FLOW-04:** □ All steps after `currentStepId` in the array have `status = 'pending'`.

**INV-FLOW-05:** □ Each step node is clickable and navigates to `step.route`.

---

## 3. Reactive Properties (→)

**REACT-FLOW-01:** `step_click(step)` → `navigate(step.route)` immediately.

**REACT-FLOW-02:** `status = 'complete'` → node rendered with success color/checkmark indicator.

**REACT-FLOW-03:** `status = 'in_progress'` → node rendered with primary color/active indicator.

**REACT-FLOW-04:** `status = 'pending'` → node rendered with muted color.

---

## 4. Acceptance Criteria

| AC ID | Given | When | Then | Property Ref |
|-------|-------|------|------|-------------|
| AC-FLOW-01 | ProcessFlow with 5 steps, currentStep = 3 | — | Steps 1,2 show complete; step 3 shows in_progress; steps 4,5 show pending | INV-FLOW-02, INV-FLOW-03, INV-FLOW-04 |
| AC-FLOW-02 | Any state | User clicks Step 4 node | navigate('/step-4') called | REACT-FLOW-01, INV-FLOW-05 |
| AC-FLOW-03 | Step 1 rendered | — | Rendered first in DOM | INV-FLOW-01 |

---

## 5. Test References

| Test File | Test ID | Property |
|-----------|---------|----------|
| tests/component/ProcessFlow.test.tsx | `flow.inv.01` | INV-FLOW-01 |
| tests/component/ProcessFlow.test.tsx | `flow.inv.02-04` | INV-FLOW-02, INV-FLOW-03, INV-FLOW-04 |
| tests/component/ProcessFlow.test.tsx | `flow.react.01` | REACT-FLOW-01 |
