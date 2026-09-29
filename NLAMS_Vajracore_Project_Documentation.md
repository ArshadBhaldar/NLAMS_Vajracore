# VajraBhoomi (वज्रभूमि) — National Land Governance & Acquisition System
## Comprehensive Technical & Statutory Project Documentation | Smart India Hackathon (SIH 2026)
### Platform: NLAMS 2.0 Vajracore (Digital Public Infrastructure for Land Governance)

---

## 1. Executive Summary & Problem Statement

### 1.1 Background & The National Challenge
Land acquisition is the single most critical dependency for India's infrastructure ambitions, spanning national expressways (NHAI), high-speed rail corridors (NHSRCL), dedicated freight corridors (DFCCIL), renewable energy mega-parks, and multi-modal logistics hubs under the **PM GatiShakti National Master Plan**. In India, land acquisition is governed by the stringent mandates of the **Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement (RFCTLARR) Act 2013**.

Despite comprehensive statutory rules, land acquisition projects routinely suffer from 3 to 5 years of crippling delays caused by systemic bottlenecks:
1. **Siloed & Fragmented Bureaucracy**: Lack of unified coordination among Requiring Bodies (NHAI, MoRTH, Railways), State Revenue Departments, District Collectorates (CALA), and Central Ministries results in administrative gridlock.
2. **Manual Scrutiny & Title Deed Inconsistencies**: Verification of land ownership deeds, inheritance claims, encumbrance records, and 7/12 extracts is conducted manually, resulting in disputed ownership and prolonged court litigation (*lis pendens*).
3. **Geospatial & Ecological Discrepancies**: Land acquisition alignments drawn without high-precision GIS data inadvertently encroach upon Coastal Regulation Zones (CRZ-I), reserved wildlife sanctuaries, defense buffers, or water bodies—triggering stay orders from the National Green Tribunal (NGT).
4. **Opaque Valuation & Public Distrust**: Manual calculation of market values, rural multipliers, 100% Solatium, and R&R entitlement leads to allegations of corruption, under-compensation, and public unrest among displaced farmers.
5. **Urban Cadastral Disconnect**: Urban municipal areas possess rich spatial City Survey maps and textual Property Cards (PR Cards), yet no digital mechanism links these datasets using standard national identifiers like the **ULPIN (Unique Land Parcel Identification Number / Bhu-Aadhaar)**.

### 1.2 The Solution: VajraBhoomi (वज्रभूमि)
**VajraBhoomi** is a state-of-the-art, production-grade Digital Public Infrastructure (DPI) platform engineered to digitize, automate, and legally streamline the complete land acquisition and governance lifecycle. Built on an immutable PostgreSQL/PostGIS foundation, a high-performance Node.js API engine, a multi-agent Python AI scrutiny microservice, and a Next.js 16 frontend with interactive OpenStreetMap GIS capabilities, VajraBhoomi guarantees zero paper delays, zero mock data, and 100% compliance with the RFCTLARR Act 2013.

---

## 2. Uniqueness & Architectural Innovations

### 2.1 Statutory Decision Support System (DSS) with Human-in-the-Loop (HITL)
Under Indian administrative law and RFCTLARR Act 2013, sovereign decisions—such as issuing statutory declarations under Section 19/3D, deciding citizen objections under Section 15, and passing final compensation awards under Section 23/31—cannot be legally outsourced to an autonomous artificial intelligence algorithm. 

**VajraBhoomi explicitly positions AI not as an autonomous judge, but as an auditable Decision Support System (DSS) within a strict Human-in-the-Loop (HITL) architecture**:
- **AI as the "Preparer"**: Autonomous AI agents parse deeds, execute spatial PostGIS intersection audits, and compute draft compensation award sheets including 100% Solatium and 12% statutory interest.
- **Human Authority as the "Approver"**: The Competent Authority for Land Acquisition (CALA / District Collector) reviews the AI audit breakdown, retains ultimate judicial discretion, and digitally signs the legal decree using Government of India **Class-3 Digital Signature Certificates (DSC)**.
- **Dynamic 3-Tier Confidence Triage**:
  - 🟢 **Green Flag (>90% Confidence)**: Clean title, single Khatedar, zero statutory buffer violations. Fast-tracks for single-click CALA DSC countersignature.
  - 🟡 **Amber Flag (70–89% Confidence)**: Area variance between RoR and GIS polygon, or multiple joint heirs. Flags for Patwari ground inspection.
  - 🔴 **Red Flag (<70% Confidence)**: Encumbrances, court injunctions, or forest/CRZ overlaps. Automatically schedules mandatory personal hearings before the Collector under Section 15.

