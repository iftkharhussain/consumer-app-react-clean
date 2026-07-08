/* eslint-disable */
// Redux Store exports
export { store, persistor } from './store';

// Typed hooks
export { useAppDispatch, useAppSelector } from './hooks';

// Form slice
export {
    setVehicleData,
    addVehicle,
    removeVehicle,
    setCurrentVehicleIndex,
    setDriverData,
    addDriver,
    removeDriver,
    setCurrentDriverIndex,
    setDiscountData,
    setContactData,
    setPhoneVerified,
    resetForm,
    selectVehicles,
    selectCurrentVehicleIndex,
    selectCurrentVehicle,
    selectDrivers,
    selectCurrentDriverIndex,
    selectCurrentDriver,
    selectDiscountData,
    selectContactData,
    selectIsPhoneVerified,
    selectVehicleScreenData,
    selectDriverScreenData,
} from './slices/formSlice';

// Navigation slice
export {
    navigateTo,
    goBack,
    setCurrentScreen,
    setCurrentStep,
    setTransitioning,
    resetNavigation,
    jumpTo,
    startAddingVehicle,
    startAddingDriver,
    resetCreationFlow,
    selectCurrentScreenId,
    selectCurrentStepId,
    selectHistory,
    selectIsTransitioning,
    selectCanGoBack,
    selectIsAddingNewVehicle,
    selectIsAddingNewDriver,
} from './slices/navigationSlice';
