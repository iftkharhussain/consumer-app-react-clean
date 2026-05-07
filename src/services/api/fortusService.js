/**
 * Fortus Leads Service - API calls for Fortus Leads integration
 * 
 * Handles communication with Consumer App API for Fortus Leads:
 * - Request a call (send lead to Fortus when consumer clicks "Demander un appel")
 * - Get office hours (display office hours info to consumer)
 */

import apiClient from './client';

/**
 * Request a call - sends lead to Fortus Leads platform
 * 
 * Called when consumer clicks "Demander un appel" button.
 * 
 * @param {Object} params - { productSlug: string, userProductId?: string, carrierCode?: string }
 * @returns {Promise<Object>} { success, message, data: { fortusLeadId, status } }
 */
export const requestCall = async (params) => {
  try {
    const response = await apiClient.post('/api/fortus/request-call', params);
    return response.data;
  } catch (error) {
    console.error('[fortusService] requestCall ERROR:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
    // Return structured error response
    return {
      success: false,
      message: error.response?.data?.message || 'Une erreur est survenue lors de l\'envoi de votre demande.',
      error: error.response?.data?.error || 'UNKNOWN_ERROR'
    };
  }
};

/**
 * Get office hours for current user's product
 * 
 * Used to display office hours info to consumer before they request a call.
 * 
 * @param {Object} params - { productSlug: string } or { userProductId: string }
 * @returns {Promise<Object>} { success, data: { officeHours, isCurrentlyOpen, timezone, configured } }
 */
export const getOfficeHours = async (params) => {
  try {
    const response = await apiClient.get('/api/fortus/office-hours', { params });
    return response.data;
  } catch (error) {
    console.error('[fortusService] getOfficeHours ERROR:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
    // Return default values if error
    return {
      success: true,
      data: {
        officeHours: null,
        isCurrentlyOpen: true, // Default to open
        timezone: 'America/Toronto',
        configured: false
      }
    };
  }
};

/**
 * Track call or meeting event for analytics
 * 
 * Called after ezLead is successfully sent on confirmation pages.
 * Prevents duplicate tracking on page reload.
 * 
 * @param {string} userProductId - User product ID
 * @param {string} eventType - 'call' or 'meeting'
 * @returns {Promise<Object>} { success, message, recordId?, alreadyExists? }
 */
export const trackEvent = async (userProductId, eventType) => {
  try {
    const response = await apiClient.post('/api/fortus/track-event', {
      userProductId,
      eventType
    });
    return response.data;
  } catch (error) {
    console.error('[fortusService] trackEvent ERROR:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      userProductId,
      eventType
    });
    
    // Return error response (don't throw - tracking failure shouldn't break UI)
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to track event'
    };
  }
};

// Named export for object-style import
export const fortusService = {
  requestCall,
  getOfficeHours,
  trackEvent
};

export default fortusService;
