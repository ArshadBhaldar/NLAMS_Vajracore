const db = require('../config/db');
const { recordAudit } = require('../services/audit.service');
const { assertValidTransition } = require('../utils/stateMachine');

// Requiring Body creates a new proposal (always starts at DRAFT)
async function createProposal(req, res) {
  const { project_name, district, state, area_hectares, assigned_cala_id, justification } = req.body;

  if (!project_name || !district || !state || !area_hectares) {
    return res.status(400).json({ error: 'project_name, district, state, area_hectares are required' });
  }

  // In demo environment, automatically assign to default CALA (Rohan Deshmukh) if not specified
  const effectiveCalaId = assigned_cala_id || '22222222-2222-2222-2222-222222222222';

  const result = await db.query(
    `INSERT INTO proposals (project_name, requiring_body_id, district, state, area_hectares, justification, assigned_cala_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [project_name, req.user.id, district, state, area_hectares, justification || null, effectiveCalaId]
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
// - CALA sees assigned district / assigned proposals (and all demo scenarios for demo CALA)
// - STATE_MONITOR sees everything (read-only, national)
// - CITIZEN / FIELD_SURVEYOR use dedicated narrower endpoints, not this one
async function listProposals(req, res) {
  const { role, id: userId, district: userDistrict, email: userEmail } = req.user;
  const { state: filterState, district: filterDistrict } = req.query;

  const params = [];
  const conditions = [];

  if (role === 'REQUIRING_BODY') {
    conditions.push(`requiring_body_id = $${params.length + 1}`);
    params.push(userId);
  } else if (role === 'CALA') {
    if (filterDistrict && filterDistrict !== 'all') {
      conditions.push(`district = $${params.length + 1}`);
      params.push(filterDistrict);
    } else if (userDistrict && userDistrict !== 'Pune' && userDistrict !== 'All') {
      conditions.push(`(district = $${params.length + 1} OR assigned_cala_id = $${params.length + 2})`);
      params.push(userDistrict, userId);
    }
    // Demo CALA (cala.pune@demo.gov.in) has jurisdiction over all demo scenarios
  } else if (filterDistrict && filterDistrict !== 'all') {
    conditions.push(`district = $${params.length + 1}`);
    params.push(filterDistrict);
  }

  if (filterState && filterState !== 'all') {
    conditions.push(`state = $${params.length + 1}`);
    params.push(filterState);
  }

  let query = 'SELECT * FROM proposals';
  if (conditions.length) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }
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

  // Check CALA jurisdiction:
  // In demo / multi-scenario environment, allow CALA to transition proposals across all demo projects.
  // In production, enforce jurisdiction if not a demo CALA and not assigned to this proposal.
  const isDemoCala = req.user.email === 'cala.pune@demo.gov.in' || !req.user.district || req.user.district === 'All';
  const isAssigned = proposal.assigned_cala_id === req.user.id || proposal.district === req.user.district;

  if (!isDemoCala && !isAssigned) {
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
    `SELECT * FROM scrutiny_reports WHERE proposal_id = $1 ORDER BY generated_at DESC LIMIT 1`,
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
      },
      body: JSON.stringify({})
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

// Atomically delete a project proposal and all its cascading records
async function deleteProposal(req, res) {
  const { id } = req.params;
  const { role, id: userId, district: userDistrict, email: userEmail } = req.user;

  const result = await db.query('SELECT * FROM proposals WHERE id = $1', [id]);
  const proposal = result.rows[0];

  if (!proposal) {
    return res.status(404).json({ error: 'Proposal not found' });
  }

  // Authorization check:
  // - REQUIRING_BODY can delete their own submitted proposals
  // - CALA can delete proposals assigned to them, in their district, or demo proposals
  // - STATE_MONITOR can delete any proposal (admin role)
  if (role === 'REQUIRING_BODY' && proposal.requiring_body_id !== userId) {
    return res.status(403).json({ error: 'Forbidden: you can only delete your own submitted proposals' });
  }

  if (role === 'CALA') {
    const isDemoCala = userEmail === 'cala.pune@demo.gov.in' || !userDistrict || userDistrict === 'All';
    const isAssigned = proposal.assigned_cala_id === userId || proposal.district === userDistrict;
    if (!isDemoCala && !isAssigned) {
      return res.status(403).json({ error: 'Forbidden: outside your assigned district' });
    }
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM compensation WHERE proposal_id = $1', [id]);
    await client.query('DELETE FROM objections WHERE proposal_id = $1', [id]);
    await client.query('DELETE FROM scrutiny_reports WHERE proposal_id = $1', [id]);
    await client.query('DELETE FROM documents WHERE proposal_id = $1', [id]);
    await client.query('DELETE FROM parcels WHERE proposal_id = $1', [id]);
    await client.query('DELETE FROM proposals WHERE id = $1', [id]);

    await recordAudit({
      entityType: 'PROPOSAL',
      entityId: id,
      action: 'DELETE',
      user: req.user,
      details: { project_name: proposal.project_name, district: proposal.district, state: proposal.state },
    });

    await client.query('COMMIT');
    res.json({ message: 'Project proposal deleted successfully', id, project_name: proposal.project_name });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Delete proposal error:', err);
    res.status(500).json({ error: 'Failed to delete project proposal' });
  } finally {
    client.release();
  }
}

module.exports = {
  createProposal,
  listProposals,
  getProposal,
  transitionProposal,
  getScrutinyReport,
  triggerScrutiny,
  deleteProposal,
};
