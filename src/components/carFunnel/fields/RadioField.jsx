/* eslint-disable */
import React from 'react';
import { Form, Radio } from 'antd';
import 'styles/carFunnel/components/RadioField.css';

export const RadioField = ({ field, isLastField = false }) => {
    return (
        <Form.Item
            label={field.label}
            name={field.name}
            rules={[{ required: field.required !== false, message: '*Requis' }]}
            className={isLastField ? 'radio-field-no-margin' : ''}
        >
            <Radio.Group className="radio-field-group">
                {field.options?.map((option) => (
                    <Radio.Button
                        key={option.value}
                        value={option.value}
                        className="radio-field-button"
                    >
                        {option.label}
                    </Radio.Button>
                ))}
            </Radio.Group>
        </Form.Item>
    );
};

export default RadioField;
