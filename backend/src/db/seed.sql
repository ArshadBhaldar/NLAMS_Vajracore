-- Demo seed data for local development / hackathon demo
-- Password for all demo users is: Demo@1234  (bcrypt hash below)

INSERT INTO users (id, name, email, password_hash, role, district) VALUES
  ('11111111-1111-1111-1111-111111111111', 'NHAI Project Office', 'nhai@demo.gov.in', '$2a$10$5PVx0ceV0/dkeeIV3IH/qe9QUciS65atJ1sLnnPXPFjFl71rQ2Wuu', 'REQUIRING_BODY', 'Pune'),
  ('22222222-2222-2222-2222-222222222222', 'Rohan Deshmukh, District Collector', 'cala.pune@demo.gov.in', '$2a$10$5PVx0ceV0/dkeeIV3IH/qe9QUciS65atJ1sLnnPXPFjFl71rQ2Wuu', 'CALA', 'Pune'),
  ('33333333-3333-3333-3333-333333333333', 'Field Surveyor - Anita', 'surveyor.anita@demo.gov.in', '$2a$10$5PVx0ceV0/dkeeIV3IH/qe9QUciS65atJ1sLnnPXPFjFl71rQ2Wuu', 'FIELD_SURVEYOR', 'Pune'),
  ('44444444-4444-4444-4444-444444444444', 'Ministry Monitor', 'monitor@demo.gov.in', '$2a$10$5PVx0ceV0/dkeeIV3IH/qe9QUciS65atJ1sLnnPXPFjFl71rQ2Wuu', 'STATE_MONITOR', NULL),
  ('55555555-5555-5555-5555-555555555555', 'Ganesh Patil (Landowner)', 'ganesh.patil@demo.gov.in', '$2a$10$5PVx0ceV0/dkeeIV3IH/qe9QUciS65atJ1sLnnPXPFjFl71rQ2Wuu', 'CITIZEN', 'Pune');

-- A restricted zone (mock forest patch near Pune) for overlap testing
INSERT INTO restricted_zones (zone_name, zone_type, geom) VALUES
  ('Mulshi Forest Buffer', 'FOREST',
   ST_GeogFromText('POLYGON((73.55 18.50, 73.58 18.50, 73.58 18.53, 73.55 18.53, 73.55 18.50))'));

-- A demo proposal
INSERT INTO proposals (id, project_name, requiring_body_id, district, state, area_hectares, stage, assigned_cala_id) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'Pune-Mumbai Expressway Widening - Phase 2',
   '11111111-1111-1111-1111-111111111111', 'Pune', 'Maharashtra', 42.750, 'NOTIFIED_3A',
   '22222222-2222-2222-2222-222222222222');

-- A parcel under that proposal, deliberately overlapping the restricted zone above
INSERT INTO parcels (id, proposal_id, ulpin, owner_name, claimed_area_sqm, geom) VALUES
  ('b1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111',
   'MH1234567890', 'Ganesh Patil', 12000,
   ST_GeogFromText('POLYGON((73.56 18.51, 73.59 18.51, 73.59 18.54, 73.56 18.54, 73.56 18.51))'));

-- Compensation record for that parcel
INSERT INTO compensation (proposal_id, parcel_id, assessed_amount, status) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111',
   1850000.00, 'ASSESSED');
