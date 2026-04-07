/**
 * Quote Recalculation Service
 * 
 * Manages recalculation limits, validation, and business logic.
 * Prevents users from recalculating quotes more than the allowed limit.
 * 
 * Business Rules:
 * - Maximum 2 recalculations per session
 * - Counter resets when user navigates away from customize page
 * - After limit reached, user must contact broker
 */

const RECALCULATION_LIMIT = 2;
const BROKER_PHONE = '1 (450) 762-9240';
const BROKER_PHONE_LINK = 'tel:+14507629240';

/**
 * Validate if user can perform a recalculation
 * 
 * @param {number} currentCount - Current recalculation count
 * @returns {Object} Validation result with allowed flag and message
 */
export const validateRecalculationRequest = (currentCount) => {
  if (currentCount >= RECALCULATION_LIMIT) {
    return {
      allowed: false,
      limitReached: true,
      message: `Vous avez atteint la limite de ${RECALCULATION_LIMIT} recalculs. Veuillez contacter un courtier.`,
      remainingRecalculations: 0
    };
  }

  return {
    allowed: true,
    limitReached: false,
    message: 'Recalculation autorisée',
    remainingRecalculations: RECALCULATION_LIMIT - currentCount
  };
};

/**
 * Get recalculation button text based on current count
 * 
 * @param {number} count - Current recalculation count
 * @param {boolean} isLoading - Whether recalculation is in progress
 * @returns {string} Button text
 */
export const getRecalculateButtonText = (count, isLoading = false) => {
  if (isLoading) {
    return 'Chargement...';
  }

  if (count >= RECALCULATION_LIMIT) {
    return 'Limite atteinte';
  }

  if (count === 0) {
    return 'Recalculer mon prix';
  }

  return `Recalculer mon prix (${count}/${RECALCULATION_LIMIT})`;
};

/**
 * Check if recalculation button should be disabled
 * 
 * @param {boolean} hasChanges - Whether user made protection changes
 * @param {boolean} isLoading - Whether recalculation is in progress
 * @param {number} count - Current recalculation count
 * @returns {boolean} True if button should be disabled
 */
export const shouldDisableRecalculateButton = (hasChanges, isLoading, count) => {
  return !hasChanges || isLoading || count >= RECALCULATION_LIMIT;
};

/**
 * Get modal configuration for limit reached state
 * 
 * @returns {Object} Modal configuration object
 */
export const getRecalculationLimitModalConfig = () => {
  return {
    title: 'Limite de recalculs atteinte',
    message: `Vous avez atteint la limite de ${RECALCULATION_LIMIT} recalculs. Pour obtenir une nouvelle soumission avec vos modifications, veuillez contacter un courtier.`,
    brokerPhone: BROKER_PHONE,
    brokerPhoneLink: BROKER_PHONE_LINK,
    callButtonText: 'Appeler maintenant',
    closeButtonText: 'Fermer'
  };
};

/**
 * Get warning banner configuration for bottom bar
 * 
 * @returns {Object} Warning banner configuration
 */
export const getRecalculationLimitWarning = () => {
  return {
    message: `Limite de recalculs atteinte. Contactez un courtier pour continuer: ${BROKER_PHONE}`,
    phoneLink: BROKER_PHONE_LINK,
    phone: BROKER_PHONE
  };
};

/**
 * Validate quote recalculation prerequisites
 * 
 * @param {Object} params - Validation parameters
 * @param {string} params.userProductId - User product ID
 * @param {Object} params.protectionsData - Protection modifications
 * @param {number} params.recalculateCount - Current recalculation count
 * @returns {Object} Validation result
 */
export const validateRecalculationPrerequisites = ({ userProductId, protectionsData, recalculateCount }) => {
  const errors = [];

  if (!userProductId) {
    errors.push('User product ID is required');
  }

  if (!protectionsData) {
    errors.push('Protection modifications are required');
  }

  const limitValidation = validateRecalculationRequest(recalculateCount);
  if (!limitValidation.allowed) {
    errors.push(limitValidation.message);
  }

  return {
    valid: errors.length === 0,
    errors,
    canProceed: errors.length === 0
  };
};

/**
 * Log recalculation attempt for debugging
 * 
 * @param {Object} params - Log parameters
 */
export const logRecalculationAttempt = ({ userProductId, count, success, error }) => {
  const timestamp = new Date().toISOString();
  console.log('[RecalculationService]', {
    timestamp,
    userProductId,
    attemptNumber: count + 1,
    success,
    error: error || null,
    remainingAttempts: Math.max(0, RECALCULATION_LIMIT - count - 1)
  });
};

/**
 * Get recalculation constants
 * 
 * @returns {Object} Constants
 */
export const getRecalculationConstants = () => {
  return {
    limit: RECALCULATION_LIMIT,
    brokerPhone: BROKER_PHONE,
    brokerPhoneLink: BROKER_PHONE_LINK
  };
};

export default {
  validateRecalculationRequest,
  getRecalculateButtonText,
  shouldDisableRecalculateButton,
  getRecalculationLimitModalConfig,
  getRecalculationLimitWarning,
  validateRecalculationPrerequisites,
  logRecalculationAttempt,
  getRecalculationConstants,
  RECALCULATION_LIMIT,
  BROKER_PHONE,
  BROKER_PHONE_LINK
};
