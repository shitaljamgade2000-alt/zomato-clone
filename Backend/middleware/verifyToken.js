const { verifyAccessToken } = require('../utils/jwtHandler');

/**
 * Middleware to verify JWT token
 */
const verifyToken = (req, res, next) => {
  try {
    // Get token from headers
    const token = req.headers.authorization?.split(' ')[1] ||
                  req.cookies?.accessToken ||
                  req.body?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Please log in.',
      });
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token. Please log in again.',
      });
    }

    // Attach user info to request
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Token verification failed.',
      error: err.message,
    });
  }
};

/**
 * Optional token verification (doesn't fail if no token)
 */
const optionalVerifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] ||
                  req.cookies?.accessToken;

    if (token) {
      const decoded = verifyAccessToken(token);
      if (decoded) {
        req.user = decoded;
      }
    }

    next();
  } catch (err) {
    next();
  }
};

module.exports = {
  verifyToken,
  optionalVerifyToken,
};
