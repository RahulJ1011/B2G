const express = require('express');
const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/cases', require('./caseRoutes'));
router.use('/notifications', require('./notificationRoutes'));
router.use('/stations', require('./stationRoutes'));

module.exports = router;
