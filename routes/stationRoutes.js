const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const { createStation, getStations } = require('../controllers/station');

// Create station (Admin / Superior only)
router.post('/', protect, authorizeRoles('SUPERIOR', 'JUDICIARY'), createStation);

// Get stations (all roles)
router.get('/', protect, getStations);

module.exports = router;
