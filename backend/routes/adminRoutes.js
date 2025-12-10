const express = require('express');
const router = express.Router();
const { getDashboard, getOverview, createAdmin, getBatchGuideMapping } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.post('/create', createAdmin); // Public for initial setup
router.get('/dashboard', protect, authorize('admin'), getDashboard);
router.get('/overview', protect, authorize('admin'), getOverview);
router.get('/batch-guide-mapping', protect, authorize('admin'), getBatchGuideMapping);

module.exports = router;

