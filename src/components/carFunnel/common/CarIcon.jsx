/* eslint-disable */
import React from 'react';
import { getAssetPath } from 'utils/carFunnel/assetPath';
import 'styles/carFunnel/components/CarIcon.css';

const CarIcon = ({ style = {}, className = '' }) => {
    return (
        <div className={`car-icon ${className}`} style={style}>
            <img
                alt="Vehicle"
                src={getAssetPath('/images/car-image.png')}
                className="car-icon__image"
            />
        </div>
    );
};

export default CarIcon;
