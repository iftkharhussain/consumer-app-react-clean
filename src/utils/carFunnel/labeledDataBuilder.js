/* eslint-disable */
/**
 * Utility to build labeled data structures
 * Transforms flat key-value pairs into labeled objects with {label, key, value}
 */

import { screens } from 'config/carFunnel/screens';

/**
 * Build a map of field names to their labels from TypeScript configs
 * @returns {Object} - Map of fieldName -> label
 */
const buildFieldLabelMap = () => {
    const labelMap = {};

    screens.forEach(screen => {
        if (screen.fields) {
            screen.fields.forEach(field => {
                if (field.name) {
                    // Priority: field.label > field.shortLabel > screen.headerText.text > screen.title > field.name
                    labelMap[field.name] = field.label ||
                        field.shortLabel ||
                        (screen.headerText && screen.headerText.text) ||
                        screen.title ||
                        field.name;
                }
            });
        }
    });

    return labelMap;
};

// Cache the label map for performance
const FIELD_LABEL_MAP = buildFieldLabelMap();

/**
 * Check if a field is hidden in the config
 * @param {string} fieldName - The field name
 * @returns {boolean} - True if the field is marked as hidden
 */
const isFieldHidden = (fieldName) => {
    for (const screen of screens) {
        if (screen.fields) {
            // Check top-level fields
            const field = screen.fields.find(f => f.name === fieldName);
            if (field && field.hidden) return true;

            // Check fields inside rows/groups
            for (const f of screen.fields) {
                if (f.type === 'row' && f.fields) {
                    const nestedField = f.fields.find(nf => nf.name === fieldName);
                    if (nestedField && nestedField.hidden) return true;
                }
            }
        }
    }
    return false;
};

/**
 * Get the display value for a field (handles options with labels)
 * @param {string} fieldName - The field name
 * @param {any} value - The raw value
 * @returns {string} - The display value (option label if available)
 */
const getDisplayValue = (fieldName, value) => {
    if (value === null || value === undefined) return '';

    // Find the field in screens config to get option labels
    for (const screen of screens) {
        if (screen.fields) {
            const field = screen.fields.find(f => f.name === fieldName);
            if (field) {
                // Check flat options
                if (field.options) {
                    const option = field.options.find(opt => opt.value === value);
                    if (option) return option.label;
                }
                // Check optionGroups
                if (field.optionGroups) {
                    for (const group of field.optionGroups) {
                        const option = group.options.find(opt => opt.value === value);
                        if (option) return option.label;
                    }
                }
            }
        }
    }

    return String(value);
};

export const createLabeledField = (key, value) => {
    // Return null if field is hidden - caller should handle this
    if (isFieldHidden(key)) return null;

    const label = FIELD_LABEL_MAP[key] || key;
    const displayValue = getDisplayValue(key, value);

    return {
        label,
        key,
        value,
        displayValue
    };
};

/**
 * Helper to safely add a labeled field if not null
 */
const addLabeledField = (fieldsArray, key, value) => {
    const labeledField = createLabeledField(key, value);
    if (labeledField) {
        fieldsArray.push(labeledField);
    }
};

/**
 * Build labeled vehicle data from currentCarData
 * @param {Object} currentCarData - The current car data from screens
 * @param {number} index - The vehicle index
 * @returns {Object} - Vehicle data with labeled fields
 */
