const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/verifyToken');
const {
  validatePhoneOTP,
  validateOTPVerification,
  validateEmailOTP,
  validateEmailOTPVerification,
  validateRegister,
  handleValidationErrors,
} = require('../validators/authValidator');

/**
 * Public Routes (No Auth Required)
 */

// const upload = require('../middleware/upload');

// router.post(
//   '/',
//   authMiddleware,
//   upload.single('image'),
//   restaurantController.createRestaurant
// );

// Send OTP to phone
router.post(
  '/send-otp',
  validatePhoneOTP,
  handleValidationErrors,
  authController.sendOTP
);

// Verify phone OTP
router.post(
  '/verify-otp',
  validateOTPVerification,
  handleValidationErrors,
  authController.verifyOTP
);

// Resend phone OTP
router.post(
  '/resend-otp',
  validatePhoneOTP,
  handleValidationErrors,
  authController.resendOTP
);

// Send OTP to email
router.post(
  '/send-email-otp',
  validateEmailOTP,
  handleValidationErrors,
  authController.sendEmailOTP
);

// Verify email OTP
router.post(
  '/verify-email-otp',
  validateEmailOTPVerification,
  handleValidationErrors,
  authController.verifyEmailOTP
);

// Resend email OTP
router.post(
  '/resend-email-otp',
  validateEmailOTP,
  handleValidationErrors,
  authController.resendEmailOTP
);

// Register new user
router.post(
  '/register',
  validateRegister,
  handleValidationErrors,
  authController.register
);

// Refresh access token
router.post('/refresh-token', authController.refreshToken);

/**
 * Protected Routes (Auth Required)
 */

// Get user profile
router.get('/profile', verifyToken, authController.getProfile);

// Update user profile
router.put('/profile', verifyToken, authController.updateProfile);

// Logout
router.post('/logout', verifyToken, authController.logout);

module.exports = router;
