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
  const response = await apiClient.get('/api/quote/fetch', {
    params: { productSlug }
  });
  return response.data;
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

export default {
  fetchQuote,
  requestQuote,
  getUserProducts,
  getQuoteStatus,
  getQuoteStatusBySlug,
  getQuoteDetails
};
