const db = require('../config/db');
const { recordAudit } = require('../services/audit.service');

// CITIZEN files an objection against a proposal/parcel affecting their land.
async function createObjection(req, res) {
  const { proposal_id, parcel_id, reason } = req.body;

  if (!proposal_id || !reason) {
    return res.status(400).json({ error: 'proposal_id and reason are required' });
  }

  const result = await db.query(
    `INSERT INTO objections (proposal_id, parcel_id, filed_by, reason)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [proposal_id, parcel_id || null, req.user.id, reason]
  );

  const objection = result.rows[0];

  await recordAudit({
    entityType: 'OBJECTION',
    entityId: objection.id,
    action: 'CREATE',
    user: req.user,
    details: { proposal_id, reason },
  });

  res.status(201).json(objection);
}

// CITIZEN sees only their own filed objections.
async function listMyObjections(req, res) {
  const result = await db.query(
    `SELECT * FROM objections WHERE filed_by = $1 ORDER BY filed_at DESC`,
    [req.user.id]
  );
  res.json(result.rows);
}

// CALA resolves (or rejects) an objection within their district.
async function resolveObjection(req, res) {
  const { id } = req.params;
  let { status, resolution_notes } = req.body;
  if (!status) status = 'RESOLVED';

  if (!['RESOLVED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ error: "status must be 'RESOLVED' or 'REJECTED'" });
  }

  const result = await db.query(
    `UPDATE objections
     SET status = $1, resolution_notes = $2, resolved_at = now()
     WHERE id = $3 RETURNING *`,
    [status, resolution_notes || null, id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Objection not found' });
  }

  await recordAudit({
    entityType: 'OBJECTION',
    entityId: id,
    action: `RESOLVE_${status}`,
    user: req.user,
    details: { resolution_notes },
  });

  res.json(result.rows[0]);
}

async function listObjectionsForProposal(req, res) {
  const result = await db.query(
    `SELECT o.*, u.name AS filed_by_name
     FROM objections o JOIN users u ON u.id = o.filed_by
     WHERE o.proposal_id = $1 ORDER BY o.filed_at DESC`,
    [req.params.proposalId]
  );
  res.json(result.rows);
}

module.exports = { createObjection, listMyObjections, resolveObjection, listObjectionsForProposal };
