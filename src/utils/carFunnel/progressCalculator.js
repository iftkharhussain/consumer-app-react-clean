/* eslint-disable */
/**
 * Progress Calculator Utility
 * 
 * Progress bar checkpoints:
 * - Point 1 (Véhicule): 0% - 48% (car summary at 48%)
 * - Point 2 (Conducteur): 48% - 90% (driver first screen at 50%)
 * - Point 3 (Soumission): 90% - 100% (contact-info at 93%)
 * 
 * Progress fills smoothly between checkpoints based on screens completed within each step.
 */

// Checkpoint positions
const CHECKPOINTS = {
  vehicule: { start: 0, end: 48 },      // 0% to 48%
  conducteur: { start: 48, end: 90 },   // 48% to 90%
  soumission: { start: 90, end: 100 },  // 90% to 100%
};

// Screen order within each step
const CAR_SCREEN_ORDER = ['auto-1', '1.1-auto1', '2-auto1', '3-auto1', '4-auto1', '5-auto1'];
const DRIVER_SCREEN_ORDER = ['1-driver1', '2-driver1', '3-driver1', '4-driver1', '5-driver1', '6-driver1', '7-driver1', '8-driver1', '9-driver1', '10-driver1'];
const SUBMISSION_SCREENS = ['contact-info', 'verification'];

// Determine screen type
const getScreenType = (screenId) => {
  if (!screenId) return null;
  if (screenId.includes('auto') || screenId === 'auto-1' || screenId === 'summary-1car') return 'vehicule';
  if (screenId.includes('driver')) return 'conducteur';
  if (screenId === 'contact-info' || screenId === 'verification' || screenId === 'discount') return 'soumission';
  return null;
};

// Get position of car screen (0 to 1)
const getCarScreenPosition = (screenId) => {
  const positions = {
    'auto-1': 0,
    '1.1-auto1': 0.15,
    '2-auto1': 0.3,
    '3-auto1': 0.5,
    '4-auto1': 0.7,
    '5-auto1': 0.9,
    'summary-1car': 1,
  };
  return positions[screenId] !== undefined ? positions[screenId] : 0;
};

// Get position of driver screen (0 to 1)
const getDriverScreenPosition = (screenId) => {
  // Handle sub-screens (3.1-driver1, 5.1-driver1, etc.)
  const baseScreen = screenId?.split('.')[0];
  const isSubScreen = screenId?.includes('.');

  const positions = {
    '1-driver1': 0.05,   // 48% + (0.05 * 42%) = 50.1%
    '2-driver1': 0.15,
    '3-driver1': 0.25,
    '3b-driver1': 0.30,
    '4-driver1': 0.35,
    '5-driver1': 0.45,
    '6-driver1': 0.55,
    '7-driver1': 0.65,
    '8-driver1': 0.75,
    '9-driver1': 0.85,
    '10-driver1': 0.95,
  };

  // Check direct match first
  if (positions[screenId] !== undefined) {
    return positions[screenId];
  }

  // Handle sub-screens by finding base screen position and adding a small offset
  const baseScreenId = baseScreen + '-driver1';
  if (positions[baseScreenId] !== undefined) {
    return Math.min(positions[baseScreenId] + 0.05, 1);
  }

  return 0;
};

// Get position of submission screen (0 to 1)
const getSubmissionScreenPosition = (screenId) => {
  const positions = {
    'discount': 0,        // Start of soumission: 90%
    'contact-info': 0,    // Still stay at 90% to keep gap before dot
    'verification': 0.5,  // Halfway through: 95%
  };
  return positions[screenId] !== undefined ? positions[screenId] : 0;
};

/**
 * Calculate overall progress percentage
 * 
 * @param {string} currentScreenId - Current screen ID
 * @returns {number} Progress percentage (0-100)
 */
export const calculateProgress = ({
  currentScreenId,
  completedCars = 0,
  completedDrivers = 0,
  currentCarIndex = 0,
  currentDriverIndex = 0,
}) => {
  const screenType = getScreenType(currentScreenId);

  if (!screenType) return 0;

  let progress = 0;

  switch (screenType) {
    case 'vehicule': {
      // Progress within Véhicule step (0% - 35%)
      const checkpoint = CHECKPOINTS.vehicule;
      const screenPosition = getCarScreenPosition(currentScreenId);
      const range = checkpoint.end - checkpoint.start;
      progress = checkpoint.start + (screenPosition * range);
      break;
    }

    case 'conducteur': {
      // Progress within Conducteur step (35% - 65%)
      const checkpoint = CHECKPOINTS.conducteur;
      const screenPosition = getDriverScreenPosition(currentScreenId);
      const range = checkpoint.end - checkpoint.start;
      progress = checkpoint.start + (screenPosition * range);
      break;
    }

    case 'soumission': {
      // Progress within Soumission step (65% - 100%)
      const checkpoint = CHECKPOINTS.soumission;
      const screenPosition = getSubmissionScreenPosition(currentScreenId);
      const range = checkpoint.end - checkpoint.start;
      progress = checkpoint.start + (screenPosition * range);
      break;
    }

    default:
      progress = 0;
  }

  return Math.min(Math.round(progress), 100);
};

/**
 * Get current step index (0-3)
 * 
 * @param {string} currentScreenId - Current screen ID
 * @returns {number} Step index (0-3)
 */
export const getCurrentStepIndex = (currentScreenId) => {
  const screenType = getScreenType(currentScreenId);

  switch (screenType) {
    case 'vehicule':
      return 0;
    case 'conducteur':
      return 1;
    case 'soumission':
      return 2;
    default:
      return 0;
  }
};

/**
 * Get steps with their completion status
 * 
 * @param {string} currentScreenId - Current screen ID
 * @returns {Array} Array of step objects with status
 */
export const getStepsWithStatus = ({
  currentScreenId,
  completedCars = 0,
  completedDrivers = 0,
}) => {
  const currentStepIndex = getCurrentStepIndex(currentScreenId);

  const steps = [
    { title: 'Véhicule', key: 'vehicule' },
    { title: 'Conducteur', key: 'conducteur' },
    { title: 'Soumission', key: 'soumission' },
  ];

  return steps.map((step, index) => {
    let status = 'wait';

    if (index < currentStepIndex) {
      status = 'finish';
    } else if (index === currentStepIndex) {
      // Show first step (Véhicule) as finished from the start
      if (index === 0) {
        status = 'finish';
      } else if (index === 2) {
        // The last step (Soumission) should remain as 'wait' while in progress
        // so it doesn't look finished/active prematurely
        status = 'wait';
      } else {
        status = 'process';
      }
    }

    return { ...step, status };
  });
};

export default {
  calculateProgress,
  getCurrentStepIndex,
  getStepsWithStatus,
};
