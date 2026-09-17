const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { asyncHandler } = require('../middleware/errorHandler');
const { createParcel, listParcelsForProposal } = require('../controllers/parcel.controller');

router.use(authenticate);

router.post('/', requirePermission('parcel:create'), asyncHandler(createParcel));
router.get('/proposal/:proposalId', asyncHandler(listParcelsForProposal));

module.exports = router;
