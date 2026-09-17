# NLAMS Vajracore

NLAMS 2.0 — **National Land Acquisition & Management System** — is a role-based platform for coordinated government land acquisition workflows. It features a Next.js frontend connected to a Node.js/Express + PostgreSQL/PostGIS backend via a real-time API.

## Architecture

```text
┌─────────────────────────────────────┐
│  Next.js Frontend  (port 3000)      │
│  React · TypeScript · Tailwind CSS  │
│  shadcn/ui · Lucide icons           │
├─────────────────────────────────────┤
│  /api/* proxy rewrite ──────────────│──►  Express Backend (port 4000)
│                                     │     JWT auth · RBAC middleware
│                                     │     PostgreSQL + PostGIS
└─────────────────────────────────────┘
```

The frontend proxies all `/api/*` requests to the backend via a Next.js rewrite (configured in `next.config.mjs`), so no CORS setup is needed during development.

## Features

- **JWT Authentication** — Login page with role-based redirect to the appropriate dashboard
- **Role-Based Access Control (RBAC)** — 5 roles with strict permission enforcement:
  - **State Monitor** → National Dashboard with live KPIs and project analytics
  - **Requiring Body** → Submit acquisition proposals with statutory documents
  - **CALA / District Collector** → Workbench for proposal review, AI scrutiny, and stage transitions
  - **Field Surveyor** → Mobile-ready survey queue with photo capture and document upload
  - **Citizen / Landowner** → View parcel status, compensation, and file objections
- **Real-time Data** — All dashboards, tables, and KPI cards fetch live data from the backend API
- **Proposal State Machine** — Stage transitions (DRAFT → 3A → 3D → AWARD → POSSESSION) enforced by backend validation
- **Audit Trail** — Every state-changing action is logged in an append-only audit table
- **Document Versioning** — Uploading a document of the same type auto-increments the version number
- **PostGIS Spatial Queries** — Parcel polygon overlap checks against restricted zones
- **GIS Map** — Placeholder for Leaflet/Mapbox integration (spatial data is ready in PostGIS)

## Application Routes

| Route | Role | Description |
|---|---|---|
| `/login` | All | Authentication page (demo credentials shown on-screen) |
| `/dashboard` | State Monitor | National KPI dashboard with filters |
| `/workbench` | CALA | Proposal review, scrutiny panels, stage transitions |
| `/submit-proposal` | Requiring Body | Acquisition proposal form |
| `/field-survey` | Field Surveyor | Survey queue with photo capture and upload |
| `/my-land` | Citizen | Parcel status, compensation, objections |

## Technology

