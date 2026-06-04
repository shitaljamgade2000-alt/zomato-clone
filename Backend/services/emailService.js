const nodemailer = require('nodemailer');

// Configure email service
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your_email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your_app_password',
  },
});

/**
 * Send OTP email
 */
const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@zomatoclone.com',
      to: email,
      subject: 'Your Zomato Clone OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 10px;">
            <h2 style="color: #e74c3c; text-align: center;">Zomato Clone</h2>
            <p style="font-size: 16px; color: #333;">Hello,</p>
            <p style="font-size: 16px; color: #333;">Your OTP for verification is:</p>
            <div style="background-color: #e74c3c; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
              <h1 style="color: white; margin: 0; letter-spacing: 5px; font-size: 32px;">${otp}</h1>
            </div>
            <p style="font-size: 14px; color: #666;">This OTP is valid for 5 minutes only.</p>
            <p style="font-size: 14px; color: #666;">If you didn't request this OTP, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">© 2024 Zomato Clone. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

/**
 * Send Welcome Email
 */
const sendWelcomeEmail = async (email, name) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@zomatoclone.com',
      to: email,
      subject: 'Welcome to Zomato Clone!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 10px;">
            <h2 style="color: #e74c3c; text-align: center;">🍽️ Zomato Clone</h2>
            <p style="font-size: 16px; color: #333;">Hi ${name},</p>
            <p style="font-size: 16px; color: #333;">Welcome to Zomato Clone! We're excited to have you on board.</p>
            <p style="font-size: 16px; color: #333;">You can now:</p>
            <ul style="font-size: 16px; color: #333;">
              <li>Browse restaurants near you</li>
              <li>Place food orders</li>
              <li>Track your deliveries in real-time</li>
            </ul>
            <a href="#" style="display: inline-block; background-color: #e74c3c; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; margin-top: 20px;">Start Exploring</a>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">© 2024 Zomato Clone. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', result.response);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail,
};
