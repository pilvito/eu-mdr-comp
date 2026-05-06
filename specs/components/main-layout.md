# SPEC: MainLayout Component (Sidebar Navigation)
**Spec ID:** COMP-NAV
**Component:** src/layouts/MainLayout.tsx
**Machine:** (no dedicated machine — layout state is passive; active route from React Router)
**Tests:** tests/component/MainLayout.test.tsx (to be created), tests/e2e/invariants/navigation-safety.spec.ts

---

## 1. Domain Entities

```typescript
interface NavItem {
  id: string
  label: string
  icon: LucideIcon
  path: string
  section?: 'mdr' | 'iec' | 'setup'
}
```

The sidebar renders a fixed list of nav items corresponding to all application routes.

---

## 2. State Machine Definition

Navigation state is owned by React Router. The layout component is stateless — it reads `useLocation()` to determine the active route.

```
STATES (conceptual — owned by React Router):
  ANY_ROUTE     -- layout always visible; sidebar always present

ACTIVE HIGHLIGHTING:
  For each NavItem: highlighted ↔ location.pathname === navItem.path
```

---

## 3. Formal Invariants (□)

**INV-NAV-01:** □ Exactly one sidebar item is highlighted at any time (the current route).

**INV-NAV-02:** □ Sidebar is always visible — it does not collapse, hide, or disappear on any route.

**INV-NAV-03:** □ The global product selector (active product name) is always visible in the sidebar header area.

**INV-NAV-04:** □ Clicking a nav item always navigates to its path (no disabled sidebar items).

**INV-NAV-05:** □ The active route highlighted in sidebar matches `window.location.pathname` exactly.

---

## 4. Reactive Properties (→)

**REACT-NAV-01:** `setActiveProduct(id)` → product selector label updates immediately (same render).

**REACT-NAV-02:** `route_change` → sidebar highlight updates without page reload.

**REACT-NAV-03:** `active_product = null` → product selector shows a placeholder ("Select Product" or similar).

---

## 5. Acceptance Criteria

| AC ID | Given | When | Then | Property Ref |
|-------|-------|------|------|-------------|
| AC-NAV-01 | User is on /step-1 | — | Step 1 nav item is highlighted, no other item | INV-NAV-01 |
| AC-NAV-02 | User is on any route | — | Sidebar is visible | INV-NAV-02 |
| AC-NAV-03 | No active product | — | Product selector shows placeholder | REACT-NAV-03 |
| AC-NAV-04 | Active product "DeviceX" | User sets active product | Selector shows "DeviceX" | REACT-NAV-01 |
| AC-NAV-05 | User is on /step-3 | User clicks Step 5 sidebar item | Route changes to /step-5 | INV-NAV-04 |

---

## 6. Test References

| Test File | Test ID | Property |
|-----------|---------|----------|
| tests/e2e/invariants/navigation-safety.spec.ts | `e2e.nav.*` | INV-NAV-01, INV-NAV-02, INV-NAV-04 |
| tests/e2e/invariants/active-product-scoping.spec.ts | `e2e.nav.scope.*` | INV-NAV-03, REACT-NAV-03 |
