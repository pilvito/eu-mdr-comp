> **Migration notice:** This file is the original high-level functional spec. The authoritative,
> Pnueli-style declarative specs now live in [`specs/`](./specs/README.md). Each section below
> has been migrated into structured feature and domain spec files. This file is kept for
> git history and as a high-level overview.

# Functional Specification: EU MDR Compliance Application

## 1. Overview
The EU MDR Compliance Application is a comprehensive, interactive platform designed for MedTech startups. It provides a structured, audit-ready roadmap that guides users through the complex European Medical Device Regulation (EU MDR) certification process and IEC 62304 software compliance lifecycle. The application is built using React, TypeScript, Vite, and Electron, allowing it to function as both a web application and a desktop application.

## 2. Core Modules & Features

### 2.1 Product & Software Item Management
The application acts as a centralized workspace for managing multiple medical device products and their associated software components.
* **Product Definition:** Users can create, view, and manage multiple products.
* **Software Item Tracking:** Users can define discrete software items (e.g., frontend app, backend service, AI model).
* **Relationship Mapping:** Users can link one or multiple software items to a specific product, establishing a clear hierarchical structure.
* **Global Context:** A global product selector allows the user to switch the "active product" at any time, ensuring all subsequent views and compliance steps are scoped to the selected product. Data is persisted locally.

### 2.2 Compliance Roadmap Navigation
The application provides a structured 9-step roadmap, augmented with specific IEC 62304 software modules, to track progress across the regulatory lifecycle.

#### Primary Steps:
* **Step 1: Applicability & Intended Use** - Defining the intended medical purpose and determining if the product falls under EU MDR scope.
* **Step 2: Classification** - Determining the risk class (e.g., Class I, IIa, IIb, III) based on MDR rules.
* **Step 3: QMS Builder** - Establishing the Quality Management System (ISO 13485) requirements.
* **IEC 62304 Planning** - Dedicated module for Software as a Medical Device (SaMD) planning, safety classification, and lifecycle management.
* **SW Architecture** - Documenting the software architecture, design specifications, and traceability.
* **Step 4: Clinical Data** - Gathering and evaluating clinical evidence.
* **Step 5: Tech File** - Compiling the comprehensive Technical Documentation required for submission.
* **Step 6: Notified Body** - Selecting and engaging with a Notified Body for conformity assessment.
* **Step 7: EU Requirements** - Addressing specific localized EU requirements and representation.
* **Step 8: CE Marking** - Finalizing the Declaration of Conformity and affixing the CE mark.
* **Step 9: Post-Market** - Setting up Post-Market Surveillance (PMS) and vigilance systems.

### 2.3 Dashboard & Progress Tracking
* **Progress Visualization:** An overall progress indicator tracks completion across the entire roadmap.
* **Dashboard:** A central hub providing an overview of the active product's status, pending tasks, and recent activity.

### 2.4 AI Knowledge Base Integration (Backend/CLI)
* **Regulatory Traceability:** Integration with a knowledge graph that traces regulatory requirements directly to QMS evidence.
* **Integrity Checks:** Python-based CLI agent (`agent.py`) capable of parsing YAML/PDF requirements, verifying knowledge graph integrity, and ensuring that the compliance paths are logically sound and transparent.

## 3. User Interface & Experience (UI/UX)
* **Modern Aesthetic:** A premium, professional light-mode design utilizing CSS variables for consistent theming and an "audit-ready" presentation.
* **Sidebar Layout:** Persistent left-hand sidebar for easy navigation across all roadmap steps, featuring clear iconography.
* **Responsive Layout:** Content areas are scrollable and responsive, ensuring readability of complex compliance tables and forms.

## 4. Technical Architecture
* **Frontend:** React 19, React Router for navigation, Lucide React for iconography.
* **Build Tool:** Vite for fast local development and optimized production builds.
* **Desktop Wrapper:** Electron to package the application as a standalone desktop tool.
* **State Management:** React Context (`ProductContext`) for managing product states and `localStorage` for data persistence.
