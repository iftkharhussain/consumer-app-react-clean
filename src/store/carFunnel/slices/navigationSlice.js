/* eslint-disable */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    currentScreenId: 'auto-1',
    currentStepId: 1,
    history: [],
    isTransitioning: false,
    isAddingNewVehicle: false,
    isAddingNewDriver: false,
};

const navigationSlice = createSlice({
    name: 'navigation',
    initialState,
    reducers: {
        navigateTo: (state, action) => {
            const { screenId, stepId } = action.payload;
            state.history.push(state.currentScreenId);
            state.currentScreenId = screenId;
            if (stepId !== undefined) {
                state.currentStepId = stepId;
            }
        },

        goBack: (state) => {
            if (state.history.length > 0) {
                const previousScreen = state.history.pop();
                if (previousScreen) {
                    state.currentScreenId = previousScreen;
                }
            }
            // Reset creation flow flags when going back
            state.isAddingNewVehicle = false;
            state.isAddingNewDriver = false;
        },

        setCurrentScreen: (state, action) => {
            state.currentScreenId = action.payload;
        },

        setCurrentStep: (state, action) => {
            state.currentStepId = action.payload;
        },

        setTransitioning: (state, action) => {
            state.isTransitioning = action.payload;
        },

        resetNavigation: () => initialState,

        // Jump to a specific screen without adding to history
        jumpTo: (state, action) => {
            const { screenId, stepId } = action.payload;
            state.currentScreenId = screenId;
            if (stepId !== undefined) {
                state.currentStepId = stepId;
            }
            // Clear history when jumping - empty array means no previous screens
            state.history = [];
            // Reset creation flow flags when jumping (e.g., edit or remove)
            state.isAddingNewVehicle = false;
            state.isAddingNewDriver = false;
        },

        // Set creation flow flags
        startAddingVehicle: (state) => {
            state.isAddingNewVehicle = true;
            state.isAddingNewDriver = false;
        },

        startAddingDriver: (state) => {
            state.isAddingNewVehicle = false;
            state.isAddingNewDriver = true;
        },

        resetCreationFlow: (state) => {
            state.isAddingNewVehicle = false;
            state.isAddingNewDriver = false;
        },
    },
});

export const {
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
} = navigationSlice.actions;

export default navigationSlice.reducer;

// Selectors
export const selectCurrentScreenId = (state) =>
    state.navigation.currentScreenId;
export const selectCurrentStepId = (state) =>
    state.navigation.currentStepId;
export const selectHistory = (state) =>
    state.navigation.history;
export const selectIsTransitioning = (state) =>
    state.navigation.isTransitioning;
export const selectCanGoBack = (state) =>
    state.navigation.history.length > 0;
export const selectIsAddingNewVehicle = (state) =>
    state.navigation.isAddingNewVehicle;
export const selectIsAddingNewDriver = (state) =>
    state.navigation.isAddingNewDriver;
