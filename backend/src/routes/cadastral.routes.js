const express = require('express');
const router = express.Router();
const cadastralController = require('../controllers/cadastral.controller');
const { asyncHandler } = require('../middleware/errorHandler');

// Public endpoints for cadastral map visualizer
router.get('/plots', asyncHandler(cadastralController.getAllPlotsGeoJSON));
router.get('/plots/:ulpin', asyncHandler(cadastralController.getPlotByUlpin));

module.exports = router;
