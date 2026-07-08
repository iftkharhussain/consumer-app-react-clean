/* eslint-disable */
// Re-export all config from a single entry point
export { steps, getStepById, getStepByName } from './steps';
export {
    screensMap,
    screens,
    getScreen,
    screenExists,
    getScreensByStep,
    vehicleScreens,
    driverScreens,
    summaryScreens,
    submissionScreens,
} from './screens';
export {
    USE_NEW_RENDERER,
    MIGRATED_SCREENS,
    shouldUseNewRenderer,
    isStepFullyMigrated,
    getMigrationProgress,
    logMigrationStatus,
} from './featureFlags';
