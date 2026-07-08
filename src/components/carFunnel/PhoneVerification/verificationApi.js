/* eslint-disable */
/**
 * API service for phone verification
 * Handles OTP sending and verification
 */

import { USE_MOCK_DATA } from 'config/carFunnel/config';

const API_BASE_URL = 'https://norga.app/api/v1/funnels/phone/verification';

/**
 * Send OTP to phone number
 * @param {Object} params - Parameters for sending OTP
 * @param {string} params.phoneNumber - Phone number with country code
 * @param {string} params.channel - Channel to send OTP ('sms' or 'voice')
 * @param {string} params.locale - Language locale ('fr' or 'en')
 * @param {string} params.email - Optional email for logging
 * @returns {Promise<Object>} - Response from API
 */
export const sendOtp = async ({ phoneNumber, channel, locale = 'fr', email }) => {
  if (USE_MOCK_DATA) {
    await new Promise((r) => setTimeout(r, 400));
    return { success: true, message: 'OTP sent (mock)', isTestNumber: true };
  }
  const response = await fetch(`${API_BASE_URL}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phoneNumber,
      channel,
      locale,
      email
    }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to send OTP');
  }
  
  return data;
};

/**
 * Verify OTP code
 * @param {Object} params - Parameters for verification
 * @param {string} params.otp - OTP code entered by user
 * @param {string} params.phoneNumber - Phone number that received the OTP
 * @param {string} params.channel - Channel used to send OTP
 * @param {string} params.locale - Language locale
 * @param {string} params.email - Optional email for logging
 * @returns {Promise<Object>} - Response from API
 */
export const verifyOtp = async ({ otp, phoneNumber, channel, locale = 'fr', email }) => {
  if (USE_MOCK_DATA) {
    await new Promise((r) => setTimeout(r, 300));
    return { success: true, message: 'OTP verified (mock)', isTestNumber: true };
  }
  const params = new URLSearchParams({
    otp,
    phoneNumber,
    channel,
    locale,
    ...(email && { email })
  });
  
  const response = await fetch(`${API_BASE_URL}?${params.toString()}`);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to verify OTP');
  }
  
  return data;
};

/**
 * Test phone number utilities
 */

// Read test configuration from environment
const TEST_MODE_ENABLED = window.PHONE_VERIFICATION_TEST_MODE;
const TEST_PHONE_NUMBERS = (window.TEST_PHONE_NUMBERS || '5551234567,5555555555').split(',').map(n => n.trim());
const TEST_OTP_CODE = window.TEST_OTP_CODE || '1234';

/**
 * Check if test mode is globally enabled
 * @returns {boolean}
 */
export const isTestModeEnabled = () => TEST_MODE_ENABLED;

/**
 * Check if a phone number is a test number
 * @param {string} phoneNumber - Phone number to check
 * @param {string[]} testNumbers - Array of test phone numbers (optional, uses env config if not provided)
 * @returns {boolean}
 */
export const isTestPhoneNumber = (phoneNumber, testNumbers = TEST_PHONE_NUMBERS) => {
  // If global test mode is enabled, all numbers are treated as test numbers
  if (TEST_MODE_ENABLED) {
    return true;
  }
  
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return false;
  }
  
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  return testNumbers.some(testNum => cleanPhone.includes(testNum));
};

/**
 * Get the test OTP code
 * @returns {string}
 */
export const getTestOtpCode = () => TEST_OTP_CODE;

/**
 * Get test phone numbers from config
 * @returns {string[]}
 */
export const getTestPhoneNumbers = () => TEST_PHONE_NUMBERS;

/**
 * Simulate OTP sending for test numbers
 * @param {string} phoneNumber - Phone number
 * @param {string} channel - Channel
 * @returns {Promise<Object>}
 */
export const sendTestOtp = async (phoneNumber, channel) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    success: true,
    message: 'Test OTP sent successfully',
    isTestNumber: true
  };
};

/**
 * Simulate OTP verification for test numbers
 * @param {string} otp - OTP entered by user
 * @returns {Promise<Object>}
 */
export const verifyTestOtp = async (otp) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const testOtpCode = getTestOtpCode();
  
  if (otp === testOtpCode) {
    return {
      success: true,
      message: 'Test OTP verified successfully',
      isTestNumber: true
    };
  } else {
    throw new Error(`Invalid test OTP. Expected: ${testOtpCode}`);
  }
};

export default {
  sendOtp,
  verifyOtp,
  isTestPhoneNumber,
  getTestOtpCode,
  sendTestOtp,
  verifyTestOtp
};
