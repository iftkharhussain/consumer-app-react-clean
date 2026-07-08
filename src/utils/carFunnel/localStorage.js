/* eslint-disable */
/**
 * LocalStorage utility functions for saving and restoring form data
 * 
 * Data structure:
 * {
 *   cars: [{ index, manufacturer, model, year, ... }],
 *   drivers: [{ index, fullName, dob, ... }],
 *   currentCar: { ...in-progress car data },
 *   currentDriver: { ...in-progress driver data },
 *   navigation: { currentScreenId, screenHistory, navigationHistory, currentVehicleIndex, currentDriverIndex }
 * }
 */

const STORAGE_KEY = 'norga_consumer_app_data';

/**
 * Save all app data to localStorage
 * @param {Object} data - The complete app state
 * @returns {boolean} - Success status
 */
export const saveFormData = (data) => {
    try {
        const serialized = JSON.stringify(data);
        localStorage.setItem(STORAGE_KEY, serialized);
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        if (error.name === 'QuotaExceededError') {
            console.warn('LocalStorage quota exceeded. Consider clearing old data.');
        }
        return false;
    }
};

/**
 * Load all app data from localStorage
 * @returns {Object|null} - The loaded data or null if not found
 */
export const loadFormData = () => {
    try {
        const serialized = localStorage.getItem(STORAGE_KEY);
        if (serialized === null) {
            return null;
        }
        return JSON.parse(serialized);
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        return null;
    }
};

/**
 * Save data for current car being edited
 * @param {string} screenId - The screen ID (e.g., 'auto-1', '2-auto1')
 * @param {Object} values - The form values to save
 * @returns {boolean} - Success status
 */
export const saveCurrentCarData = (screenId, values) => {
    try {
        const data = loadFormData() || { cars: [], drivers: [], currentCar: {}, currentDriver: {}, navigation: {} };
        data.currentCar = { ...data.currentCar, [screenId]: values };
        return saveFormData(data);
    } catch (error) {
        console.error('Error saving current car data:', error);
        return false;
    }
};

/**
 * Save data for current driver being edited
 * @param {string} screenId - The screen ID (e.g., '1-driver1', '2-driver1')
 * @param {Object} values - The form values to save
 * @returns {boolean} - Success status
 */
export const saveCurrentDriverData = (screenId, values) => {
    try {
        const data = loadFormData() || { cars: [], drivers: [], currentCar: {}, currentDriver: {}, navigation: {} };
        data.currentDriver = { ...data.currentDriver, [screenId]: values };
        return saveFormData(data);
    } catch (error) {
        console.error('Error saving current driver data:', error);
        return false;
    }
};

/**
 * Complete current car and add to cars array
 * @param {Object} carData - Complete car data object
 * @returns {boolean} - Success status
 */
export const completeCurrentCar = (carData) => {
    try {
        const data = loadFormData() || { cars: [], drivers: [], currentCar: {}, currentDriver: {}, navigation: {} };
        data.cars = [...data.cars, carData];
        data.currentCar = {}; // Clear current car data
        return saveFormData(data);
    } catch (error) {
        console.error('Error completing current car:', error);
        return false;
    }
};

/**
 * Complete current driver and add to drivers array
 * @param {Object} driverData - Complete driver data object
 * @returns {boolean} - Success status
 */
export const completeCurrentDriver = (driverData) => {
    try {
        const data = loadFormData() || { cars: [], drivers: [], currentCar: {}, currentDriver: {}, navigation: {} };
        data.drivers = [...data.drivers, driverData];
        data.currentDriver = {}; // Clear current driver data
        return saveFormData(data);
    } catch (error) {
        console.error('Error completing current driver:', error);
        return false;
    }
};

/**
 * Get current car data
 * @returns {Object} - Current car data
 */
export const getCurrentCarData = () => {
    try {
        const data = loadFormData();
        return data?.currentCar || {};
    } catch (error) {
        console.error('Error getting current car data:', error);
        return {};
    }
};

/**
 * Get current driver data
 * @returns {Object} - Current driver data
 */
export const getCurrentDriverData = () => {
    try {
        const data = loadFormData();
        return data?.currentDriver || {};
    } catch (error) {
        console.error('Error getting current driver data:', error);
        return {};
    }
};

/**
 * Get all completed cars
 * @returns {Array} - Array of completed cars
 */
export const getCompletedCars = () => {
    try {
        const data = loadFormData();
        return data?.cars || [];
    } catch (error) {
        console.error('Error getting completed cars:', error);
        return [];
    }
};

/**
 * Get all completed drivers
 * @returns {Array} - Array of completed drivers
 */
export const getCompletedDrivers = () => {
    try {
        const data = loadFormData();
        return data?.drivers || [];
    } catch (error) {
        console.error('Error getting completed drivers:', error);
        return [];
    }
};

/**
 * Save navigation state
 * @param {Object} navigationState - Navigation state object
 * @returns {boolean} - Success status
 */
export const saveNavigationState = (navigationState) => {
    try {
        const data = loadFormData() || { cars: [], drivers: [], currentCar: {}, currentDriver: {}, navigation: {} };
        data.navigation = navigationState;
        return saveFormData(data);
    } catch (error) {
        console.error('Error saving navigation state:', error);
        return false;
    }
};

/**
 * Clear form data from localStorage
 * @returns {boolean} - Success status
 */
export const clearFormData = () => {
    try {
        localStorage.removeItem(STORAGE_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing localStorage:', error);
        return false;
    }
};

/**
 * Update a specific field in the stored data
 * @param {string} key - The key to update
 * @param {any} value - The value to set
 * @returns {boolean} - Success status
 */
export const updateFormField = (key, value) => {
    try {
        const data = loadFormData() || {};
        data[key] = value;
        return saveFormData(data);
    } catch (error) {
        console.error('Error updating form field:', error);
        return false;
    }
};
