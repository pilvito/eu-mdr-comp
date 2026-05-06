# SPEC: ChecklistStep Component
**Spec ID:** COMP-CL
**Component:** src/components/ChecklistStep.tsx
**Machine:** src/machines/checklistMachine.ts
**Tests:** tests/component/ChecklistStep.test.tsx
**Used by:** Steps 3–9 (QMS through Post-Market), SaMD Planning

---

## 1. Domain Entities

```typescript
interface Task {
  id: string
  title: string
  description: string
}

interface ChecklistStepProps {
  stepNumber: number        // 3–9
  title: string
  description: string
  icon: LucideIcon
  tasks: Task[]
  prevStep: string          // Route path for Back navigation
  nextStep: string          // Route path for Continue navigation
}

type CompletedTasks = Record<string, boolean>  // task.id → done
```

---

## 2. State Machine Definition

```
STATES:
  IDLE          -- no tasks toggled
  IN_PROGRESS   -- some tasks toggled, not all
  COMPLETE      -- all tasks toggled

INITIAL STATE: IDLE

TRANSITIONS:
  IDLE
    → IN_PROGRESS   on: toggle_task(id)   guard: tasks.length > 1
    → COMPLETE      on: toggle_task(id)   guard: tasks.length === 1

  IN_PROGRESS
    → IN_PROGRESS   on: toggle_task(id)   guard: completedCount + 1 < tasks.length (after toggle)
                                          OR completedCount - 1 > 0 (un-toggle)
    → COMPLETE      on: toggle_task(id)   guard: completedCount + 1 === tasks.length
    → IDLE          on: toggle_task(id)   guard: was last completed task, now un-toggled

  COMPLETE
    → IN_PROGRESS   on: toggle_task(id)   (un-toggle any task)
```

---

## 3. Formal Invariants (□)

**INV-CL-01:** □ `progress = Math.round((completedCount / tasks.length) * 100)`
> The progress percentage is always a deterministic function of completed count and task count.

**INV-CL-02:** □ `progress ∈ [0, 100]`
> Progress never exceeds 100% or goes below 0%.

**INV-CL-03:** □ `tasks.length > 0` (component is not rendered with an empty task list).

**INV-CL-04:** □ Each task can be in only one of two states: completed or not completed (boolean toggle).

**INV-CL-05:** □ Clicking a completed task un-completes it; clicking an uncompleted task completes it.
> Toggle is bidirectional — there is no "locked" completed state.

**INV-CL-06:** □ The Continue button is always enabled regardless of completion state.
> Checklist steps use advisory completion, not blocking. Users can proceed at any time.
> (Note: This is a deliberate design choice — compliance tasks may be done out-of-order.)

---

## 4. Progress Properties (◇)

**PROG-CL-01:** ◇ `user toggles all tasks` → `state = COMPLETE ∧ progress = 100`

**PROG-CL-02:** ◇ `state = COMPLETE ∧ user clicks Continue` → `route = nextStep`

**PROG-CL-03:** ◇ `user clicks Back` → `route = prevStep` (regardless of state)

---

## 5. Reactive Properties (→)

**REACT-CL-01:** `toggle_task(id)` → progress bar width updates synchronously in the same render.

**REACT-CL-02:** `toggle_task(id)` → task card border and background color change synchronously:
- Completed: `border: 1px solid var(--success)`, `background: rgba(16,185,129,0.05)`
- Not completed: `border: 1px solid var(--border-subtle)`, `background: var(--bg-surface)`

**REACT-CL-03:** `toggle_task(id)` → icon changes synchronously:
- Completed: `CheckCircle2` in `var(--success)`
- Not completed: `Circle` in `var(--text-muted)`

**REACT-CL-04:** Continue button label depends on stepNumber:
- `stepNumber === 9` → "Finish"
- `stepNumber < 9` → "Continue to Step N+1"

---

## 6. Acceptance Criteria

| AC ID | Given | When | Then | Property Ref |
|-------|-------|------|------|-------------|
| AC-CL-01 | ChecklistStep renders with 5 tasks | No interaction | Progress shows 0% | INV-CL-01 |
| AC-CL-02 | 5 tasks, 0 completed | User clicks task 1 | Progress shows 20% | INV-CL-01, REACT-CL-01 |
| AC-CL-03 | 5 tasks, task 1 completed | User clicks task 1 again | Progress shows 0% | INV-CL-05, REACT-CL-01 |
| AC-CL-04 | 5 tasks, 4 completed | User clicks last task | Progress shows 100%, state = COMPLETE | PROG-CL-01 |
| AC-CL-05 | Any state | User clicks Continue | Navigation to nextStep | PROG-CL-02, INV-CL-06 |
| AC-CL-06 | Any state | User clicks Back | Navigation to prevStep | PROG-CL-03 |
| AC-CL-07 | stepNumber = 9 | — | Continue button shows "Finish" | REACT-CL-04 |
| AC-CL-08 | stepNumber = 3 | — | Continue button shows "Continue to Step 4" | REACT-CL-04 |

---

## 7. Component Mapping

| Spec Concept | React Element | File:Line |
|---|---|---|
| completedTasks state | `useState<Record<string,boolean>>({})` | ChecklistStep.tsx:15 |
| toggle | `toggleTask(id)` → spread new bool | ChecklistStep.tsx:17 |
| completedCount | `Object.values(completedTasks).filter(v => v).length` | ChecklistStep.tsx:21 |
| progress | `Math.round((completedCount / tasks.length) * 100)` | ChecklistStep.tsx:22 |
| progress bar | `<div style={{ width: \`${progress}%\` }}>` | ChecklistStep.tsx:49 |
| Continue label | ternary on `stepNumber === 9` | ChecklistStep.tsx:93 |

---

## 8. Test References

| Test File | Test ID | Property |
|-----------|---------|----------|
| tests/component/ChecklistStep.test.tsx | `cl.inv.01` | INV-CL-01 |
| tests/component/ChecklistStep.test.tsx | `cl.inv.02` | INV-CL-02 |
| tests/component/ChecklistStep.test.tsx | `cl.inv.05` | INV-CL-05 |
| tests/component/ChecklistStep.test.tsx | `cl.inv.06` | INV-CL-06 |
| tests/component/ChecklistStep.test.tsx | `cl.react.01` | REACT-CL-01 |
| tests/component/ChecklistStep.test.tsx | `cl.react.04` | REACT-CL-04 |
| tests/unit/machines/checklistMachine.test.ts | `clm.*` | All state transitions |
| tests/e2e/flows/checklist-completion.spec.ts | `e2e.cl.*` | AC-CL-01 through AC-CL-08 |
