# SPEC: IEC 62304 — Software Architecture
**Spec ID:** FEAT-ARCH
**Route:** /sw-architecture
**Regulation Ref:** IEC 62304:2006+AMD1:2015 §5.2 (Software Requirements Analysis), §5.3 (Software Architectural Design)
**Component:** src/pages/SoftwareArchitecture.tsx
**Machine:** src/machines/swArchitectureMachine.ts
**Tests:** tests/component/SoftwareArchitecture.test.tsx, tests/e2e/flows/samd-lifecycle.spec.ts

---

## 1. Domain Entities

```typescript
interface Requirement {
  id: string   // generated: 'req-<timestamp>'
  text: string // non-empty
}

interface SoftwareItem {
  id: string              // generated: 'item-<timestamp>' or 'demo-item-1'
  name: string            // user-defined, non-empty
  requirements: Requirement[]
  architectureDetails: string  // free text
}

type ActiveTab = 'requirements' | 'architecture'
```

---

## 2. State Machine Definition

```
STATES:
  NO_ACTIVE_ITEM      -- items list empty OR no item selected
  ITEM_SELECTED       -- an item is active, viewing requirements tab
  EDITING_ARCH        -- an item is active, viewing architecture tab
  SAVING              -- mock save in progress (2-second timeout)
  SAVED               -- save confirmation shown briefly, then returns to ITEM_SELECTED/EDITING_ARCH

INITIAL STATE: ITEM_SELECTED (demo-item-1 pre-loaded as default)

TRANSITIONS:
  NO_ACTIVE_ITEM
    → ITEM_SELECTED   on: item_selected(id)    guard: items.some(i => i.id === id)
    → ITEM_SELECTED   on: item_added(name)     guard: name.trim().length > 0
                                               (new item auto-activates)

  ITEM_SELECTED  (requirements tab)
    → EDITING_ARCH    on: tab_switched('architecture')
    → NO_ACTIVE_ITEM  on: item_list_becomes_empty  [not currently possible — no delete]
    → ITEM_SELECTED   on: requirement_added(text)  guard: text.trim().length > 0
    → SAVING          on: save_clicked

  EDITING_ARCH
    → ITEM_SELECTED   on: tab_switched('requirements')
    → EDITING_ARCH    on: architecture_text_changed
    → SAVING          on: save_clicked

  SAVING
    → ITEM_SELECTED   on: save_timeout (2s)    guard: activeTab was 'requirements'
    → EDITING_ARCH    on: save_timeout (2s)    guard: activeTab was 'architecture'

  SAVED  (momentary — merged into SAVING → returns-to-active)
```

---

## 3. Formal Invariants (□)

**INV-ARCH-01:** □ `activeItem ≠ null` → detail panel is visible; `activeItem = null` → placeholder panel shown.

**INV-ARCH-02:** □ Requirements are displayed as `REQ-N` where N is 1-based index of the requirement in the array.
> "REQ-1", "REQ-2", etc. — index is positional, not the `id` field.

**INV-ARCH-03:** □ A requirement with empty text cannot be added.
> `newRequirement.trim().length === 0` → form submit is a no-op.

**INV-ARCH-04:** □ A software item with empty name cannot be added.
> `newItemName.trim().length === 0` → form submit is a no-op.

**INV-ARCH-05:** □ Adding a new software item auto-activates it (new item becomes `activeItemId`).

**INV-ARCH-06:** □ The "Save" button label alternates: "Save Item" (resting) → "Saved!" (for 2 seconds after click) → "Save Item".

**INV-ARCH-07:** □ Exactly one tab is active at any time ('requirements' or 'architecture').

**INV-ARCH-08:** □ Save does not persist to localStorage in the current implementation (mock save only).
> This is noted as a future enhancement — SoftwareArchitecture state is ephemeral (reset on page reload).

---

## 4. Progress Properties (◇)

**PROG-ARCH-01:** ◇ `user adds item name ∧ submits form` → new item appears in sidebar list AND is active.

