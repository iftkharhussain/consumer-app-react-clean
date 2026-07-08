/* eslint-disable */
import React, { useState, useEffect, useCallback } from 'react';
import { Form, Typography, Button, Modal } from 'antd';
import dayjs from 'dayjs';
import {
    useAppDispatch,
    useAppSelector,
    setVehicleData,
    setDriverData,
    setDiscountData,
    selectVehicleScreenData,
    selectDriverScreenData,
    selectDrivers,
    selectVehicles,
    removeVehicle,
    removeDriver,
    setCurrentVehicleIndex,
    setCurrentDriverIndex,
} from 'store/carFunnel';
import { jumpTo } from 'store/carFunnel/slices/navigationSlice';
import ActionCard from 'components/carFunnel/ActionCard';
import PrimaryButton from 'components/carFunnel/common/PrimaryButton';
import DriverHeader from 'components/carFunnel/common/DriverHeader';
import { FieldRenderer } from './FieldRenderer';
import vehicleApiService from 'services/carFunnel/vehicleApiService';
import { CheckCircleFilled, ExclamationCircleOutlined } from '@ant-design/icons';
import InfoModal from 'components/carFunnel/common/InfoModal';
import OccupationPopup from 'components/carFunnel/common/OccupationPopup';
import { getAssetPath } from 'utils/carFunnel/assetPath';
import CarIcon from 'components/carFunnel/common/CarIcon';
import 'styles/carFunnel/screens/ScreenRegular.css';

const { Text } = Typography;

// Helper function to get display name for driver
const getDriverDisplayName = (driver) => {
    const screenData = driver['1-driver1'] || driver['2-driver1'] || {};

    // Check for firstName/lastName first (new structure)
    const firstName = screenData.firstName || screenData.prenom || '';
    const lastName = screenData.lastName || screenData.nom || '';

    if (firstName || lastName) {
        return `${firstName} ${lastName}`.trim();
    }

    // Fallback to fullName for backwards compatibility
    if (screenData.fullName) {
        return screenData.fullName;
    }

    return 'Conducteur';
};

