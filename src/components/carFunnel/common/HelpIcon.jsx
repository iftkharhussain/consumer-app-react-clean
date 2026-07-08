/* eslint-disable */
import React from 'react';
import { Tooltip } from 'antd';
import 'styles/carFunnel/components/HelpIcon.css';

const HelpIcon = ({ tooltipText, onClick }) => {
    const icon = (
        <svg
            width="16"
            height="19"
            viewBox="0 0 16 19"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            onClick={onClick}
            className="help-icon"
            aria-label="Help"
        >
            <path d="M8.28844 10.18H7.44844C7.44844 9.05 7.82844 8.57 8.47844 8.12C8.96844 7.77 9.40844 7.4 9.41844 6.78C9.42844 6.05 8.82844 5.5 8.03844 5.5C7.13844 5.5 6.55844 6.18 6.58844 7.13H5.65844C5.66844 5.72 6.64844 4.7 8.04844 4.7C9.36844 4.7 10.3284 5.6 10.3284 6.76C10.3284 7.62 9.77844 8.18 9.08844 8.65C8.51844 9.02 8.28844 9.38 8.28844 10.18ZM7.89844 12.14C7.57844 12.14 7.34844 11.91 7.34844 11.58C7.34844 11.27 7.57844 11.04 7.89844 11.04C8.21844 11.04 8.44844 11.27 8.44844 11.58C8.44844 11.91 8.21844 12.14 7.89844 12.14Z" fill="black"/>
            <circle cx="8" cy="8" r="7.75" stroke="black" strokeWidth="0.5"/>
        </svg>
    );

    if (tooltipText) {
        return (
            <Tooltip title={tooltipText} placement="top">
                {icon}
            </Tooltip>
        );
    }

    return icon;
};

export default HelpIcon;
