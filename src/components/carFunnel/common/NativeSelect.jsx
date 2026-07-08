/* eslint-disable */
import React from 'react';
import { Form } from 'antd';
import HelpIcon from 'components/carFunnel/common/HelpIcon';
import 'styles/carFunnel/components/NativeSelect.css';

/**
 * NativeSelect — a styled native <select> element that matches the Ant Design
 * Select look. Used on iOS / Android so the device's native picker pops up.
 */
export const NativeSelect = ({
    field,
    options = [],
    disabled = false,
    isLoading = false,
    isLastField = false,
    onChange,
    onShowHelp,
}) => {
    const itemClass = isLastField ? 'ant-form-item-no-margin' : 'ant-form-item-standard-margin';

    const handleHelpClick = () => {
        if (onShowHelp && field.helpInfo) {
            onShowHelp(field.helpInfo);
        }
    };

    return (
        <Form.Item
            className={itemClass}
            label={
                <span>
                    {field.label}
                    {(field.helpIcon || field.hasHelpIcon) && (
                        <HelpIcon
                            tooltipText={field.helpTooltip}
                            onClick={field.helpInfo ? handleHelpClick : undefined}
                        />
                    )}
                </span>
            }
            name={field.name}
            rules={[{ required: field.required !== false, message: '*Requis' }]}
            initialValue={field.defaultValue}
            getValueFromEvent={(e) => e.target.value || undefined}
        >
            <div className="native-select-wrapper">
                {/* We wrap in a Form.Item child component pattern via render prop */}
                <NativeSelectInner
                    options={options}
                    placeholder={isLoading ? 'Chargement...' : (field.placeholder || 'Sélectionner...')}
                    disabled={isLoading || disabled}
                    onChange={onChange}
                    mode={field.mode}
                />
            </div>
        </Form.Item>
    );
};

/**
 * Inner component that receives the Ant Design Form value/onChange injection
 * and binds it to the native <select>.
 */
const NativeSelectInner = React.forwardRef(({
    value,
    onChange: antdOnChange,
    options,
    placeholder,
    disabled,
    mode,
    onChange: externalOnChange,
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
        if (externalOnChange) externalOnChange(val);
    };

    // Normalize value for the native select
    const selectValue = isMultiple
        ? (Array.isArray(value) ? value : (value ? [value] : []))
        : (value || '');

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
                {options.map((opt) => (
                    <option
                        key={opt.value}
                        value={opt.value}
                        disabled={opt.disabled || false}
                    >
                        {opt.label}
                    </option>
                ))}
            </select>
            {/* Custom caret arrow */}
            <span className="native-select-arrow" aria-hidden="true">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </span>
        </div>
    );
});

NativeSelectInner.displayName = 'NativeSelectInner';

export default NativeSelect;
