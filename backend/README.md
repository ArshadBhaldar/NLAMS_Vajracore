# NLAMS 2.0 — Core Workflow Engine (Backend)

Node.js/Express backend implementing the proposal lifecycle, RBAC, document
versioning, GIS overlap checks, compensation approval, objections, and the
immutable audit trail described in the NLAMS 2.0 blueprint. Web3/smart
contracts are intentionally out of scope for this pass — `compensation.approve`
is the seam where that integration plugs in later.

Tested end-to-end against a real PostgreSQL 16 + PostGIS 3.4 instance during
development, including RBAC rejection paths, invalid state transitions, and
the restricted-zone overlap query.

## 1. Prerequisites

- Node.js 18+
- PostgreSQL 14+ with the PostGIS extension available (`postgis` package)

## 2. Setup

```bash
npm install
cp .env.example .env
# edit .env with your Postgres credentials and a real JWT_SECRET
```

Create the database, then apply the schema and demo seed data:

```bash
createdb nlams
npm run db:init    # applies src/db/schema.sql
npm run db:seed    # applies src/db/seed.sql (5 demo users, 1 proposal, 1 parcel)
```

## 3. Run

```bash
npm run dev     # nodemon, auto-restart
# or
npm start
```

Server starts on `http://localhost:4000` (configurable via `PORT`).
Health check: `GET /health`

## 4. Demo Login

All seeded users share the password `Demo@1234`:

| Email | Role | District |
|---|---|---|
| nhai@demo.gov.in | REQUIRING_BODY | Pune |
| cala.pune@demo.gov.in | CALA | Pune |
| surveyor.anita@demo.gov.in | FIELD_SURVEYOR | Pune |
| monitor@demo.gov.in | STATE_MONITOR | — |
| ganesh.patil@demo.gov.in | CITIZEN | Pune |

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"cala.pune@demo.gov.in","password":"Demo@1234"}'
```

Use the returned `token` as `Authorization: Bearer <token>` on every other request.

## 5. API Overview

| Method | Route | Who | Purpose |
|---|---|---|---|
| POST | `/api/auth/login` | anyone | Get JWT |
| GET | `/api/auth/me` | authenticated | Current user info |
| POST | `/api/proposals` | REQUIRING_BODY | Create a proposal (starts at DRAFT) |
| GET | `/api/proposals` | any (scoped) | List proposals — own (RB), district (CALA), all (Monitor) |
| PATCH | `/api/proposals/:id/transition` | CALA | Move proposal to next lifecycle stage |
| POST | `/api/parcels` | REQUIRING_BODY | Add a GPS-polygon parcel; auto-checks restricted-zone overlap |
| GET | `/api/parcels/proposal/:id` | any | List parcels for a proposal (GeoJSON) |
| POST | `/api/documents` | REQUIRING_BODY, FIELD_SURVEYOR | Upload a document (auto-versioned by doc_type) |
| GET | `/api/documents/history` | any | Version history for a proposal + doc_type |
| PATCH | `/api/compensation/:id/approve` | CALA | Approve & mark compensation paid |
| POST | `/api/objections` | CITIZEN | File an objection |
| PATCH | `/api/objections/:id/resolve` | CALA | Resolve/reject an objection |
| GET | `/api/dashboard/summary` | CALA, STATE_MONITOR | KPI aggregates for the dashboard |
| GET | `/api/audit/:entityType/:entityId` | any | Full audit trail for an entity |

## 6. Proposal Lifecycle (state machine)

```
DRAFT -> NOTIFIED_3A -> DECLARED_3D -> AWARD -> POSSESSION
                |              |
                +--> DISPUTED <+
```

Invalid transitions (e.g. skipping a stage) are rejected with HTTP 409.
See `src/utils/stateMachine.js`.

## 7. Security notes

- Every mutating route is authenticated (JWT) and permission-checked
  (`src/config/permissions.js` is the single source of truth for the RBAC matrix).
- CALA and Field Surveyor actions are additionally scoped to their assigned
  district — a valid token from a Pune CALA cannot transition a Nashik proposal.
- The `audit_log` table has DB-level rules blocking UPDATE/DELETE, so it's
  append-only even if application code has a bug.
- File uploads are stored on local disk for the prototype (`UPLOAD_DIR`);
  swap `src/middleware/upload.js` for an S3/MinIO-backed multer storage
  engine for production without touching any controller.

## 8. Known prototype simplifications

- `PFMS`, `Bhuvan`, `ULPIN`, `DigiLocker` integrations are not called — the
  system is structured so those slot in as services behind the existing
  endpoints (e.g. `compensation.approve` is where a PFMS/Web3 call would go).
- The AI Multi-Agent Orchestrator (Legal Scrutinizer, Geospatial Analyzer,
  R&R Calculator) is a separate Python/FastAPI service per the architecture
  doc — this repo covers the Node.js core workflow engine it plugs into via
  `scrutiny_reports`.
