# SPEC: Data Model & Persistence
**Spec ID:** DOM-DATA
**Regulation Ref:** EU MDR 2017/745 (general); IEC 62304 §5.1 (software development planning)
**Storage:** localStorage (keys: `eumdr_products`, `eumdr_softwareItems`, `eumdr_activeProductId`)

---

## 1. Domain Entities

### Product
```typescript
interface Product {
  id: string                    // UUID, generated at creation
  name: string                  // Non-empty, user-defined
  classification: string        // One of: 'Class I' | 'Class IIa' | 'Class IIb' | 'Class III' | ''
  intendedUse: string           // Free text
  linkedSoftwareItemIds: string[] // IDs of associated SoftwareItems
  stepProgress: Record<StepId, StepStatus>
}

type StepId =
  | 'step1' | 'step2' | 'step3' | 'step4' | 'step5'
  | 'step6' | 'step7' | 'step8' | 'step9'
  | 'samd' | 'swarch'

type StepStatus = 'not_started' | 'in_progress' | 'complete'
```

### SoftwareItem
```typescript
interface SoftwareItem {
  id: string        // UUID, generated at creation
  name: string      // Non-empty, user-defined
  description: string
  safetyClass: 'A' | 'B' | 'C' | ''  // IEC 62304 §4.3
}
```

### AppState (in-memory, derived from localStorage)
```typescript
interface AppState {
  products: Product[]
  softwareItems: SoftwareItem[]
  activeProductId: string | null
}
```

---

## 2. Persistence Invariants (□)

**INV-DATA-01:** □ `localStorage['eumdr_products']` is either absent or valid JSON array of Product objects.

**INV-DATA-02:** □ `activeProductId !== null` → `products.some(p => p.id === activeProductId)`
> The active product ID must always reference an existing product. If the referenced product is deleted, activeProductId resets to null.

**INV-DATA-03:** □ `∀ p ∈ products : ∀ id ∈ p.linkedSoftwareItemIds : softwareItems.some(sw => sw.id === id)`
> A product's linked software item IDs must always reference existing software items. Dangling references are cleaned on software item deletion.

**INV-DATA-04:** □ `products.map(p => p.id)` contains no duplicates.

**INV-DATA-05:** □ `softwareItems.map(sw => sw.id)` contains no duplicates.

**INV-DATA-06:** □ On page load, state is initialised from localStorage before any UI renders.

---

## 3. Reactive Properties (→)

**REACT-DATA-01:** `product_created` → `localStorage['eumdr_products']` updated within the same synchronous call.

**REACT-DATA-02:** `product_deleted(id)` → `activeProductId` set to null if `activeProductId === id`.

**REACT-DATA-03:** `software_item_deleted(id)` → all `linkedSoftwareItemIds` arrays purged of `id`.

**REACT-DATA-04:** `active_product_changed(id)` → `localStorage['eumdr_activeProductId']` updated synchronously.

---

## 4. localStorage Keys

| Key | Type | Default |
|-----|------|---------|
| `eumdr_products` | `Product[]` JSON | `[]` |
| `eumdr_softwareItems` | `SoftwareItem[]` JSON | `[]` |
| `eumdr_activeProductId` | `string \| null` JSON | `null` |

---

## 5. Test References

| Test File | Test ID | Property |
|-----------|---------|----------|
| tests/unit/context/ProductContext.test.ts | `data.inv.02` | INV-DATA-02 |
| tests/unit/context/ProductContext.test.ts | `data.inv.03` | INV-DATA-03 |
| tests/e2e/invariants/data-persistence.spec.ts | `e2e.data.persist.*` | INV-DATA-01, INV-DATA-06 |
| tests/e2e/invariants/active-product-scoping.spec.ts | `e2e.data.scope.*` | INV-DATA-02 |
