/**
 * Vehicle Service - API calls for vehicle data
 */

import apiClient from './client';

/**
 * Get user's vehicles from their products
 * 
 * @param {string} productSlug - Product slug (e.g., 'car-insurance')
 * @param {string} userProductId - User product ID (optional, prioritized over productSlug)
 * @returns {Promise<Object>} Response with vehicles array
 */
export const getUserVehicles = async (productSlug, userProductId = null) => {
  try {
    const params = {};
    if (userProductId) {
      params.userProductId = userProductId;
    } else if (productSlug) {
      params.productSlug = productSlug;
    }

    const response = await apiClient.get('/api/vehicles/user', { params });
    return response.data;
  } catch (error) {
    console.error('[vehicleService] getUserVehicles ERROR:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
};