export const ScreenRegular = ({
    screen,
    onNavigate,
    currentVehicleIndex = 0,
    currentDriverIndex = 0,
}) => {
    const dispatch = useAppDispatch();
    const [form] = Form.useForm();
    const [formValues, setFormValues] = useState({});
    const [isVisible] = useState(true);
    const [itemToRemove, setItemToRemove] = useState(null);

    // Vehicle API state
    const [yearsData, setYearsData] = useState([]);
    const [makesData, setMakesData] = useState([]);
    const [modelsData, setModelsData] = useState([]);
    const [yearsLoading, setYearsLoading] = useState(false);
    const [makesLoading, setMakesLoading] = useState(false);
    const [modelsLoading, setModelsLoading] = useState(false);
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedMake, setSelectedMake] = useState(null);

    // Help Modal state
    const [helpModalVisible, setHelpModalVisible] = useState(false);
    const [helpModalInfo, setHelpModalInfo] = useState({ image: '', text: '', imageStyle: null });

    // Occupation confirmation popup state (holds the field whose popup is open)
    const [occupationPopupField, setOccupationPopupField] = useState(null);

    // Get saved data from Redux
    const savedVehicleData = useAppSelector(selectVehicleScreenData(screen.id));
    const baseVehicleOverview = useAppSelector(selectVehicleScreenData('auto-1'));
    const savedDriverData = useAppSelector(selectDriverScreenData(screen.id));
    const baseDriverData = useAppSelector(selectDriverScreenData('1-driver1'));
    const allDrivers = useAppSelector(selectDrivers);
    const allVehicles = useAppSelector(selectVehicles);

    // Fetch years for auto-1 screen
    const fetchYears = useCallback(async () => {
        if (screen.id !== 'auto-1') return;

        setYearsLoading(true);
        try {
            const years = await vehicleApiService.getYears();
            const formattedYears = years.map((year) => ({ value: year.toString(), label: year.toString() }));
            setYearsData(formattedYears);
        } catch (error) {
            console.error('Failed to fetch years:', error);
        } finally {
            setYearsLoading(false);
        }
    }, [screen.id]);

    // Fetch makes when year changes
    const fetchMakes = useCallback(async (year) => {
        if (!year) {
            setMakesData([]);
            return;
        }

        setMakesLoading(true);
        try {
            const makes = await vehicleApiService.getMakes(year);
            // API already returns objects with {value, label} - use directly
            setMakesData(makes);
        } catch (error) {
            console.error('Failed to fetch makes:', error);
        } finally {
            setMakesLoading(false);
        }
    }, []);

    // Fetch models when make changes
    const fetchModels = useCallback(async (year, make) => {
        if (!year || !make) {
            setModelsData([]);
            return;
        }

        setModelsLoading(true);
        try {
            const models = await vehicleApiService.getModels(year, make);
            // Models API returns objects with value/label already formatted
            setModelsData(models);
        } catch (error) {
            console.error('Failed to fetch models:', error);
        } finally {
            setModelsLoading(false);
        }
    }, []);

    // Load years on mount for auto-1 screen
    useEffect(() => {
        if (screen.id === 'auto-1') {
            fetchYears();
        }
    }, [screen.id, fetchYears]);

    // Reset form and load saved data when screen or vehicle/driver index changes
    useEffect(() => {
        // Reset form first
        form.resetFields();
        setFormValues({});
        setSelectedYear(null);
        setSelectedMake(null);
        setMakesData([]);
        setModelsData([]);

        let savedData;

        if (screen.stepId === 1) {
            savedData = savedVehicleData;
        } else if (screen.stepId === 2) {
            savedData = savedDriverData;
        }

        // Build default values from field configs
        const defaultValues = {};
        if (screen.fields) {
            screen.fields.forEach(field => {
                if (field.defaultValue !== undefined) {
                    defaultValues[field.name] = field.defaultValue;
                }
            });
        }

        // Deserialize ISO date strings back to dayjs objects for form
        const deserializeValue = (value) => {
            // Check if value is an ISO date string or YYYY-MM-DD format
            if (typeof value === 'string' && (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value) || /^\d{4}-\d{2}-\d{2}$/.test(value))) {
                return dayjs(value);
            }
            // Handle arrays (for date ranges)
            if (Array.isArray(value)) {
                return value.map(deserializeValue);
            }
            // Handle nested objects
            if (value && typeof value === 'object' && value.constructor === Object) {
                return Object.entries(value).reduce((acc, [k, v]) => {
                    acc[k] = deserializeValue(v);
                    return acc;
                }, {});
            }
            return value;
        };

        // Merge default values with saved data (saved data takes priority)
        const mergedData = { ...defaultValues, ...savedData };

        // Deserialize dates for form display
        const initialData = Object.entries(mergedData).reduce((acc, [key, value]) => {
            acc[key] = deserializeValue(value);
            return acc;
        }, {});

        // Auto-fill address from first driver for subsequent drivers on screen 1-driver1
        if (screen.id === '1-driver1' && currentDriverIndex > 0 && !savedData?.address) {
            const firstDriverData = allDrivers[0]?.['1-driver1'];
            if (firstDriverData?.address) {
                const addressData = {
                    address: firstDriverData.address,
                    address_components: firstDriverData.address_components,
                    postalCode: firstDriverData.postalCode,
                    locationIndex: firstDriverData.locationIndex,
                };
                Object.assign(initialData, addressData);
            }
        }

        if (Object.keys(initialData).length > 0) {
            form.setFieldsValue(initialData);
            setFormValues(initialData);

            // Trigger a re-validation of auto-filled address to clear errors
            if (initialData.address) {
                setTimeout(() => {
                    form.validateFields(['address', 'postalCode']).catch(() => {});
                }, 100);
            }

            // Restore selections for cascading dropdowns
            if (initialData.year) {
                setSelectedYear(initialData.year);
                fetchMakes(initialData.year);
            }
            if (initialData.manufacturer) {
                setSelectedMake(initialData.manufacturer);
                if (initialData.year) {
                    fetchModels(initialData.year, initialData.manufacturer);
                }
            }
        }
    }, [screen.id, screen.stepId, currentVehicleIndex, currentDriverIndex, form, savedVehicleData, savedDriverData, fetchMakes, fetchModels]);

    const handleFormChange = (changedValues) => {
        const values = form.getFieldsValue();
        setFormValues(values);

        // Reset dependent fields when parent conditional field changes
        if (screen.fields && changedValues) {
            const changedFieldNames = Object.keys(changedValues);
            const fieldsToReset = {};

            // Function to check if a field should be reset based on its showWhen condition
            const shouldResetField = (field, currentValues) => {
                if (!field.showWhen) return false;

                const parentValue = currentValues[field.showWhen.field];
                const conditionValue = field.showWhen.value;
                const operator = field.showWhen.operator;

                if (conditionValue === 'any') {
                    // Reset if parent has no value or is empty array
                    if (Array.isArray(parentValue)) {
                        return parentValue.length === 0;
                    }
                    return !parentValue || parentValue === '';
                } else if (operator === 'notEqual') {
                    // For notEqual, reset if value equals the condition
                    return parentValue === conditionValue;
                } else if (operator === 'in') {
                    // For 'in' operator, reset if parent value is not in the array of condition values
                    if (!parentValue || parentValue === '' || !Array.isArray(conditionValue)) {
                        return true;
                    }
                    return !conditionValue.includes(parentValue);
                } else if (operator === 'includesAny') {
                    // For 'includesAny', reset if current array contains none of the condition values
                    if (!Array.isArray(parentValue) || parentValue.length === 0) return true;
                    if (!Array.isArray(conditionValue)) return true;
                    return !conditionValue.some(v => parentValue.includes(v));
                } else {
                    // For equal condition (default)
                    // Handle array values (for checkboxSelect fields)
                    if (Array.isArray(parentValue)) {
                        return !parentValue.includes(conditionValue);
                    }
                    return parentValue !== conditionValue;
                }
            };

            // First pass: find direct dependents of changed fields
            screen.fields.forEach(field => {
                if (field.showWhen && changedFieldNames.includes(field.showWhen.field)) {
                    if (shouldResetField(field, values)) {
                        fieldsToReset[field.name] = undefined;
                        values[field.name] = undefined;
                    }
                }
            });

            // Second pass: find fields dependent on the reset fields (handles nested dependencies)
            if (Object.keys(fieldsToReset).length > 0) {
                screen.fields.forEach(field => {
                    if (field.showWhen && Object.keys(fieldsToReset).includes(field.showWhen.field)) {
                        if (shouldResetField(field, values)) {
                            fieldsToReset[field.name] = undefined;
                            values[field.name] = undefined;
                        }
                    }
                });
            }

            // Apply all resets at once
            if (Object.keys(fieldsToReset).length > 0) {
                form.setFieldsValue(fieldsToReset);
                setFormValues({ ...values });
            }
        }

        // Handle cascading dropdowns for auto-1 screen
        if (screen.id === 'auto-1') {
            // Year changed - fetch makes
            if (values.year && values.year !== selectedYear) {
                setSelectedYear(values.year);
                setSelectedMake(null);
                setMakesData([]);
                setModelsData([]);
                form.setFieldsValue({ manufacturer: undefined, model: undefined });
                fetchMakes(values.year);
            }

            // Make changed - fetch models
            if (values.manufacturer && values.manufacturer !== selectedMake && selectedYear) {
                setSelectedMake(values.manufacturer);
                setModelsData([]);
                form.setFieldsValue({ model: undefined });
                fetchModels(selectedYear, values.manufacturer);
            }

            // Model changed - update vehicleDetails immediately
            if (values.model && modelsData.length > 0) {
                const selectedModel = modelsData.find(m => m.value === values.model);
                if (selectedModel && selectedModel.fullData) {
                    const vehicleDetails = {
                        ...selectedModel.fullData,
                        year: values.year,
                        make: values.manufacturer
                    };
                    form.setFieldsValue({ vehicleDetails });
                    setFormValues({ ...values, vehicleDetails });
                }
            }
        }
    };

    const handleSubmit = async () => {
        try {
            // If a field defines a confirmation popup and ONLY its trigger value is
            // selected (e.g. just "Diplôme universitaire"), open the popup to capture
            // the user's occupation before proceeding. Once an occupation is added the
            // value is no longer just the trigger, so submit continues normally.
            const popupField = (screen.fields || []).find(f => f.popup);
            if (popupField) {
                const popupValue = form.getFieldValue(popupField.name);
                const onlyTrigger = Array.isArray(popupValue)
                    && popupValue.length === 1
                    && popupValue[0] === popupField.popup.triggerValue;
                if (onlyTrigger) {
                    setOccupationPopupField(popupField);
                    return;
                }
            }

            // Compute which field names are currently VISIBLE based on showWhen conditions.
            // We only validate visible fields — hidden ones stay mounted (to preserve their
            // values in the form store) but should not fire required-field validation.
            const isFieldConditionMet = (field, values) => {
                if (!field.showWhen) return true;
                const { field: conditionField, value: conditionValue, operator = 'equal' } = field.showWhen;
                const currentValue = values[conditionField];

                if (conditionValue === 'any') {
                    return !(!currentValue || currentValue === '' || (Array.isArray(currentValue) && currentValue.length === 0));
                } else if (operator === 'notEqual') {
                    return !(!currentValue || currentValue === '' || currentValue === conditionValue);
                } else if (operator === 'in') {
                    return !(!currentValue || currentValue === '' || !Array.isArray(conditionValue) || !conditionValue.includes(currentValue));
                } else if (operator === 'includesAny') {
                    return Array.isArray(currentValue) && currentValue.length > 0 && Array.isArray(conditionValue) && conditionValue.some(v => currentValue.includes(v));
                } else {
                    if (Array.isArray(currentValue)) return currentValue.includes(conditionValue);
                    return currentValue === conditionValue;
                }
            };

            const collectVisibleNames = (fields, values) => {
                const names = [];
                (fields || []).forEach(field => {
                    if (field.type === 'row') {
                        names.push(...collectVisibleNames(field.fields, values));
                    } else if (!field.hidden && isFieldConditionMet(field, values)) {
                        names.push(field.name);
                    }
                });
                return names;
            };

            const currentValues = form.getFieldsValue(true);
            const visibleFieldNames = collectVisibleNames(screen.fields, currentValues);

            // Validate only visible fields — hidden fields preserve their value but skip validation
            const validatedValues = await form.validateFields(visibleFieldNames);

            // Merge: all stored values (includes hidden field values) + validated visible values
            const allValues = form.getFieldsValue(true);
            const values = { ...allValues, ...validatedValues };

            // Serialize date objects to ISO strings for Redux
            const serializeValue = (value) => {
                // Check if value is a dayjs/moment object
                if (value && typeof value === 'object' && (value.$d || value.toISOString)) {
                    return dayjs(value).format('YYYY-MM-DD');
                }
                // Handle arrays (for date ranges)
                if (Array.isArray(value)) {
                    return value.map(serializeValue);
                }
                // Handle nested objects
                if (value && typeof value === 'object' && value.constructor === Object) {
                    return Object.entries(value).reduce((acc, [k, v]) => {
                        acc[k] = serializeValue(v);
                        return acc;
                    }, {});
                }
                return value;
            };

            const serializedValues = Object.entries(values).reduce((acc, [key, value]) => {
                acc[key] = serializeValue(value);
                return acc;
            }, {});

            // For vehicle screens (step 1), add full vehicle details if model is selected
            if (screen.stepId === 1 && serializedValues.model && modelsData.length > 0) {
                const selectedModel = modelsData.find(m => m.value === serializedValues.model);
                if (selectedModel && selectedModel.fullData) {
                    // Store the full vehicle data
                    serializedValues.vehicleDetails = selectedModel.fullData;
                }
                // Also add year and manufacturer if they exist
                if (serializedValues.year) {
                    serializedValues.vehicleDetails = {
                        ...serializedValues.vehicleDetails,
                        year: serializedValues.year
                    };
                }
                if (serializedValues.manufacturer) {
                    serializedValues.vehicleDetails = {
                        ...serializedValues.vehicleDetails,
                        make: serializedValues.manufacturer
                    };
                }
            }

            // Save to appropriate store based on step
            if (screen.stepId === 1) {
                dispatch(setVehicleData({ screenId: screen.id, data: serializedValues }));
            } else if (screen.stepId === 2) {
                dispatch(setDriverData({ screenId: screen.id, data: serializedValues }));
            } else if (screen.stepId === 3) {
                dispatch(setDiscountData(serializedValues));
            }

            // Determine next screen - check for conditional navigation
            let nextScreenId = screen.nextScreen;

            // Handle conditional navigation (for screens like 4-driver1)
            if (screen.conditionalNavigation) {
                for (const condition of screen.conditionalNavigation) {
                    if (values[condition.field] === condition.value) {
                        nextScreenId = condition.nextScreen;
                        break; // Take the first matching condition
                    }
                }
            }

            if (nextScreenId) {
                onNavigate(nextScreenId, values);
            }
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    // Prefill the occupation popup from the current selections (excluding the
    // trigger value) so previously chosen answers are preserved.
    const buildOccupationPopupInitialValues = (field) => {
        if (!field?.popup) return {};
        const initial = {};
        (field.popup.fields || []).forEach((f) => {
            if (f.name === field.name) {
                const current = form.getFieldValue(field.name);
                initial[f.name] = Array.isArray(current)
                    ? current.filter(v => v !== field.popup.triggerValue)
                    : [];
            } else {
                const v = form.getFieldValue(f.name);
                if (v !== undefined) initial[f.name] = v;
            }
        });
        return initial;
    };

    // When the user confirms in the popup, merge the collected values back into the
    // form (keeping the trigger value alongside the chosen occupation), then continue
    // the submission that was interrupted to show the popup.
    const handleOccupationConfirm = (popupValues) => {
        const field = occupationPopupField;
        if (!field) return;

        const triggerValue = field.popup.triggerValue;
        const occupations = Array.isArray(popupValues[field.name]) ? popupValues[field.name] : [];
        const merged = Array.from(new Set([triggerValue, ...occupations]));

        const updates = { [field.name]: merged };
        Object.keys(popupValues).forEach((key) => {
            if (key !== field.name) updates[key] = popupValues[key];
        });

        form.setFieldsValue(updates);
        setFormValues(prev => ({ ...prev, ...updates }));
        setOccupationPopupField(null);

        // Continue the submission now that a valid occupation has been provided.
        handleSubmit();
    };

    // Helper to capitalize first letter
    const capitalize = (str) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    // Get dynamic labels
    const buildVehicleLabel = (values) => {
        if (!values) return undefined;

        const year = values.year ? String(values.year).trim() : '';
        const manufacturer = values.manufacturer ? capitalize(String(values.manufacturer).trim()) : '';

        // Use the label from vehicleDetails if available, otherwise fallback to model directly
        const vehicleLabel = values.vehicleDetails?.label || values.vehicleDetails?.model || values.model || '';

        if (!year && !manufacturer && !vehicleLabel) {
            return undefined;
        }

        // Return object for full vehicle info (to be displayed with new design)
        if (manufacturer && vehicleLabel && year) {
            return {
                manufacturer,
                year,
                model: vehicleLabel
            };
        }

        // Return string for partial info (fallback)
        if (manufacturer && year) {
            return `${manufacturer}, ${year}`;
        }

        return manufacturer || year || undefined;
    };

    const getVehicleLabel = () => {
        // For the first screen (auto-1), show live values as user types
        if (screen.id === 'auto-1') {
            const liveLabel = buildVehicleLabel(formValues);
            if (liveLabel) {
                return liveLabel;
            }
        }

        // For other screens, get the saved data for current vehicle's auto-1 screen
        const savedLabel = buildVehicleLabel(baseVehicleOverview);
        if (savedLabel) {
            return savedLabel;
        }

        // Fallback: show "Voiture X" based on current vehicle index
        return `Véhicule ${currentVehicleIndex + 1}`;
    };

    const getDriverLabel = () => {
        // For first driver screen, show live typed name (or empty if not typed yet)
        if (screen.id === '1-driver1') {
            const firstName = formValues.firstName || '';
            const lastName = formValues.lastName || '';
            if (firstName || lastName) {
                return `${firstName} ${lastName}`.trim();
            }
            return '';
        }

        // For other driver screens, get name from saved data
        if (baseDriverData?.firstName || baseDriverData?.lastName) {
            return `${baseDriverData.firstName || ''} ${baseDriverData.lastName || ''}`.trim();
        }

        // Fallback to fullName for backwards compatibility
        if (baseDriverData?.fullName) {
            return baseDriverData.fullName;
        }

        if (screen.driverLabel) {
            return screen.driverLabel;
        }
        return '';
    };

    const handleShowHelp = (info) => {
        setHelpModalInfo(info);
        setHelpModalVisible(true);
    };

    // Get dynamic options for a field
    const getFieldOptions = (field) => {
        if (screen.id === 'auto-1' && field.isDynamic) {
            switch (field.name) {
                case 'year':
                    return yearsData;
                case 'manufacturer':
                    return makesData;
                case 'model':
                    return modelsData;
            }
        }
        return field.options || [];
    };

    // Get loading state for a field
    const getFieldLoading = (field) => {
        if (screen.id === 'auto-1' && field.isDynamic) {
            switch (field.name) {
                case 'year':
                    return yearsLoading;
                case 'manufacturer':
                    return makesLoading;
                case 'model':
                    return modelsLoading;
            }
        }
        return false;
    };

    // Check if field should be disabled (cascading dependency)
    const isFieldDisabled = (field) => {
        if (screen.id === 'auto-1') {
            if (field.name === 'manufacturer' && !selectedYear) return true;
            if (field.name === 'model' && (!selectedYear || !selectedMake)) return true;
        }
        return false;
    };

    // Check if field should be hidden (only for first screen)
    const isFieldHidden = (field) => {
        if (screen.id === 'auto-1') {
            if (field.name === 'manufacturer' && !selectedYear) return true;
            if (field.name === 'model' && (!selectedYear || !selectedMake)) return true;
        }
        return false;
    };

    // Get completed drivers for showAllDrivers view with their actual indices
    const completedDriversWithIndices = allDrivers
        .map((d, idx) => ({ driver: d, index: idx }))
        .filter(({ driver }) => Object.keys(driver).length > 0);

    // Handlers for edit and remove on completed item cards
    const handleEditItem = (index, type) => {
        if (type === 'vehicle') {
            dispatch(setCurrentVehicleIndex(index));
            dispatch(jumpTo({ screenId: 'auto-1', stepId: 1 }));
        } else {
            dispatch(setCurrentDriverIndex(index));
            dispatch(jumpTo({ screenId: '1-driver1', stepId: 1 }));
        }
    };

    const handleRemoveItem = (index, type) => {
        setItemToRemove({ index, type });
    };

    const confirmRemove = () => {
        const { index, type } = itemToRemove;
        const itemName = type === 'vehicle' ? 'véhicule' : 'conducteur';

        const allItems = type === 'vehicle' ? allVehicles : allDrivers;
        const isLastItem = allItems.filter(item => Object.keys(item).length > 0).length === 1;

        if (type === 'vehicle') {
            dispatch(removeVehicle(index));
            if (isLastItem) {
                dispatch(setCurrentVehicleIndex(0));
                dispatch(jumpTo({ screenId: 'auto-1', stepId: 1 }));
            }
        } else {
            dispatch(removeDriver(index));
            if (isLastItem) {
                dispatch(setCurrentDriverIndex(0));
                dispatch(jumpTo({ screenId: '1-driver1', stepId: 1 }));
            }
        }

        setItemToRemove(null);
    };

    const cancelRemove = () => {
        setItemToRemove(null);
    };

    // Get completed vehicles (for showing previous cars when adding a new car)
    const getVehicleDisplayInfo = (vehicle, index) => {
        const auto1Data = vehicle['auto-1'] || {};
        const manufacturer = auto1Data.manufacturer || '';
        const year = auto1Data.year || '';

        // Use more descriptive labels if available
        const vehicleDetails = auto1Data.vehicleDetails || {};
        const model = vehicleDetails.label || vehicleDetails.model || auto1Data.model || '';

        // Capitalize manufacturer name safely
        const makeLabel = manufacturer
            ? String(manufacturer).charAt(0).toUpperCase() + String(manufacturer).slice(1)
            : '';

        // Model can be uppercase or just capitalized safely
        const modelLabel = model ? String(model).toUpperCase() : '';

        return {
            manufacturer: makeLabel,
            year: year,
            model: modelLabel
        };
    };

    // Get vehicles to show (all completed vehicles except the current one being edited)
    const completedVehicles = screen.stepId === 1
        ? allVehicles
            .map((v, idx) => ({ vehicle: v, index: idx }))
            .filter(({ vehicle, index }) => Object.keys(vehicle).length > 0 && index !== currentVehicleIndex)
        : [];

    // Check if we should show edit/remove buttons on other completed items' cards
    // Show buttons only when:
    // 1. Current item is fully completed (has final screen data), AND
    // 2. Not on the first screen (to keep first screen clean when starting to edit)
    const isEditingCurrentVehicle =
        allVehicles[currentVehicleIndex] &&
        allVehicles[currentVehicleIndex]['5-auto1'] &&
        screen.id !== 'auto-1';
    const isEditingCurrentDriver =
        allDrivers[currentDriverIndex] &&
        allDrivers[currentDriverIndex]['4-driver1'] &&
        screen.id !== '1-driver1';

    // Get completed drivers to show (all completed drivers except the current one being edited)
    const getDriverDisplayName = (driver) => {
        const screenData = driver['1-driver1'] || {};
        if (screenData.firstName || screenData.lastName) {
            return `${screenData.firstName || ''} ${screenData.lastName || ''}`.trim();
        }
        if (screenData.fullName) {
            return screenData.fullName;
        }
        return null;
    };

    const completedDriversForDisplay = screen.stepId === 2 && !screen.showAllDrivers
        ? allDrivers
            .map((d, idx) => ({ driver: d, index: idx }))
            .filter(({ driver, index }) => Object.keys(driver).length > 0 && index !== currentDriverIndex)
        : [];

    return (
        <div className={`screen-container screen-regular ${isVisible ? 'screen-regular--visible' : 'screen-regular--hidden'} ${screen.fields?.some(f => f.variant === 'coverage-selection') ? 'screen-coverage' : ''}`}>
            {/* Show All Drivers Section (for screen 10-driver1) */}
            {screen.showAllDrivers && (
                <>
                    {completedDriversWithIndices.map(({ driver, index }, displayIndex) => (
                        <div key={index} className="completed-item-card">
                            <div className="completed-item-card__left">
                                <img
                                    src={getAssetPath('/images/Calque_1.svg')}
                                    alt="Driver"
                                    className="completed-item-card__icon"
                                />
                                <div>
                                    <Text className="completed-item-card__label">
                                        {displayIndex === 0 ? 'Conducteur principal' : 'Conducteur occasionnel'}
                                    </Text>
                                    <Text className="completed-item-card__name">
                                        {getDriverDisplayName(driver)}
                                    </Text>
                                </div>
                            </div>
                            <CheckCircleFilled className="completed-item-card__check" />
                        </div>
                    ))}
                </>
            )}

            {/* Show Completed Vehicles when editing (show all other completed vehicles) */}
            {completedVehicles.length > 0 && (
                <>
                    {completedVehicles.map(({ vehicle, index }) => {
                        const vehicleInfo = getVehicleDisplayInfo(vehicle, index);
                        return (
                            <div key={index} className="completed-item-card">
                                <div className="completed-item-card__left">
                                    <CarIcon className="completed-item-card__car-icon" />
                                    <div>
                                        <div className="completed-item-card__vehicle-info">
                                            <div className="completed-item-card__vehicle-main">
                                                <span className="completed-item-card__manufacturer">{vehicleInfo.manufacturer}</span>
                                                {vehicleInfo.year && <span className="completed-item-card__year">, {vehicleInfo.year}</span>}
                                            </div>
                                            {vehicleInfo.model && (
                                                <div className="completed-item-card__model">{vehicleInfo.model}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <CheckCircleFilled className="completed-item-card__check" />
                            </div>
                        );
                    })}
                </>
            )}

            {/* Show Completed Drivers when editing (show all other completed drivers) */}
            {completedDriversForDisplay.length > 0 && (
                <>
                    {completedDriversForDisplay.map(({ driver, index }) => (
                        <div key={index} className="completed-item-card completed-item-card--driver">
                            <div className="completed-item-card__left">
                                <img
                                    src={getAssetPath('/images/Calque_1.svg')}
                                    alt="Driver"
                                    className="completed-item-card__icon"
                                />
                                <div>
                                    <Text className="completed-item-card__label">
                                        {index === 0 ? 'Conducteur principal' : 'Conducteur occasionnel'}
                                    </Text>
                                    <Text className="completed-item-card__name">
                                        {getDriverDisplayName(driver) || `Conducteur ${index + 1}`}
                                    </Text>
                                </div>
                            </div>
                            <CheckCircleFilled className="completed-item-card__check" />
                        </div>
                    ))}
                </>
            )}

            <ActionCard>
                {/* Vehicle Header */}
                {screen.vehicleIcon && (
                    <div className="vehicle-driver-header">
                        <CarIcon />
                        <div>
                            {(() => {
                                const vehicleLabel = getVehicleLabel();
                                // If it's an object with manufacturer, year, model
                                if (vehicleLabel && typeof vehicleLabel === 'object' && vehicleLabel.manufacturer) {
                                    return (
                                        <div className="vehicle-driver-header__vehicle-info">
                                            <div className="vehicle-driver-header__vehicle-main">
                                                <span className="vehicle-driver-header__manufacturer">{vehicleLabel.manufacturer}</span>
                                                {vehicleLabel.year && <span className="vehicle-driver-header__year">, {vehicleLabel.year}</span>}
                                            </div>
                                            {vehicleLabel.model && (
                                                <div className="vehicle-driver-header__model">{vehicleLabel.model}</div>
                                            )}
                                        </div>
                                    );
                                }
                                // Otherwise display as string (fallback)
                                return (
                                    <Text strong className="vehicle-driver-header__title">
                                        {vehicleLabel}
                                    </Text>
                                );
                            })()}
                        </div>
                    </div>
                )}

                {/* Driver Header */}
                {screen.driverIcon && (
                    <DriverHeader driverName={getDriverLabel()} driverIndex={currentDriverIndex} />
                )}

                {/* Header Text (e.g., for discount screen) */}
                {screen.headerText && (
                    <div className="screen-regular__header-text">
                        <Text className={`screen-regular__header-main ${screen.headerText.subText ? 'screen-regular__header-main--with-sub' : ''}`}>
                            {screen.headerText.text.split('**').map((part, index) =>
                                index % 2 === 1 ? (
                                    <span key={index} className="screen-regular__header-bold">{part}</span>
                                ) : (
                                    <span key={index}>{part}</span>
                                )
                            )}
                        </Text>
                        {screen.headerText.subText && (
                            <Text className="screen-regular__header-sub">
                                {screen.headerText.subText}
                            </Text>
                        )}
                    </div>
                )}
                {/* Non à tous button for screens with switch variant questions */}
                {screen.showNoToAllButton && (
                    <div className="btn-no-to-all-wrapper">
                        <button
                            type="button"
                            className="btn-no-to-all"
                            onClick={() => {
                                // Set all switch fields to 'non'
                                const updates = {};
                                screen.fields.forEach(field => {
                                    if (field.variant === 'switch') {
                                        updates[field.name] = 'non';
                                    }
                                });
                                form.setFieldsValue(updates);
                                setFormValues(prev => ({ ...prev, ...updates }));
                            }}
                        >
                            Non à tous
                        </button>
                    </div>
                )}

                <Form form={form} layout="vertical" onValuesChange={handleFormChange}>
                    {screen.fields
                        .filter(field => !isFieldHidden(field))
                        .map((field, index, array) => {
                            // Get dynamic options and loading state for the field
                            const dynamicOptions = getFieldOptions(field);
                            const isLoading = getFieldLoading(field);
                            const disabled = isFieldDisabled(field);

                            // Resolve dynamic label if labelDynamicField is specified
                            let resolvedLabel = field.label;
                            if (field.labelDynamicField && typeof field.label === 'string') {
                                const dynamicFieldName = field.labelDynamicField;
                                const dynamicValue = formValues[dynamicFieldName];

                                if (dynamicValue) {
                                    // Check if the selected value is "autre" and we have a labelWhenOther
                                    if (dynamicValue === 'autre' && field.labelWhenOther) {
                                        resolvedLabel = field.labelWhenOther;
                                    } else {
                                        // Find the parent field to get its options and find the selected label
                                        const parentField = screen.fields.find(f => f.name === dynamicFieldName);
                                        if (parentField) {
                                            // Collect all options: flat options + options from optionGroups
                                            let allOptions = [];
                                            const flatOptions = getFieldOptions(parentField).length > 0
                                                ? getFieldOptions(parentField)
                                                : (parentField.options || []);
                                            allOptions.push(...flatOptions);

                                            // Also search through optionGroups if present
                                            if (parentField.optionGroups) {
                                                parentField.optionGroups.forEach(group => {
                                                    allOptions.push(...(group.options || []));
                                                });
                                            }

                                            const selectedOption = allOptions.find(opt => opt.value === dynamicValue);
                                            if (selectedOption) {
                                                // Replace placeholder {fieldName} with the selected label
                                                resolvedLabel = field.label.replace(`{${dynamicFieldName}}`, selectedOption.label);
                                            }
                                        }
                                    }
                                }
                            }

                            // Create a modified field with dynamic options and resolved label
                            const fieldWithOptions = {
                                ...field,
                                label: resolvedLabel,
                                options: dynamicOptions.length > 0 ? dynamicOptions : (field.options || []),
                            };

                            return (
                                <FieldRenderer
                                    key={field.name}
                                    form={form}
                                    field={fieldWithOptions}
                                    isLastField={index === array.length - 1}
                                    formValues={formValues}
                                    isLoading={isLoading}
                                    disabled={disabled}
                                    onChange={handleFormChange}
                                    onShowHelp={handleShowHelp}
                                />
                            );
                        })}
                </Form>


                {/* Alternative link section (e.g., "Trouver l'auto avec le NIV") */}
                {screen.alternativeLink && (
                    <div className="alternative-link-section">
                        {/* Divider with "ou" text */}
                        <div className="alternative-link-divider">
                            <div className="alternative-link-divider__line" />
                            <span className="alternative-link-divider__text">
                                ou
                            </span>
                            <div className="alternative-link-divider__line" />
                        </div>

                        {/* Link */}
                        <div className="add-vehicle-alternative-link">
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (screen.alternativeLink.targetScreen) {
                                        onNavigate(screen.alternativeLink.targetScreen);
                                    }
                                }}
                                className="alternative-link__anchor"
                            >
                                {screen.alternativeLink.text}
                            </a>
                        </div>
                    </div>
                )}
            </ActionCard>

            {/* Single button like original DynamicForm - Retour is handled by App.jsx */}
            <div className="form-buttons-container">
                <PrimaryButton onClick={handleSubmit}>
                    Suivant
                </PrimaryButton>
            </div>

            {/* Confirm Remove Modal */}
            <Modal getContainer={() => document.querySelector(".car-funnel") || document.body}
                open={itemToRemove !== null}
                onOk={confirmRemove}
                onCancel={cancelRemove}
                okText="Supprimer"
                cancelText="Annuler"
                okButtonProps={{ danger: true }}
                centered
                closeIcon={null}
                styles={{
                    body: { padding: '24px' }
                }}
            >
                <div className="confirm-modal__content">
                    <ExclamationCircleOutlined className="confirm-modal__icon" />
                    <div>
                        <h3 className="confirm-modal__title">
                            Supprimer ce {itemToRemove?.type === 'vehicle' ? 'véhicule' : 'conducteur'}?
                        </h3>
                        <p className="confirm-modal__text">
                            Êtes-vous sûr de vouloir supprimer ce {itemToRemove?.type === 'vehicle' ? 'véhicule' : 'conducteur'}? Cette action ne peut pas être annulée.
                        </p>
                    </div>
                </div>
            </Modal>

            <InfoModal
                visible={helpModalVisible}
                onClose={() => setHelpModalVisible(false)}
                image={helpModalInfo.image}
                text={helpModalInfo.text}
                imageStyle={helpModalInfo.imageStyle}
            />

            {occupationPopupField && (
                <OccupationPopup
                    visible={!!occupationPopupField}
                    config={occupationPopupField.popup}
                    initialValues={buildOccupationPopupInitialValues(occupationPopupField)}
                    onConfirm={handleOccupationConfirm}
                    onClose={() => setOccupationPopupField(null)}
                />
            )}
        </div>
    );
};

export default ScreenRegular;
