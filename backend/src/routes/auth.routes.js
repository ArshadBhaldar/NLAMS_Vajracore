const express = require('express');
const router = express.Router();
const { login, me } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

router.post('/login', asyncHandler(login));
router.get('/me', authenticate, asyncHandler(me));

module.exports = router;
