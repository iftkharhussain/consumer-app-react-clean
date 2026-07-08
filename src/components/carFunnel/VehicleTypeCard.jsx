/* eslint-disable */
import React from 'react';
import { Card } from 'antd';
import 'styles/carFunnel/components/VehicleTypeCard.css';

const VehicleTypeCard = ({ icon, label, onClick, selected }) => {
    return (
        <Card
            hoverable
            onClick={onClick}
            className={`vehicle-type-card ${selected ? 'vehicle-type-card--selected' : ''}`}
        >
            <div className="vehicle-type-card__icon">
                {icon}
            </div>
            <div className="vehicle-type-card__label">
                {label}
            </div>
        </Card>
    );
};

export default VehicleTypeCard;
