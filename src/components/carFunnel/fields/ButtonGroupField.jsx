/* eslint-disable */
import React from 'react';
import { Form } from 'antd';
import RadioButtonGroup from 'components/carFunnel/common/RadioButtonGroup';
import HelpIcon from 'components/carFunnel/common/HelpIcon';
import { getAssetPath } from 'utils/carFunnel/assetPath';
import 'styles/carFunnel/components/ButtonGroupField.css';

export const ButtonGroupField = ({ field, form, isLastField = false }) => {
    const [expandedIds, setExpandedIds] = React.useState({});

    const toggleExpand = (sectionIndex, itemIndex) => {
        const key = `${sectionIndex}-${itemIndex}`;
        setExpandedIds(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // Switch variant renders label and buttons in one row
    if (field.variant === 'switch') {
        return (
            <div key={field.name} className={`button-group-field--switch ${isLastField ? 'button-group-field--last' : ''}`}>
                <div className="button-group-field__switch-container">
                    <span className={`button-group-field__switch-label ${field.isWarning ? 'button-group-field__switch-label--warning' : ''}`}>
                        {field.label}
                    </span>
                    <div className="button-group-field__switch-buttons">
                        <Form.Item
                            name={field.name}
                            rules={[{ required: field.required !== false, message: '*Requis' }]}
                            className="ant-form-item-no-margin"
                            initialValue={field.defaultValue}
                        >
                            <RadioButtonGroup
                                options={field.options || []}
                                value={form.getFieldValue(field.name)}
                                onChange={(value) => form.setFieldsValue({ [field.name]: value })}
                                variant="switch"
                            />
                        </Form.Item>
                    </div>
                </div>
            </div>
        );
    }

    // Custom Label component to handle richLabel or standard label
    const Label = () => {
        if (field.richLabel) {
            return (
                <div className="button-group-rich-label">
                    <div className="button-group-rich-label__text">
                        <span className="button-group-rich-label__blue">
                            {field.richLabel.blueText}
                        </span>
                        <span className="button-group-rich-label__normal">
                            {field.richLabel.normalText}
                        </span>
                    </div>
                    {field.richLabel.image && (
                        <div className="button-group-rich-label__image-container">
                            <img
                                src={getAssetPath(field.richLabel.image)}
                                alt=""
                                className="button-group-rich-label__image"
                            />
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div>
                <span className={field.isWarning ? 'button-group-label--warning' : ''}>
                    {field.label}
                    {field.hasHelpIcon && <HelpIcon tooltipText={field.helpTooltip} />}
                </span>
                {field.helpText && (
                    <div className="button-group-help-text">
                        {field.helpText}
                    </div>
                )}
            </div>
        );
    };

    // Default rendering for other variants
    const selectedValue = form.getFieldValue(field.name);
    const details = field.coverageDetails ? field.coverageDetails[selectedValue] : null;

    // Only render the label if there's content to show
    const labelToRender = (field.label || field.richLabel) ? <Label /> : null;

    const formItemClass = (isLastField && !details) ? "ant-form-item-no-margin" : "ant-form-item-standard-margin";

    return (
        <div className={`button-group-field ${field.variant ? `button-group-field--${field.variant}` : ''}`}>
            <Form.Item
                className={formItemClass}
                label={labelToRender}
                colon={false}
                name={field.name}
                rules={[{ required: field.required !== false, message: '*Requis' }]}
                initialValue={field.defaultValue}
            >
                <RadioButtonGroup
                    options={field.options || []}
                    value={selectedValue}
                    onChange={(value) => form.setFieldsValue({ [field.name]: value })}
                    allowWrap={field.allowWrap !== undefined ? field.allowWrap : true}
                    buttonWidth={field.buttonWidth || 'auto'}
                    variant={field.variant === 'coverage-selection' ? 'radio' : (field.variant ? field.variant : field.options?.length === 2 ? 'compact' : 'radio')}
                    columns={field.columns}
                />
            </Form.Item>

            {field.variant === 'coverage-selection' && details && (
                <div className={`coverage-details-card ${isLastField ? 'button-group-field--last' : ''}`}>
                    {(Array.isArray(details) ? details : [details]).map((item, index, array) => (
                        <React.Fragment key={index}>
                            <div className="coverage-details-row">
                                <div className="coverage-details-row__image-container">
                                    <img
                                        src={getAssetPath(item.image)}
                                        alt=""
                                        className="coverage-details-row__image"
                                        style={item.imageStyle || {
                                            width: index === array.length - 1 && array.length > 1 ? '80px' : '95px',
                                            height: index === array.length - 1 && array.length > 1 ? 'auto' : '94px',
                                        }}
                                    />
                                </div>
                                <div className="coverage-details-row__content">
                                    <div className="coverage-details-row__title">
                                        {item.title}
                                    </div>
                                    <div className={`coverage-details-row__description ${item.expandables ? 'coverage-details-row__description--with-expand' : ''}`}>
                                        {item.description}
                                    </div>

                                    {item.expandables && item.expandables.map((exp, expIdx) => {
                                        const isExpanded = expandedIds[`${index}-${expIdx}`];
                                        return (
                                            <div key={expIdx} className="coverage-expandable">
                                                <div
                                                    onClick={() => toggleExpand(index, expIdx)}
                                                    className="coverage-expandable__trigger"
                                                >
                                                    {exp.title}
                                                    <img
                                                        src={getAssetPath('/images/left-arrow.svg')}
                                                        alt=""
                                                        className={`coverage-expandable__icon ${isExpanded ? 'coverage-expandable__icon--expanded' : 'coverage-expandable__icon--collapsed'}`}
                                                    />
                                                </div>
                                                {isExpanded && (
                                                    <div className="coverage-expandable__text">
                                                        {exp.text}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {index < array.length - 1 && (
                                <div className="coverage-plus-divider">
                                    <div className="coverage-plus-divider__line" />
                                    <div className="coverage-plus-divider__icon-container">
                                        <img
                                            src={getAssetPath('/images/plus.svg')}
                                            alt="+"
                                            className="coverage-plus-divider__icon"
                                        />
                                    </div>
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ButtonGroupField;
