# NLAMS Backend

Express.js backend for NLAMS 2.0 — the core workflow engine that handles authentication, RBAC, proposal lifecycle management, document versioning, spatial queries, and audit logging.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your Postgres credentials and JWT secret

# 3. Create the database (PostgreSQL with PostGIS)
#    In psql:
#    CREATE DATABASE nlams;
#    \c nlams
#    CREATE EXTENSION IF NOT EXISTS postgis;
#    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

# 4. Apply schema and seed data
npm run db:init
npm run db:seed

# 5. Start the server
npm run dev
```

The server starts on `http://localhost:4000`. The Next.js frontend proxies to this automatically.

## Environment Variables

See `.env.example` for all required variables:

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `4000` |
| `PGHOST` | PostgreSQL host | `localhost` |
| `PGPORT` | PostgreSQL port | `5432` |
| `PGDATABASE` | Database name | `nlams` |
| `PGUSER` | Database user | `nlams_admin` |
| `PGPASSWORD` | Database password | — |
| `JWT_SECRET` | Secret for signing JWTs | — |
| `JWT_EXPIRY` | Token expiry duration | `8h` |
| `UPLOAD_DIR` | File upload directory | `./uploads` |

## Database

**PostgreSQL 14+** with the **PostGIS** extension is required.

### Schema (`src/db/schema.sql`)

| Table | Purpose |
|---|---|
| `users` | All system users with role enum and district scoping |
| `proposals` | Land acquisition proposals with stage state machine |
| `parcels` | Spatial land parcels (PostGIS GEOGRAPHY polygons) |
| `restricted_zones` | Seeded restricted areas for overlap checks |
| `documents` | Versioned document storage metadata |
| `scrutiny_reports` | AI agent output storage (JSONB) |
| `compensation` | Per-parcel compensation tracking |
| `objections` | Citizen-filed objections |
| `audit_log` | Append-only, tamper-resistant action log |

### Key Schema Details

- **Proposal stages**: `DRAFT → NOTIFIED_3A → DECLARED_3D → AWARD → POSSESSION` (with `DISPUTED` as a branch)
- **User roles**: `REQUIRING_BODY`, `CALA`, `FIELD_SURVEYOR`, `STATE_MONITOR`, `CITIZEN`
- **Spatial data**: Parcels store GPS polygons as `GEOGRAPHY(POLYGON, 4326)` with GIST indexes
- **Audit log**: Protected by PostgreSQL rules — `UPDATE` and `DELETE` are blocked at the DB level

### npm Scripts

```bash
npm run db:init    # Apply schema.sql (creates tables, enums, indexes)
npm run db:seed    # Insert demo data (5 users, 1 proposal, 1 parcel, 1 compensation)
npm run dev        # Start with nodemon (auto-restart on changes)
npm start          # Start in production mode
```

### Demo Users (seeded)

All passwords: `Demo@1234`

| Email | Role | District |
|---|---|---|
| `nhai@demo.gov.in` | REQUIRING_BODY | Pune |
| `cala.pune@demo.gov.in` | CALA | Pune |
| `surveyor.anita@demo.gov.in` | FIELD_SURVEYOR | Pune |
| `monitor@demo.gov.in` | STATE_MONITOR | — |
| `ganesh.patil@demo.gov.in` | CITIZEN | Pune |

## Architecture

```text
src/
├── app.js                  Express app setup, route registration, middleware
├── server.js               Entry point (starts listening on PORT)
├── config/
│   ├── db.js               PostgreSQL connection pool (pg)
│   └── permissions.js      RBAC permission matrix (role → permissions[])
├── controllers/
│   ├── auth.controller.js          Login (bcrypt + JWT) and /me
│   ├── proposal.controller.js      CRUD + stage transition
│   ├── parcel.controller.js        Create (PostGIS), list, citizen's /mine
│   ├── document.controller.js      Upload (multer), version control, history
│   ├── compensation.controller.js  Approve/pay, list by proposal
│   ├── objection.controller.js     Create, resolve, list mine/by proposal
│   └── dashboard.controller.js     Aggregated KPIs (role-scoped)
├── middleware/
│   ├── auth.js             JWT verification → req.user
│   ├── rbac.js             Permission check + district scoping
│   ├── errorHandler.js     Centralized error handling + asyncHandler wrapper
│   └── upload.js           Multer config (25MB limit, UUID filenames)
├── routes/                 Express routers (1 file per resource)
├── services/
│   └── audit.service.js    Append-only audit log writes + trail queries
├── utils/
│   └── stateMachine.js     Valid stage transitions + role enforcement
└── db/
    ├── schema.sql          Full DDL with enums, indexes, and audit rules
    ├── seed.sql            Demo data for local development
    ├── init.js             Runs schema.sql against the database
    └── seed.js             Runs seed.sql against the database
```

## RBAC Permission Matrix

| Permission | REQUIRING_BODY | CALA | FIELD_SURVEYOR | STATE_MONITOR | CITIZEN |
|---|---|---|---|---|---|
| `proposal:create` | ✅ | | | | |
| `proposal:view_own` | ✅ | | | | |
| `proposal:view_district` | | ✅ | | | |
| `proposal:transition_stage` | | ✅ | | | |
| `parcel:create` | ✅ | | | | |
| `parcel:view_own` | | | | | ✅ |
| `parcel:view_assigned` | | | ✅ | | |
| `document:upload` | ✅ | | ✅ | | |
| `scrutiny:view_report` | | ✅ | | | |
| `scrutiny:trigger_run` | | ✅ | | | |
| `compensation:approve` | | ✅ | | | |
| `compensation:view_own` | | | | | ✅ |
| `objection:create` | | | | | ✅ |
| `objection:view_own` | | | | | ✅ |
| `objection:resolve` | | ✅ | | | |
| `dashboard:view_macro` | ✅ | | | | |
| `dashboard:view_district` | | ✅ | | | |
| `dashboard:view_national` | | | | ✅ | |
| `report:generate_mis` | | | | ✅ | |
| `risk:view_score` | | | | ✅ | |
