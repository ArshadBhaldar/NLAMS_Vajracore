# NLAMS 2.0 (National Land Acquisition & Management System) - Vajracore
## Comprehensive Project Documentation for Smart India Hackathon (SIH) 2026

---

## 1. Executive Summary & Problem Statement

### 1.1 Background & The Problem Statement
Land acquisition is a foundational pillar for any nation's infrastructure development, including highways, high-speed railways, industrial corridors, irrigation projects, and urban modernization. In India, the process is governed by the stringent **Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement (RFCTLARR) Act 2013**. 

Despite clear statutory guidelines, the execution suffers from crippling bottlenecks:
1. **Fragmented Workflows**: A lack of standardized, digital coordination among Requiring Bodies (NHAI, Railways), State Governments, District Administrations, and Central Ministries leads to information silos.
2. **Manual Scrutiny & Inaccuracies**: Verification of statutory title deeds, cadastral land records, and landowner credentials is done manually. This is highly error-prone and leads to protracted legal disputes.
3. **Geospatial & Ecological Discrepancies**: Land alignments drawn without high-precision GIS data often inadvertently overlap with Coastal Regulation Zones (CRZ), protected forests, or water bodies, causing project stalls pending environmental clearances.
4. **Opaque Compensation (R&R) Disbursal**: Calculations for statutory compensation are manual and opaque. Affected citizens lack real-time visibility into their compensation status, leading to mass grievances and protests.

### 1.2 Our Solution: NLAMS Vajracore
**NLAMS 2.0 (Vajracore)** is a production-grade, web-based digital platform that digitizes the entire land acquisition lifecycle. From the initial project proposal and geospatial geofencing to multi-agent AI legal scrutiny, public objection redressal, and Direct Benefit Transfer (DBT) of compensation—the system enforces standardized workflows and absolute compliance with the RFCTLARR Act 2013.

---

## 2. Uniqueness of the Solution

While existing e-governance systems act as passive data repositories, NLAMS Vajracore acts as an **Active, Intelligent Adjudicator**:
- **Multi-Agent AI Ecosystem**: We deploy independent AI agents (Legal, Geospatial, and R&R) that concurrently audit proposals in real-time, eliminating human bias and manual verification delays.
- **Dynamic Cadastral Geofencing & Intersects**: True PostGIS spatial integration means every drawn polygon on our map instantly queries actual ground-truth data—such as revenue survey numbers and ecological buffers—preventing unviable alignments on day one.
- **Immutable Statutory State Machine**: The system strictly enforces the legal pipeline (Draft → 3A → 3D → Award → Possession). A stage cannot be advanced without resolving prior statutory requirements, backed by PostgreSQL cascading transactions.
- **Transparent Citizen Empowerment**: Displaced landowners can directly inspect their affected parcels on high-resolution satellite imagery, review exact valuation formulas, lodge Section 15 objections, and track DBT compensation.

---

## 3. Target Audience & Stakeholders

NLAMS 2.0 connects every participant in the acquisition ecosystem through role-based, specialized portals:

1. **Requiring Bodies (e.g., NHAI, Dedicated Freight Corridor Corporation)**
   - *Role*: Propose projects, upload physical title deeds, and map exact corridor boundaries using our geospatial toolkit.
2. **Competent Authority for Land Acquisition (CALA / District Collector)**
   - *Role*: The primary adjudicator. Runs the AI scrutiny pipeline, resolves Section 15 citizen objections, advances statutory gazette stages, and approves final DBT compensation payouts.
3. **Citizens / Landowners**
   - *Role*: The affected populace. They can log in to view affected parcels, track compensation transparently, raise statutory objections during the 3A phase, and submit ownership proofs.
4. **Field Surveyors**
   - *Role*: On-ground agents capturing physical GNSS locations and submitting real-time inspection checklists for the proposed land.
5. **State / Central Monitors (e.g., MoRTH)**
   - *Role*: Strategic oversight. They access the National GIS Dashboard to view multi-state project progress, identify bottlenecks, and generate executive MIS reports.

---

## 4. System Architecture & Technologies

NLAMS Vajracore employs a robust, highly scalable 3-tier microservices architecture designed for national deployment.

### 4.1 Technology Stack
- **Frontend Layer (Port 3000)**: Built on **Next.js 16 (App Router)** and **React 19**, utilizing **TailwindCSS v4** and **Radix UI Primitives** for a highly responsive, GPU-accelerated interface.
- **Backend API Engine (Port 4000)**: **Node.js** with **Express 4**. Features JWT Role-Based Access Control (RBAC) middleware, and an atomic transaction engine to handle concurrent, cascading updates securely.
- **Database Layer (Port 5432)**: **PostgreSQL** supercharged with **PostGIS**. Handles complex spatial geometry, ST_Intersects queries, cadastral parcel mapping, and versioned documents.
- **AI Orchestrator (Port 8000)**: A dedicated **Python FastAPI** microservice housing the autonomous AI agents. Utilizes `pdfplumber` for extraction and Anthropic (Claude) or Regex heuristics for semantic validation.

