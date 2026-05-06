# SPEC: Dashboard
**Spec ID:** FEAT-DASH
**Route:** / (root)
**Regulation Ref:** (application entry point; no direct regulation reference)
**Component:** src/pages/Dashboard.tsx, src/components/ProcessFlow.tsx
**Machine:** (no dedicated machine — stateless render + ProcessFlow navigation)
**Tests:** tests/component/Dashboard.test.tsx, tests/e2e/flows/mdr-full-journey.spec.ts

---

## 1. Domain Entities

The Dashboard is a stateless hub. It renders:
- An introductory header panel with "Applicability Check" CTA button
- The `ProcessFlow` component showing the full MDR + IEC 62304 roadmap

---

## 2. State Machine Definition

The Dashboard has no local state. All navigation is triggered by button clicks or ProcessFlow node clicks.

```
STATES:
  RENDERED  -- always; Dashboard has no loading, empty, or error states in MVP

TRANSITIONS: (none — stateless)
```

---

## 3. Formal Invariants (□)

**INV-DASH-01:** □ The Dashboard always renders (no conditional rendering, no loading states in MVP).

**INV-DASH-02:** □ The "Applicability Check" button always navigates to '/step-1'.

**INV-DASH-03:** □ The ProcessFlow component is always rendered on the Dashboard.

---

## 4. Reactive Properties (→)

**REACT-DASH-01:** `click('Applicability Check')` → `navigate('/step-1')`.

**REACT-DASH-02:** `click(processFlowNode)` → `navigate(node.route)` (delegated to ProcessFlow — REACT-FLOW-01).

---

## 5. Acceptance Criteria

| AC ID | Given | When | Then | Property Ref |
|-------|-------|------|------|-------------|
| AC-DASH-01 | User navigates to '/' | — | Dashboard renders with header and ProcessFlow | INV-DASH-01, INV-DASH-03 |
| AC-DASH-02 | Dashboard visible | User clicks "Applicability Check" | Route = '/step-1' | REACT-DASH-01, INV-DASH-02 |
| AC-DASH-03 | Dashboard visible | User clicks Step 2 in ProcessFlow | Route = '/step-2' | REACT-DASH-02 |

---

## 6. Component Mapping

| Spec Concept | React Element | File:Line |
|---|---|---|
| Header panel | `<div className="glass-panel">` | Dashboard.tsx:11 |
| Applicability Check button | `onClick={() => navigate('/step-1')}` | Dashboard.tsx:20 |
| ProcessFlow render | `<ProcessFlow />` | Dashboard.tsx:26 |

---

## 7. Test References

| Test File | Test ID | Property |
|-----------|---------|----------|
| tests/component/Dashboard.test.tsx | `dash.inv.01-03` | All invariants |
| tests/component/Dashboard.test.tsx | `dash.react.01` | REACT-DASH-01 |
| tests/e2e/flows/mdr-full-journey.spec.ts | `e2e.dash.*` | AC-DASH-01 through AC-DASH-03 |
