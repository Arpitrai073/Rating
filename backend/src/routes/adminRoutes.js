const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createUserValidation, createStoreValidation } = require('../validators');
const {
  getDashboardStats,
  createUser,
  listUsers,
  getUserById,
  createStore,
  listStoresAdmin,
} = require('../controllers/adminController');

const router = express.Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', getDashboardStats);
router.post('/users', createUserValidation, validate, createUser);
router.get('/users', listUsers);
router.get('/users/:id', getUserById);
router.post('/stores', createStoreValidation, validate, createStore);
router.get('/stores', listStoresAdmin);

module.exports = router;
