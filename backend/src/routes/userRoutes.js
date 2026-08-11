const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { ratingValidation } = require('../validators');
const { listStores, submitRating, updateRating } = require('../controllers/userController');

const router = express.Router();

router.use(authenticate, authorize('USER'));

router.get('/stores', listStores);
router.post('/stores/:storeId/ratings', ratingValidation, validate, submitRating);
router.put('/stores/:storeId/ratings', ratingValidation, validate, updateRating);

module.exports = router;
