const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { getAuditTrail } = require('../services/audit.service');

router.use(authenticate);

// GET /api/audit/PROPOSAL/:id  ->  full history for that proposal
router.get('/:entityType/:entityId', asyncHandler(async (req, res) => {
  const { entityType, entityId } = req.params;
  const trail = await getAuditTrail(entityType.toUpperCase(), entityId);
  res.json(trail);
}));

module.exports = router;
