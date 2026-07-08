/* eslint-disable */
import React from 'react';
import { Card } from 'antd';
import 'styles/carFunnel/components/ManufacturerGrid.css';

const ManufacturerGrid = ({ manufacturers, selectedManufacturer, onSelect }) => {
    return (
        <div className="manufacturer-grid">
            {manufacturers.map((manufacturer) => {
                const isSelected = selectedManufacturer === manufacturer.value;
                return (
                    <Card
                        key={manufacturer.value}
                        hoverable
                        onClick={() => onSelect(manufacturer.value)}
                        className={`manufacturer-card ${isSelected ? 'manufacturer-card--selected' : ''}`}
                    >
                        <div className="manufacturer-card__label">
                            {manufacturer.label}
                        </div>
                    </Card>
                );
            })}
        </div>
    );
};

export default ManufacturerGrid;
