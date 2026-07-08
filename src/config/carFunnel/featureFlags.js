/* eslint-disable */
/**
 * Feature flags configuration for gradual migration
 * This enables switching between legacy JSON-driven and new TypeScript-based components
 */

// Environment-based feature flag for using new renderer
export const USE_NEW_RENDERER = window.USE_NEW_RENDERER;

// Flag to enable/disable Redux persist (localStorage persistence)
// Set to false to disable persistence and work on it later
export const ENABLE_REDUX_PERSIST = false;

// List of screens that have been migrated to the new system
// Add screen IDs here as they are migrated and tested
export const MIGRATED_SCREENS = [
    // Vehicle screens (Step 1) - ALL MIGRATED
    'auto-1',
    '2-auto1',
    '3-auto1',
    '4-auto1',
    '5-auto1',
    'summary-1car', // Vehicle summary

    // Driver screens (Step 2) - ALL MIGRATED
    '1-driver1',
    '2-driver1',
    '3-driver1',
    '4-driver1',
    '5-driver1',
    '6-driver1',
    '7-driver1',
    '8-driver1',
    '9-driver1', // Driver summary
    '10-driver1',

    // Submission screens (Step 3) - ALL MIGRATED
    'contact-info',
    'verification',
];

/**
 * Check if a specific screen should use the new renderer
 * @param screenId - The ID of the screen to check
 * @returns boolean - true if the screen should use the new renderer
 */
export const shouldUseNewRenderer = (screenId) => {
    // If global flag is off, always use legacy
    if (!USE_NEW_RENDERER) {
        return false;
    }

    // If screen is in the migrated list, use new renderer
    return MIGRATED_SCREENS.includes(screenId);
};

/**
 * Check if all screens in a step are migrated
 * @param stepId - The step ID to check
 * @returns boolean - true if all screens in the step are migrated
 */
export const isStepFullyMigrated = (stepId) => {
    // Define all screens per step
    const screensByStep = {
        1: ['auto-1', '2-auto1', '3-auto1', '4-auto1', '5-auto1', 'vin-lookup'],
        2: [
            '1-driver1', '2-driver1', '3-driver1', '3.1-driver1', '3.2-driver1',
            '4-driver1', '4.1-driver1', '4.2-driver1', '4.3-driver1',
            '5-driver1', '5.1-driver1', '5.2-driver1',
            '6-driver1', '6.1-driver1', '6.2-driver1',
            '7-driver1', '7.1-driver1', '7.2-driver1',
            '8-driver1', '9-driver1', '10-driver1'
        ],
        3: ['contact-info', 'verification'],
    };

    const stepScreens = screensByStep[stepId] || [];
    return stepScreens.every(screenId => MIGRATED_SCREENS.includes(screenId));
};

/**
 * Get migration progress percentage
 * @returns number - percentage of screens migrated (0-100)
 */
export const getMigrationProgress = () => {
    const totalScreens = 35; // Total number of screens in the app
    const migratedCount = MIGRATED_SCREENS.length;
    return Math.round((migratedCount / totalScreens) * 100);
};

/**
 * Development helper to log migration status
 */
export const logMigrationStatus = () => {
    if ((process.env.NODE_ENV !== 'production')) {
        console.log('=== Migration Status ===');
        console.log(`Global flag (VITE_USE_NEW_RENDERER): ${USE_NEW_RENDERER}`);
        console.log(`Migrated screens: ${MIGRATED_SCREENS.length}/35`);
        console.log(`Progress: ${getMigrationProgress()}%`);
        console.log('Migrated:', MIGRATED_SCREENS);
        console.log('========================');
    }
};