### 4.2 Architectural Diagram

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                      Next.js Frontend (Port 3000)                       │
│        React 19 · TypeScript · Tailwind CSS 4 · Radix UI Primitives     │
│        Citizen Portal · CALA Workbench · GIS National Monitor           │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ /api/* proxy rewrite
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      Express Backend API (Port 4000)                    │
│        Node.js · JWT RBAC Middleware · Atomic Transaction Engine        │
│        RFCTLARR State Machine · Cascading Audit Logging                 │
└───────────────────┬─────────────────────────────────┬───────────────────┘
                    │                                 │
                    │ PostgreSQL + PostGIS (Port 5432)│ Service-to-Service
                    ▼                                 ▼ (X-Service-Key)
┌──────────────────────────────────────┐  ┌───────────────────────────────┐
│  PostgreSQL / PostGIS Database       │  │ Python AI Orchestrator (:8000)│
│  - Spatial geometry & ST_Intersects  │  │ - Legal Scrutinizer Agent     │
│  - Cadastral parcels & boundaries    │  │ - Geospatial Analyzer Agent   │
│  - RFCTLARR stage transitions        │  │ - R&R Calculator Agent        │
│  - Versioned statutory documents     │  │ - PDF Extraction & Scrutiny   │
└──────────────────────────────────────┘  └───────────────────────────────┘
```

---

## 5. Detailed Core Features Explained

### 5.1 Multi-Agent AI Scrutiny Pipeline
When the Requiring Body submits a proposal and title deeds, the CALA triggers the AI Scrutiny run. Three agents work in parallel:
- **Legal Scrutinizer**: It ingests the PDF title deed, standardizing Indian naming honorifics (e.g., mapping 'Shri', 'Mr.', 'Smt.'). It extracts declared landowner names and survey coordinates, cross-referencing them against the PostgreSQL cadastral registry. If Mr. X claims survey 101, but the registry shows Mrs. Y, it flags an encumbrance immediately.
- **Geospatial Analyzer**: It extracts the GeoJSON polygon submitted by the Requiring Body and runs an `ST_Intersects` audit against restricted layers in PostGIS (e.g., Mangrove buffers, Defense lands). This prevents illegal alignments before they are officially gazetted.
- **R&R Compensation Calculator**: Automatically applies the RFCTLARR formula. It retrieves the base market value (circle rate) for the specific cadastral zone, applies the statutory rural/urban multiplier, adds a mandatory 100% Solatium, and calculates the exact resettlement grant.

### 5.2 High-Resolution Multi-Corridor GIS Viewer
The platform features an interactive satellite canvas displaying four authentic infrastructure corridors (e.g., Navi Mumbai Airport, High-Speed Rail).
- **Interactive Inspection**: By dropping a reticle anywhere on the map, the system instantly computes live ground-truth data: exact Latitude/Longitude, Cadastral Revenue Survey Number, Village/Taluka, Land Classification (e.g., Agricultural Bagayat vs. Forest), and real-time circle rate valuation.
- **Layering & Filtration**: Dynamic layers color-code parcels based on their current statutory status (*Acquired*, *In Progress*, *Disputed*).

### 5.3 Complete Project Lifecycle & State Machine
The system rigorously adheres to the RFCTLARR statutory milestones.

```text
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  1. DRAFT    │ ──> │2. NOTIFIED_3A│ ──> │3. DECLARED_3D│ ──> │  4. AWARD    │ ──> │5. POSSESSION │
└──────────────┘     └──────┬───────┘     └──────────────┘     └──────────────┘     └──────────────┘
 Proposal Setup             │              Final Declaration    Award Package        DBT Direct Payout
 Shapefile Upload           ▼              Hearing Closed       100% Solatium        Physical Handover
 Title Deed Attach   ┌──────────────┐      Land Vests to State  R&R Resettlement
                     │Section 15    │
                     │Objections    │
                     │& Hearings    │
                     └──────────────┘
```
- **DRAFT**: Initial documentation and polygon mapping.
- **NOTIFIED_3A**: The preliminary notification. A mandatory objection window is opened for citizens to file Section 15 grievances via their portal.
- **DECLARED_3D**: Final notification after the CALA officially resolves all objections with hearing notes.
- **AWARD**: The AI R&R calculation is finalized, generating the formal compensation order.
- **POSSESSION**: The compensation is processed via DBT integration, marking the land as formally acquired by the state.

### 5.4 Unified Proposal & Safe Deletion Systems
- **National Corridor Archetypes**: Native support for diverse multi-state project configurations across highways, dedicated freight rail, logistics parks, and renewable transmission corridors.
- **Transactional Clean-Up**: If a project proposal is cancelled or deleted, the backend executes a PostgreSQL transaction block to safely cascade and delete all nested records (compensations, objections, scrutiny reports, and geometries), guaranteeing zero database corruption.

---

## 6. Feasibility, Viability, and Impact

### 6.1 Technical Feasibility
The platform is built on battle-tested, open-source technologies (PostgreSQL, Node.js, Python), ensuring there is no vendor lock-in. The use of PostGIS provides enterprise-grade spatial indexing out-of-the-box. Furthermore, our AI architecture includes robust deterministic fallbacks (Regex heuristics), meaning the system remains 100% functional even if third-party LLM APIs experience downtime.

### 6.2 Economic Viability
- **SaaS / Cloud-Native**: The microservices architecture is perfectly suited for centralized deployment on government cloud infrastructure (like NIC MeghRaj), allowing for nationwide scaling without exponential hardware costs.
- **Massive Cost Savings**: By automating legal verification and geospatial overlap checks, the government saves millions in consultancy fees, litigation costs, and administrative man-hours for every major project.

### 6.3 Strategic Impacts & National Benefits
- **Eradication of Delays**: Instant AI validation prevents projects from stalling in environmental courts or facing stay orders due to faulty paperwork, directly accelerating national infrastructure delivery.
- **Restored Trust & Transparency**: By providing citizens with direct visibility into their compensation calculations and a digital channel to raise objections, the system drastically reduces friction and civil unrest associated with land acquisition.
- **Data-Driven Governance**: Central Ministries gain a unified, transparent bird's-eye view of all state-level land acquisitions, ensuring strategic alignment with the **PM GatiShakti National Master Plan**.

