const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { asyncHandler } = require('../middleware/errorHandler');
const {
  createProposal,
  listProposals,
  getProposal,
  transitionStage,
} = require('../controllers/proposal.controller');

router.use(authenticate); // every route below requires a valid JWT

router.post('/', requirePermission('proposal:create'), asyncHandler(createProposal));
router.get('/', asyncHandler(listProposals)); // scoping handled inside controller by role
router.get('/:id', asyncHandler(getProposal));
router.patch('/:id/transition', requirePermission('proposal:transition_stage'), asyncHandler(transitionStage));

module.exports = router;
