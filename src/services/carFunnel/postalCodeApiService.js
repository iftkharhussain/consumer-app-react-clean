/* eslint-disable */
/**
 * Postal Code API Service
 * Handles API calls to fetch location index from postal codes
 */
import { USE_MOCK_DATA } from 'config/carFunnel/config';

const API_BASE_URL = window.API_URL || 'http://localhost:3000/api';

class PostalCodeApiService {
  /**
   * Get location index by postal code
   * @param {string} postalCode - Postal code (with or without space, e.g., "H3C 0S5" or "H3C0S5")
   * @returns {Promise<Object>} { gcpcid, fsa, city }
   */
  async getLocationIndex(postalCode) {
    if (USE_MOCK_DATA) {
      return { success: true, gcpcid: '0000', fsa: (postalCode || 'H3C').replace(/\s/g, '').slice(0, 3).toUpperCase(), city: 'Montréal' };
    }
    try {
      const response = await fetch(`${API_BASE_URL}/postal-codes/location-index?postalCode=${encodeURIComponent(postalCode)}`);
      const result = await response.json();

      // Return the full result so caller can check success/message
      return result;
    } catch (error) {
      console.error('Get location index error:', error);
      return { success: false, message: 'Erreur de connexion' };
    }
  }

  /**
   * Get location index from full address
   * @param {string} address - Full address string
   * @returns {Promise<Object>} { gcpcid, fsa, city, postalCode }
   */
  async getLocationIndexFromAddress(address) {
    if (USE_MOCK_DATA) {
      return { gcpcid: '0000', fsa: 'H3C', city: 'Montréal', postalCode: 'H3C0S5' };
    }
    try {
      const response = await fetch(`${API_BASE_URL}/postal-codes/location-index-from-address`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.warn('No postal code found in address:', address);
        return null;
      }

      return result.data;
    } catch (error) {
      console.error('Get location index from address error:', error);
      return null;
    }
  }

  /**
   * Extract postal code from address string
   * @param {string} address - Full address string
   * @returns {string|null} - Postal code or null
   */
  extractPostalCode(address) {
    if (!address || typeof address !== 'string') {
      return null;
    }

    // Canadian postal code pattern: A1A 1A1 or A1A1A1
    const postalCodeRegex = /([A-Z]\d[A-Z]\s?\d[A-Z]\d)/gi;
    const match = address.match(postalCodeRegex);

    if (match && match.length > 0) {
      return match[0].replace(/\s/g, '').toUpperCase();
    }

    return null;
  }
}

export default new PostalCodeApiService();
