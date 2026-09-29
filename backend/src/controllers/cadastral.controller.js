const db = require('../config/db');

/**
 * GET /api/cadastral/plots
 * Returns GeoJSON FeatureCollection of all city survey plots.
 * Query filters:
 *   - litigation: boolean ('true' / 'false')
 *   - ward: string
 *   - search: string (matches ULPIN, CTS, or Owner Name)
 */
exports.getAllPlotsGeoJSON = async (req, res) => {
  const { litigation, ward, search } = req.query;

  const conditions = [];
  const params = [];

  if (litigation !== undefined && litigation !== '') {
    params.push(litigation === 'true');
    conditions.push(`litigation_flag = $${params.length}`);
  }

  if (ward) {
    params.push(`%${ward}%`);
    conditions.push(`ward ILIKE $${params.length}`);
  }

  if (search) {
    params.push(`%${search}%`);
    const idx = params.length;
    conditions.push(`(ulpin ILIKE $${idx} OR cts_number ILIKE $${idx} OR owner_name ILIKE $${idx})`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const sql = `
    SELECT
      id,
      ulpin,
      owner_name,
      cts_number,
      litigation_flag,
      area_sqm,
      ward,
      zone_classification,
      encroachment_risk,
      property_card_url,
      ST_AsGeoJSON(geometry)::json AS geometry
    FROM city_survey_plots
    ${whereClause}
    ORDER BY created_at ASC
  `;

  const { rows } = await db.query(sql, params);

  const featureCollection = {
    type: 'FeatureCollection',
    features: rows.map((r) => ({
      type: 'Feature',
      id: r.id,
      geometry: r.geometry,
      properties: {
        id: r.id,
        ulpin: r.ulpin,
        owner_name: r.owner_name,
        cts_number: r.cts_number,
        litigation_flag: r.litigation_flag,
        area_sqm: r.area_sqm ? Number(r.area_sqm) : null,
        ward: r.ward,
        zone_classification: r.zone_classification,
        encroachment_risk: r.encroachment_risk,
        property_card_url: r.property_card_url,
      },
    })),
  };

  return res.json(featureCollection);
};

/**
 * GET /api/cadastral/plots/:ulpin
 * Returns detailed plot metadata including centroid and bounding box for map navigation.
 */
exports.getPlotByUlpin = async (req, res) => {
  const { ulpin } = req.params;

  const sql = `
    SELECT
      id,
      ulpin,
      owner_name,
      cts_number,
      litigation_flag,
      area_sqm,
      ROUND((area_sqm / 10000.0), 4) AS area_hectares,
      ward,
      zone_classification,
      encroachment_risk,
      property_card_url,
      created_at,
      updated_at,
      ST_AsGeoJSON(geometry)::json AS geometry,
      ST_AsGeoJSON(ST_Centroid(geometry))::json AS centroid,
      ST_XMin(geometry) AS bbox_west,
      ST_YMin(geometry) AS bbox_south,
      ST_XMax(geometry) AS bbox_east,
      ST_YMax(geometry) AS bbox_north
    FROM city_survey_plots
    WHERE ulpin = $1 OR id::text = $1
    LIMIT 1
  `;

  const { rows } = await db.query(sql, [ulpin]);

  if (rows.length === 0) {
    return res.status(404).json({ error: `Plot with ULPIN / ID '${ulpin}' not found` });
  }

  const plot = rows[0];

  return res.json({
    id: plot.id,
    ulpin: plot.ulpin,
    owner_name: plot.owner_name,
    cts_number: plot.cts_number,
    litigation_flag: plot.litigation_flag,
    area_sqm: plot.area_sqm ? Number(plot.area_sqm) : null,
    area_hectares: plot.area_hectares ? Number(plot.area_hectares) : null,
    ward: plot.ward,
    zone_classification: plot.zone_classification,
    encroachment_risk: plot.encroachment_risk,
    property_card_url: plot.property_card_url,
    created_at: plot.created_at,
    updated_at: plot.updated_at,
    geometry: plot.geometry,
    centroid: plot.centroid,
    bbox_west: Number(plot.bbox_west),
    bbox_south: Number(plot.bbox_south),
    bbox_east: Number(plot.bbox_east),
    bbox_north: Number(plot.bbox_north),
  });
};
