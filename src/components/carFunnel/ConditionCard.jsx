/* eslint-disable */
import React from 'react';
import { Card } from 'antd';
import 'styles/carFunnel/components/ConditionCard.css';

const ConditionCard = ({ label, description, onClick, selected }) => {
    return (
        <Card
            hoverable
            onClick={onClick}
            className={`condition-card ${selected ? 'condition-card--selected' : ''}`}
        >
            <div className="condition-card__label">
                {label}
            </div>
            <div className="condition-card__description">
                {description}
            </div>
        </Card>
    );
};

export default ConditionCard;
