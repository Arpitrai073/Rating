const { body } = require('express-validator');

const nameRules = body('name')
  .trim()
  .isLength({ min: 20, max: 60 })
  .withMessage('Name must be between 20 and 60 characters');

const emailRules = body('email')
  .trim()
  .isEmail()
  .withMessage('Please provide a valid email address')
  .normalizeEmail();

const addressRules = body('address')
  .trim()
  .notEmpty()
  .withMessage('Address is required')
  .isLength({ max: 400 })
  .withMessage('Address must be at most 400 characters');

const passwordRules = body('password')
  .isLength({ min: 8, max: 16 })
  .withMessage('Password must be 8-16 characters')
  .matches(/[A-Z]/)
  .withMessage('Password must include at least one uppercase letter')
  .matches(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/)
  .withMessage('Password must include at least one special character');

const roleRules = body('role')
  .optional()
  .isIn(['ADMIN', 'USER', 'STORE_OWNER'])
  .withMessage('Role must be ADMIN, USER, or STORE_OWNER');

const signupValidation = [nameRules, emailRules, addressRules, passwordRules];

const loginValidation = [
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const createUserValidation = [
  nameRules,
  emailRules,
  addressRules,
  passwordRules,
  body('role')
    .isIn(['ADMIN', 'USER', 'STORE_OWNER'])
    .withMessage('Role must be ADMIN, USER, or STORE_OWNER'),
];

const createStoreValidation = [
  nameRules,
  emailRules,
  addressRules,
  body('owner_id')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Owner ID must be a positive integer'),
];

const updatePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  passwordRules,
];

const ratingValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
];

module.exports = {
  signupValidation,
  loginValidation,
  createUserValidation,
  createStoreValidation,
  updatePasswordValidation,
  ratingValidation,
};
