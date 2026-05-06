# SPEC: EU MDR Regulatory Domain
**Spec ID:** DOM-MDR
**Regulation:** EU MDR 2017/745 (Regulation (EU) 2017/745 of the European Parliament)
**Visual Ref:** specs/images/mdr-certification-flow.png

---

## 1. Regulatory Entities

### Device Classification (Annex VIII)
| Class | Risk Level | Examples | Notified Body Required |
|-------|-----------|---------|----------------------|
| Class I (Non-sterile, Non-measuring) | Low | Bandages, examination gloves | No (self-declaration) |
| Class I (Sterile or Measuring) | Low-Medium | Sterile wound dressings | Yes (limited scope) |
| Class IIa | Medium | Hearing aids, dental fillings | Yes |
| Class IIb | Medium-High | Ventilators, X-ray machines | Yes |
| Class III | High | Pacemakers, implantable devices | Yes (full scrutiny) |

### Certification Pathway (sequential)
```
1. Device Classification (Annex VIII)
        ↓
2. Quality Management System (ISO 13485 / MDR Annex IX)
        ↓
3. Technical Documentation (MDR Annex II & III)
        ↓
4. Clinical Evaluation (MDR Article 61 + Annex XIV)
        ↓
5. Authorized Representative (EC REP) appointment
        ↓
6. EUDAMED Registration → UDI assignment
        ↓
7. Notified Body Audit (Class IIa, IIb, III only)
        ↓
8. Declaration of Conformity + CE Marking
        ↓
9. Post-Market Surveillance (PMS) + Vigilance
```

### Key Regulatory Terms
- **Intended Purpose:** The use for which a device is intended as specified by the manufacturer.
- **Medical Device:** Any instrument, apparatus, software intended for medical purposes (Article 2(1)).
- **SaMD:** Software as a Medical Device — software that performs a medical function without being part of a hardware device.
- **EC REP:** Authorized Representative in the EU for non-EU manufacturers.
- **UDI:** Unique Device Identifier assigned via EUDAMED registration.
- **PMS:** Post-Market Surveillance — ongoing monitoring of device safety after market entry.

---

## 2. Application Domain Invariants (□)

**INV-MDR-01:** □ Classification is determined before QMS or Technical File work begins.
> In the application, Step 2 (Classification) must be completed before steps requiring class-specific requirements can be opened.

**INV-MDR-02:** □ Class I (non-sterile, non-measuring) devices do not require a Notified Body.
> The application's Step 6 (Notified Body) UI must reflect this by showing a "Not required" state for Class I.

**INV-MDR-03:** □ CE Marking (Step 8) is only reachable after Declaration of Conformity is prepared.

**INV-MDR-04:** □ PMS (Step 9) is a continuous obligation — it does not complete; it is only "set up".

---

## 3. Mapping to Application Steps

| Regulation Activity | App Step | Route |
|---------------------|----------|-------|
| Applicability & Intended Use | Step 1 | /step-1 |
| Device Classification | Step 2 | /step-2 |
| QMS (ISO 13485) | Step 3 | /step-3 |
| IEC 62304 Software Lifecycle | SaMD Planning | /sw-planning |
| Software Architecture | SW Architecture | /sw-architecture |
| Clinical Data | Step 4 | /step-4 |
| Technical File | Step 5 | /step-5 |
| Notified Body | Step 6 | /step-6 |
| EU Requirements (EC REP, EUDAMED) | Step 7 | /step-7 |
| CE Marking | Step 8 | /step-8 |
| Post-Market Surveillance | Step 9 | /step-9 |