### 2.2 Urban Cadastral Linkage (UCL) Module & ULPIN / Bhu-Aadhaar Integration
VajraBhoomi introduces a dedicated **Urban Cadastral Linkage (UCL)** module (`/cadastral-map`) that solves the urban land record problem:
- **ULPIN as Primary Key**: Links spatial City Survey map boundaries (polygons) with textual Property Cards (PR Cards) using the Government of India's 14-digit **Unique Land Parcel Identification Number (ULPIN)**.
- **PostGIS Spatial Table (`city_survey_plots`)**: Stores polygon geometries, CTS numbers, ward/division, mutation history, encumbrance status, and property card URLs.
- **Dual-Pane Interactive Interface**: Simultaneously displays the spatial cadastral parcel on an interactive OpenStreetMap alongside the authenticated Property Card PDF with instant search by ULPIN or CTS Number.

### 2.3 Native OpenStreetMap (OSM) & ESRI Satellite GIS Engine
VajraBhoomi features an interactive, high-precision Leaflet GIS map (`/dashboard`) powered by genuine **OpenStreetMap (OSM)** raster tiles with a 1-click **ESRI World Imagery Satellite** toggle:
- **100% Free & Open-Source**: Zero external API keys, zero watermarks, and zero vendor lock-in.
- **Sub-Meter PostGIS Geofencing**: Displays real spatial corridors and parcel boundaries for major national megaprojects (NMIA Airport, Bullet Train MAHSR, Delhi-Mumbai Expressway NE-4, and Pune-Mumbai Missing Link).
- **Surrounding Land Cadastral Inspector**: Clicking anywhere across India on the OpenStreetMap drops a live GNSS reticle pin and calculates real-time revenue survey numbers, revenue villages/talukas, land classifications, government ready reckoner circle rates, and 100% Solatium valuations.

---

## 3. Stakeholders & Role-Based Workspaces

VajraBhoomi provides dedicated, security-hardened workspaces tailored for every participant in the acquisition ecosystem:

| Stakeholder Role | Persona in Demo | Portal / Route | Primary Responsibilities |
| :--- | :--- | :--- | :--- |
| **Requiring Body (PIU)** | NHAI Project Implementation Unit | `/submit-proposal` | Propose corridors, upload statutory deeds, submit PostGIS boundaries |
| **District CALA (Collector)** | Rohan Deshmukh, IAS (District Collector) | `/workbench` | Run AI Scrutiny, adjudicate Sec 15 objections, advance stages, sign awards with DSC |
| **Citizen / Landowner** | Ganesh Patil (Khatedar) | `/my-land` | Inspect parcel boundaries, review valuation formulas, lodge Sec 15 objections, receive DBT payouts |
| **Field Surveyor** | Anita Kulkarni (Cadastral Surveyor) | `/field-survey` | Record on-ground GNSS coordinates, verify crop/tree/structural assets, submit field verification checklists |
| **State / National Monitor** | MoRTH / PM GatiShakti Secretariat | `/dashboard` | National GIS dashboard, multi-state progress monitoring, executive MIS CSV export |

---

