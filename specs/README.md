# Spec-Driven Development — Notation Guide

This directory contains the authoritative specifications for the EU MDR Compliance Application,
written in a Pnueli-style declarative format. Each spec drives implementation (via XState machines
in `src/machines/`) and verification (via tests in `tests/`).

---

## Directory Layout

```
specs/
├── README.md               ← this file
├── images/                 ← visual reference specs (EU MDR flow, IEC 62304 lifecycle)
├── domain/                 ← cross-cutting regulatory knowledge (not tied to any one route)
│   ├── eu-mdr-regulation.md
│   ├── iec62304-standard.md
│   └── data-model.md
├── features/               ← one spec per application route
│   ├── product-management.md
│   ├── dashboard.md
│   ├── step1-applicability.md
│   ├── step2-classification.md
│   ├── step3-qms.md ... step9-post-market.md
│   ├── iec62304-samd-planning.md
│   └── iec62304-sw-architecture.md
└── components/             ← specs for shared UI components and global context
    ├── product-context.md
    ├── checklist-step.md
    ├── process-flow.md
    └── main-layout.md
```

---

## Temporal Logic Notation

| Symbol | Meaning | Usage |
|--------|---------|-------|
| `□ P` | **Always P** — P holds in every reachable state | Invariants that must never be violated |
| `◇ P` | **Eventually P** — given the precondition, P will hold in some future state | Progress guarantees |
| `P → Q` | **P leads to Q** — if P holds, Q holds in this or the immediately following state | Reactive/causal effects |
| `¬ P` | **Not P** | Negation |
| `P ∧ Q` | **P and Q** | Conjunction |
| `P ∨ Q` | **P or Q** | Disjunction |
| `P ↔ Q` | **P if and only if Q** | Biconditional |
| `∃ x : P(x)` | **There exists x such that P(x)** | Existential quantification |
| `∀ x : P(x)` | **For all x, P(x)** | Universal quantification |

---

## Property ID Naming Convention

All properties carry a stable ID used for traceability from spec → machine guard → test assertion.

| Prefix | Scope | Example |
|--------|-------|---------|
| `INV-<FEAT>-NN` | Invariant (□) | `INV-STEP1-01` |
| `PROG-<FEAT>-NN` | Progress property (◇) | `PROG-PROD-02` |
| `REACT-<FEAT>-NN` | Reactive property (→) | `REACT-ARCH-01` |
| `AC-<FEAT>-NN` | Acceptance criterion | `AC-DASH-03` |

Feature shortcodes: `PROD`, `DASH`, `STEP1`–`STEP9`, `SAMD`, `ARCH`, `CTX`, `CL`, `FLOW`, `NAV`

---

## Spec File Structure (mandatory sections)

Every feature spec file must contain all eight sections in this order:

```markdown
# SPEC: [Feature Name]
**Spec ID:** FEAT-XXX
**Route:** /route-path
**Regulation Ref:** EU MDR Article / IEC 62304 Section (if applicable)
**Component:** src/pages/FeatureName.tsx
**Machine:** src/machines/featureMachine.ts
**Tests:** tests/component/Feature.test.tsx, tests/e2e/flows/feature.spec.ts

## 1. Domain Entities
Typed data structures the feature operates on.

## 2. State Machine Definition
Named states + transitions with event triggers and guards (text diagram format).

## 3. Formal Invariants (□)
INV-XXX-NN: □ (condition → implication)

## 4. Progress Properties (◇)
PROG-XXX-NN: ◇ (precondition → eventual outcome)

## 5. Reactive Properties (→)
REACT-XXX-NN: event → synchronous effect

## 6. Acceptance Criteria
| AC ID | Given | When | Then | Property Ref |

## 7. Component Mapping
| Spec Concept | React Element | File:Line |

## 8. Test References
| Test File | Test ID | Property Verified |
```

---

## Three-Layer Development Workflow

```
1. SPEC (specs/features/*.md)
   Write the formal properties first.
   A spec is complete when all eight sections are filled.

        ↓

2. MACHINE (src/machines/*.ts)
   Translate the state machine section into an XState v5 config.
   Each guard/action cites its INV/PROG/REACT ID in a JSDoc comment.

        ↓

3. TEST (tests/unit/machines/*.test.ts, tests/component/*.test.tsx, tests/e2e/**/*.spec.ts)
   Every INV-* has a unit or component test.
   Every AC-* has a Playwright E2E assertion.
   Run: npm run test:all
```

---

## Visual Reference Images

| File | Description |
|------|-------------|
| `images/mdr-certification-flow.png` | EU MDR certification pathway by device class |
| `images/iec62304-lifecycle.png` | IEC 62304 software lifecycle process overview |
| `images/iec62304-dev-planning.png` | Software development planning breakdown per IEC 62304 |

---

## Running the Test Suite

```bash
npm run test            # Vitest: unit + component tests
npm run test:coverage   # With coverage report (threshold: 80%)
npm run test:e2e        # Playwright: E2E tests against dev server
npm run test:all        # Both
```
