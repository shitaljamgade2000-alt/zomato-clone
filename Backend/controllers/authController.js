const User = require('../models/User_Auth');
const OTPVerification = require('../models/OTPVerification');
const UserSession = require('../models/UserSession');
const { generateOTP, getOTPExpiryTime } = require('../utils/otpGenerator');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwtHandler');
const { sendOTPEmail, sendWelcomeEmail } = require('../services/emailService');
const { sendOTPSMS } = require('../services/smsService');
const { Op } = require('sequelize');

// ============================================================
// PHONE OTP LOGIN
// ============================================================

/**
 * Send OTP to phone
 * POST /api/auth/send-otp
 */
exports.sendOTP = async (req, res) => {
  try {
    const { phone, countryCode = '+91' } = req.body;

    // Validate phone
    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number. Must be 10 digits.',
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpiryTime(5);

    // Delete previous unused OTPs for this phone
    await OTPVerification.destroy({
      where: {
        phone,
        is_used: false,
        verification_type: 'phone',
      },
    });

    // Save OTP to database
    await OTPVerification.create({
      phone,
      otp,
      expires_at: expiresAt,
      verification_type: 'phone',
    });

    // Send SMS
    await sendOTPSMS(phone, otp, countryCode);

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        phone,
        expiryTime: '5 minutes',
        // Only for development - remove in production
        ...(process.env.NODE_ENV === 'development' && { otp }),
      },
    });
  } catch (err) {
    console.error('Send OTP Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
      error: err.message,
    });
  }
};

/**
 * Resend OTP to phone
 * POST /api/auth/resend-otp
 */
exports.resendOTP = async (req, res) => {
  try {
    const { phone, countryCode = '+91' } = req.body;

    // Validate phone
    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number.',
      });
    }

    // Check if there's a recent OTP attempt (prevent abuse)
    const recentOTP = await OTPVerification.findOne({
      where: {
        phone,
        verification_type: 'phone',
        is_used: false,
      },
      order: [['created_at', 'DESC']],
    });

    if (recentOTP && !recentOTP.isExpired()) {
      // OTP still valid, don't resend yet
      return res.status(400).json({
        success: false,
        message: 'OTP already sent. Please wait before requesting a new one.',
        data: {
          expiresIn: Math.ceil((recentOTP.expires_at - new Date()) / 1000),
        },
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpiryTime(5);

    // Delete old OTPs
    await OTPVerification.destroy({
      where: {
        phone,
        is_used: false,
        verification_type: 'phone',
      },
    });

    // Save new OTP
    await OTPVerification.create({
      phone,
      otp,
      expires_at: expiresAt,
      verification_type: 'phone',
    });

    // Send SMS
    await sendOTPSMS(phone, otp, countryCode);

    return res.status(200).json({
      success: true,
      message: 'OTP resent successfully',
      data: {
        phone,
        expiryTime: '5 minutes',
        // Only for development
        ...(process.env.NODE_ENV === 'development' && { otp }),
      },
    });
  } catch (err) {
    console.error('Resend OTP Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to resend OTP',
      error: err.message,
    });
  }
};

/**
 * Verify phone OTP
 * POST /api/auth/verify-otp
 */
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    // Validate input
    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number.',
      });
    }

    if (!otp || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Must be 6 digits.',
      });
    }

    // Find OTP record
    const otpRecord = await OTPVerification.findOne({
      where: {
        phone,
        otp,
        verification_type: 'phone',
        is_used: false,
      },
      order: [['created_at', 'DESC']],
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    // Check if OTP is expired
    if (otpRecord.isExpired()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired',
      });
    }

    // Mark OTP as used
    await otpRecord.update({ is_used: true });

    // Check if user exists
    const user = await User.findOne({ where: { phone } });

    if (user) {
      // User exists - Login
      const accessToken = generateAccessToken(user.id, user.email, user.phone);
      const refreshToken = generateRefreshToken(user.id);

      // Store session
      await UserSession.create({
        user_id: user.id,
        refresh_token: refreshToken,
        device: req.headers['user-agent'],
        ip_address: req.ip,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      // Set cookies
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            profile_image: user.profile_image,
            is_verified: user.is_verified,
          },
          tokens: {
            accessToken,
            refreshToken,
          },
        },
      });
    } else {
      // New user - return phone for registration
      return res.status(200).json({
        success: true,
        message: 'OTP verified. Please complete registration',
        data: {
          phone,
          isNewUser: true,
        },
      });
    }
  } catch (err) {
    console.error('Verify OTP Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify OTP',
      error: err.message,
    });
  }
};

// ============================================================
// EMAIL OTP LOGIN
// ============================================================

/**
 * Send OTP to email
 * POST /api/auth/send-email-otp
 */
exports.sendEmailOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address.',
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpiryTime(5);

    // Delete previous unused OTPs for this email
    await OTPVerification.destroy({
      where: {
        email,
        is_used: false,
        verification_type: 'email',
      },
    });

    // Save OTP to database
    await OTPVerification.create({
      email,
      otp,
      expires_at: expiresAt,
      verification_type: 'email',
    });

    // Send email
    await sendOTPEmail(email, otp);

    return res.status(200).json({
      success: true,
      message: 'OTP sent to email',
      data: {
        email,
        expiryTime: '5 minutes',
        // Only for development
        ...(process.env.NODE_ENV === 'development' && { otp }),
      },
    });
  } catch (err) {
    console.error('Send Email OTP Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
      error: err.message,
    });
  }
};

/**
 * Verify email OTP
 * POST /api/auth/verify-email-otp
 */
