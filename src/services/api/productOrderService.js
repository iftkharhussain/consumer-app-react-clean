/**
 * Product Order Service
 * Handles product order API calls
 */

import apiClient from './client';

/**
 * Get product order details by userProductId
 * @param {string} userProductId - User product ID
 * @returns {Promise<Object>} Order details with selectedQuote
 */
export const getOrderDetails = async (userProductId) => {
  const response = await apiClient.get(`/api/product-order/${userProductId}`);
  return response.data;
};

/**
 * Check if user has pending order for a product
 * @param {string} productSlug - Product slug (e.g., 'car-insurance')
 * @returns {Promise<Object>} { hasPendingOrder, userProductId?, requestedAt? }
 */
export const checkPendingOrder = async (productSlug) => {
  const response = await apiClient.get('/api/product-order/check', {
    params: { productSlug }
  });
  return response.data;
};

/**
 * Get user's product orders
 * @param {string} productSlug - Optional product slug filter
 * @param {string} status - Optional status filter
 * @returns {Promise<Object>} List of orders
 */
export const getUserOrders = async (productSlug = null, status = null) => {
  const params = {};
  if (productSlug) params.productSlug = productSlug;
  if (status) params.status = status;
  
  const response = await apiClient.get('/api/product-order', { params });
  return response.data;
};

/**
 * Update order status
 * @param {string} orderId - Order ID
 * @param {string} status - New status
 * @param {Object} metadata - Optional metadata
 * @returns {Promise<Object>} Updated order
 */
export const updateOrderStatus = async (orderId, status, metadata = null) => {
  const response = await apiClient.put(`/api/product-order/${orderId}`, {
    status,
    metadata
  });
  return response.data;
};

const productOrderService = {
  getOrderDetails,
  checkPendingOrder,
  getUserOrders,
  updateOrderStatus
};

export default productOrderService;
