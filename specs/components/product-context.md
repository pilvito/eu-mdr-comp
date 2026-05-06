# SPEC: Product Context (Global State Machine)
**Spec ID:** COMP-CTX
**Component:** src/context/ProductContext.tsx
**Machine:** src/machines/productMachine.ts
**Tests:** tests/unit/context/ProductContext.test.ts, tests/e2e/invariants/active-product-scoping.spec.ts

---

## 1. Domain Entities

See `specs/domain/data-model.md` for full type definitions.

Key types managed here:
- `Product` — device product with linked software items
- `SoftwareItem` — discrete software component (frontend, backend, AI model, etc.)
- `activeProductId: string | null` — globally selected product; scopes all step views

---

## 2. State Machine Definition

```
STATES:
  EMPTY               -- no products exist
  HAS_PRODUCTS        -- ≥1 product, no active selection
  ACTIVE              -- activeProduct is set, all step views scoped to it
  ACTIVE_WITH_SW      -- activeProduct is set AND has ≥1 linked software item

INITIAL STATE: EMPTY (or ACTIVE if localStorage restores an activeProductId)

TRANSITIONS:
  EMPTY
    → ACTIVE  on: add_product
               guard: products.length was 0 → first product auto-activates

  HAS_PRODUCTS
    → ACTIVE  on: set_active_product(id)

  ACTIVE
    → ACTIVE          on: add_product (additional products; active unchanged)
    → ACTIVE_WITH_SW  on: link_software_item(productId, swId)
                         guard: productId === activeProductId
    → HAS_PRODUCTS    on: set_active_product(null)
    → ACTIVE          on: set_active_product(otherId) -- switches active product
    → EMPTY           on: delete_product(id) [if id was last product]
    → HAS_PRODUCTS    on: delete_product(id) [if other products remain]

  ACTIVE_WITH_SW
    → ACTIVE          on: unlink_software_item(activeProductId, swId)
                         guard: was last linked item
    → ACTIVE_WITH_SW  on: unlink_software_item(activeProductId, swId)
                         guard: other items remain
    → EMPTY / HAS_PRODUCTS  on: delete_product (same as ACTIVE)
```

---

## 3. Formal Invariants (□)

**INV-CTX-01:** □ `activeProductId !== null` → `products.some(p => p.id === activeProductId)`
> The active product ID always references an existing product. Violated on deletion → reset to null.

**INV-CTX-02:** □ `∀ p ∈ products : ∀ id ∈ p.softwareItemIds : softwareItems.some(sw => sw.id === id)`
> Dangling links are impossible. Software item deletion purges all linked references.

**INV-CTX-03:** □ First product added → auto-sets as activeProduct (first user gets a working default).

**INV-CTX-04:** □ `products.map(p => p.id)` has no duplicates (IDs are unique).

**INV-CTX-05:** □ Any state change → localStorage updated within the same render cycle (via useEffect).

**INV-CTX-06:** □ A software item can be linked to the same product at most once.

---

## 4. Progress Properties (◇)

**PROG-CTX-01:** ◇ `user adds first product` → `activeProductId !== null`
> The user reaches an active state after adding one product, without any extra selection step.

**PROG-CTX-02:** ◇ `user links at least one SW item to active product` → `state = ACTIVE_WITH_SW`

---

## 5. Reactive Properties (→)

**REACT-CTX-01:** `addProduct` → if `products.length === 0`, `activeProductId ← newProduct.id`
> Auto-activate first product so new users immediately have an active context.

**REACT-CTX-02:** `setActiveProduct(id)` → all downstream consumers re-render with new scope.

**REACT-CTX-03:** `linkSoftwareItemToProduct(productId, swId)` → no-op if already linked (idempotent).

**REACT-CTX-04:** `deleteProduct(id)` [not yet implemented; reserved] → `unlinkSoftwareItemFromProduct` called for all links, then `activeProductId` reset if needed.

---

## 6. Acceptance Criteria

| AC ID | Given | When | Then | Property Ref |
|-------|-------|------|------|-------------|
| AC-CTX-01 | No products exist | User adds first product | That product becomes active | REACT-CTX-01, PROG-CTX-01 |
| AC-CTX-02 | Active product exists | User adds second product | Active product unchanged | INV-CTX-03 (only first auto-activates) |
| AC-CTX-03 | Products A and B exist, A is active | User selects B | B becomes active, all views re-scope | REACT-CTX-02 |
| AC-CTX-04 | Product A linked to SW item X | SW item X is deleted | Product A's softwareItemIds no longer contains X | INV-CTX-02 |
| AC-CTX-05 | SW item X already linked to Product A | Link X to A again | No duplicate link added | INV-CTX-06, REACT-CTX-03 |
| AC-CTX-06 | App is reloaded | — | Products, software items, and activeProductId restored from localStorage | INV-CTX-05 |

---

## 7. Component Mapping

| Spec Concept | React Element | File:Line |
|---|---|---|
| products state | `useState<Product[]>` | ProductContext.tsx:43 |
| softwareItems state | `useState<SoftwareItem[]>` | ProductContext.tsx:48 |
| activeProductId state | `useState<string\|null>` | ProductContext.tsx:53 |
| auto-activate first product | `if (!activeProductId) setActiveProductId(newProduct.id)` | ProductContext.tsx:77 |
| localStorage sync | three `useEffect` blocks | ProductContext.tsx:58–68 |
| idempotent link | `!p.softwareItemIds.includes(softwareItemId)` guard | ProductContext.tsx:92 |

---

## 8. Test References

| Test File | Test ID | Property |
|-----------|---------|----------|
| tests/unit/context/ProductContext.test.ts | `ctx.inv.01` | INV-CTX-01 |
| tests/unit/context/ProductContext.test.ts | `ctx.inv.02` | INV-CTX-02 |
| tests/unit/context/ProductContext.test.ts | `ctx.inv.03` | INV-CTX-03 |
| tests/unit/context/ProductContext.test.ts | `ctx.inv.06` | INV-CTX-06 |
| tests/unit/context/ProductContext.test.ts | `ctx.react.01` | REACT-CTX-01 |
| tests/e2e/invariants/active-product-scoping.spec.ts | `e2e.ctx.scope.*` | INV-CTX-01, REACT-CTX-02 |
| tests/e2e/invariants/data-persistence.spec.ts | `e2e.ctx.persist.*` | INV-CTX-05 |
