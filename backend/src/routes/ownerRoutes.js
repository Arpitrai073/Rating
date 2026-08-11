const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getOwnerDashboard } = require('../controllers/ownerController');

const router = express.Router();

router.use(authenticate, authorize('STORE_OWNER'));
router.get('/dashboard', getOwnerDashboard);

module.exports = router;
