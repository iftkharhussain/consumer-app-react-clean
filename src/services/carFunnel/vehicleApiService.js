/* eslint-disable */
/**
 * Vehicle API Service
 * Handles all API calls to the backend vehicle endpoints.
 *
 * UI/UX phase: when USE_MOCK_DATA is true, the year/make/model/VIN lookups
 * return hardcoded data (mockVehicleData.js) instead of hitting the backend.
 * Flip USE_MOCK_DATA in config/carFunnel/config.js to go live.
 */

import { USE_MOCK_DATA } from 'config/carFunnel/config';
import { YEARS, MAKES, buildMockModels, MOCK_VIN_RESULT } from './mockVehicleData';

const API_BASE_URL = window.API_URL || 'http://localhost:3000/api';

// Resolve a mock value after a short delay so loading spinners still show.
const mockDelay = (value, ms = 200) => new Promise((resolve) => setTimeout(() => resolve(value), ms));

class VehicleApiService {
  /**
   * Check vehicle data loading status
   * @returns {Promise<Object>} Status object
   */
  async getStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles/status`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to get status');
      }

      return result.data;
    } catch (error) {
      console.error('Get status error:', error);
      throw error;
    }
  }

  /**
   * Look up vehicle by VIN
   * @param {string} vin - VIN number (full or partial)
   * @returns {Promise<Array>} Array of matching vehicles
   */
  async lookupVIN(vin) {
    if (USE_MOCK_DATA) return mockDelay(MOCK_VIN_RESULT);
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles/vin/${vin}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to lookup VIN');
      }

      return result.data.map(vehicle => {
        if (typeof vehicle !== 'object' || vehicle === null) return vehicle;
        return {
          ...vehicle,
          label: this._cleanString(vehicle.label || vehicle.model),
          model: this._cleanString(vehicle.model),
          modelFr: this._cleanString(vehicle.modelFr)
        };
      });
    } catch (error) {
      console.error('VIN lookup error:', error);
      throw error;
    }
  }

  /**
   * Get list of all available years
   * @returns {Promise<Array<number>>} Array of years
   */
  async getYears() {
    if (USE_MOCK_DATA) return mockDelay([...YEARS]);
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles/years`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch years');
      }

      return result.data;
    } catch (error) {
      console.error('Get years error:', error);
      throw error;
    }
  }

  /**
   * Get list of makes (optionally filtered by year)
   * @param {number} year - Optional year filter
   * @returns {Promise<Array<string>>} Array of make names
   */
  async getMakes(year = null) {
    if (USE_MOCK_DATA) return mockDelay(MAKES.map((m) => ({ value: m, label: m })));
    try {
      const url = year
        ? `${API_BASE_URL}/vehicles/makes?year=${year}`
        : `${API_BASE_URL}/vehicles/makes`;

      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch makes');
      }

      return result.data.map(make => {
        if (typeof make === 'string') return this._cleanString(make);
        if (typeof make === 'object' && make !== null) {
          return {
            ...make,
            label: this._cleanString(make.label),
          };
        }
        return make;
      });
    } catch (error) {
      console.error('Get makes error:', error);
      throw error;
    }
  }

  /**
   * Cleans strings by removing replacement characters and fixing common encoding issues
   * @param {string} str - String to clean
   * @returns {string} Cleaned string
   */
  _cleanString(str) {
    if (!str || typeof str !== 'string') return str;
    // Remove the replacement character \uFFFD (often shown as )
    return str.replace(/\uFFFD/g, '');
  }

  /**
   * Get list of models for a specific year and make
   * @param {number} year - Model year
   * @param {string} make - Manufacturer name
   * @returns {Promise<Array<Object>>} Array of model objects with full data
   */
  async getModels(year, make) {
    if (USE_MOCK_DATA) return mockDelay(buildMockModels(year, make));
    try {
      const url = `${API_BASE_URL}/vehicles/models?year=${year}&make=${encodeURIComponent(make)}`;
      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch models');
      }

      // Transform the data to include fullData for each model and clean strings
      return result.data.map((model, index) => {
        const cleanedLabel = this._cleanString(model.label || model.model);
        const cleanedModel = this._cleanString(model.model);
        const cleanedModelFr = this._cleanString(model.modelFr);

        return {
          value: (model.viccCode !== undefined && model.extVicc !== undefined) ? `${model.viccCode}-${model.extVicc}` : (model.viccCode || model.extVicc || model.value || `model-${index}`),
          label: cleanedLabel,
          fullData: {
            viccCode: model.viccCode,
            extVicc: model.extVicc,
            model: cleanedModel,
            modelFr: cleanedModelFr,
            label: cleanedLabel,
            bodyStyle: model.bodyStyle,
            bodyType: model.bodyType,
            cylinder: model.cylinder,
            fuelType: model.fuelType,
            year: year,
            make: make
          }
        };
      });
    } catch (error) {
      console.error('Get models error:', error);
      throw error;
    }
  }

  /**
   * Get full vehicle details by VICC codes
   * @param {number} year - Model year
   * @param {number} viccCode - VICC code
   * @param {number} extVicc - Extended VICC
   * @returns {Promise<Object>} Vehicle details
   */
  async getVehicleDetails(year, viccCode, extVicc) {
    try {
      const url = `${API_BASE_URL}/vehicles/details?year=${year}&viccCode=${viccCode}&extVicc=${extVicc}`;
      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch vehicle details');
      }

      return result.data;
    } catch (error) {
      console.error('Get vehicle details error:', error);
      throw error;
    }
  }

  /**
   * Search vehicles by multiple criteria
   * @param {Object} criteria - Search criteria
   * @returns {Promise<Array<Object>>} Array of matching vehicles
   */
  async searchVehicles(criteria) {
    try {
      const params = new URLSearchParams();

      Object.keys(criteria).forEach(key => {
        if (criteria[key] !== undefined && criteria[key] !== null && criteria[key] !== '') {
          params.append(key, criteria[key]);
        }
      });

      const url = `${API_BASE_URL}/vehicles/search?${params.toString()}`;
      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to search vehicles');
      }

      return result.data;
    } catch (error) {
      console.error('Search vehicles error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new VehicleApiService();
