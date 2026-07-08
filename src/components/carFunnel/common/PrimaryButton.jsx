/* eslint-disable */
import React from 'react';
import { Button } from 'antd';
import { getAssetPath } from 'utils/carFunnel/assetPath';
import 'styles/carFunnel/components/PrimaryButton.css';

const PrimaryButton = ({ children, className, ...props }) => {
    return (
        <Button
            type="primary"
            className={`primary-button btn-primary ${className || ''}`}
            {...props}
        >
            <span className="primary-button__content">
                {children}
                <img
                    src={getAssetPath('/images/right-arrow-icon.svg')}
                    alt=""
                    className="primary-button__icon"
                />
            </span>
        </Button>
    );
};

export default PrimaryButton;
