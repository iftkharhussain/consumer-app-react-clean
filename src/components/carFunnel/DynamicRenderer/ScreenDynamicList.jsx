/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Form, Button, Typography } from 'antd';
import { CloseOutlined, CheckCircleFilled } from '@ant-design/icons';
import { useAppDispatch, useAppSelector, setDriverData, setVehicleData, selectDriverScreenData, selectVehicleScreenData, selectDrivers } from 'store/carFunnel';
import ActionCard from 'components/carFunnel/ActionCard';
import PrimaryButton from 'components/carFunnel/common/PrimaryButton';
import SecondaryButton from 'components/carFunnel/common/SecondaryButton';
import DriverHeader from 'components/carFunnel/common/DriverHeader';
import { FieldRenderer } from './FieldRenderer';
import { getAssetPath } from 'utils/carFunnel/assetPath';
import 'styles/carFunnel/screens/ScreenDynamicList.css';

const { Text } = Typography;

export const ScreenDynamicList = ({
    screen,
    onNavigate,
    onBack,
    currentDriverIndex = 0,
}) => {
    const dispatch = useAppDispatch();
    const [form] = Form.useForm();
    const startEmpty = screen.dynamicListConfig?.startEmpty || false;
    const [items, setItems] = useState(startEmpty ? [] : [{ id: 1 }]);
    const [formValues, setFormValues] = useState({});

    // Get driver name from first driver screen
    const baseDriverData = useAppSelector(selectDriverScreenData('1-driver1'));

    // Get data from conditional check screen (e.g., 4-driver1)
    const conditionalCheckScreenData = useAppSelector(
        selectDriverScreenData(screen.conditionalNextScreen?.checkScreenId || '')
    );

    // Get all drivers for showing completed drivers
    const allDrivers = useAppSelector(selectDrivers);

    // Helper function to get driver display name
    const getDriverDisplayName = (driver) => {
        const screenData = driver['1-driver1'] || {};
        if (screenData.fullName) {
            return screenData.fullName;
        }
        return null;
    };

    // Get completed drivers to display when adding second driver
    const completedDriversForDisplay = screen.stepId === 2 && currentDriverIndex > 0
        ? allDrivers.slice(0, currentDriverIndex).filter(d => Object.keys(d).length > 0)
        : [];

    // Get saved data from Redux
    const savedDriverData = useAppSelector(selectDriverScreenData(screen.id));
    const savedVehicleData = useAppSelector(selectVehicleScreenData(screen.id));

    // Reset items and load saved data when screen changes
    useEffect(() => {
        let savedData;
        if (screen.stepId === 1) {
            savedData = savedVehicleData;
        } else if (screen.stepId === 2) {
            savedData = savedDriverData;
        }

        if (savedData && Object.keys(savedData).length > 0) {
            // Find max item ID from saved field names (e.g., reason_2, date_3)
            let maxId = 1;
            Object.keys(savedData).forEach(key => {
                const parts = key.split('_');
                if (parts.length > 1) {
                    const id = parseInt(parts[parts.length - 1]);
                    if (!isNaN(id) && id > maxId) {
                        maxId = id;
                    }
                }
            });

            // Reconstruct items array
            const newItems = [];
            for (let i = 1; i <= maxId; i++) {
                newItems.push({ id: i });
            }
            setItems(newItems);

            // Load data into form
            form.setFieldsValue(savedData);
            setFormValues(savedData);
        } else {
            // Default behavior
            const shouldStartEmpty = screen.dynamicListConfig?.startEmpty || false;
            setItems(shouldStartEmpty ? [] : [{ id: 1 }]);
            form.resetFields();
            setFormValues({});
        }
    }, [screen.id, form, savedDriverData, savedVehicleData, screen.stepId, screen.dynamicListConfig?.startEmpty]);

    const handleFormChange = () => {
        setFormValues(form.getFieldsValue());
    };

    const addItem = () => {
        const maxItems = screen.dynamicListConfig?.maxItems || 2;
        if (items.length >= maxItems) {
            return;
        }

        const newId = items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1;
        setItems([...items, { id: newId }]);
    };

    const removeItem = (id) => {
        setItems(items.filter((item) => item.id !== id));
        
        // Also remove the field values from the form when an item is removed
        const currentValues = form.getFieldsValue();
        const newValues = { ...currentValues };
        
        // Identify fields associated with this item ID
        Object.keys(newValues).forEach(key => {
            if (id === 1) {
                // For ID 1, we only remove fields WITHOUT a suffix
                const isSuffixed = screen.fields.some(f => key === `${f.name}_${key.split('_').pop()}`);
                if (!isSuffixed && screen.fields.some(f => key === f.name)) {
                    delete newValues[key];
                }
            } else if (key.endsWith(`_${id}`)) {
                delete newValues[key];
            }
        });
        
        form.setFieldsValue(newValues);
        setFormValues(newValues);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            // Save to store based on step
            if (screen.stepId === 1) {
                dispatch(setVehicleData({ screenId: screen.id, data: values }));
            } else if (screen.stepId === 2) {
                dispatch(setDriverData({ screenId: screen.id, data: values }));
            }

            // Determine next screen - check for conditional navigation
            let nextScreenId = screen.nextScreen;

            // Handle conditional next screen based on answers from another screen (e.g., 4-driver1)
            if (screen.conditionalNextScreen && conditionalCheckScreenData) {
                for (const condition of screen.conditionalNextScreen.conditions) {
                    if (conditionalCheckScreenData[condition.field] === condition.value) {
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

    const getDriverLabel = () => {
        // Get name from saved driver data
        if (baseDriverData?.fullName) {
            return baseDriverData.fullName;
        }

        if (screen.driverLabel) {
            return screen.driverLabel;
        }
        return `Conducteur ${currentDriverIndex + 1}`;
    };

    return (
        <div className="screen-container screen-dynamic-list">
            {/* Show Completed Drivers when adding additional drivers */}
            {completedDriversForDisplay.length > 0 && (
                <>
                    {completedDriversForDisplay.map((driver, index) => (
                        <div key={index} className="completed-driver-card">
                            <div className="completed-driver-card__left">
                                <img
                                    src={getAssetPath('/images/Calque_1.svg')}
                                    alt="Driver"
                                    className="completed-driver-card__icon"
                                />
                                <div>
                                    <Text className="completed-driver-card__label">
                                        {index === 0 ? 'Conducteur principal' : 'Conducteur occasionnel'}
                                    </Text>
                                    <Text className="completed-driver-card__name">
                                        {getDriverDisplayName(driver) || `Conducteur ${index + 1}`}
                                    </Text>
                                </div>
                            </div>
                            <CheckCircleFilled className="completed-driver-card__check" />
                        </div>
                    ))}
                </>
            )}

            {/* First card: Driver header + Card Title/Subtitle */}
            <ActionCard>
                {/* Driver header with separator line */}
                {screen.driverIcon && (
                    <DriverHeader driverName={getDriverLabel()} driverIndex={currentDriverIndex} />
                )}

                {/* Card title and subtitle below driver header */}
                {(screen.cardTitle || screen.title) && (
                    <Text className={`dynamic-list-card-title ${(screen.cardSubtitle || screen.subtitle) ? 'dynamic-list-card-title--with-subtitle' : ''}`}>
                        {screen.cardTitle || screen.title}
                    </Text>
                )}
                {(screen.cardSubtitle || screen.subtitle) && (
                    <Text className="dynamic-list-card-subtitle">
                        {screen.cardSubtitle || screen.subtitle}
                    </Text>
                )}
            </ActionCard>

            {/* Dynamic list items - outside card */}
            <Form form={form} layout="vertical" onValuesChange={handleFormChange} className="dynamic-list-form">
                {items.map((item, itemIndex) => (
                    <div key={item.id} className="dynamic-list-item">
                        {/* Remove button */}
                        <Button
                            type="text"
                            icon={<CloseOutlined />}
                            onClick={() => removeItem(item.id)}
                            className="dynamic-list-item__remove-btn"
                        />

                        {/* Item label */}
                        <Text className="dynamic-list-item__title">
                            {screen.dynamicListConfig?.itemLabel || 'Item'} {itemIndex + 1}
                        </Text>

                        {/* Fields for this item */}
                        {screen.fields.map((field, fieldIndex) => {
                            const fieldName = item.id > 1 ? `${field.name}_${item.id}` : field.name;
                            const modifiedField = { ...field, name: fieldName };

                            return (
                                <FieldRenderer
                                    key={fieldName}
                                    field={modifiedField}
                                    form={form}
                                    isLastField={fieldIndex === screen.fields.length - 1}
                                    formValues={formValues}
                                />
                            );
                        })}

                        {/* Help text */}
                        {screen.helpText && (
                            <Text className="dynamic-list-item__help-text">
                                {screen.helpText}
                            </Text>
                        )}
                    </div>
                ))}
            </Form>

            {/* Buttons section */}
            <div className="dynamic-list-buttons">
                <SecondaryButton
                    onClick={addItem}
                    disabled={items.length >= (screen.dynamicListConfig?.maxItems || 2)}
                >
                    {screen.dynamicListConfig?.addButtonText || 'Ajouter +'}
                </SecondaryButton>
                <PrimaryButton onClick={handleSubmit}>Suivant</PrimaryButton>
            </div>
        </div>
    );
};

export default ScreenDynamicList;
