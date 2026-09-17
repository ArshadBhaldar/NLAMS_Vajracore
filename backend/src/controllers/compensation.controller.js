const db = require('../config/db');
const { recordAudit } = require('../services/audit.service');

// CALA-only. This is the step that, in the full architecture, would call
// the Web3 smart contract's approveAndPay() function. For now (Web3 parked)
// it just flips status to PAID and stamps who approved it — the payment
// integration slots in here later without changing the API contract.
async function approveCompensation(req, res) {
  const { id } = req.params;

  const result = await db.query('SELECT * FROM compensation WHERE id = $1', [id]);
  const record = result.rows[0];

  if (!record) {
    return res.status(404).json({ error: 'Compensation record not found' });
  }
  if (record.status === 'PAID') {
    return res.status(409).json({ error: 'Already paid' });
  }

  const updated = await db.query(
    `UPDATE compensation
     SET status = 'PAID', approved_by = $1, approved_at = now(), paid_at = now(), paid_amount = assessed_amount
     WHERE id = $2 RETURNING *`,
    [req.user.id, id]
  );

  await recordAudit({
    entityType: 'COMPENSATION',
    entityId: id,
    action: 'APPROVE_AND_PAY',
    user: req.user,
    details: { assessed_amount: record.assessed_amount },
  });

  res.json(updated.rows[0]);
}

async function listCompensationForProposal(req, res) {
  const result = await db.query(
    `SELECT * FROM compensation WHERE proposal_id = $1`,
    [req.params.proposalId]
  );
  res.json(result.rows);
}

module.exports = { approveCompensation, listCompensationForProposal };
