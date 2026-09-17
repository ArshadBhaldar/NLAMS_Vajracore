const db = require('../config/db');

// Powers the National Dashboard KPI cards: area notified/acquired,
// compensation paid vs assessed, families displaced (proxied by distinct
// parcel owners for the prototype), R&R completion %, and stage counts
// for timeline adherence. Scoped by district for CALA, national for
// STATE_MONITOR, and filterable via query params for both.
async function getDashboardSummary(req, res) {
  const { role, district: userDistrict } = req.user;
  const { district: filterDistrict, state: filterState } = req.query;

  const params = [];
  const conditions = [];

  // CALA is hard-scoped to their own district regardless of query params
  if (role === 'CALA') {
    conditions.push(`p.district = $${params.length + 1}`);
    params.push(userDistrict);
  } else if (filterDistrict) {
    conditions.push(`p.district = $${params.length + 1}`);
    params.push(filterDistrict);
  }

  if (filterState) {
    conditions.push(`p.state = $${params.length + 1}`);
    params.push(filterState);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const areaResult = await db.query(
    `SELECT
       COALESCE(SUM(area_hectares), 0) AS area_notified,
       COALESCE(SUM(area_hectares) FILTER (WHERE stage IN ('AWARD','POSSESSION')), 0) AS area_acquired,
       COUNT(*) AS total_proposals,
       COUNT(*) FILTER (WHERE stage = 'DISPUTED') AS disputed_count,
       COUNT(*) FILTER (WHERE stage = 'POSSESSION') AS possession_count
     FROM proposals p ${whereClause}`,
    params
  );

  const compResult = await db.query(
    `SELECT
       COALESCE(SUM(c.assessed_amount), 0) AS total_assessed,
       COALESCE(SUM(c.paid_amount), 0) AS total_paid,
       COUNT(DISTINCT c.parcel_id) FILTER (WHERE c.status = 'PAID') AS families_paid,
       COUNT(DISTINCT c.parcel_id) AS families_total
     FROM compensation c
     JOIN proposals p ON p.id = c.proposal_id
     ${whereClause}`,
    params
  );

  const stageBreakdown = await db.query(
    `SELECT stage, COUNT(*) AS count FROM proposals p ${whereClause} GROUP BY stage`,
    params
  );

  const area = areaResult.rows[0];
  const comp = compResult.rows[0];

  res.json({
    area_notified_hectares: Number(area.area_notified),
    area_acquired_hectares: Number(area.area_acquired),
    total_proposals: Number(area.total_proposals),
    disputed_count: Number(area.disputed_count),
    possession_count: Number(area.possession_count),
    compensation_assessed: Number(comp.total_assessed),
    compensation_paid: Number(comp.total_paid),
    rr_completion_pct: comp.families_total > 0
      ? Number(((comp.families_paid / comp.families_total) * 100).toFixed(1))
      : 0,
    families_displaced: Number(comp.families_total),
    stage_breakdown: stageBreakdown.rows,
  });
}

module.exports = { getDashboardSummary };
