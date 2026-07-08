/* eslint-disable */
import React from 'react';
import { ScreenRegular } from './ScreenRegular';
import { ScreenDynamicList } from './ScreenDynamicList';
import { ScreenSummary } from './ScreenSummary';
import { ScreenContact } from './ScreenContact';
import { ScreenVerification } from './ScreenVerification';
import 'styles/carFunnel/components/FieldRenderer.css';

export const DynamicRenderer = ({
    screen,
    onNavigate,
    onBack,
    currentVehicleIndex = 0,
    currentDriverIndex = 0,
    onAddVehicle,
    onAddDriver,
}) => {
    switch (screen.type) {
        case 'regular':
            return (
                <ScreenRegular
                    screen={screen}
                    onNavigate={onNavigate}
                    onBack={onBack}
                    currentVehicleIndex={currentVehicleIndex}
                    currentDriverIndex={currentDriverIndex}
                />
            );

        case 'dynamicList':
            return (
                <ScreenDynamicList
                    screen={screen}
                    onNavigate={onNavigate}
                    onBack={onBack}
                    currentDriverIndex={currentDriverIndex}
                />
            );

        case 'summary':
            return (
                <ScreenSummary
                    screen={screen}
                    onNavigate={onNavigate}
                    onBack={onBack}
                    onAddVehicle={onAddVehicle}
                    onAddDriver={onAddDriver}
                />
            );

        case 'contact':
            return <ScreenContact screen={screen} onNavigate={onNavigate} onBack={onBack} />;

        case 'verification':
            return <ScreenVerification screen={screen} onNavigate={onNavigate} onBack={onBack} />;

        default:
            return (
                <div className="dynamic-renderer-fallback">
                    <p>Unknown screen type</p>
                </div>
            );
    }
};

export default DynamicRenderer;
