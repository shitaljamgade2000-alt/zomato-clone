// SMS Service - Using Twilio or Mock Service
// For development, using mock SMS service

/**
 * Mock SMS Service (for development)
 * In production, integrate with Twilio or AWS SNS
 */

const sendOTPSMS = async (phone, otp, countryCode = '+91') => {
  try {
    // For production, use Twilio SDK
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      return await sendViaTwilio(phone, otp, countryCode);
    }

    // Mock SMS for development
    console.log(`
    ╔════════════════════════════════════╗
    ║     MOCK SMS SERVICE               ║
    ╠════════════════════════════════════╣
    ║ To: ${countryCode}${phone}                 ║
    ║ OTP: ${otp}                         ║
    ║ Message: Your Zomato OTP: ${otp}  ║
    ╚════════════════════════════════════╝
    `);

    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
};

/**
 * Send SMS via Twilio (Production)
 */
const sendViaTwilio = async (phone, otp, countryCode) => {
  try {
    const twilio = require('twilio');
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const message = await client.messages.create({
      body: `Your Zomato OTP: ${otp}. Valid for 5 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `${countryCode}${phone}`,
    });

    console.log('SMS sent via Twilio:', message.sid);
    return true;
  } catch (error) {
    console.error('Twilio SMS Error:', error);
    return false;
  }
};

module.exports = {
  sendOTPSMS,
};
