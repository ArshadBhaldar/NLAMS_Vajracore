const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { getDashboardSummary } = require('../controllers/dashboard.controller');

router.use(authenticate);

// Both CALA (district view) and STATE_MONITOR (national view) can hit this;
// scoping is handled inside the controller based on req.user.role.
router.get('/summary', asyncHandler(getDashboardSummary));

module.exports = router;