**PROG-ARCH-02:** ◇ `user adds requirement text ∧ submits form` → requirement appears with `REQ-N` label.

**PROG-ARCH-03:** ◇ `user clicks Save` → button shows "Saved!" for 2 seconds then reverts to "Save Item".

---

## 5. Reactive Properties (→)

**REACT-ARCH-01:** `item_selected(id)` → detail panel updates to show selected item's data synchronously.

**REACT-ARCH-02:** `tab_switched('architecture')` → requirements form hidden, architecture textarea shown.

**REACT-ARCH-03:** `tab_switched('requirements')` → textarea hidden, requirements list shown.

**REACT-ARCH-04:** `architecture_text_changed(val)` → `item.architectureDetails` updates in items array synchronously.

**REACT-ARCH-05:** `save_clicked` → `savedStatus = true` for 2 seconds via `setTimeout`.

---

## 6. Acceptance Criteria

| AC ID | Given | When | Then | Property Ref |
|-------|-------|------|------|-------------|
| AC-ARCH-01 | Page loads | — | Demo item "EHR Core Database" visible, selected, requirements tab active | INV-ARCH-01 |
| AC-ARCH-02 | Demo item selected | — | REQ-1 requirement visible | INV-ARCH-02 |
| AC-ARCH-03 | Requirements tab | User types "My requirement" and clicks Add | Requirement appears as REQ-2 | PROG-ARCH-02, INV-ARCH-02 |
| AC-ARCH-04 | Requirements tab | User submits empty requirement | No requirement added | INV-ARCH-03 |
| AC-ARCH-05 | New item form | User types "My Service" and submits | Item appears in sidebar, becomes active, requirements tab shows empty state | PROG-ARCH-01, INV-ARCH-05 |
| AC-ARCH-06 | New item form | User submits empty name | No item added | INV-ARCH-04 |
| AC-ARCH-07 | Item selected | User clicks Architecture tab | Architecture textarea visible | REACT-ARCH-02, INV-ARCH-07 |
| AC-ARCH-08 | Any item active | User clicks Save | Button shows "Saved!" then reverts after 2s | PROG-ARCH-03, INV-ARCH-06 |
| AC-ARCH-09 | No items (edge case) | — | Placeholder panel: "Select or add a software item" | INV-ARCH-01 |

---

## 7. Component Mapping

| Spec Concept | React Element | File:Line |
|---|---|---|
| `items` list | `useState<SoftwareItem[]>([demo-item-1])` | SoftwareArchitecture.tsx:17 |
| `activeItemId` | `useState<string>('demo-item-1')` | SoftwareArchitecture.tsx:25 |
| `activeTab` | `useState<'requirements'\|'architecture'>('requirements')` | SoftwareArchitecture.tsx:28 |
| `savedStatus` | `useState(false)` | SoftwareArchitecture.tsx:30 |
| `activeItem` | `items.find(i => i.id === activeItemId)` | SoftwareArchitecture.tsx:32 |
| `handleAddItem` | empty name guard + state update | SoftwareArchitecture.tsx:34 |
| `handleAddRequirement` | empty text guard + requirements append | SoftwareArchitecture.tsx:50 |
| `handleUpdateArchitecture` | textarea onChange → items map | SoftwareArchitecture.tsx:68 |
| `handleMockSave` | `setSavedStatus(true); setTimeout(..., 2000)` | SoftwareArchitecture.tsx:79 |
| REQ-N label | `REQ-{idx+1}` where idx is map index | SoftwareArchitecture.tsx:185 |

---

## 8. Test References

| Test File | Test ID | Property |
|-----------|---------|----------|
| tests/component/SoftwareArchitecture.test.tsx | `arch.inv.01-08` | All invariants |
| tests/component/SoftwareArchitecture.test.tsx | `arch.react.*` | Reactive properties |
| tests/unit/machines/swArchitectureMachine.test.ts | `archm.*` | State transitions |
| tests/e2e/flows/samd-lifecycle.spec.ts | `e2e.arch.*` | AC-ARCH-01 through AC-ARCH-09 |
