const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const OTPVerification = sequelize.define('OTPVerification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isEmail: true,
    },
  },
  otp: {
    type: DataTypes.STRING(6),
    allowNull: false,
    validate: {
      isNumeric: true,
      len: [6, 6],
    },
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  is_used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  verification_type: {
    type: DataTypes.ENUM('phone', 'email'),
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'otp_verifications',
  timestamps: false,
  underscored: true,
});

// Check if OTP is expired
OTPVerification.prototype.isExpired = function() {
  return new Date() > this.expires_at;
};

module.exports = OTPVerification;
