/* eslint-disable */
import React from 'react';
import { Card, Typography } from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';
import 'styles/carFunnel/components/CompletedVehicleCard.css';

const { Text } = Typography;

const CompletedVehicleCard = ({ vehicleNumber, vehicleInfo, onClick }) => {
    const { manufacturer, model, year } = vehicleInfo;

    return (
        <Card
            hoverable={!!onClick}
            onClick={onClick}
            className={`completed-vehicle-card ${onClick ? 'completed-vehicle-card--clickable' : ''}`}
        >
            {/* Vehicle Icon */}
            <div className="completed-vehicle-card__icon">
                🚗
            </div>

            {/* Vehicle Info */}
            <div className="completed-vehicle-card__info">
                <div className="completed-vehicle-card__vehicle-info">
                    <div className="completed-vehicle-card__vehicle-main">
                        <span className="completed-vehicle-card__manufacturer">{manufacturer}</span>
                        {year && <span className="completed-vehicle-card__year">, {year}</span>}
                    </div>
                    {model && (
                        <div className="completed-vehicle-card__model">{model}</div>
                    )}
                </div>
            </div>

            {/* Checkmark */}
            <CheckCircleFilled className="completed-vehicle-card__check" />
        </Card>
    );
};

export default CompletedVehicleCard;
