/* eslint-disable */
// Import screen configs from each domain
import { vehicleScreens } from './vehicle';
import { driverScreens } from './driver';
import { summaryScreens } from './summary';
import { submissionScreens } from './submission';

// Combine all screens into a single map for O(1) lookup
export const screensMap = new Map([
    // Vehicle screens
    ...Object.entries(vehicleScreens),
    // Summary screens
    ...Object.entries(summaryScreens),
    // Driver screens
    ...Object.entries(driverScreens),
    // Submission screens
    ...Object.entries(submissionScreens),
]);

// Export array for iteration
export const screens = Array.from(screensMap.values());

// Helper function to get a screen by ID
export const getScreen = (id) => {
    return screensMap.get(id);
};

// Helper to check if a screen exists
export const screenExists = (id) => {
    return screensMap.has(id);
};

// Get all screens for a specific step
export const getScreensByStep = (stepId) => {
    return screens.filter((screen) => screen.stepId === stepId);
};

// Re-export individual screen collections
export { vehicleScreens } from './vehicle';
export { driverScreens } from './driver';
export { summaryScreens } from './summary';
export { submissionScreens } from './submission';
