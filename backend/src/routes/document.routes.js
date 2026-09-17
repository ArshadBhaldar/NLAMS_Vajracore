const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { upload } = require('../middleware/upload');
const { asyncHandler } = require('../middleware/errorHandler');
const {
  uploadDocument,
  getDocumentHistory,
  listDocumentsForProposal,
} = require('../controllers/document.controller');

router.use(authenticate);

router.post('/', requirePermission('document:upload'), upload.single('file'), asyncHandler(uploadDocument));
router.get('/history', asyncHandler(getDocumentHistory));
router.get('/proposal/:proposalId', asyncHandler(listDocumentsForProposal));

module.exports = router;
