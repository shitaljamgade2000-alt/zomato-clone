const { body, validationResult } = require('express-validator');

/**
 * Validate phone number input
 */
const validatePhoneOTP = [
  body('phone')
    .trim()
    .matches(/^\d{10}$/)
    .withMessage('Phone number must be exactly 10 digits'),
];

/**
 * Validate OTP verification
 */
const validateOTPVerification = [
  body('phone')
    .trim()
    .matches(/^\d{10}$/)
    .withMessage('Phone number must be exactly 10 digits'),
  body('otp')
    .trim()
    .matches(/^\d{6}$/)
    .withMessage('OTP must be exactly 6 digits'),
];

/**
 * Validate email OTP
 */
const validateEmailOTP = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address'),
];

/**
 * Validate email OTP verification
 */
const validateEmailOTPVerification = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('otp')
    .trim()
    .matches(/^\d{6}$/)
    .withMessage('OTP must be exactly 6 digits'),
];

/**
 * Validate user registration
 */
const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Name must be at least 3 characters long'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('phone')
    .trim()
    .matches(/^\d{10}$/)
    .withMessage('Phone number must be exactly 10 digits'),
];

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

module.exports = {
  validatePhoneOTP,
  validateOTPVerification,
  validateEmailOTP,
  validateEmailOTPVerification,
  validateRegister,
  handleValidationErrors,
};
