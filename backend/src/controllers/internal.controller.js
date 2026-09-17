const path = require('path');
const db = require('../config/db');

async function getProposalPackage(req, res) {
  const { proposal_id } = req.params;

  try {
    // 1. Fetch Proposal
    const proposalResult = await db.query(
      `SELECT * FROM proposals WHERE id = $1`,
      [proposal_id]
    );
    if (proposalResult.rows.length === 0) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    const proposal = proposalResult.rows[0];

    // 2. Fetch Parcels
    const parcelResult = await db.query(
      `SELECT id, ulpin, owner_name, claimed_area_sqm, restricted_zone_overlap, overlap_details 
       FROM parcels WHERE proposal_id = $1`,
      [proposal_id]
    );
    const parcels = parcelResult.rows;

    // 3. Fetch Documents
    const documentResult = await db.query(
      `SELECT * FROM documents WHERE proposal_id = $1 ORDER BY version DESC`,
      [proposal_id]
    );
    const documents = documentResult.rows;

    res.json({
      proposal,
      parcels,
      documents
    });
  } catch (error) {
    console.error('Error fetching proposal package:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function downloadDocument(req, res) {
  const { document_id } = req.params;

  try {
    const result = await db.query(
      `SELECT storage_path FROM documents WHERE id = $1`,
      [document_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const { storage_path } = result.rows[0];
    const absolutePath = path.resolve(storage_path);
    
    res.download(absolutePath);
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function saveScrutinyReport(req, res) {
  const { proposal_id } = req.params;
  const report = req.body;

  try {
    // Upsert the scrutiny report (one per proposal for the overall orchestration)
    // Actually, schema.sql has: id, proposal_id, agent_name, status, report_data, created_at
    // But the python orchestrator sends the overall combined report. Let's use agent_name = 'ORCHESTRATOR'
    const result = await db.query(
      `INSERT INTO scrutiny_reports (proposal_id, agent_name, status, report_data)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [proposal_id, 'ORCHESTRATOR', report.overall_status, report]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error saving scrutiny report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getProposalPackage,
  downloadDocument,
  saveScrutinyReport
};
