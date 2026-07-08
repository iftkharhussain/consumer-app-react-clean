/* eslint-disable */
/**
 * Form Submission API Service
 * Handles submitting the complete form data after phone verification
 */

import dayjs from 'dayjs';
import { buildLabeledVehicleData, buildLabeledDriverData } from 'utils/carFunnel/labeledDataBuilder';
import { USE_MOCK_DATA } from 'config/carFunnel/config';

// Use the global FORM_SUBMISSION_API constant from index.html
const FORM_SUBMISSION_API_URL = window.FORM_SUBMISSION_API || 'https://norga.app/api/v1/funnels/submit';

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

/**
 * Build submission payload from Redux state
 * Uses the labeled data builder utilities to format data properly
 * @param {Object} reduxState - The Redux state object
 * @returns {Object} - Formatted payload for API
 */
export const buildSubmissionPayload = (reduxState) => {
  const { form } = reduxState || {};
  const { vehicles = [], drivers = [], contactData = {} } = form || {};

  // Format vehicles using the labeled data builder
  // The builder expects the format: { 'auto-1': {...}, '2-auto1': {...}, etc. }
  const formattedVehicles = vehicles
    .filter(vehicle => Object.keys(vehicle).length > 0)
    .map((vehicle, index) => {
      // Use the existing utility that knows how to format vehicle data
      return buildLabeledVehicleData(vehicle, index);
    });

  // Format drivers using the labeled data builder
  // The builder expects the format: { '1-driver1': {...}, '2-driver1': {...}, etc. }
  const formattedDrivers = drivers
    .filter(driver => Object.keys(driver).length > 0)
    .map((driver, index) => {
      // Use the existing utility that knows how to format driver data
      return buildLabeledDriverData(driver, index);
    });

  return {
    cars: formattedVehicles,
    drivers: formattedDrivers,
    contactData
  };
};

// Legacy function - kept for backwards compatibility but deprecated
export const getStoredFormData = () => {
  console.warn('getStoredFormData is deprecated - using Redux state instead');
  return null;
};

/**
 * Submit form data to API
 * @param {Object} params - Submission parameters
 * @param {Object} params.reduxState - The Redux state object
 * @param {Object} params.verification - Verification details (phone, channel, etc.)
 * @returns {Promise<Object>} - Response with redirect URL
 */
export const submitFormData = async ({ reduxState, verification }) => {
  if (USE_MOCK_DATA) {
    await new Promise((r) => setTimeout(r, 500));
    return { success: true, message: 'Submitted (mock)' };
  }
  try {
    if (!reduxState) {
      throw new Error('Redux state is required for form submission');
    }

    // Build submission payload from Redux state
    const formatted = buildSubmissionPayload(reduxState);
    const cars = formatted.cars;
    const drivers = formatted.drivers;
    const contactInfoData = formatted.contactData;

    const contactEmail = contactInfoData.email || '';
    const contactPhone = contactInfoData.phone || '';
    const contactFullName = contactInfoData.fullName || '';

    // Use verification phone (with country code) or fallback to contact phone
    const verifiedPhone = verification.phone || contactPhone;
    // Use contact-info email as primary, verification email as fallback
    const email = contactEmail || verification.email || '';

    const event_id = 'norga_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // 2. Push to dataLayer for GTM to capture
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        'event': 'meta_event_id_generated',
        'event_id': event_id
      });

    }

    // 3. Capture tracking cookies
    const fbp = getCookie('_fbp');
    const fbc = getCookie('_fbc');
    const fpid = getCookie('FPID');

    const payload = {
      // Tracking data
      event_id,
      fbp,
      fbc,
      fpid,

      // Form data
      cars,
      drivers,

      // Contact info at root level
      phone: verifiedPhone,
      email: email,
      fullName: contactFullName,

      // Consent data
      consentChecked: contactInfoData.consentChecked || false,
      creditCheckConsent: contactInfoData.creditCheckConsent || false,

      // Verification metadata (without phone/email duplication)
      verification: {
        channel: verification.channel,
        verifiedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        isTestNumber: verification.isTestNumber || false
      },

      // Metadata
      submittedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      userAgent: navigator.userAgent,
      locale: 'fr'
    };



    const response = await fetch(FORM_SUBMISSION_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Form submission failed');
    }

    // Normalize redirect URL - support both formats:
    // 1. data.redirect.url (from lead system with cross-app auth)
    // 2. data.redirectUrl or data.url (legacy format)
    if (data.redirect?.url) {
      data.redirectUrl = data.redirect.url;
    }

    // Attach event_id to the response so the UI can use it for redirect parameters or pixel events
    data.event_id = event_id;

    return data;
  } catch (error) {
    console.error('Form submission error:', error);
    throw error;
  }
};

// Deprecated - Redux state is managed by the store
export const clearFormData = () => {
  console.warn('clearFormData is deprecated - Redux state is managed by the store');
  return true;
};

export default {
  submitFormData,
  buildSubmissionPayload
};
