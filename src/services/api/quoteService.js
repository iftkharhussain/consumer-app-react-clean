/**
 * Quote Service - API calls for quote management
 */

import apiClient from './client';

/**
 * Fetch quote for a product - single endpoint that handles everything
 * This will:
 * 1. Find user's product
 * 2. Check if quote exists (return it)
 * 3. If not, request from LMS and return result
 * 
 * @param {string} productSlug - Product slug (e.g., 'car-insurance')
 * @returns {Promise<Object>} Quote response with carriers
 */
export const fetchQuote = async (productSlug) => {
  try {
    const response = await apiClient.get('/api/quote/fetch', {
      params: { productSlug }
    });
    return response.data;
  } catch (error) {
    console.error('[quoteService] fetchQuote ERROR:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url
    });
    throw error;
  }
};

/**
 * Request a quote for a product (legacy - use fetchQuote instead)
 * @param {Object} params - { productSlug: string } or { userProductId: string }
 * @returns {Promise<Object>} Quote request response
 */
export const requestQuote = async (params) => {
  const response = await apiClient.post('/api/quote/request', params);
  return response.data;
};

/**
 * Get all user products with quote statuses
 * @returns {Promise<Object>} List of user products
 */
export const getUserProducts = async () => {
  const response = await apiClient.get('/api/quote/products');
  return response.data;
};

/**
 * Get quote status for a specific product
 * @param {string} userProductId - User product ID
 * @returns {Promise<Object>} Quote status
 */
export const getQuoteStatus = async (userProductId) => {
  const response = await apiClient.get(`/api/quote/status/${userProductId}`);
  return response.data;
};

/**
 * Get quote status by product slug
 * @param {string} productSlug - Product slug (e.g., 'car-insurance')
 * @returns {Promise<Object>} Quote status
 */
export const getQuoteStatusBySlug = async (productSlug) => {
  const response = await apiClient.get('/api/quote/status', {
    params: { productSlug }
  });
  return response.data;
};

/**
 * Get full quote details from LMS
 * @param {string} userProductId - User product ID
 * @returns {Promise<Object>} Full quote details with carrier results
 */
export const getQuoteDetails = async (userProductId) => {
  const response = await apiClient.get(`/api/quote/details/${userProductId}`);
  return response.data;
};

// ============================================
// ASYNC POLLING ENDPOINTS (Jan 2026)
// ============================================

/**
 * Poll quote status by quoteId (Async Polling Pattern)
 * 
 * Call this every 5 seconds after requesting a quote until status is:
 * - 'success': Quote completed successfully, includes carriers data
 * - 'failed': Quote request failed
 * - 'timeout': Quote timed out
 * 
 * @param {string} quoteId - The quote ID returned from requestQuote
 * @returns {Promise<Object>} Quote status with carriers if complete
 */
export const checkQuoteStatus = async (quoteId) => {
  const response = await apiClient.get(`/api/quote/poll/${quoteId}`);
  return response.data;
};

/**
 * Get all quotes for a lead
 * @param {string} leadId - Lead ID
 * @returns {Promise<Object>} List of quote records
 */
export const getQuotesByLead = async (leadId) => {
  const response = await apiClient.get(`/api/quote/by-lead/${leadId}`);
  return response.data;
};

// ============================================
// RECALCULATE QUOTE (TEMPORARY - NO DB SAVE)
// ============================================

/**
 * Request a recalculated quote with modified coverages
 * 
 * Used when user modifies protection settings in the customize page.
 * Returns temporary quote data - NOT saved to database.
 * Quote only gets persisted when user clicks "Demander un appel".
 * 
 * @param {string} userProductId - User product ID
 * @param {Object} protections - Modified protection settings
 * @returns {Promise<Object>} Temporary quote response
 */
export const recalculateQuote = async (userProductId, protections) => {
  const response = await apiClient.post('/api/quote/recalculate', {
    userProductId,
    protections
  });
  return response.data;
};

export default {
  fetchQuote,
  requestQuote,
  getUserProducts,
  getQuoteStatus,
  getQuoteStatusBySlug,
  getQuoteDetails,
  // Async polling
  checkQuoteStatus,
  getQuotesByLead,
  // Recalculate
  recalculateQuote
};