exports.verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate input
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address.',
      });
    }

    if (!otp || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP.',
      });
    }

    // Find OTP record
    const otpRecord = await OTPVerification.findOne({
      where: {
        email,
        otp,
        verification_type: 'email',
        is_used: false,
      },
      order: [['created_at', 'DESC']],
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    // Check if expired
    if (otpRecord.isExpired()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired',
      });
    }

    // Mark as used
    await otpRecord.update({ is_used: true });

    // Check if user exists
    const user = await User.findOne({ where: { email } });

    if (user) {
      // User exists - Login
      const accessToken = generateAccessToken(user.id, user.email, user.phone);
      const refreshToken = generateRefreshToken(user.id);

      // Store session
      await UserSession.create({
        user_id: user.id,
        refresh_token: refreshToken,
        device: req.headers['user-agent'],
        ip_address: req.ip,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      // Set cookies
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            profile_image: user.profile_image,
            is_verified: user.is_verified,
          },
          tokens: {
            accessToken,
            refreshToken,
          },
        },
      });
    } else {
      // New user
      return res.status(200).json({
        success: true,
        message: 'OTP verified. Please complete registration',
        data: {
          email,
          isNewUser: true,
        },
      });
    }
  } catch (err) {
    console.error('Verify Email OTP Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify OTP',
      error: err.message,
    });
  }
};

/**
 * Resend OTP to email
 * POST /api/auth/resend-email-otp
 */
exports.resendEmailOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address.',
      });
    }

    // Check if there's a recent OTP attempt
    const recentOTP = await OTPVerification.findOne({
      where: {
        email,
        verification_type: 'email',
        is_used: false,
      },
      order: [['created_at', 'DESC']],
    });

    if (recentOTP && !recentOTP.isExpired()) {
      return res.status(400).json({
        success: false,
        message: 'OTP already sent. Please wait before requesting a new one.',
        data: {
          expiresIn: Math.ceil((recentOTP.expires_at - new Date()) / 1000),
        },
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpiryTime(5);

    // Delete old OTPs
    await OTPVerification.destroy({
      where: {
        email,
        is_used: false,
        verification_type: 'email',
      },
    });

    // Save new OTP
    await OTPVerification.create({
      email,
      otp,
      expires_at: expiresAt,
      verification_type: 'email',
    });

    // Send email
    await sendOTPEmail(email, otp);

    return res.status(200).json({
      success: true,
      message: 'OTP resent to email',
      data: {
        email,
        expiryTime: '5 minutes',
        // Only for development
        ...(process.env.NODE_ENV === 'development' && { otp }),
      },
    });
  } catch (err) {
    console.error('Resend Email OTP Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to resend OTP',
      error: err.message,
    });
  }
};

// ============================================================
// USER REGISTRATION
// ============================================================

/**
 * Register new user
 * POST /api/auth/register
 */
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validate input
    if (!name || name.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 3 characters long.',
      });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address.',
      });
    }

    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number.',
      });
    }

    // Check if phone already exists
    const existingPhone = await User.findOne({ where: { phone } });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number already registered.',
      });
    }

    // Check if email already exists
    if (email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered.',
        });
      }
    }

    // Create user
    const user = await User.create({
      name,
      email: email || null,
      phone,
      password: password || null,
      is_verified: true, // Since OTP is verified
    });

    if (password) {
      await user.hashPassword();
      await user.save();
    }

    // Send welcome email if email exists
    if (email) {
      await sendWelcomeEmail(email, name);
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email, user.phone);
    const refreshToken = generateRefreshToken(user.id);

    // Store session
    await UserSession.create({
      user_id: user.id,
      refresh_token: refreshToken,
      device: req.headers['user-agent'],
      ip_address: req.ip,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    // Set cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          profile_image: user.profile_image,
          is_verified: user.is_verified,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (err) {
    console.error('Register Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: err.message,
    });
  }
};

// ============================================================
// TOKEN REFRESH
// ============================================================

/**
 * Refresh access token
 * POST /api/auth/refresh-token
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const cookieRefreshToken = req.cookies?.refreshToken;
    const token = refreshToken || cookieRefreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not provided.',
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token.',
      });
    }

    // Check session exists and is active
    const session = await UserSession.findOne({
      where: {
        user_id: decoded.userId,
        refresh_token: token,
        is_active: true,
      },
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Session not found.',
      });
    }

    // Get user
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user.id, user.email, user.phone);

    // Set cookie
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (err) {
    console.error('Refresh Token Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to refresh token',
      error: err.message,
    });
  }
};

// ============================================================
// USER PROFILE
// ============================================================

/**
 * Get user profile
 * GET /api/auth/profile
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: {
        exclude: ['password'],
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.error('Get Profile Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: err.message,
    });
  }
};

/**
 * Update user profile
 * PUT /api/auth/profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, profile_image } = req.body;

    const user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if new email already exists
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({
        where: { email, id: { [Op.ne]: user.id } },
      });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use.',
        });
      }
    }

    // Update user
    await user.update({
      name: name || user.name,
      email: email || user.email,
      profile_image: profile_image || user.profile_image,
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (err) {
    console.error('Update Profile Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: err.message,
    });
  }
};

// ============================================================
// LOGOUT
// ============================================================

/**
 * Logout user
 * POST /api/auth/logout
 */
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const cookieRefreshToken = req.cookies?.refreshToken;
    const token = refreshToken || cookieRefreshToken;

    if (token && req.user?.userId) {
      // Invalidate session
      await UserSession.update(
        { is_active: false },
        {
          where: {
            user_id: req.user.userId,
            refresh_token: token,
          },
        }
      );
    }

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (err) {
    console.error('Logout Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: err.message,
    });
  }
};
