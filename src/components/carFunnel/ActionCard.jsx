/* eslint-disable */
import React from 'react';
import { Card } from 'antd';
import 'styles/carFunnel/components/ActionCard.css';

const ActionCard = ({ children, title, icon, compactPadding, style, className }) => {
    return (
        <Card
            bordered={false}
            className={`action-card ${compactPadding ? 'action-card--compact' : ''} ${className || ''}`}
            style={style}
        >
            {title && (
                <div className="action-card__header">
                    {icon && <div className="action-card__header-icon">{icon}</div>}
                    <h2 className="action-card__header-title">{title}</h2>
                </div>
            )}
            {children}
        </Card>
    );
};

export default ActionCard;
