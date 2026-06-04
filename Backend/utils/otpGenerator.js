/**
 * Generate 6-digit random OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Calculate OTP expiry time (5 minutes from now)
 */
const getOTPExpiryTime = (minutesFromNow = 5) => {
  const now = new Date();
  return new Date(now.getTime() + minutesFromNow * 60000);
};

module.exports = {
  generateOTP,
  getOTPExpiryTime,
};