## 4. System Architecture & Technical Specifications

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                      Next.js Frontend (Port 3000)                       │
│        React 19 · TypeScript · Tailwind CSS 4 · Radix UI Primitives     │
│        Leaflet GIS (OpenStreetMap + ESRI Satellite) · UCL Dual-Pane     │
│        Dynamic Multi-Site GIS Inspector · 1-Click Demo Persona Bar      │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ /api/* proxy rewrite
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      Express Backend API (Port 4000)                    │
│        Node.js · JWT RBAC Middleware · Atomic Transaction Engine        │
│        RFCTLARR State Machine · UCL Spatial Engine · Audit Logging      │
└───────────────────┬─────────────────────────────────┬───────────────────┘
                    │                                 │
                    │ PostgreSQL + PostGIS (Port 5432)│ Service-to-Service
                    ▼                                 ▼ (X-Service-Key)
┌──────────────────────────────────────┐  ┌───────────────────────────────┐
│  PostgreSQL / PostGIS Database       │  │ Python AI Orchestrator (:8000)│
│  - Spatial geometry & ST_Intersects  │  │ - Legal Scrutinizer Agent     │
│  - Cadastral parcels & boundaries    │  │ - Geospatial Analyzer Agent   │
│  - UCL city_survey_plots & ULPIN     │  │ - R&R Calculator Agent        │
│  - RFCTLARR stage transitions        │  │ - PDF Extraction & Scrutiny   │
│  - Versioned statutory documents     │  │                               │
└──────────────────────────────────────┘  └───────────────────────────────┘
```

### 4.1 Technology Stack Matrix
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, TailwindCSS v4, Radix UI Primitives, Lucide Icons, Leaflet & React-Leaflet.
- **Backend API**: Node.js, Express 4, PostgreSQL Driver (`pg`), JWT authentication, Multer for file streaming, Winston audit logger.
- **Spatial Database**: PostgreSQL 14+ with PostGIS spatial extension (`ST_Intersects`, `ST_GeomFromGeoJSON`, `ST_Area`, `ST_Buffer`, spatial R-tree GIST indexing).
- **AI Microservice**: Python 3.10+, FastAPI, Uvicorn, `pdfplumber` for statutory deed parsing, Anthropic Claude API / Deterministic Regex heuristic fallback.

---

## 5. Core Functional Modules

### 5.1 Multi-Agent AI Scrutiny Pipeline
When a proposal is submitted, the District CALA triggers autonomous scrutiny:
- **Legal Scrutinizer Agent**: Normalizes Indian naming honorifics (`Shri`, `Mr.`, `Smt.`, `Dr.`), parses owner names and survey plots from uploaded title deed PDFs, cross-checks against cadastral registry records, and flags encumbrances or title mismatches.
- **Geospatial Analyzer Agent**: Executes PostGIS `ST_Intersects` spatial queries against eco-sensitive buffer layers (CRZ-I mangroves, reserved forests, water bodies, and defense zones).
- **R&R Compensation Calculator Agent**: Deterministically applies RFCTLARR First and Second Schedule formulas:
  $$\text{Total Compensation} = (\text{Market Value} \times \text{Multiplier}) + \text{100\% Solatium} + \text{12\% Annual Interest} + \text{Asset Valuation} + \text{R\&R Package}$$

### 5.2 National Infrastructure GIS Map (`/dashboard`)
An interactive Leaflet map featuring real geographic vector boundaries for 4 national megaprojects:
1. **Navi Mumbai International Airport (NMIA)**: Runway 08L/26R, Runway 08R/26L, Terminal 1 concourse, Atal Setu expressway connector, and Ulwe CRZ-I mangrove eco-buffer.
2. **Mumbai-Ahmedabad High-Speed Rail (MAHSR Bullet Train)**: Elevated viaduct right-of-way, Precast Girder Casting Yard #4, Traction Substation TSS-09, disputed plot 412/A, and CWC canal buffer.
3. **Delhi-Mumbai Greenfield Expressway (NE-4, Package 14)**: 8-lane 70m ROW mainline, Vadodara-Bharuch Cloverleaf Interchange 14, automated FASTag toll plaza, and wayside amenities.
4. **Pune-Mumbai Expressway Missing Link**: Twin-Tunnel Western & Eastern Portals, Kusgaon cable-stayed viaduct, and Borghat wildlife sanctuary buffer.
- Features smooth **fly-to-bounds transitions**, layer filters (*Acquired*, *In Progress*, *Disputed*, *Eco-Buffer*), parcel dossier modals, and the **Surrounding Land Cadastral Inspector**.

### 5.3 Urban Cadastral Linkage (UCL) Module (`/cadastral-map`)
Connects spatial City Survey plots to textual Property Cards using the 14-digit ULPIN:
- Spatial demarcation of urban CTS plots on OpenStreetMap with color-coded tenure statuses.
- Side-by-side synchronized Property Card (PR Card) PDF inspection.
- Search and query by 14-digit ULPIN or CTS Number with auto-zoom and bounding highlights.

### 5.4 RFCTLARR Statutory State Machine
Enforces strict statutory progression with database transaction integrity:
$$\text{DRAFT} \longrightarrow \text{NOTIFIED\_3A} \longrightarrow \text{DECLARED\_3D} \longrightarrow \text{AWARD} \longrightarrow \text{POSSESSION}$$
- **DRAFT**: Project setup, GeoJSON boundary submission, and title deed attachment.
- **NOTIFIED_3A**: Preliminary notification published; opens citizen objection window.
- **DECLARED_3D**: Final notification after the Collector conducts Section 15 hearings and enters official resolution notes.
- **AWARD**: Final statutory compensation award declared with 100% Solatium and R&R grants.
- **POSSESSION**: Compensation settled via direct e-Kuber DBT integration, transferring clear title to the state.

### 5.5 Safe Project Deletion & Clean-up Engine
Safe proposal deletion (`DELETE /api/proposals/:id`) executed within an atomic PostgreSQL transaction (`BEGIN ... COMMIT / ROLLBACK`), cleanly cascading through `compensation`, `objections`, `scrutiny_reports`, `documents`, `parcels`, and `proposals`.

---

## 6. Key API Endpoints Reference

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticate user & return signed JWT |
| `GET` | `/api/auth/me` | Authenticated | Validate active session & return user profile |
| `GET` | `/api/proposals` | Authenticated | List proposals (scoped by role & jurisdiction) |
| `POST` | `/api/proposals` | `REQUIRING_BODY` | Register new acquisition proposal |
| `PATCH` | `/api/proposals/:id/transition` | `CALA` | Advance RFCTLARR statutory lifecycle stage |
| `DELETE` | `/api/proposals/:id` | `REQUIRING_BODY`, `CALA`, `STATE_MONITOR` | Transactionally delete project & cascading records |
| `POST` | `/api/proposals/:id/scrutinize` | `CALA` | Trigger multi-agent AI scrutiny run on port 8000 |
| `GET` | `/api/proposals/:id/scrutiny` | Authenticated | Retrieve latest AI scrutiny report |
| `POST` | `/api/parcels` | `REQUIRING_BODY` | Demarcate parcel with PostGIS polygon coordinates |
| `GET` | `/api/parcels/mine` | `CITIZEN` | Fetch registered parcels belonging to citizen |
| `POST` | `/api/documents` | `REQUIRING_BODY`, `FIELD_SURVEYOR` | Upload statutory document (version-tracked) |
| `GET` | `/api/compensation/proposal/:id` | Authenticated | Fetch assessed compensation awards |
| `PATCH` | `/api/compensation/:id/approve` | `CALA` | Approve & disburse compensation via DBT |
| `POST` | `/api/objections` | `CITIZEN` | Lodge Section 15 statutory objection |
| `PATCH` | `/api/objections/:id/resolve` | `CALA` | Resolve citizen objection with hearing notes |
| `GET` | `/api/dashboard/summary` | Authenticated | Aggregated national KPIs & timeline metrics |
| `GET` | `/api/cadastral/plots` | Public / Authenticated | Query City Survey parcels with PostGIS geometries |
| `GET` | `/api/cadastral/plots/:ulpin` | Public / Authenticated | Fetch single parcel by 14-digit ULPIN or CTS number & Property Card URL |

---

## 7. Feasibility, National Impact & Hackathon Alignment

### 7.1 Technical Feasibility
- **100% Free & Open-Source Stack**: Built on Node.js, Next.js, PostgreSQL/PostGIS, and OpenStreetMap—eliminating expensive commercial GIS licenses and proprietary APIs.
- **Fail-Safe Fallback**: Deterministic regex fallback ensures full system availability even during external AI API downtime.
- **Zero Mock Data**: Every parcel click, stage advance, and objection update syncs with real PostgreSQL records.

### 7.2 Strategic & National Impact (PM GatiShakti & Viksit Bharat 2047)
- **Elimination of Multi-Year Delays**: Automated deed verification and PostGIS environmental intersection audits resolve disputes before statutory gazette declaration.
- **Eradication of Corruption**: 100% transparent statutory formulas, auditable DSC signatures, and direct bank transfers (DBT) eliminate intermediaries.
- **Unified Master Plan Oversight**: Central Ministries receive real-time, cross-state acquisition metrics directly aligned with the **PM GatiShakti National Master Plan**.