export const buildLabeledVehicleData = (currentCarData, index) => {
    const fields = [];
    let vehicleDetails = null;

    // Add index as a special field
    fields.push({
        label: 'Index',
        key: 'index',
        value: index,
        displayValue: String(index)
    });

    // Screen auto-1: year, manufacturer, model, and full vehicle details
    if (currentCarData['auto-1']) {
        const data = currentCarData['auto-1'];
        if (data.year !== undefined) addLabeledField(fields, 'year', data.year);
        if (data.manufacturer !== undefined) addLabeledField(fields, 'manufacturer', data.manufacturer);
        if (data.model !== undefined) addLabeledField(fields, 'model', data.model);

        // Include full vehicle details if available
        if (data.vehicleDetails) {
            vehicleDetails = data.vehicleDetails;
        }
    }

    // Screen 1.1-auto1: vin
    if (currentCarData['1.1-auto1']) {
        const data = currentCarData['1.1-auto1'];
        if (data.vin !== undefined) addLabeledField(fields, 'vin', data.vin);
    }

    // Screen 2-auto1: ownership, vehicleConditionAtPurchase, purchaseDate, parkingLocation, antiTheft
    if (currentCarData['2-auto1']) {
        const data = currentCarData['2-auto1'];
        if (data.ownership !== undefined) addLabeledField(fields, 'ownership', data.ownership);
        if (data.vehicleConditionAtPurchase !== undefined) addLabeledField(fields, 'vehicleConditionAtPurchase', data.vehicleConditionAtPurchase);
        if (data.purchaseDate !== undefined) addLabeledField(fields, 'purchaseDate', data.purchaseDate);
        if (data.parkingLocation !== undefined) addLabeledField(fields, 'parkingLocation', data.parkingLocation);
        if (data.antiTheft !== undefined) addLabeledField(fields, 'antiTheft', data.antiTheft);
    }

    // Screen 3-auto1: primaryUsage, dailyCommute, annualKm
    if (currentCarData['3-auto1']) {
        const data = currentCarData['3-auto1'];
        if (data.primaryUsage !== undefined) addLabeledField(fields, 'primaryUsage', data.primaryUsage);
        if (data.dailyCommute !== undefined) addLabeledField(fields, 'dailyCommute', data.dailyCommute);
        if (data.dailyCommuteKm !== undefined) addLabeledField(fields, 'dailyCommuteKm', data.dailyCommuteKm);
        if (data.annualKm !== undefined) addLabeledField(fields, 'annualKm', data.annualKm);
    }

    // Screen 4-auto1: usedOutsideQuebec, weeksOutsideQuebec, isModified, modificationTypes, modificationValue
    if (currentCarData['4-auto1']) {
        const data = currentCarData['4-auto1'];
        if (data.usedOutsideQuebec !== undefined) addLabeledField(fields, 'usedOutsideQuebec', data.usedOutsideQuebec);
        if (data.weeksOutsideQuebec !== undefined) addLabeledField(fields, 'weeksOutsideQuebec', data.weeksOutsideQuebec);
        if (data.isModified !== undefined) addLabeledField(fields, 'isModified', data.isModified);
        if (data.modificationTypes !== undefined) addLabeledField(fields, 'modificationTypes', data.modificationTypes);
        if (data.modificationValue !== undefined) addLabeledField(fields, 'modificationValue', data.modificationValue);
        // Legacy field support
        if (data.registeredOutsideQuebec !== undefined) addLabeledField(fields, 'registeredOutsideQuebec', data.registeredOutsideQuebec);
    }

    // Screen 5-auto1: coverageType, allPerilsCoverage, collisionCoverage
    if (currentCarData['5-auto1']) {
        const data = currentCarData['5-auto1'];
        if (data.coverageType !== undefined) addLabeledField(fields, 'coverageType', data.coverageType);
        if (data.allPerilsCoverage !== undefined) addLabeledField(fields, 'allPerilsCoverage', data.allPerilsCoverage);
        if (data.collisionCoverage !== undefined) addLabeledField(fields, 'collisionCoverage', data.collisionCoverage);
    }

    return {
        index,
        fields,
        // Include full vehicle details from API response
        ...(vehicleDetails && { vehicleDetails })
    };
};

/**
 * Build labeled driver data from currentDriverData
 * @param {Object} currentDriverData - The current driver data from screens
 * @param {number} index - The driver index
 * @returns {Object} - Driver data with labeled fields
 */
