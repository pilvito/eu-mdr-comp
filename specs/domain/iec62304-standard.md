# SPEC: IEC 62304 Standard Domain
**Spec ID:** DOM-IEC
**Standard:** IEC 62304:2006+AMD1:2015 — Medical device software: Software life cycle processes
**Visual Ref:** specs/images/iec62304-lifecycle.png, specs/images/iec62304-dev-planning.png

---

## 1. Standard Entities

### Software Safety Classification (§4.3)
| Class | Risk to Patient | Requirements Level |
|-------|----------------|-------------------|
| Class A | No injury or minor injury possible | Minimal process requirements |
| Class B | Non-serious injury possible | Moderate process requirements |
| Class C | Death or serious injury possible | Full process requirements |

Classification is determined by the HARM that could result if the software fails. Higher class = stricter documentation, testing, and change management obligations.

### IEC 62304 Processes
1. **Software Development Process (§5):** Planning, requirements, architecture, detailed design, unit implementation, integration, system testing, release.
2. **Software Maintenance Process (§6):** Problem reports, modification requests, change implementation, re-verification.
3. **Software Configuration Management Process (§8):** Identification, control, status accounting, evaluation.
4. **Software Problem Resolution Process (§9):** Problem identification, investigation, advisory, resolution.

### SOUP (Software of Unknown Provenance)
Software components (libraries, frameworks) not developed under IEC 62304. Must be identified, evaluated, and documented as SOUP items.

### Traceability
IEC 62304 requires bidirectional traceability between:
- System requirements ↔ Software requirements
- Software requirements ↔ Software architecture
- Software requirements ↔ Unit tests
- Software architecture ↔ Integration tests

---

## 2. Domain Invariants (□)

**INV-IEC-01:** □ Every software item must have an assigned Safety Class (A, B, or C) before architecture work begins.

**INV-IEC-02:** □ Class C software items require unit tests for every software unit.

**INV-IEC-03:** □ SOUP items must be listed with version, publisher, and justification of use.

**INV-IEC-04:** □ Architecture documents must trace back to at least one software requirement.

---

## 3. Mapping to Application Features

| IEC 62304 Process | App Feature | Route |
|-------------------|-------------|-------|
| §5.1 Software Development Planning | SaMD Planning | /sw-planning |
| §5.3 Software Architecture | SW Architecture | /sw-architecture |
| §5.2 Software Requirements | SW Architecture (requirements panel) | /sw-architecture |
| §8 Configuration Management | Referenced in SaMD Planning checklist | /sw-planning |
| §9 Problem Resolution | Noted as ongoing; not a dedicated route in v1 | — |
