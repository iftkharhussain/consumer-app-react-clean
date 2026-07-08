/* eslint-disable */
import React from 'react';
import { Form, InputNumber } from 'antd';

export const NumberField = ({ field, isLastField = false }) => {
    const itemClass = isLastField ? 'ant-form-item-no-margin' : 'ant-form-item-standard-margin';

    return (
        <Form.Item
            label={field.label}
            name={field.name}
            rules={[{ required: field.required !== false, message: '*Requis' }]}
            extra={field.helpText}
            className={itemClass}
        >
            <InputNumber
                placeholder={field.placeholder}
                className="full-width"
                min={field.min ?? 0}
                max={field.max}
                addonAfter={field.suffix}
            />
        </Form.Item>
    );
};

export default NumberField;