export const buildLabeledDriverData = (currentDriverData, index) => {
    const fields = [];

    // Add index as a special field
    fields.push({
        label: 'Index',
        key: 'index',
        value: index,
        displayValue: String(index)
    });

    // Screen 1-driver1: fullName, firstName, lastName, gender, dateOfBirth, address, addressDuration, postalCode, locationIndex
    if (currentDriverData['1-driver1']) {
        const data = currentDriverData['1-driver1'];
        if (data.fullName !== undefined) addLabeledField(fields, 'fullName', data.fullName);
        if (data.firstName !== undefined) addLabeledField(fields, 'firstName', data.firstName);
        if (data.lastName !== undefined) addLabeledField(fields, 'lastName', data.lastName);
        if (data.gender !== undefined) addLabeledField(fields, 'gender', data.gender);
        if (data.dateOfBirth !== undefined) addLabeledField(fields, 'dateOfBirth', data.dateOfBirth);
        if (data.address !== undefined) addLabeledField(fields, 'address', data.address);
        if (data.addressDuration !== undefined) addLabeledField(fields, 'addressDuration', data.addressDuration);
        if (data.postalCode !== undefined) addLabeledField(fields, 'postalCode', data.postalCode);
        if (data.locationIndex !== undefined) addLabeledField(fields, 'locationIndex', data.locationIndex);

        // Include address components if available (contains location data)
        if (data.address_components) {
            addLabeledField(fields, 'address_components', data.address_components);
        }
    }

    // Screen 2-driver1: maritalStatus, professionalStatus, universityGraduate, currentlyStudent
    if (currentDriverData['2-driver1']) {
        const data = currentDriverData['2-driver1'];
        if (data.maritalStatus !== undefined) {
            // "Conjoint(e) de fait" (common-law) submits the same value as "Marié(e)".
            // It only uses a distinct option value in the form so the two buttons don't
            // both highlight when one is selected.
            const maritalStatusValue = data.maritalStatus === 'conjoint_de_fait' ? 'marie' : data.maritalStatus;
            addLabeledField(fields, 'maritalStatus', maritalStatusValue);
        }
        if (data.professionalStatus !== undefined) addLabeledField(fields, 'professionalStatus', data.professionalStatus);
        if (data.professionalStatusDetail !== undefined) addLabeledField(fields, 'professionalStatusDetail', data.professionalStatusDetail);
        if (data.universityGraduate !== undefined) addLabeledField(fields, 'universityGraduate', data.universityGraduate);
        if (data.currentlyStudent !== undefined) addLabeledField(fields, 'currentlyStudent', data.currentlyStudent);
    }

    // Screen 3-driver1: insuranceStatus, currentInsurer, coverageExpiryMonth
    if (currentDriverData['3-driver1']) {
        const data = currentDriverData['3-driver1'];
        if (data.insuranceStatus !== undefined) addLabeledField(fields, 'insuranceStatus', data.insuranceStatus);
        if (data.currentInsurer !== undefined) addLabeledField(fields, 'currentInsurer', data.currentInsurer);
        if (data.coverageExpiryMonth !== undefined) addLabeledField(fields, 'coverageExpiryMonth', data.coverageExpiryMonth);
    }

    // Screen 3b-driver1: licenseType, licenseAge, licenseAgeOther
    if (currentDriverData['3b-driver1']) {
        const data = currentDriverData['3b-driver1'];
        if (data.licenseType !== undefined) addLabeledField(fields, 'licenseType', data.licenseType);
        if (data.licenseAge !== undefined) addLabeledField(fields, 'licenseAge', data.licenseAge);
        if (data.licenseAgeOther !== undefined) addLabeledField(fields, 'licenseAgeOther', data.licenseAgeOther);
        // Legacy field support
        if (data.hasCurrentInsurance !== undefined) addLabeledField(fields, 'hasCurrentInsurance', data.hasCurrentInsurance);
    }

    // Screen 4-driver1: cancelledOrRefused, licenseSuspension, atFaultAccidents, trafficViolations, criminalRecord, bankruptcy
    if (currentDriverData['4-driver1']) {
        const data = currentDriverData['4-driver1'];
        if (data.cancelledOrRefused !== undefined) addLabeledField(fields, 'cancelledOrRefused', data.cancelledOrRefused);
        if (data.licenseSuspension !== undefined) addLabeledField(fields, 'licenseSuspension', data.licenseSuspension);
        if (data.atFaultAccidents !== undefined) addLabeledField(fields, 'atFaultAccidents', data.atFaultAccidents);
        if (data.trafficViolations !== undefined) addLabeledField(fields, 'trafficViolations', data.trafficViolations);
        if (data.criminalRecord !== undefined) addLabeledField(fields, 'criminalRecord', data.criminalRecord);
        if (data.bankruptcy !== undefined) addLabeledField(fields, 'bankruptcy', data.bankruptcy);
    }

    // Dynamic list screens (5-driver1, 6-driver1, 7-driver1, 8-driver1)
    // These contain arrays of items
    // if (currentDriverData['5-driver1']) {
    //     fields.push({
    //         label: 'Annulations',
    //         key: 'cancellations',
    //         value: currentDriverData['5-driver1'],
    //         displayValue: JSON.stringify(currentDriverData['5-driver1'])
    //     });
    // }

    if (currentDriverData['6-driver1']) {
        fields.push({
            label: 'Suspensions',
            key: 'suspensions',
            value: currentDriverData['6-driver1'],
            displayValue: JSON.stringify(currentDriverData['6-driver1'])
        });
    }

    if (currentDriverData['7-driver1']) {
        fields.push({
            label: 'Accidents',
            key: 'accidents',
            value: currentDriverData['7-driver1'],
            displayValue: JSON.stringify(currentDriverData['7-driver1'])
        });
    }

    // if (currentDriverData['8-driver1']) {
    //     fields.push({
    //         label: 'Infractions',
    //         key: 'violations',
    //         value: currentDriverData['8-driver1'],
    //         displayValue: JSON.stringify(currentDriverData['8-driver1'])
    //     });
    // }

    // Screen 10-driver1: policyStartDate
    if (currentDriverData['10-driver1']) {
        const data = currentDriverData['10-driver1'];
        if (data.policyStartDate !== undefined) addLabeledField(fields, 'policyStartDate', data.policyStartDate);
    }

    return {
        index,
        fields
    };
};

/**
 * Get field label from the map
 * @param {string} fieldName - The field name
 * @returns {string} - The label or the fieldName if not found
 */
export const getFieldLabel = (fieldName) => {
    return FIELD_LABEL_MAP[fieldName] || fieldName;
};

export default {
    createLabeledField,
    buildLabeledVehicleData,
    buildLabeledDriverData,
    getFieldLabel
};
