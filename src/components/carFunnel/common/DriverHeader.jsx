/* eslint-disable */
import React from 'react';
import { Typography } from 'antd';
import { getAssetPath } from 'utils/carFunnel/assetPath';
import 'styles/carFunnel/components/DriverHeader.css';

const { Text } = Typography;

/**
 * DriverHeader component - renders driver info with horizontal separator line
 * @param {string} driverName - The driver's name to display (empty or name typed by user)
 * @param {number} driverIndex - The index of the current driver (0 = principal, 1+ = occasionnel)
 */
const DriverHeader = ({ driverName, driverIndex = 0 }) => {
    const driverLabel = driverIndex === 0 ? 'Conducteur principal' : 'Conducteur occasionnel';

    // Check if driverName is a real name (not empty and not "Conducteur X" format)
    const hasRealName = driverName &&
        !driverName.startsWith('Conducteur ') &&
        driverName.trim() !== '';

    return (
        <div className="driver-header driver-header-profile">
            <img
                src={getAssetPath('/images/Calque_1.svg')}
                alt="Driver"
                className="driver-header__icon"
            />
            <div className="driver-header__info">
                <Text className={`driver-header__label ${hasRealName ? 'driver-header__label--secondary' : 'driver-header__label--primary'}`}>
                    {driverLabel}
                </Text>
                {hasRealName && (
                    <Text className="driver-header__name">
                        {driverName}
                    </Text>
                )}
            </div>
        </div>
    );
};

export default DriverHeader;
