/* eslint-disable */
import React from 'react';
import { Form } from 'antd';
import { getAssetPath } from 'utils/carFunnel/assetPath';
import './ImageSelectField.css';

/**
 * ImageSelectInternal Component
 * Receives value and onChange from Form.Item
 */
const ImageSelectInternal = ({ value, onChange, field }) => {
    const [hoveredValue, setHoveredValue] = React.useState(null);

    // Compute box style with selected state
    const getBoxStyle = (isSelected) => {
        const baseStyle = field.boxStyle || {};
        const style = { ...baseStyle };

        // When selected, use the brand blue border
        if (isSelected) {
            style.borderColor = '#1A1ABA';
        }

        return style;
    };

    return (
        <div className="image-select-container">
            {field.options.map((option) => {
                const isSelected = value === option.value;
                const isHovered = hoveredValue === option.value;
                const showBlue = isSelected || isHovered;
                
                return (
                    <button
                        key={option.value}
                        type="button"
                        className={`image-select-box ${isSelected ? 'selected' : ''}`}
                        onClick={() => onChange && onChange(option.value)}
                        onMouseEnter={() => setHoveredValue(option.value)}
                        onMouseLeave={() => setHoveredValue(null)}
                        onMouseDown={(e) => e.preventDefault()}
                        style={getBoxStyle(isSelected)}
                        data-value={option.value}
                    >
                        <div className="image-select-image-wrapper">
                            <img
                                src={getAssetPath(showBlue && option.selectedImage ? option.selectedImage : option.image)}
                                alt={option.label}
                                className="image-select-image"
                                style={option.imageStyle ? option.imageStyle : undefined}
                            />
                        </div>
                        <span
                            className="image-select-label"
                            style={field.labelStyle ? field.labelStyle : undefined}
                        >
                            {option.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

/**
 * ImageSelectField Component
 * Renders a group of image-based selection options within a Form.Item
 */
export const ImageSelectField = ({ field, isLastField = false }) => {
    return (
        <Form.Item
            label={field.label}
            name={field.name}
            rules={[{ required: field.required !== false, message: '*Requis' }]}
            style={isLastField ? { marginBottom: 0 } : undefined}
            initialValue={field.defaultValue}
        >
            <ImageSelectInternal field={field} />
        </Form.Item>
    );
};

export default ImageSelectField;
