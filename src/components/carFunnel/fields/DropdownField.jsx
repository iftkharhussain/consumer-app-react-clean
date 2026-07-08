/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Form, Select, Spin } from 'antd';
import HelpIcon from 'components/carFunnel/common/HelpIcon';
import { isMobileDevice } from 'hooks/carFunnel/useIsMobile';
import 'styles/carFunnel/components/NativeSelect.css';

const { OptGroup } = Select;

// ─── Native select inner (for Ant Design Form injection) ──────────────────────
const NativeSelectInner = React.forwardRef(({
    value,
    onChange: antdOnChange,
    options = [],
    optionGroups,
    placeholder,
    disabled,
    mode,
    onExternalChange,
}, ref) => {
    const isMultiple = mode === 'multiple';

    const handleChange = (e) => {
        let val;
        if (isMultiple) {
            val = Array.from(e.target.selectedOptions).map(o => o.value);
        } else {
            val = e.target.value || undefined;
        }
        if (antdOnChange) antdOnChange(val);
        if (onExternalChange) onExternalChange(val);
    };

    const selectValue = isMultiple
        ? (Array.isArray(value) ? value : (value ? [value] : []))
        : (value ?? '');

    return (
        <div className="native-select-wrapper">
            <select
                ref={ref}
                className="native-select"
                value={selectValue}
                onChange={handleChange}
                disabled={disabled}
                multiple={isMultiple || false}
            >
                {!isMultiple && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}
                {optionGroups && optionGroups.length > 0 ? (
                    optionGroups.map((group, gIdx) => (
                        <optgroup key={gIdx} label={group.label}>
                            {group.options.map((opt) => (
                                <option
                                    key={opt.value}
                                    value={opt.value}
                                    disabled={opt.disabled || false}
                                >
                                    {opt.label}
                                </option>
                            ))}
                        </optgroup>
                    ))
                ) : (
                    options.map((opt) => (
                        <option
                            key={opt.value}
                            value={opt.value}
                            disabled={opt.disabled || false}
                        >
                            {opt.label}
                        </option>
                    ))
                )}
            </select>
            {/* Custom caret mimicking Ant Design */}
            <span className="native-select-arrow" aria-hidden="true">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </span>
        </div>
    );
});

NativeSelectInner.displayName = 'NativeSelectInner';

// ─── DropdownField ─────────────────────────────────────────────────────────────
export const DropdownField = ({
    field,
    isLoading = false,
    disabled = false,
    onChange,
    isLastField = false,
    formValues = {},
    onShowHelp,
}) => {
    const form = Form.useFormInstance();
    const [selectedValues, setSelectedValues] = useState([]);

    // Get options - either conditional or static
    // If optionGroups exist, flatten them into a single array for compatibility
    const getFieldOptions = () => {
        if (field.conditionalOptions && field.conditionalOptions.field) {
            const parentValue = formValues[field.conditionalOptions.field];
            if (parentValue && field.conditionalOptions.optionsMap && field.conditionalOptions.optionsMap[parentValue]) {
                return field.conditionalOptions.optionsMap[parentValue];
            }
            return [];
        }
        if (field.optionGroups) {
            return field.optionGroups.flatMap(group => group.options || []);
        }
        return field.options || [];
    };

    // Sync selectedValues with form values on mount
    useEffect(() => {
        const currentValue = form.getFieldValue(field.name);
        if (currentValue !== undefined) {
            setSelectedValues(Array.isArray(currentValue) ? currentValue : [currentValue]);
        }
    }, [form, field.name]);

    const handleChange = (value) => {
        // Handle exclusive value logic for multiple select
        if (field.mode === 'multiple' && field.multipleExclusiveValue) {
            const exclusiveValue = field.multipleExclusiveValue;
            let newValue = value;

            if (Array.isArray(value)) {
                if (value.includes(exclusiveValue) && !selectedValues.includes(exclusiveValue)) {
                    newValue = [exclusiveValue];
                } else if (selectedValues.includes(exclusiveValue) && value.length > 1) {
                    newValue = value.filter(v => v !== exclusiveValue);
                }
            }

            setSelectedValues(newValue);
            if (onChange) onChange(newValue);
            return newValue;
        }

        setSelectedValues(value);
        if (onChange) onChange(value);
        return value;
    };

    const getDisabledOptions = () => {
        const options = getFieldOptions();
        if (field.mode === 'multiple' && field.multipleExclusiveValue) {
            const exclusiveValue = field.multipleExclusiveValue;
            if (selectedValues.includes(exclusiveValue)) {
                return options.map(option => ({ ...option, disabled: option.value !== exclusiveValue }));
            } else if (selectedValues.length > 0) {
                return options.map(option => ({ ...option, disabled: option.value === exclusiveValue }));
            }
        }
        return options;
    };

    const handleHelpClick = () => {
        if (onShowHelp && field.helpInfo) onShowHelp(field.helpInfo);
    };

    const itemClass = isLastField ? 'ant-form-item-no-margin' : 'ant-form-item-standard-margin';
    const options = getDisabledOptions();
    const placeholder = isLoading ? 'Chargement...' : (field.placeholder || 'Sélectionner...');

    const label = (
        <span>
            {field.label}
            {(field.helpIcon || field.hasHelpIcon) && (
                <HelpIcon
                    tooltipText={field.helpTooltip}
                    onClick={field.helpInfo ? handleHelpClick : undefined}
                />
            )}
            {field.description && (
                <span style={{ display: 'block', fontSize: '13px', color: '#697586', marginTop: '8px', fontWeight: 'normal', lineHeight: '1.5' }}>
                    {field.description}
                </span>
            )}
        </span>
    );

    // ── MOBILE: render native <select> so iOS/Android picker appears ─────────
    if (isMobileDevice) {
        return (
            <Form.Item
                className={itemClass}
                label={label}
                name={field.name}
                rules={[{ required: field.required !== false, message: '*Requis' }]}
                initialValue={field.defaultValue}
            >
                <NativeSelectInner
                    options={options}
                    optionGroups={field.optionGroups}
                    placeholder={placeholder}
                    disabled={isLoading || disabled}
                    mode={field.mode}
                    onExternalChange={handleChange}
                />
            </Form.Item>
        );
    }

    // ── DESKTOP: keep existing Ant Design Select ─────────────────────────────
    return (
        <Form.Item
            className={itemClass}
            label={label}
            name={field.name}
            rules={[{ required: field.required !== false, message: '*Requis' }]}
            initialValue={field.defaultValue}
        >
            <Select
                mode={field.mode}
                placeholder={placeholder}
                notFoundContent={isLoading ? <Spin size="small" /> : 'Aucune option'}
                loading={isLoading}
                disabled={isLoading || disabled}
                showSearch={field.showSearch || false}
                filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                onChange={handleChange}
                options={field.optionGroups
                    ? field.optionGroups.map((group) => ({
                        label: group.label,
                        options: group.options.map((opt) => ({
                            value: opt.value,
                            label: opt.label,
                            disabled: opt.disabled || false,
                        })),
                    }))
                    : options.map((option) => ({
                        value: option.value,
                        label: option.label,
                        disabled: option.disabled || false,
                    }))
                }
            />
        </Form.Item>
    );
};

export default DropdownField;
