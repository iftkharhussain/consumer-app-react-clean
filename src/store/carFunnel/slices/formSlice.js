/* eslint-disable */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    vehicles: [{}],
    currentVehicleIndex: 0,
    drivers: [{}],
    currentDriverIndex: 0,
    discountData: {},
    contactData: {},
    isPhoneVerified: false,
    verifiedPhone: null,
};

const formSlice = createSlice({
    name: 'form',
    initialState,
    reducers: {
        // Vehicle actions
        setVehicleData: (state, action) => {
            const { screenId, data } = action.payload;
            if (!state.vehicles[state.currentVehicleIndex]) {
                state.vehicles[state.currentVehicleIndex] = {};
            }
            state.vehicles[state.currentVehicleIndex][screenId] = data;
        },

        addVehicle: (state) => {
            state.vehicles.push({});
            state.currentVehicleIndex = state.vehicles.length - 1;
        },

        removeVehicle: (state, action) => {
            const index = action.payload;
            console.log('removeVehicle reducer called with index:', index);
            console.log('Current vehicles length:', state.vehicles.length);
            
            if (state.vehicles.length > 1) {
                console.log('Removing vehicle at index:', index);
                state.vehicles.splice(index, 1);
                if (state.currentVehicleIndex >= state.vehicles.length) {
                    state.currentVehicleIndex = state.vehicles.length - 1;
                }
                console.log('Vehicle removed. New vehicles length:', state.vehicles.length);
            } else {
                console.log('Cannot remove: only one vehicle left');
                // If this is the last vehicle, replace it with an empty one
                state.vehicles[index] = {};
                console.log('Last vehicle cleared instead of removed');
            }
        },

        setCurrentVehicleIndex: (state, action) => {
            state.currentVehicleIndex = action.payload;
        },

        // Driver actions
        setDriverData: (state, action) => {
            const { screenId, data } = action.payload;
            if (!state.drivers[state.currentDriverIndex]) {
                state.drivers[state.currentDriverIndex] = {};
            }
            state.drivers[state.currentDriverIndex][screenId] = data;
        },

        addDriver: (state) => {
            state.drivers.push({});
            state.currentDriverIndex = state.drivers.length - 1;
        },

        removeDriver: (state, action) => {
            const index = action.payload;
            if (state.drivers.length > 1) {
                state.drivers.splice(index, 1);
                if (state.currentDriverIndex >= state.drivers.length) {
                    state.currentDriverIndex = state.drivers.length - 1;
                }
            }
        },

        setCurrentDriverIndex: (state, action) => {
            state.currentDriverIndex = action.payload;
        },

        // Discount & Contact actions
        setDiscountData: (state, action) => {
            state.discountData = { ...state.discountData, ...action.payload };
        },

        setContactData: (state, action) => {
            state.contactData = { ...state.contactData, ...action.payload };
        },

        // Verification actions
        setPhoneVerified: (state, action) => {
            state.isPhoneVerified = action.payload.verified;
            state.verifiedPhone = action.payload.phone;
        },

        // Reset
        resetForm: () => initialState,
    },
});

export const {
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
} = formSlice.actions;

export default formSlice.reducer;

// Selectors
export const selectVehicles = (state) => state.form.vehicles;
export const selectCurrentVehicleIndex = (state) => state.form.currentVehicleIndex;
export const selectCurrentVehicle = (state) =>
    state.form.vehicles[state.form.currentVehicleIndex] || {};

export const selectDrivers = (state) => state.form.drivers;
export const selectCurrentDriverIndex = (state) => state.form.currentDriverIndex;
export const selectCurrentDriver = (state) =>
    state.form.drivers[state.form.currentDriverIndex] || {};

export const selectDiscountData = (state) => state.form.discountData;
export const selectContactData = (state) => state.form.contactData;
export const selectIsPhoneVerified = (state) => state.form.isPhoneVerified;

export const selectVehicleScreenData = (screenId) => (state) =>
    state.form.vehicles[state.form.currentVehicleIndex]?.[screenId];

export const selectDriverScreenData = (screenId) => (state) =>
    state.form.drivers[state.form.currentDriverIndex]?.[screenId];
