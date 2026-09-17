const db = require('../config/db');

// Every state-changing action in the system should call this so the
// audit_log table (append-only at the DB level, see schema.sql) has a
// complete, tamper-resistant history of who did what and when.
async function recordAudit({ entityType, entityId, action, user, details }) {
  await db.query(
    `INSERT INTO audit_log (entity_type, entity_id, action, performed_by, performed_by_role, details)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [entityType, entityId, action, user?.id || null, user?.role || null, details ? JSON.stringify(details) : null]
  );
}

async function getAuditTrail(entityType, entityId) {
  const result = await db.query(
    `SELECT al.*, u.name AS performed_by_name
     FROM audit_log al
     LEFT JOIN users u ON u.id = al.performed_by
     WHERE al.entity_type = $1 AND al.entity_id = $2
     ORDER BY al.performed_at ASC`,
    [entityType, entityId]
  );
  return result.rows;
}

module.exports = { recordAudit, getAuditTrail };
