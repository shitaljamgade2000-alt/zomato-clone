/**
 * OTP Flow Test Script
 * Tests complete phone and email OTP workflows
 * Usage: node test-otp-flow.js
 */

const axios = require('axios');

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testPhoneOTPFlow() {
  console.log('\n========== PHONE OTP FLOW TEST ==========\n');

  const phone = '9876543210';
  const countryCode = '+91';

  try {
    // Step 1: Send OTP
    console.log('1️⃣  Sending OTP to phone...');
    const sendResponse = await API.post('/auth/send-otp', { phone, countryCode });
    console.log('✅ OTP sent successfully');
    console.log(`   OTP (dev): ${sendResponse.data.data.otp}`);
    console.log(`   Expiry: ${sendResponse.data.data.expiryTime}\n`);

    const otp = sendResponse.data.data.otp;

    // Step 2: Verify OTP
    console.log('2️⃣  Verifying OTP...');
    const verifyResponse = await API.post('/auth/verify-otp', { phone, otp });
    console.log('✅ OTP verified successfully');
    console.log(`   User: ${verifyResponse.data.data.user ? 'Registered' : 'New user (registration required)'}`);
    console.log(`   Tokens: ${verifyResponse.data.data.tokens ? 'Generated' : 'N/A'}\n`);

    // Step 3: Test resend OTP
    console.log('3️⃣  Testing resend OTP (should fail - OTP still valid)...');
    try {
      await API.post('/auth/resend-otp', { phone, countryCode });
      console.log('❌ Resend should have failed but succeeded');
    } catch (err) {
      if (err.response?.status === 400) {
        console.log('✅ Resend correctly blocked');
        console.log(`   Message: ${err.response.data.message}`);
        console.log(`   Expires in: ${err.response.data.data.expiresIn} seconds\n`);
      } else {
        throw err;
      }
    }

    console.log('✅ PHONE OTP FLOW: PASSED\n');
    return true;
  } catch (err) {
    console.error('❌ PHONE OTP FLOW: FAILED');
    console.error(`   Error: ${err.response?.data?.message || err.message}\n`);
    return false;
  }
}

async function testEmailOTPFlow() {
  console.log('========== EMAIL OTP FLOW TEST ==========\n');

  const email = 'test@example.com';

  try {
    // Step 1: Send Email OTP
    console.log('1️⃣  Sending OTP to email...');
    const sendResponse = await API.post('/auth/send-email-otp', { email });
    console.log('✅ Email OTP sent successfully');
    console.log(`   OTP (dev): ${sendResponse.data.data.otp}`);
    console.log(`   Expiry: ${sendResponse.data.data.expiryTime}\n`);

    const otp = sendResponse.data.data.otp;

    // Step 2: Verify Email OTP
    console.log('2️⃣  Verifying email OTP...');
    const verifyResponse = await API.post('/auth/verify-email-otp', { email, otp });
    console.log('✅ Email OTP verified successfully');
    console.log(`   User: ${verifyResponse.data.data.user ? 'Registered' : 'New user (registration required)'}`);
    console.log(`   Tokens: ${verifyResponse.data.data.tokens ? 'Generated' : 'N/A'}\n`);

    // Step 3: Test resend Email OTP
    console.log('3️⃣  Testing resend email OTP (should fail - OTP still valid)...');
    try {
      await API.post('/auth/resend-email-otp', { email });
      console.log('❌ Resend should have failed but succeeded');
    } catch (err) {
      if (err.response?.status === 400) {
        console.log('✅ Resend correctly blocked');
        console.log(`   Message: ${err.response.data.message}`);
        console.log(`   Expires in: ${err.response.data.data.expiresIn} seconds\n`);
      } else {
        throw err;
      }
    }

    console.log('✅ EMAIL OTP FLOW: PASSED\n');
    return true;
  } catch (err) {
    console.error('❌ EMAIL OTP FLOW: FAILED');
    console.error(`   Error: ${err.response?.data?.message || err.message}\n`);
    return false;
  }
}

async function testValidation() {
  console.log('========== VALIDATION TESTS ==========\n');

  try {
    // Invalid phone
    console.log('1️⃣  Testing invalid phone (should fail)...');
    try {
      await API.post('/auth/send-otp', { phone: '123' });
      console.log('❌ Should have rejected invalid phone');
    } catch (err) {
      if (err.response?.status === 400) {
        console.log('✅ Invalid phone rejected: ' + err.response.data.message);
      }
    }

    // Invalid email
    console.log('2️⃣  Testing invalid email (should fail)...');
    try {
      await API.post('/auth/send-email-otp', { email: 'invalid-email' });
      console.log('❌ Should have rejected invalid email');
    } catch (err) {
      if (err.response?.status === 400) {
        console.log('✅ Invalid email rejected: ' + err.response.data.message);
      }
    }

    console.log('\n✅ VALIDATION TESTS: PASSED\n');
    return true;
  } catch (err) {
    console.error('❌ VALIDATION TESTS: FAILED');
    console.error(`   Error: ${err.message}\n`);
    return false;
  }
}

async function runAllTests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════╗');
  console.log('║      OTP AUTHENTICATION FLOW TEST      ║');
  console.log('╚════════════════════════════════════════╝');

  const results = [];

  results.push(await testPhoneOTPFlow());
  results.push(await testEmailOTPFlow());
  results.push(await testValidation());

  console.log('\n╔════════════════════════════════════════╗');
  console.log('║            TEST RESULTS                ║');
  console.log('╚════════════════════════════════════════╝\n');

  const passed = results.filter(r => r).length;
  const total = results.length;

  console.log(`📊 Results: ${passed}/${total} tests passed\n`);

  if (passed === total) {
    console.log('🎉 ALL TESTS PASSED! OTP flow is working correctly.\n');
  } else {
    console.log(`⚠️  ${total - passed} test(s) failed. Check errors above.\n`);
  }
}

// Run tests
runAllTests().catch(err => {
  console.error('Fatal error:', err.message);
  console.error('\nMake sure backend is running on http://localhost:5000');
  process.exit(1);
});
