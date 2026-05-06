# SPEC: Product & Software Item Management
**Spec ID:** FEAT-PROD
**Route:** /product-setup
**Regulation Ref:** EU MDR 2017/745 Article 2(1) (medical device definition); IEC 62304 §4.3 (safety class)
**Component:** src/pages/ProductSetup.tsx
**Machine:** src/machines/productMachine.ts (operations delegated to ProductContext)
**Tests:** tests/component/ProductSetup.test.tsx, tests/e2e/flows/product-registration.spec.ts

---

## 1. Domain Entities

See `specs/domain/data-model.md`. Key entities for this page:
- `Product` — device being certified
- `SoftwareItem` — software component associated with the device
- Link relationship — `Product.softwareItemIds[]` references `SoftwareItem.id`

---

## 2. State Machine Definition

```
STATES:
  EMPTY             -- no products, no software items
  HAS_PRODUCTS      -- ≥1 product, 0 software items
  HAS_SW_ONLY       -- 0 products, ≥1 software items
  HAS_BOTH          -- ≥1 products AND ≥1 software items (link panel visible)
  LINKING           -- product and SW item selected in dropdowns, Link button enabled

INITIAL STATE: EMPTY (or restored from localStorage)

TRANSITIONS:
  EMPTY
    → HAS_PRODUCTS  on: add_product(name, desc)   guard: name.trim().length > 0
    → HAS_SW_ONLY   on: add_software_item(name, desc) guard: name.trim().length > 0

  HAS_PRODUCTS
    → HAS_BOTH      on: add_software_item(name, desc)
    → HAS_PRODUCTS  on: add_product(name, desc) (additional product added)

  HAS_SW_ONLY
    → HAS_BOTH      on: add_product(name, desc)
    → HAS_SW_ONLY   on: add_software_item(name, desc) (additional SW item)

  HAS_BOTH
    → LINKING       on: select_product_and_sw(productId, swId)
                        guard: both dropdowns have a value selected
    → HAS_BOTH      on: link_confirmed  (link complete, dropdowns reset)
    → HAS_BOTH      on: unlink(productId, swId) (if product still has other links)
    → HAS_BOTH      on: add_product / add_software_item (more items)

  LINKING
    → HAS_BOTH      on: link_confirmed   guard: linkSoftwareItemToProduct called
    → HAS_BOTH      on: dropdown_cleared (deselect product or SW)
```

---

## 3. Formal Invariants (□)

**INV-PROD-01:** □ A product with empty name cannot be added.
> `handleAddProduct` has guard: `if (newProductName.trim())`.

**INV-PROD-02:** □ A software item with empty name cannot be added.
> `handleAddSoftwareItem` has guard: `if (newSwName.trim())`.

**INV-PROD-03:** □ Link panel (section 3) is only visible when `products.length > 0 AND softwareItems.length > 0`.

**INV-PROD-04:** □ Link button is disabled when either dropdown has no selection.
> `disabled={!selectedProductToLink || !selectedSwToLink}`

**INV-PROD-05:** □ After a successful link, both dropdowns reset to empty (state clears).

**INV-PROD-06:** □ Unlinking a software item removes it from the product's display immediately.

**INV-PROD-07:** □ Portfolio overview shows empty state when no products exist.

**INV-PROD-08:** □ First product added → auto-activated as active product (via ProductContext INV-CTX-03).

---

## 4. Progress Properties (◇)

**PROG-PROD-01:** ◇ `user submits product form with valid name` → product appears in portfolio overview.

**PROG-PROD-02:** ◇ `user submits SW item form with valid name` → software item available in link dropdown.

**PROG-PROD-03:** ◇ `user selects product + SW item in dropdowns AND clicks Link` → linked item appears under product card.

---

## 5. Reactive Properties (→)

**REACT-PROD-01:** `add_product(name, desc)` → product card appears in portfolio grid immediately (same render via context setState).

**REACT-PROD-02:** `add_software_item(name, desc)` → SW item available in link dropdown (re-render).

**REACT-PROD-03:** `link_confirmed(productId, swId)` → product card shows SW item in its linked list.

**REACT-PROD-04:** `unlink(productId, swId)` → SW item removed from product card linked list.

**REACT-PROD-05:** `add_product (first ever)` → form resets (name and desc cleared); first product auto-activates.

---

## 6. Acceptance Criteria

| AC ID | Given | When | Then | Property Ref |
|-------|-------|------|------|-------------|
| AC-PROD-01 | No products | User submits empty product name | No product added | INV-PROD-01 |
| AC-PROD-02 | No products | User submits "Cardiac Analyzer" | Product appears in portfolio, auto-activated | PROG-PROD-01, INV-PROD-08 |
| AC-PROD-03 | Product exists, no SW items | — | Link panel (section 3) not visible | INV-PROD-03 |
| AC-PROD-04 | 1 product, 1 SW item | User selects both, clicks Link | SW item appears under product card | PROG-PROD-03, REACT-PROD-03 |
| AC-PROD-05 | 1 product, 1 SW item | User clicks Link with one dropdown empty | Button is disabled (no action) | INV-PROD-04 |
| AC-PROD-06 | Product with SW item linked | User clicks Trash icon | SW item removed from product card | REACT-PROD-04, INV-PROD-06 |
| AC-PROD-07 | User adds SW item, no products | — | SW item shown in "Unlinked Software Items" section | — |
| AC-PROD-08 | Successful link | — | Both dropdowns reset to empty | INV-PROD-05 |

---

## 7. Component Mapping

| Spec Concept | React Element | File:Line |
|---|---|---|
| Product form | `<form onSubmit={handleAddProduct}>` | ProductSetup.tsx:66 |
| Product name guard | `if (newProductName.trim())` | ProductSetup.tsx:26 |
| SW item form | `<form onSubmit={handleAddSoftwareItem}>` | ProductSetup.tsx:99 |
| SW name guard | `if (newSwName.trim())` | ProductSetup.tsx:35 |
| Link panel conditional | `(products.length > 0 && softwareItems.length > 0)` | ProductSetup.tsx:128 |
| Link button disabled | `disabled={!selectedProductToLink \|\| !selectedSwToLink}` | ProductSetup.tsx:160 |
| Portfolio empty state | `products.length === 0` conditional | ProductSetup.tsx:171 |
| Unlink button | `unlinkSoftwareItemFromProduct(product.id, swId)` | ProductSetup.tsx:200 |

---

## 8. Test References

| Test File | Test ID | Property |
|-----------|---------|----------|
| tests/component/ProductSetup.test.tsx | `prod.inv.01-08` | All invariants |
| tests/component/ProductSetup.test.tsx | `prod.react.*` | Reactive properties |
| tests/e2e/flows/product-registration.spec.ts | `e2e.prod.*` | AC-PROD-01 through AC-PROD-08 |
