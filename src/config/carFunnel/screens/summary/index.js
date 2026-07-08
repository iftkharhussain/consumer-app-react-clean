/* eslint-disable */
export const summaryCarScreen = {
    id: 'summary-1car',
    type: 'summary',
    stepId: 1,
    title: 'Ajoutez un deuxième véhicule',
    subtitle: '',
    summaryType: 'vehicle',
    nextScreen: '1-driver1', // This will be overridden by logic in ScreenSummary
};

// Export all summary screens
export const summaryScreens = {
    'summary-1car': summaryCarScreen,
};
