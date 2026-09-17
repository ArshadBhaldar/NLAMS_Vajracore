const db = require('../config/db');
const { recordAudit } = require('../services/audit.service');

// Uploading a document for a proposal that already has a document of the
// same doc_type auto-increments the version rather than overwriting —
// this is what satisfies the "strict version control" requirement.
async function uploadDocument(req, res) {
  const { proposal_id, doc_type, parcel_id } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  if (!proposal_id || !doc_type) {
    return res.status(400).json({ error: 'proposal_id and doc_type are required' });
  }

  const existing = await db.query(
    `SELECT COALESCE(MAX(version), 0) AS max_version FROM documents
     WHERE proposal_id = $1 AND doc_type = $2`,
    [proposal_id, doc_type]
  );
  const nextVersion = Number(existing.rows[0].max_version) + 1;

  const result = await db.query(
    `INSERT INTO documents (proposal_id, parcel_id, doc_type, filename, storage_path, version, uploaded_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [proposal_id, parcel_id || null, doc_type, req.file.originalname, req.file.path, nextVersion, req.user.id]
  );

  const document = result.rows[0];

  await recordAudit({
    entityType: 'DOCUMENT',
    entityId: document.id,
    action: 'UPLOAD',
    user: req.user,
    details: { proposal_id, doc_type, version: nextVersion, filename: req.file.originalname },
  });

  res.status(201).json(document);
}

// Returns full version history for a given proposal + doc_type so the UI
// can render "v1, v2, v3..." with an audit trail per version.
async function getDocumentHistory(req, res) {
  const { proposal_id, doc_type } = req.query;

  if (!proposal_id || !doc_type) {
    return res.status(400).json({ error: 'proposal_id and doc_type query params are required' });
  }

  const result = await db.query(
    `SELECT d.*, u.name AS uploaded_by_name
     FROM documents d
     JOIN users u ON u.id = d.uploaded_by
     WHERE d.proposal_id = $1 AND d.doc_type = $2
     ORDER BY d.version DESC`,
    [proposal_id, doc_type]
  );

  res.json(result.rows);
}

async function listDocumentsForProposal(req, res) {
  const result = await db.query(
    `SELECT * FROM documents WHERE proposal_id = $1 ORDER BY doc_type, version DESC`,
    [req.params.proposalId]
  );
  res.json(result.rows);
}

module.exports = { uploadDocument, getDocumentHistory, listDocumentsForProposal };