### Frontend
- [Next.js 16](https://nextjs.org) with the App Router
- [React 19](https://react.dev) · [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS 4](https://tailwindcss.com) · [shadcn/ui](https://ui.shadcn.com)
- [Lucide](https://lucide.dev) icons

### Backend
- [Node.js](https://nodejs.org) + [Express 4](https://expressjs.com)
- [PostgreSQL](https://www.postgresql.org) + [PostGIS](https://postgis.net) for spatial data
- [JWT](https://jwt.io) authentication · bcrypt password hashing
- [Multer](https://github.com/expressjs/multer) for file uploads

## Getting Started

### Prerequisites

- Node.js 18.18 or newer
- PostgreSQL 14+ with the PostGIS extension installed
- npm or pnpm

### 1. Install dependencies

```bash
# Frontend (root directory)
npm install

# Backend
cd backend
npm install
```

### 2. Set up the database

Create a PostgreSQL database with PostGIS enabled:

```sql
CREATE DATABASE nlams;
\c nlams
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

Copy the environment file and configure your database credentials:

```bash
cd backend
cp .env.example .env
# Edit .env with your Postgres host, port, user, password, and JWT secret
```

Apply the schema and seed demo data:

```bash
cd backend
npm run db:init    # Creates all tables, enums, and indexes
npm run db:seed    # Inserts 5 demo users, a proposal, parcel, and compensation record
```

### 3. Start the servers

Start the backend and frontend in **separate terminals**:

```bash
# Terminal 1 — Backend (port 4000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 3000)
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser. You will be redirected to the login page.

### 4. Demo credentials

All demo accounts use password: `Demo@1234`

| Role | Email | Dashboard |
|---|---|---|
| State Monitor | `monitor@demo.gov.in` | `/dashboard` |
| Requiring Body (NHAI) | `nhai@demo.gov.in` | `/submit-proposal` |
| CALA / District Collector | `cala.pune@demo.gov.in` | `/workbench` |
| Field Surveyor | `surveyor.anita@demo.gov.in` | `/field-survey` |
| Citizen / Landowner | `ganesh.patil@demo.gov.in` | `/my-land` |

## Project Structure

```text
app/                    Next.js routes and layouts
  login/                Login page
  dashboard/            State Monitor dashboard
  workbench/            CALA proposal review
  submit-proposal/      Requiring Body form
  field-survey/         Field Surveyor queue
  my-land/              Citizen portal
components/
  nlams-app.tsx         Main application shell + all page components
  ui/                   shadcn/ui primitives
lib/
  api.ts                Centralized API client (JWT injection, error handling)
  auth-context.tsx      React AuthContext (login, logout, token validation)
  types.ts              Shared TypeScript types matching backend schema
  utils.ts              Utility functions
backend/
  src/
    app.js              Express app setup and route registration
    server.js           Server entry point (port 4000)
    config/             Database pool and RBAC permission map
    controllers/        Route handlers (auth, proposals, parcels, etc.)
    db/                 Schema SQL, seed SQL, init/seed scripts
    middleware/          JWT auth, RBAC, error handling, file upload
    routes/             Express router files
    services/           Audit logging service
    utils/              Proposal state machine
  uploads/              Local file storage for document uploads
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | No | Returns JWT token |
| `GET` | `/api/auth/me` | Yes | Validates token, returns user |
| `GET` | `/api/proposals` | Yes | List proposals (role-scoped) |
| `POST` | `/api/proposals` | REQUIRING_BODY | Create proposal |
| `GET` | `/api/proposals/:id` | Yes | Get single proposal |
| `PATCH` | `/api/proposals/:id/transition` | CALA | Advance proposal stage |
| `GET` | `/api/dashboard/summary` | Yes | KPI summary (role-scoped) |
| `POST` | `/api/documents` | REQUIRING_BODY, FIELD_SURVEYOR | Upload document (multipart) |
| `GET` | `/api/documents/proposal/:id` | Yes | List documents for proposal |
| `POST` | `/api/parcels` | REQUIRING_BODY | Create parcel (GeoJSON) |
| `GET` | `/api/parcels/mine` | CITIZEN | Citizen's own parcels |
| `GET` | `/api/parcels/proposal/:id` | Yes | List parcels for proposal |
| `GET` | `/api/compensation/proposal/:id` | Yes | List compensation records |
| `PATCH` | `/api/compensation/:id/approve` | CALA | Approve & pay compensation |
| `POST` | `/api/objections` | CITIZEN | File an objection |
| `GET` | `/api/objections/mine` | CITIZEN | List own objections |
| `PATCH` | `/api/objections/:id/resolve` | CALA | Resolve/reject objection |
| `GET` | `/api/audit/:type/:id` | Yes | Audit trail for an entity |

## How It All Works

### Authentication Flow
1. User visits any page → `AuthProvider` checks for a stored JWT in `localStorage`
2. If no token exists → redirect to `/login`
3. User submits email + password → `POST /api/auth/login` → backend verifies via bcrypt
4. Backend returns a JWT containing `{id, role, district, email, name}`
5. Token is stored in `localStorage` → user is redirected to their role-specific dashboard
6. Every subsequent API call includes `Authorization: Bearer <token>` automatically via `lib/api.ts`

### RBAC Enforcement
- **Backend**: Every route is wrapped with `requirePermission('permission:key')` middleware
- **Frontend**: Navigation links and available actions are determined by `user.role`
- **Double-layer**: Even if the frontend shows a button, the backend rejects unauthorized requests

### Proposal Lifecycle
```
DRAFT → NOTIFIED_3A → DECLARED_3D → AWARD → POSSESSION
              ↕                ↕
           DISPUTED ←──────→ DISPUTED
```
Only CALA can transition stages. The state machine is defined identically in both:
- Backend: `backend/src/utils/stateMachine.js`
- Frontend: `lib/types.ts` (TRANSITIONS constant)

## License

This project is maintained for the NLAMS Vajracore application. Add the appropriate license before distributing the code publicly.
