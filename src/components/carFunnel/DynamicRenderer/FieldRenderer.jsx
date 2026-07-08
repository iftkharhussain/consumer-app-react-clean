/* eslint-disable */
import React from 'react';
import { DropdownField } from 'components/carFunnel/fields/DropdownField';
import { TextField } from 'components/carFunnel/fields/TextField';
import { NumberField } from 'components/carFunnel/fields/NumberField';
import { DateField } from 'components/carFunnel/fields/DateField';
import { DateRangeField } from 'components/carFunnel/fields/DateRangeField';
import { ButtonGroupField } from 'components/carFunnel/fields/ButtonGroupField';
import { PhoneField } from 'components/carFunnel/fields/PhoneField';
import { RadioField } from 'components/carFunnel/fields/RadioField';
import { AddressField } from 'components/carFunnel/fields/AddressField';
import { ImageSelectField } from 'components/carFunnel/fields/ImageSelectField';
import { CheckboxSelectField } from 'components/carFunnel/fields/CheckboxSelectField';
import InputWithSuffix from 'components/carFunnel/common/InputWithSuffix';

// Recursive function to render a single field
const renderSingleField = (field, form, isLastField, formValues, isLoading, disabled, onChange, onShowHelp) => {
    switch (field.type) {
        case 'dropdown':
            return (
                <DropdownField
                    field={field}
                    isLoading={isLoading}
                    disabled={disabled}
                    onChange={onChange}
                    isLastField={isLastField}
                    formValues={formValues}
                    onShowHelp={onShowHelp}
                />
            );

        case 'text':
            return <TextField field={field} isLastField={isLastField} onShowHelp={onShowHelp} />;

        case 'inputWithSuffix':
            return <InputWithSuffix field={field} isLastField={isLastField} />;

        case 'number':
            return <NumberField field={field} isLastField={isLastField} />;

        case 'date':
            return <DateField field={field} isLastField={isLastField} />;

        case 'dateRange':
            return <DateRangeField field={field} isLastField={isLastField} />;

        case 'buttonGroup':
            return <ButtonGroupField field={field} form={form} isLastField={isLastField} />;

        case 'phone':
            return <PhoneField field={field} isLastField={isLastField} />;

        case 'address':
            return <AddressField field={field} form={form} isLastField={isLastField} onChange={onChange} />;

        case 'radio':
            return <RadioField field={field} isLastField={isLastField} />;

        case 'imageSelect':
            return <ImageSelectField field={field} isLastField={isLastField} />;

        case 'checkboxSelect':
            return <CheckboxSelectField field={field} isLastField={isLastField} />;

        default:
            return null;
    }
};

export const FieldRenderer = ({
    field,
    form,
    isLastField = false,
    formValues = {},
    isLoading = false,
    disabled = false,
    onChange,
    onShowHelp,
}) => {
    // Check if field is hidden
    if (field.hidden) {
        return (
            <div className="field-hidden-wrapper" style={{ display: 'none' }}>
                {renderSingleField(field, form, isLastField, formValues, isLoading, disabled, onChange, onShowHelp)}
            </div>
        );
    }

    // Check if field should be conditionally shown
    if (field.showWhen) {
        const conditionField = field.showWhen.field;
        const conditionValue = field.showWhen.value;
        const operator = field.showWhen.operator || 'equal';
        const currentValue = formValues[conditionField];

        let conditionMet = false;

        // Handle 'any' value - show when any value is selected (not null/undefined/empty)
        if (conditionValue === 'any') {
            conditionMet = !(!currentValue || currentValue === '' || (Array.isArray(currentValue) && currentValue.length === 0));
        } else if (operator === 'notEqual') {
            conditionMet = !(!currentValue || currentValue === '' || currentValue === conditionValue);
        } else if (operator === 'in') {
            conditionMet = !(!currentValue || currentValue === '' || !Array.isArray(conditionValue) || !conditionValue.includes(currentValue));
        } else if (operator === 'includesAny') {
            conditionMet = !(!Array.isArray(currentValue) || currentValue.length === 0 || !Array.isArray(conditionValue) || !conditionValue.some(v => currentValue.includes(v)));
        } else {
            if (Array.isArray(currentValue)) {
                conditionMet = !(!currentValue || currentValue.length === 0 || !currentValue.includes(conditionValue));
            } else {
                conditionMet = currentValue === conditionValue;
            }
        }

        if (!conditionMet) {
            // Keep the field mounted (hidden) so Ant Design preserves its value in the
            // form store. Returning null would unmount it and erase the stored value.
            return (
                <div style={{ display: 'none' }}>
                    {renderSingleField(field, form, isLastField, formValues, isLoading, disabled, onChange, onShowHelp)}
                </div>
            );
        }
    }

    // Handle 'row' type - renders multiple fields side by side
    if (field.type === 'row') {
        const rowStyle = {
            '--field-row-gap': field.gap,
            '--field-row-mb': isLastField ? '0' : undefined
        };

        return (
            <div
                className={`field-row ${isLastField ? 'field-row--last' : ''}`}
                style={rowStyle}
            >
                {field.fields.map((subField, index) => {
                    const itemStyle = { '--field-item-flex': subField.flex };
                    return (
                        <div
                            key={subField.name}
                            className="field-row__item"
                            style={itemStyle}
                        >
                            {renderSingleField(
                                subField,
                                form,
                                isLastField && index === field.fields.length - 1,
                                formValues,
                                isLoading,
                                disabled,
                                onChange,
                                onShowHelp
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    return renderSingleField(field, form, isLastField, formValues, isLoading, disabled, onChange, onShowHelp);
};

export default FieldRenderer;

