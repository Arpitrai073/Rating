const express = require('express');
const {
  signupValidation,
  loginValidation,
  updatePasswordValidation,
} = require('../validators');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { signup, login, getMe, updatePassword } = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signupValidation, validate, signup);
router.post('/login', loginValidation, validate, login);
router.get('/me', authenticate, getMe);
router.put('/password', authenticate, updatePasswordValidation, validate, updatePassword);

module.exports = router;
