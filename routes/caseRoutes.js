const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const {
    submitCase,
    getCases,
    updateCase,
    confirmResolution,
    getDashboard,
    markCaseHandled,
    confirmCaseResolved
} = require('../controllers/case');

// Citizen submits complaint
router.post('/UserSubmits', protect, authorizeRoles('CITIZEN'), submitCase);

// Get cases (Citizen / Police / Superior / Judiciary)
router.get('/getCases', getCases);

// Update case (Police / Superior / Judiciary)
router.patch('/:id', updateCase);

// Mutual closure confirmation
router.patch('/:id/confirm-resolution', protect, authorizeRoles('CITIZEN', 'POLICE'), confirmResolution);

// Severity dashboard
router.get('/dashboard', protect, authorizeRoles('CITIZEN', 'POLICE', 'SUPERIOR', 'JUDICIARY'), getDashboard);


// ------------------- Police marks case as handled -------------------
router.patch("/police/:id/handle", protect, markCaseHandled);

// ------------------- Citizen confirms resolution -------------------
router.patch("/citizen/:id/confirm", protect, confirmCaseResolved)

module.exports = router;
