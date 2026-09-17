const db = require('../config/db');
const { recordAudit } = require('../services/audit.service');

// Expects geojson_polygon as a GeoJSON Polygon object, e.g.:
// { "type": "Polygon", "coordinates": [[[lng,lat],[lng,lat],...]] }
async function createParcel(req, res) {
  const { proposal_id, ulpin, owner_name, claimed_area_sqm, geojson_polygon } = req.body;

  if (!proposal_id || !geojson_polygon) {
    return res.status(400).json({ error: 'proposal_id and geojson_polygon are required' });
  }

  // Overlap check against seeded restricted_zones using PostGIS ST_Intersects.
  // This is the same query the Geospatial Analyzer AI agent will call later.
  const overlapResult = await db.query(
    `SELECT zone_name, zone_type
     FROM restricted_zones
     WHERE ST_Intersects(geom, ST_GeomFromGeoJSON($1)::geography)`,
    [JSON.stringify(geojson_polygon)]
  );

  const hasOverlap = overlapResult.rows.length > 0;

  const insertResult = await db.query(
    `INSERT INTO parcels (proposal_id, ulpin, owner_name, claimed_area_sqm, geom, restricted_zone_overlap, overlap_details)
     VALUES ($1, $2, $3, $4, ST_GeomFromGeoJSON($5)::geography, $6, $7) RETURNING *`,
    [
      proposal_id,
      ulpin || null,
      owner_name || null,
      claimed_area_sqm || null,
      JSON.stringify(geojson_polygon),
      hasOverlap,
      hasOverlap ? JSON.stringify(overlapResult.rows) : null,
    ]
  );

  const parcel = insertResult.rows[0];

  await recordAudit({
    entityType: 'PARCEL',
    entityId: parcel.id,
    action: 'CREATE',
    user: req.user,
    details: { proposal_id, restricted_zone_overlap: hasOverlap },
  });

  res.status(201).json(parcel);
}

async function listParcelsForProposal(req, res) {
  const result = await db.query(
    `SELECT id, proposal_id, ulpin, owner_name, claimed_area_sqm,
            ST_AsGeoJSON(geom)::json AS geometry,
            restricted_zone_overlap, overlap_details, created_at
     FROM parcels WHERE proposal_id = $1`,
    [req.params.proposalId]
  );
  res.json(result.rows);
}

module.exports = { createParcel, listParcelsForProposal };
