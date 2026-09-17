const db = require('../config/db');
const { recordAudit } = require('../services/audit.service');
const { assertValidTransition, TRANSITION_ROLE } = require('../utils/stateMachine');

// Requiring Body creates a new proposal (always starts at DRAFT)
async function createProposal(req, res) {
  const { project_name, district, state, area_hectares, assigned_cala_id, justification } = req.body;

  if (!project_name || !district || !state || !area_hectares) {
    return res.status(400).json({ error: 'project_name, district, state, area_hectares are required' });
  }

  const result = await db.query(
    `INSERT INTO proposals (project_name, requiring_body_id, district, state, area_hectares, justification, assigned_cala_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [project_name, req.user.id, district, state, area_hectares, justification || null, assigned_cala_id || null]
  );

  const proposal = result.rows[0];

  await recordAudit({
    entityType: 'PROPOSAL',
    entityId: proposal.id,
    action: 'CREATE',
    user: req.user,
    details: { project_name, district, area_hectares },
  });

  res.status(201).json(proposal);
}

// List proposals, scoped by role:
// - REQUIRING_BODY sees only its own submissions
// - CALA sees only its assigned district
// - STATE_MONITOR sees everything (read-only, national)
// - CITIZEN / FIELD_SURVEYOR use dedicated narrower endpoints, not this one
async function listProposals(req, res) {
  const { role, id: userId, district } = req.user;
  let query = 'SELECT * FROM proposals';
  const params = [];

  if (role === 'REQUIRING_BODY') {
    query += ' WHERE requiring_body_id = $1';
    params.push(userId);
  } else if (role === 'CALA') {
    query += ' WHERE district = $1';
    params.push(district);
  }
  // STATE_MONITOR: no filter, sees all (dashboard is national)

  query += ' ORDER BY updated_at DESC';

  const result = await db.query(query, params);
  res.json(result.rows);
}

async function getProposal(req, res) {
  const result = await db.query('SELECT * FROM proposals WHERE id = $1', [req.params.id]);
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Proposal not found' });
  }
  res.json(result.rows[0]);
}

// CALA-only: move a proposal to the next lifecycle stage.
// Validates the transition against the state machine before writing,
// and stamps an audit entry either way (even on rejection would be a
// nice-to-have, but here we log on success to keep it simple).
async function transitionProposal(req, res) {
  const { id } = req.params;
  const { to_stage } = req.body;

  if (!to_stage) {
    return res.status(400).json({ error: 'to_stage is required' });
  }

  const proposalResult = await db.query('SELECT * FROM proposals WHERE id = $1', [id]);
  const proposal = proposalResult.rows[0];

  if (!proposal) {
    return res.status(404).json({ error: 'Proposal not found' });
  }

  if (proposal.district !== req.user.district) {
    return res.status(403).json({ error: 'Forbidden: outside your assigned district' });
  }

  try {
    assertValidTransition(proposal.stage, to_stage);
  } catch (err) {
    return res.status(409).json({ error: err.message });
  }

  const updateResult = await db.query(
    `UPDATE proposals SET stage = $1, updated_at = now() WHERE id = $2 RETURNING *`,
    [to_stage, id]
  );

  await recordAudit({
    entityType: 'PROPOSAL',
    entityId: id,
    action: 'STAGE_TRANSITION',
    user: req.user,
    details: { from: proposal.stage, to: to_stage },
  });

  res.json(updateResult.rows[0]);
}

async function getScrutinyReport(req, res) {
  const { id } = req.params;
  const result = await db.query(
    `SELECT * FROM scrutiny_reports WHERE proposal_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [id]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'No scrutiny report found' });
  }
  res.json(result.rows[0]);
}

async function triggerScrutiny(req, res) {
  const { id } = req.params;
  const orchestratorUrl = process.env.AI_ORCHESTRATOR_URL || 'http://localhost:8000';

  try {
    const response = await fetch(`${orchestratorUrl}/orchestrate/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: `Orchestrator failed: ${errText}` });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Trigger Scrutiny Error:', error);
    res.status(502).json({ error: 'Failed to contact AI Orchestrator' });
  }
}

module.exports = {
  createProposal,
  listProposals,
  getProposal,
  transitionProposal,
  getScrutinyReport,
  triggerScrutiny
};
