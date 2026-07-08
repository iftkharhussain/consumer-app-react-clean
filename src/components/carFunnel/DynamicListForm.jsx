/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Form, Select, Typography } from 'antd';
import ActionCard from './ActionCard';
import PrimaryButton from './common/PrimaryButton';
import SecondaryButton from './common/SecondaryButton';
import ImprovedDatePicker from './common/ImprovedDatePicker';
import { getAssetPath } from 'utils/carFunnel/assetPath';
import 'styles/carFunnel/components/DynamicListForm.css';

const { Text } = Typography;

const DynamicListForm = ({
  currentScreen,
  onNavigate,
  onBack,
  currentDriverData = {},
  completedDrivers = [],
  currentDriverIndex = 0
}) => {
  const [form] = Form.useForm();
  const startEmpty = currentScreen?.dynamicListConfig?.startEmpty || false;
  const [items, setItems] = useState(startEmpty ? [] : [{ id: 1 }]);
  const [formValues, setFormValues] = useState({});

  // Reset items when screen changes - each screen should have independent state
  useEffect(() => {
    const shouldStartEmpty = currentScreen?.dynamicListConfig?.startEmpty || false;
    setItems(shouldStartEmpty ? [] : [{ id: 1 }]);
    form.resetFields();
    setFormValues({});
  }, [currentScreen?.id, form]);

  // Helper to get dynamic driver label
  const getDriverLabel = () => {
    // Always read from currentDriverData for the driver currently being edited
    // The name is always stored in '1-driver1' screen data
    const driver1Data = currentDriverData?.['1-driver1'];

    // Check for fullName field first
    if (driver1Data && driver1Data.fullName) {
      return driver1Data.fullName;
    }

    // Fallback to firstName/lastName if available
    if (driver1Data && driver1Data.firstName && driver1Data.lastName) {
      return `${driver1Data.firstName} ${driver1Data.lastName}`;
    }

    return currentScreen?.driverLabel || `Conducteur ${currentDriverIndex + 1}`;
  };

  const handleFormChange = () => {
    setFormValues(form.getFieldsValue());
  };

  if (!currentScreen) {
    console.error('No current screen provided to DynamicListForm');
    return <div>Screen not found</div>;
  }

  const addItem = () => {
    // Check max limit (default to 2 if not specified)
    const maxItems = currentScreen.dynamicListConfig?.maxItems || 2;
    if (items.length >= maxItems) {
      return;
    }

    const newId = items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
    setItems([...items, { id: newId }]);
  };

  const removeItem = (id) => {
    // Allow removing items even if it's the last one
    setItems(items.filter(item => item.id !== id));
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (currentScreen.nextScreen) {
        if (onNavigate) onNavigate(currentScreen.nextScreen, values);
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  // Check if all required fields for all items are filled, or if no required fields, check if form has been touched
  const isFormValid = () => {
    const requiredFields = currentScreen?.fields?.filter(field => field.required && !field.isGrouped);

    // If there are required fields, check they are filled for all items
    if (requiredFields && requiredFields.length > 0) {
      return items.every(item => {
        return requiredFields.every(field => {
          const fieldName = item.id > 1 ? `${field.name}_${item.id}` : field.name;
          const value = form.getFieldValue(fieldName);
          return value !== undefined && value !== null && value !== '';
        });
      });
    }

    // If no required fields, check if ALL fields in each item have been filled
    const allFields = currentScreen?.fields?.filter(field => !field.isGrouped);
    if (!allFields || allFields.length === 0) return true;

    return items.every(item => {
      return allFields.every(field => {
        const fieldName = item.id > 1 ? `${field.name}_${item.id}` : field.name;
        const value = form.getFieldValue(fieldName);
        return value !== undefined && value !== null && value !== '';
      });
    });
  };

  const renderField = (field, itemId, itemIndex, isLastField = false) => {
    const fieldName = itemId > 1 ? `${field.name}_${itemId}` : field.name;
    const useShortLabel = currentScreen.dynamicListConfig?.shortLabelAfterFirst && itemIndex > 0;
    const displayLabel = useShortLabel && field.shortLabel ? field.shortLabel : field.label;

    const itemClass = isLastField ? 'ant-form-item-no-margin' : 'ant-form-item-standard-margin';

    switch (field.type) {
      case 'dropdown':
        return (
          <Form.Item
            label={displayLabel}
            name={fieldName}
            rules={[{ required: field.required, message: '*Requis' }]}
            key={fieldName}
            className={itemClass}
          >
            <Select
              placeholder={field.placeholder}
              showSearch={false}
            >
              {field.options?.map(option => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        );

      case 'date':
        if (field.groupWith) {
          // This is the first field in a group
          const endField = currentScreen.fields.find(f => f.name === field.groupWith);
          const endFieldName = itemId > 1 ? `${endField.name}_${itemId}` : endField.name;

          // Remove margin if this is the last field and there's a fieldFooterText
          const hasFooterText = currentScreen.fieldFooterText && isLastField;

          return (
            <div key={fieldName} className={hasFooterText ? 'mb-0' : 'mb-24'}>
              <Text className="dynamic-list-field-group-label">
                {field.label}
              </Text>
              <div className="dynamic-list-field-grid">
                <div>
                  <Text className="dynamic-list-field-sublabel">
                    {field.subLabel}
                  </Text>
                  <Form.Item
                    name={fieldName}
                    rules={[{ required: field.required, message: 'Requis' }]}
                    className="ant-form-item-no-margin"
                  >
                    <ImprovedDatePicker
                      placeholder={field.placeholder}
                    />
                  </Form.Item>
                </div>
                <div>
                  <Text className="dynamic-list-field-sublabel">
                    {endField.subLabel}
                  </Text>
                  <Form.Item
                    name={endFieldName}
                    rules={[{ required: endField.required, message: 'Requis' }]}
                    className="ant-form-item-no-margin"
                  >
                    <ImprovedDatePicker
                      placeholder={endField.placeholder}
                    />
                  </Form.Item>
                </div>
              </div>
            </div>
          );
        }

        // Skip grouped fields as they're rendered with their parent
        if (field.isGrouped) {
          return null;
        }

        return (
          <Form.Item
            label={field.label}
            name={fieldName}
            rules={[{ required: field.required, message: '*Requis' }]}
            key={fieldName}
            className={`dynamic-list-field-limited-width ${itemClass}`}
          >
            <ImprovedDatePicker
              placeholder={field.placeholder}
            />
          </Form.Item>
        );

      default:
        return null;
    }
  };

  return (
    <div className="dynamic-list-form-container">
      <ActionCard>
        {currentScreen.driverIcon && (
          <div className="dynamic-list-driver-header">
            <img
              src={getAssetPath('/images/Calque_1.svg')}
              alt="Driver"
              className="dynamic-list-driver-icon"
            />
            <div className="dynamic-list-driver-info">
              <Text className="dynamic-list-driver-label">
                Conducteur principal
              </Text>
              <Text className="dynamic-list-driver-name">
                {getDriverLabel()}
              </Text>
            </div>
          </div>
        )}

        {currentScreen.sectionTitle && (
          <div className={currentScreen.sectionSubtitle ? 'dynamic-list-section-title-container' : 'mb-0'}>
            <Text className="dynamic-list-section-title">
              {currentScreen.sectionTitle}
            </Text>
          </div>
        )}

        {currentScreen.sectionSubtitle && (
          <Text className="dynamic-list-section-subtitle">
            {currentScreen.sectionSubtitle}
          </Text>
        )}
      </ActionCard>

      {items.map((item, index) => (
        <ActionCard key={item.id}>
          <div className="dynamic-list-item-header">
            <Text className="dynamic-list-item-title">
              {/* Use short label for items after the first */}
              {index === 0
                ? `${currentScreen.dynamicListConfig.itemLabel} ${item.id}`
                : `${currentScreen.dynamicListConfig.itemLabelShort || currentScreen.dynamicListConfig.itemLabel} ${item.id}`
              }
            </Text>
            {currentScreen.dynamicListConfig.canRemove && (
              <button
                onClick={() => removeItem(item.id)}
                className="dynamic-list-remove-btn"
              >
                <img
                  src={getAssetPath('/images/cross.svg')}
                  alt="Remove"
                  className="dynamic-list-remove-icon"
                />
              </button>
            )}
          </div>

          <Form
            form={form}
            layout="vertical"
            size="large"
            onValuesChange={handleFormChange}
            className="mb-0"
          >
            {currentScreen.fields?.map((field, fieldIndex, fieldArray) => renderField(field, item.id, index, fieldIndex === fieldArray.length - 1))}
          </Form>

          {currentScreen.fieldFooterText && (
            <Text className="dynamic-list-field-footer-text">
              {currentScreen.fieldFooterText}
            </Text>
          )}
        </ActionCard>
      ))}

      <div className="dynamic-list-actions">
        {currentScreen.dynamicListConfig && (
          <SecondaryButton
            onClick={addItem}
            disabled={!isFormValid() || items.length >= (currentScreen.dynamicListConfig?.maxItems || 2)}
            className={(!isFormValid() || items.length >= (currentScreen.dynamicListConfig?.maxItems || 2)) ? 'opacity-50 pointer-events-none' : ''}
          >
            {currentScreen.dynamicListConfig.addButtonText}
          </SecondaryButton>
        )}
        <PrimaryButton onClick={handleSubmit}>Suivant</PrimaryButton>
      </div>
    </div>
  );
};

export default DynamicListForm;
