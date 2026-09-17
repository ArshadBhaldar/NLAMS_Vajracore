const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { asyncHandler } = require('../middleware/errorHandler');
const {
  createObjection,
  listMyObjections,
  resolveObjection,
  listObjectionsForProposal,
} = require('../controllers/objection.controller');

router.use(authenticate);

router.post('/', requirePermission('objection:create'), asyncHandler(createObjection));
router.get('/mine', requirePermission('objection:view_own'), asyncHandler(listMyObjections));
router.patch('/:id/resolve', requirePermission('objection:resolve'), asyncHandler(resolveObjection));
router.get('/proposal/:proposalId', asyncHandler(listObjectionsForProposal));

module.exports = router;
