const express = require('express');
const router = express.Router();
const { serviceAuth } = require('../middleware/serviceAuth');
const { asyncHandler } = require('../middleware/errorHandler');
const {
  getProposalPackage,
  downloadDocument,
  saveScrutinyReport
} = require('../controllers/internal.controller');

// All internal routes are protected by the Service Key
router.use(serviceAuth);

// Python orchestrator fetching data
router.get('/proposals/:proposal_id/package', asyncHandler(getProposalPackage));
router.get('/documents/:document_id/download', asyncHandler(downloadDocument));

// Python orchestrator saving reports
router.post('/proposals/:proposal_id/scrutiny', asyncHandler(saveScrutinyReport));

module.exports = router;
