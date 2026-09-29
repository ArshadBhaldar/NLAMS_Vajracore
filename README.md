# VajraBhoomi (वज्रभूमि) — National Land Governance & Acquisition System

[![Next.js](https://img.shields.io/badge/Next.js-16_App_Router-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_4-green?logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-PostGIS-336791?logo=postgresql)](https://postgis.net/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python_AI_Orchestrator-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

**VajraBhoomi (वज्रभूमि)** is a comprehensive, production-grade Digital Public Infrastructure (DPI) platform developed for the **Smart India Hackathon (SIH 2026)**. It digitizes the entire land acquisition lifecycle in India — from project proposal registration and PostGIS spatial boundary geofencing to multi-agent AI scrutiny, statutory gazette milestones, Section 15 objection redressal, Direct Benefit Transfer (DBT) compensation disbursement, and final possession under the **RFCTLARR Act 2013** and **PM GatiShakti National Master Plan**.

---

## 🏛️ System Architecture

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                      Next.js Frontend (Port 3000)                       │
│        React 19 · TypeScript · Tailwind CSS 4 · Radix UI Primitives     │
│        Leaflet GIS (OpenStreetMap + ESRI Satellite) · Urban Cadastral   │
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

The frontend seamlessly proxies all `/api/*` network requests to the backend on port `4000` via Next.js rewrites (`next.config.mjs`), eliminating CORS friction during development and deployment.

---

## ⚡ Core Features & Innovations

### 1. 🏛️ Statutory Decision Support System (DSS) & Human-in-the-Loop (HITL) Pipeline
Under administrative law and the **RFCTLARR Act (2013)**, compulsory land acquisition and compensation cannot be delegated to an autonomous black-box algorithm. **VajraBhoomi explicitly positions AI not as an autonomous judge, but as an auditable Decision Support System (DSS)**:

- **AI as the "Preparer"**: Ingests baseline registry records, extracts legal deeds, and computes the preliminary **Draft Award Sheet (Section 23/31)** including the mandatory 100% Solatium (Sec 30(1)) and 12% additional market value (Sec 30(3)).
- **Human Authority as the "Approver"**: The Competent Authority / District Collector (CALA) reviews the statutory formula breakdown, exercises judicial discretion if needed, and is the **only one** empowered to legally sign and lock the award using Government of India **Class-3 Digital Signature Certificates (DSC)**.
- **Dynamic 3-Tier Confidence Triage**:
  - 🟢 **Green Flag Route (>90% Confidence)**: Clean title, single Khatedar, zero statutory buffer violations. Fast-tracks for single-click CALA DSC countersignature.
  - 🟡 **Amber Flag Route (70–89% Confidence)**: Area variance between RoR and GIS polygon, or multiple joint heirs. Flags for Patwari ground inspection.
  - 🔴 **Red Flag Route (<70% Confidence)**: Encumbrances, court injunctions (lis pendens), or forest/CRZ overlaps. Automatically schedules mandatory personal hearings before the Collector under Section 15.

#### Multi-Agent Statutory Ingestion Agents (Port 8000)
- **Legal Scrutinizer Agent**: Parses uploaded statutory title deeds (`pdfplumber` / regex heuristic fallback or Claude LLM), normalizes Indian naming honorifics (`Mr.`, `Shri`, `Smt.`, `Dr.`), verifies declared landowner names against cadastral registry records, and flags discrepancies or encumbrances.
- **Geospatial Analyzer Agent**: Performs PostGIS spatial intersection audits (`ST_Intersects`) across parcel polygon coordinates against restricted environmental buffer zones (forest reserves, coastal CRZ, defense buffers, and water bodies).
- **R&R Compensation Calculator Agent**: Deterministically calculates statutory compensation packages strictly adhering to Sections 26–30 and the Second Schedule of the RFCTLARR Act 2013:
  $$\text{Draft Award} = (\text{Base Market Value} \times \text{Multiplier}) + \text{100\% Solatium} + \text{12\% Interest} + \text{Assets (Sec 29)} + \text{R\&R Package}$$

### 2. 🗺️ National Infrastructure GIS Map with OpenStreetMap (OSM) & ESRI Satellite (`/dashboard`)
An interactive, high-precision Leaflet GIS map powered by genuine **OpenStreetMap (OSM)** raster tiles with a 1-click **ESRI World Imagery Satellite** toggle — operating with **zero API keys and zero watermarks**:
- ✈️ **Navi Mumbai International Airport (NMIA)**: 1,160 hectares across Ulwe, Targhar, Kombadbhuje, Ganeshpuri, Kopar, and Vaghivalivada villages, including twin-runway layouts (08L/26R & 08R/26L), passenger terminal footprint, Atal Setu link, and CRZ-I coastal mangrove eco-buffers.
- 🚄 **Mumbai-Ahmedabad High-Speed Rail (MAHSR Bullet Train)**: Multi-kilometer viaduct right-of-way, 42-hectare precast box-girder casting yard #4, traction substation (TSS-09), disputed agricultural plot 412/A, and irrigation canal buffer across Navsari & Chikhli agricultural belt.
- 🛣️ **Delhi-Mumbai Greenfield Expressway (NE-4, Package 14)**: 8-lane 70m ROW mainline, cloverleaf grade-separated interchange (Junction 14), smart FASTag automated toll plaza, and wayside amenities across Karjan & Miyagam farmlands.
- 🏔️ **Pune-Mumbai Expressway Missing Link**: Khandala Ghat bypass twin-tunnel portals, Kusgaon cable-stayed viaduct, and Mulshi/Borghat wildlife sanctuary eco-buffer.

#### Core Capabilities:
- **Fly-to-Project Navigation**: Instant animated camera transition zooming to the precise geographic bounding box of any national corridor.
- **In-Map Spatial Demarcation Layers**: Real-time layer filtering for *Acquired (emerald)*, *In Progress (amber)*, *Disputed (rose)*, and *Eco-Sensitive Buffers (hatched)*.
- **Interactive Parcel Dossier Dialog**: Click on any corridor polygon to view official survey number, demarcated area, disbursement status, and statutory stage.
- **Surrounding Land Cadastral Inspector**: Click anywhere across India on the OpenStreetMap to drop a GNSS reticle pin and calculate real-time ground-truth revenue intelligence:
  - Exact Latitude / Longitude (6 decimal places)
  - Cadastral Revenue Survey / Gat number & sub-division
  - Revenue Village, Taluka, and District
  - Land Classification (Agricultural Jirayat/Bagayat, Gaothan Abadi, CRZ-I, Highway ROW)
  - Government Ready Reckoner / Circle Rate + 100% Solatium payout under RFCTLARR 2013
  - Proximity to ongoing infrastructure alignment
- **Cinema Mode**: Viewport expands dynamically for high-impact presentations.
- **Executive MIS Report Downloader**: Instant CSV report generation (`NLAMS_Acquisition_MIS_Report_<date>.csv`) summarizing state, district, notified hectares, and financial disbursement metrics.

### 3. 🏙️ Urban Cadastral Linkage (UCL) Module & ULPIN / Bhu-Aadhaar Engine (`/cadastral-map`)
The **Urban Cadastral Linkage (UCL) Module** bridges the historical divide between spatial City Survey map boundaries (polygons) and textual Property Cards (PR Cards):
- **ULPIN as Primary Key**: Links cadastral polygons with statutory property records using the Government of India's 14-digit **Unique Land Parcel Identification Number (ULPIN / Bhu-Aadhaar)**.
- **PostGIS Spatial Table (`city_survey_plots`)**:
  - `id` (UUID), `ulpin` (VARCHAR 14, unique), `owner_name`, `cts_number` (City Title Survey Number)
  - `ward_division`, `area_sqm`, `property_card_url` (PDF storage / S3)
  - `geom` (`GEOMETRY(Polygon, 4326)` with PostGIS spatial indexing)
  - Mutation history & encumbrance flags (mortgages, court attachments, lis pendens)
- **Dual-Pane Interactive Interface**:
  - Left pane displays Leaflet OpenStreetMap with color-coded CTS survey parcels and zoom-to-parcel interactions.
  - Right pane renders the official Sub-Registrar Property Card (PR Card) PDF with full metadata inspection.
- **Instant Search**: Search by 14-digit ULPIN or CTS Number to immediately locate, zoom, and highlight any urban plot.

### 4. 🎲 6 Curated National Infrastructure Demo Scenarios (`/submit-proposal`)
A 1-click **"Load Random Scenario"** feature populates realistic project specifications without manual typing:

| # | Sector | Project Name | State / District | Landowner & Claimed Area | GeoJSON Location |
| :-: | :--- | :--- | :--- | :--- | :--- |
| **1** | **Semi-High Speed Rail** | Pune-Nashik Semi-High Speed Rail Corridor — Package IV | Maharashtra, Pune | Mr. Ganesh Patil (12,000 sqm) | Mulshi / Pune alignment |
| **2** | **Dedicated Freight** | Western Dedicated Freight Corridor (WDFC) — Phase II Feeder Spur | Haryana, Gurugram | Shri Devendra Singh Yadav (47,500 sqm) | Sohna / Rewari logistics hub |
| **3** | **Greenfield Expressway** | Delhi-Mumbai Greenfield Expressway (NE-4) — Vadodara-Bharuch | Gujarat, Vadodara | Smt. Bhavnaben Patel (68,000 sqm) | Junction 14 interchange |
| **4** | **Multi-Modal Logistics** | PM GatiShakti Multi-Modal Logistics Park (MMLP) — Talegaon Hub | Maharashtra, Pune | Mr. Ganesh Patil (84,000 sqm) | NH-48 container apron |
| **5** | **Renewable Hybrid Park** | Khavda Ultra Mega Renewable Energy Hybrid Park — 765kV Substation | Gujarat, Kutch | Shri Suresh Kumar Jadeja (145,000 sqm) | Kutch solar/wind grid link |
| **6** | **Industrial Expressway** | Bengaluru-Chennai Expressway (NE-7) — Hoskote to Malur Package I | Karnataka, Bengaluru Rural | Shri M. Venkataswamy (36,500 sqm) | Auto cluster link |

### 5. 📜 Authentic Statutory Title Deed Documents Repository
Seven official statutory Title Deed PDF certificates generated with state revenue seals, cadastral coordinates, revenue extracts, and sub-registrar stamps (stored in `public/sample_documents/` and `sample_documents/`):
- 6 scenario-matching PDFs with registered landowner names and survey numbers.
- 1 intentional discrepancy test deed (`Title_Deed_Mismatch_Disputed_Sample.pdf`) to demonstrate AI Legal Scrutinizer mismatch detection.
- **Dual Presentation Support**:
  - **Download Matching PDF**: Download physical file to machine and manually drag & drop.
  - **1-Click Auto-Attach**: In-browser instant attachment via Blob API into the form state.
  - **Quick-Pick Pills**: Instant document switching for pitch testing.

### 6. 🗑️ Full Project Deletion & Transactional Clean-up
- Safe project proposal deletion (`DELETE /api/proposals/:id`) executed inside a PostgreSQL transaction (`BEGIN ... COMMIT / ROLLBACK`).
- Cascades through dependent records: `compensation`, `objections`, `scrutiny_reports`, `documents`, `parcels`, and `proposals`.
- Interactive confirmation modal with project metadata and warning, plus real-time reactive UI update.

### 7. ⚖️ Statutory Workflow & Milestone Progression (`/workbench`)
- RFCTLARR statutory milestone state machine:
  $$\text{DRAFT} \longrightarrow \text{NOTIFIED\_3A} \longrightarrow \text{DECLARED\_3D} \longrightarrow \text{AWARD} \longrightarrow \text{POSSESSION}$$
- Multi-district authority allowing CALA to adjudicate proposals across all national demo corridors.
- Citizen objection redressal with Section 15 hearing resolution notes.
- Direct Benefit Transfer (DBT) compensation approval and settlement (`ASSESSED` → `PAID`).

---

## 👥 Demo Personas & 1-Click Role Switcher

All demo accounts use password: **`Demo@1234`**

| Role | Name / Title | Email | Default Dashboard | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Requiring Body** | NHAI Project Office | `nhai@demo.gov.in` | `/submit-proposal` | Create proposals, upload deeds, submit boundaries |
| **District CALA** | Rohan Deshmukh, District Collector | `cala.pune@demo.gov.in` | `/workbench` | AI Scrutiny, stage advancement, resolve objections, approve DBT |
| **Citizen / Landowner** | Ganesh Patil | `ganesh.patil@demo.gov.in` | `/my-land` | View parcels, track compensation, file Section 15 objections |
| **Field Surveyor** | Anita, Cadastral Surveyor | `surveyor.anita@demo.gov.in` | `/field-survey` | GPS GNSS location capture, ground truth inspection checklist |
| **State Monitor** | Ministry of Road Transport & Highways | `monitor@demo.gov.in` | `/dashboard` | National GIS dashboard, MIS CSV reports, cross-state KPIs |

> **Presentation Tip**: Use the persistent **`🎭 Demo Role`** dropdown in the top navigation bar to switch between any persona instantly without logging out.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.18+ or v20+
- **Python**: v3.10+
- **PostgreSQL**: v14+ with the **PostGIS** extension enabled
- **npm** or **pnpm**

---

### Step 1: Database Setup

1. Create a PostgreSQL database and enable required extensions:
```sql
CREATE DATABASE nlams_dev;
\c nlams_dev
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

2. Configure backend environment file (`backend/.env`):
```env
PORT=4000
NODE_ENV=development
DATABASE_URL=postgres://postgres:your_password@localhost:5432/nlams_dev
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
AI_ORCHESTRATOR_URL=http://localhost:8000
AI_SERVICE_KEY=nlams_internal_service_secret_2026
```

3. Initialize schema and seed demo records:
```bash
cd backend
npm install
npm run db:init    # Creates schema, PostGIS tables, enums, indexes
npm run db:seed    # Inserts demo users, restricted forest buffer, initial proposal
```

---

### Step 2: Python AI Multi-Agent Orchestrator Setup

1. Navigate to the orchestrator directory:
```bash
cd nlams-ai-orchestrator
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Configure orchestrator environment file (`nlams-ai-orchestrator/.env`):
```env
NODE_BACKEND_URL=http://localhost:4000
AI_SERVICE_KEY=nlams_internal_service_secret_2026
# Optional: Set ANTHROPIC_API_KEY to use Claude for legal scrutiny.
# If left empty, the engine uses deterministic regex heuristic fallback.
ANTHROPIC_API_KEY=
```

4. Start the AI Orchestrator service on port 8000:
```bash
python -m uvicorn app.main:app --port 8000 --reload
```
Health check: `http://localhost:8000/health` → `{"status": "ok", "service": "nlams-ai-orchestrator"}`

---

### Step 3: Start Node.js Express Backend

In a second terminal:
```bash
cd backend
npm run dev
```
Backend API will listen on `http://localhost:4000`.

---

### Step 4: Start Next.js Frontend

In a third terminal (from the project root):
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 Key API Endpoints

| Method | Endpoint | Authorized Roles | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticate user & return signed JWT |
| `GET` | `/api/auth/me` | Authenticated | Validate active session & return user profile |
| `GET` | `/api/proposals` | Authenticated | List proposals (scoped by role & jurisdiction) |
| `POST` | `/api/proposals` | `REQUIRING_BODY` | Register new acquisition proposal |
| `GET` | `/api/proposals/:id` | Authenticated | Retrieve proposal by UUID |
| `PATCH` | `/api/proposals/:id/transition` | `CALA` | Advance RFCTLARR statutory lifecycle stage |
| `DELETE` | `/api/proposals/:id` | `REQUIRING_BODY`, `CALA`, `STATE_MONITOR` | Transactionally delete project & cascading records |
| `POST` | `/api/proposals/:id/scrutinize` | `CALA` | Trigger multi-agent AI scrutiny run on port 8000 |
| `GET` | `/api/proposals/:id/scrutiny` | Authenticated | Retrieve latest AI scrutiny report |
| `POST` | `/api/parcels` | `REQUIRING_BODY` | Demarcate parcel with PostGIS polygon coordinates |
| `GET` | `/api/parcels/mine` | `CITIZEN` | Fetch registered parcels belonging to citizen |
| `POST` | `/api/documents` | `REQUIRING_BODY`, `FIELD_SURVEYOR` | Upload statutory document (version-tracked) |
| `GET` | `/api/documents/proposal/:id` | Authenticated | List all statutory documents for proposal |
| `GET` | `/api/compensation/proposal/:id` | Authenticated | Fetch assessed compensation awards |
| `PATCH` | `/api/compensation/:id/approve` | `CALA` | Approve & disburse compensation via DBT |
| `POST` | `/api/objections` | `CITIZEN` | Lodge Section 15 statutory objection |
| `PATCH` | `/api/objections/:id/resolve` | `CALA` | Resolve citizen objection with hearing notes |
| `GET` | `/api/dashboard/summary` | Authenticated | Aggregated national KPIs & timeline metrics |
| `GET` | `/api/audit/:type/:id` | Authenticated | Cryptographic, immutable audit log trail |
| `GET` | `/api/cadastral/plots` | Public / Authenticated | Query City Survey parcels with PostGIS geometries |
| `GET` | `/api/cadastral/plots/:ulpin` | Public / Authenticated | Fetch single parcel by 14-digit ULPIN or CTS number & Property Card URL |

---

## 📂 Repository Structure

```text
c:\NLAMS_Vajracore\
├── app/                              # Next.js 16 App Router pages
│   ├── cadastral-map/page.tsx        # Urban Cadastral Linkage (UCL) & ULPIN Map
│   ├── dashboard/page.tsx            # State Monitor National GIS Dashboard
│   ├── field-survey/page.tsx         # Field Surveyor GNSS inspection queue
│   ├── login/page.tsx                # Authentication with 1-click persona logins
│   ├── my-land/page.tsx              # Citizen Land & Rights portal
│   ├── submit-proposal/page.tsx      # Unified Proposal Submission portal
│   └── workbench/page.tsx            # CALA Scrutiny Workbench
├── components/
│   ├── national-gis-leaflet-map.tsx  # Dynamic OpenStreetMap & ESRI GIS Map Engine
│   ├── nlams-app.tsx                 # Core UI component tree, GIS viewer & state
│   ├── ucl-leaflet-map.tsx           # Leaflet UCL Cadastral Map Engine
│   ├── urban-cadastral-map.tsx       # Urban Cadastral Linkage (UCL) Dual-Pane Engine
│   ├── vajrabhoomi-logo.tsx          # Official VajraBhoomi Ashoka emblem branding
│   └── ui/                           # Radix UI primitives & design tokens
├── lib/
│   ├── api.ts                        # Centralized type-safe API client (JWT injection)
│   ├── auth-context.tsx              # Authentication state provider
│   └── types.ts                      # Shared TypeScript data models
├── public/
│   └── sample_documents/             # 7 authentic statutory Title Deed PDFs (statically served)
├── backend/
│   ├── src/
│   │   ├── config/                   # PostgreSQL pool & centralized RBAC permissions
│   │   ├── controllers/              # Route controllers (proposals, parcels, cadastral, documents)
│   │   │   └── cadastral.controller.js # Urban Cadastral Linkage REST controller
│   │   ├── db/                       # Schema DDL, seed SQL, and setup scripts
│   │   │   ├── ucl_schema.sql        # City Survey Plots PostGIS table DDL
│   │   │   ├── ucl_seed.sql          # Authentic Pune CTS sample records
│   │   │   └── ucl_seed_runner.js    # Automated seed executor
│   │   ├── middleware/               # Auth, RBAC, file upload & error handlers
│   │   ├── routes/                   # Express REST route definitions
│   │   │   └── cadastral.routes.js   # Urban Cadastral Linkage REST routes
│   │   ├── services/                 # Audit logging & notification services
│   │   └── utils/                    # Statutory state machine transitions
│   └── generate_all_sample_documents.js # Generator for official Title Deed PDFs
└── nlams-ai-orchestrator/            # Python FastAPI AI Multi-Agent Service
    ├── app/
    │   ├── agents/                   # Legal Scrutinizer, Geospatial Analyzer, R&R Calculator
    │   ├── core/                     # Internal security & config
    │   └── main.py                   # FastAPI application entry point
    └── requirements.txt              # Python service dependencies
```

---

## 🏆 Smart India Hackathon (SIH 2026) Alignment

NLAMS 2.0 directly resolves the core problem statement of **digital end-to-end land acquisition management**:
1. **Zero Mock/Static Data**: Every interaction — from GIS coordinate clicks to stage advancement — communicates with real PostgreSQL/PostGIS database records.
2. **Transparent Statutory Compliance**: Adheres to Section 3A, 3D, Award, and Possession mandates under the RFCTLARR Act 2013.
3. **Automated Corruption & Encroachment Prevention**: AI Legal Scrutinizer and Geospatial Analyzer automatically detect restricted forest overlap and mismatched title deeds before statutory gazette declaration.
4. **Citizen Empowerment**: Direct objection lodging, DBT compensation visibility, and vernacular guidance support.

---

## 📄 License

This repository is maintained for the **NLAMS 2.0 Vajracore** platform for the Smart India Hackathon 2026.
