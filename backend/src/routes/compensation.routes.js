const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { asyncHandler } = require('../middleware/errorHandler');
const {
  approveCompensation,
  listCompensationForProposal,
} = require('../controllers/compensation.controller');

router.use(authenticate);

router.patch('/:id/approve', requirePermission('compensation:approve'), asyncHandler(approveCompensation));
router.get('/proposal/:proposalId', asyncHandler(listCompensationForProposal));

module.exports = router;
