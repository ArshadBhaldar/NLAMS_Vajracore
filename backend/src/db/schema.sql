-- NLAMS 2.0 Core Schema
-- Requires PostGIS extension for spatial parcel data

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============ ENUMS ============

CREATE TYPE user_role AS ENUM (
  'REQUIRING_BODY',
  'CALA',
  'FIELD_SURVEYOR',
  'STATE_MONITOR',
  'CITIZEN'
);

CREATE TYPE proposal_stage AS ENUM (
  'DRAFT',
  'NOTIFIED_3A',
  'DECLARED_3D',
  'AWARD',
  'POSSESSION',
  'DISPUTED'
);

CREATE TYPE compensation_status AS ENUM (
  'ASSESSED',
  'PENDING',
  'PAID'
);

CREATE TYPE document_status AS ENUM (
  'PENDING_REVIEW',
  'VERIFIED',
  'FLAGGED'
);

-- ============ USERS ============

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL,
  district VARCHAR(100),          -- relevant for CALA / Field Surveyor scoping
  phone VARCHAR(20),
  aadhaar_ref VARCHAR(20),         -- masked/reference only, never store raw Aadhaar
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ PROPOSALS ============

CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_name VARCHAR(200) NOT NULL,
  requiring_body_id UUID NOT NULL REFERENCES users(id),
  district VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  area_hectares NUMERIC(12,3) NOT NULL,
  stage proposal_stage NOT NULL DEFAULT 'DRAFT',
  litigation_risk_score NUMERIC(5,2),        -- 0-100, filled by risk engine
  litigation_risk_band VARCHAR(10),           -- LOW / MEDIUM / HIGH
  assigned_cala_id UUID REFERENCES users(id), -- district collector responsible
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_proposals_stage ON proposals(stage);
CREATE INDEX idx_proposals_district ON proposals(district);

-- ============ LAND PARCELS (spatial) ============

CREATE TABLE parcels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  ulpin VARCHAR(30),                          -- Bhu-Aadhaar / ULPIN reference
  owner_name VARCHAR(200),
  claimed_area_sqm NUMERIC(14,2),
  geom GEOGRAPHY(POLYGON, 4326) NOT NULL,     -- GPS polygon, WGS84
  restricted_zone_overlap BOOLEAN DEFAULT FALSE,
  overlap_details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_parcels_geom ON parcels USING GIST(geom);
CREATE INDEX idx_parcels_proposal ON parcels(proposal_id);

-- Seeded restricted zones (forest land, protected areas, etc.) for overlap checks
CREATE TABLE restricted_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zone_name VARCHAR(200) NOT NULL,
  zone_type VARCHAR(50) NOT NULL,             -- FOREST / PROTECTED / DEFENSE etc.
  geom GEOGRAPHY(POLYGON, 4326) NOT NULL
);

CREATE INDEX idx_restricted_zones_geom ON restricted_zones USING GIST(geom);

-- ============ DOCUMENTS (versioned) ============

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  parcel_id UUID REFERENCES parcels(id),
  doc_type VARCHAR(50) NOT NULL,              -- TITLE_DEED / SURVEY_PHOTO / CONSENT_FORM etc.
  filename VARCHAR(255) NOT NULL,
  storage_path TEXT NOT NULL,
  version INT NOT NULL DEFAULT 1,
  status document_status NOT NULL DEFAULT 'PENDING_REVIEW',
  uploaded_by UUID NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_documents_proposal ON documents(proposal_id);

-- ============ AI SCRUTINY REPORTS ============

CREATE TABLE scrutiny_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  legal_result JSONB,       -- Legal Scrutinizer Agent output
  geospatial_result JSONB,  -- Geospatial Analyzer Agent output
  rr_result JSONB,          -- R&R Calculator Agent output
  overall_status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PASS / FLAGGED / PENDING
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ COMPENSATION ============

CREATE TABLE compensation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  parcel_id UUID NOT NULL REFERENCES parcels(id),
  assessed_amount NUMERIC(14,2) NOT NULL,
  paid_amount NUMERIC(14,2) DEFAULT 0,
  status compensation_status NOT NULL DEFAULT 'ASSESSED',
  approved_by UUID REFERENCES users(id),      -- CALA who signed off
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  transaction_ref VARCHAR(100)                -- placeholder for future PFMS/Web3 tx id
);

-- ============ OBJECTIONS (citizen-filed) ============

CREATE TABLE objections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  parcel_id UUID REFERENCES parcels(id),
  filed_by UUID NOT NULL REFERENCES users(id),
  reason TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'OPEN', -- OPEN / RESOLVED / REJECTED
  filed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT
);

-- ============ AUDIT LOG (append-only, immutable) ============

CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL,   -- PROPOSAL / DOCUMENT / COMPENSATION / OBJECTION
  entity_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,        -- CREATE / STAGE_TRANSITION / UPLOAD / APPROVE etc.
  performed_by UUID REFERENCES users(id),
  performed_by_role user_role,
  details JSONB,
  performed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);

-- Prevent updates/deletes on audit_log at the DB level (append-only enforcement)
CREATE RULE audit_log_no_update AS ON UPDATE TO audit_log DO INSTEAD NOTHING;
CREATE RULE audit_log_no_delete AS ON DELETE TO audit_log DO INSTEAD NOTHING;
