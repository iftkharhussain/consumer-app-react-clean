/* eslint-disable */
import React, { useState } from 'react';
import { Typography, Button, Modal } from 'antd';
import { CheckCircleFilled, ExclamationCircleOutlined } from '@ant-design/icons';
import { useAppSelector, useAppDispatch, selectVehicles, selectDrivers, removeVehicle, removeDriver, setCurrentVehicleIndex, setCurrentDriverIndex } from 'store/carFunnel';
import { navigateTo, jumpTo, resetCreationFlow } from 'store/carFunnel/slices/navigationSlice';
import PrimaryButton from 'components/carFunnel/common/PrimaryButton';
import SecondaryButton from 'components/carFunnel/common/SecondaryButton';
import CustomTooltip from 'components/carFunnel/common/CustomTooltip';
import MaxVehiclesModal from 'components/carFunnel/MaxVehiclesModal';
import { getAssetPath } from 'utils/carFunnel/assetPath';
import CarIcon from 'components/carFunnel/common/CarIcon';
import 'styles/carFunnel/screens/ScreenSummary.css';

const { Text } = Typography;

const MAX_VEHICLES = 2;

// Helper function to get display name for vehicle
const getVehicleDisplayName = (vehicle) => {
    // Vehicle data is stored by screenId, e.g. vehicle['auto-1'] = { year, manufacturer, model, vehicleDetails }
    // Check common screen IDs where vehicle info might be stored
    const screenData = vehicle['auto-1'] || vehicle['1.1-auto1'] || vehicle['2-auto1'] || {};

    const manufacturer = screenData.manufacturer || screenData.make || '';
    const year = screenData.year || '';

    // Use the label from vehicleDetails if available
    const vehicleLabel = screenData.vehicleDetails?.label || screenData.vehicleDetails?.model || screenData.model || '';

    return {
        manufacturer,
        year,
        model: vehicleLabel
    };
};

// Helper function to get display name for driver
const getDriverDisplayName = (driver) => {
    // Driver data is stored by screenId, e.g. driver['1-driver1'] = { firstName, lastName }
    const screenData = driver['1-driver1'] || driver['2-driver1'] || {};

    // Check for firstName/lastName first (new structure)
    const firstName = screenData.firstName || screenData.prenom || '';
    const lastName = screenData.lastName || screenData.nom || '';

    if (firstName || lastName) {
        return `${firstName} ${lastName}`.trim();
    }

    // Fallback to fullName for backwards compatibility
    if (screenData.fullName) {
        return screenData.fullName;
    }

    return 'Conducteur';
};

export const ScreenSummary = ({
    screen,
    onNavigate,
    onBack,
    onAddVehicle,
    onAddDriver,
}) => {
    const dispatch = useAppDispatch();
    const vehicles = useAppSelector(selectVehicles);
    const drivers = useAppSelector(selectDrivers);
    const [showMaxVehiclesModal, setShowMaxVehiclesModal] = useState(false);
    const [itemToRemove, setItemToRemove] = useState(null);

    const handleContinue = () => {
        // Reset creation flow when continuing from summary
        dispatch(resetCreationFlow());

        // Special navigation logic for car summary
        if (screen.summaryType === 'vehicle') {
            // Check if drivers exist
            const completedDrivers = drivers.filter(d => Object.keys(d).length > 0);
            if (completedDrivers.length > 0) {
                // Go to driver summary
                onNavigate('9-driver1', {});
            } else {
                // Go to driver add flow (first driver screen)
                onNavigate('1-driver1', {});
            }
        } else if (screen.nextScreen) {
            onNavigate(screen.nextScreen, {});
        }
    };
    const handleAdd = () => {
        if (screen.summaryType === 'vehicle') {
            // Check if max vehicles reached
            const completedVehicles = vehicles.filter(v => Object.keys(v).length > 0);
            if (completedVehicles.length >= MAX_VEHICLES) {
                setShowMaxVehiclesModal(true);
                return;
            }
            if (onAddVehicle) {
                onAddVehicle();
            }
        } else if (screen.summaryType === 'driver' && onAddDriver) {
            onAddDriver();
        }
    };

    const handleEdit = (index) => {
        if (screen.summaryType === 'vehicle') {
            // Set the current vehicle index and jump to first vehicle screen (clears history)
            dispatch(setCurrentVehicleIndex(index));
            dispatch(jumpTo({ screenId: 'auto-1', stepId: 1 }));
        } else {
            // Set the current driver index and jump to first driver screen (clears history)
            dispatch(setCurrentDriverIndex(index));
            dispatch(jumpTo({ screenId: '1-driver1', stepId: 1 }));
        }
    };

    const handleRemove = (index) => {
        console.log('=== REMOVE BUTTON CLICKED ===');
        console.log('handleRemove called with index:', index);
        setItemToRemove(index);
    };

    const confirmRemove = () => {
        console.log('=== CONFIRM REMOVE ===');
        console.log('Removing item at index:', itemToRemove);

        // Check if this is the last item
        const isLastItem = screen.summaryType === 'vehicle'
            ? vehicles.filter(v => Object.keys(v).length > 0).length === 1
            : drivers.filter(d => Object.keys(d).length > 0).length === 1;

        console.log('Is last item:', isLastItem);

        if (screen.summaryType === 'vehicle') {
            console.log('Dispatching removeVehicle');
            dispatch(removeVehicle(itemToRemove));

            // If this was the last vehicle, jump back to first vehicle screen (clears history)
            if (isLastItem) {
                console.log('Last vehicle removed, jumping to auto-1');
                dispatch(setCurrentVehicleIndex(0));
                dispatch(jumpTo({ screenId: 'auto-1', stepId: 1 }));
            }
        } else {
            console.log('Dispatching removeDriver');
            dispatch(removeDriver(itemToRemove));

            // If this was the last driver, jump back to first driver screen (clears history)
            if (isLastItem) {
                console.log('Last driver removed, jumping to 1-driver1');
                dispatch(setCurrentDriverIndex(0));
                dispatch(jumpTo({ screenId: '1-driver1', stepId: 1 }));
            }
        }

        setItemToRemove(null);
    };

    const cancelRemove = () => {
        console.log('=== CANCEL REMOVE ===');
        setItemToRemove(null);
    };

    // Get completed items with their actual indices
    const itemsWithIndices = screen.summaryType === 'vehicle'
        ? vehicles.map((v, idx) => ({ item: v, actualIndex: idx })).filter(({ item }) => Object.keys(item).length > 0)
        : drivers.map((d, idx) => ({ item: d, actualIndex: idx })).filter(({ item }) => Object.keys(item).length > 0);

    // For driver summary, also get completed vehicles to display
    const completedVehicles = screen.summaryType === 'driver'
        ? vehicles.map((v, idx) => ({ item: v, actualIndex: idx })).filter(({ item }) => Object.keys(item).length > 0)
        : [];

    // Check if we should show tooltip (only for vehicles and when less than max)
    const showTooltip = screen.summaryType === 'vehicle' && itemsWithIndices.length < MAX_VEHICLES;

    return (
        <div className="screen-container screen-summary">
            {/* Completed items */}
            {itemsWithIndices.map(({ item, actualIndex }, displayIndex) => (
                <div key={actualIndex} className="summary-item-card">
                    <div className="summary-item-card__left">
                        {screen.summaryType === 'vehicle' ? (
                            <CarIcon className="summary-item-card__car-icon" />
                        ) : (
                            <img
                                src={getAssetPath('/images/Calque_1.svg')}
                                alt="Driver"
                                className="summary-item-card__icon"
                            />
                        )}
                        <div>
                            {/* Only show label for drivers, not vehicles */}
                            {screen.summaryType !== 'vehicle' && (
                                <Text className="summary-item-card__label">
                                    {displayIndex === 0 ? 'Conducteur principal' : 'Conducteur occasionnel'}
                                </Text>
                            )}
                            {screen.summaryType === 'vehicle' ? (
                                (() => {
                                    const vehicleInfo = getVehicleDisplayName(item);
                                    return (
                                        <div className="summary-item-card__vehicle-info">
                                            <div className="summary-item-card__vehicle-main">
                                                <span className="summary-item-card__manufacturer">{vehicleInfo.manufacturer}</span>
                                                {vehicleInfo.year && <span className="summary-item-card__year">, {vehicleInfo.year}</span>}
                                            </div>
                                            {vehicleInfo.model && (
                                                <div className="summary-item-card__model">{vehicleInfo.model}</div>
                                            )}
                                        </div>
                                    );
                                })()
                            ) : (
                                <Text className="summary-item-card__name">
                                    {getDriverDisplayName(item)}
                                </Text>
                            )}
                        </div>
                    </div>
                    <div className="summary-item-card__right">
                        <Button
                            type="link"
                            size="small"
                            onClick={() => handleRemove(actualIndex)}
                            className="summary-item-card__action"
                        >
                            Supprimer
                        </Button>
                        <Button
                            type="link"
                            size="small"
                            onClick={() => handleEdit(actualIndex)}
                            className="summary-item-card__action"
                        >
                            Éditer
                        </Button>
                        <CheckCircleFilled className="summary-item-card__check" />
                    </div>
                </div>
            ))
            }

            {/* Buttons section */}
            <div className="summary-buttons-container">
                {showTooltip ? (
                    <CustomTooltip
                        content={<div className="summary-tooltip-content">Assurez plus d'un véhicule et vous pourriez <span className="summary-tooltip-content__highlight">économiser jusqu'à 15%</span> avec certains assureurs.</div>}
                        placement="bottom"
                        alwaysVisible={true}
                    >
                        <SecondaryButton onClick={handleAdd}>
                            {screen.summaryType === 'vehicle' ? 'Ajouter un véhicule +' : 'Ajouter un conducteur +'}
                        </SecondaryButton>
                    </CustomTooltip>
                ) : (
                    <SecondaryButton onClick={handleAdd}>
                        {screen.summaryType === 'vehicle' ? 'Ajouter un véhicule +' : 'Ajouter un conducteur +'}
                    </SecondaryButton>
                )}
                <PrimaryButton onClick={handleContinue}>Suivant</PrimaryButton>
            </div>

            {/* Max Vehicles Modal */}
            <MaxVehiclesModal
                visible={showMaxVehiclesModal}
                onClose={() => setShowMaxVehiclesModal(false)}
            />

            {/* Confirm Remove Modal */}
            <Modal getContainer={() => document.querySelector(".car-funnel") || document.body}
                open={itemToRemove !== null}
                onOk={confirmRemove}
                onCancel={cancelRemove}
                okText="Supprimer"
                cancelText="Annuler"
                className='confirm-remove-modal'
                okButtonProps={{ danger: true }}
                centered
                closeIcon={null}
            >
                <div className="confirm-modal__content">
                    <ExclamationCircleOutlined className="confirm-modal__icon" />
                    <div>
                        <h3 className="confirm-modal__title">
                            Supprimer ce {screen.summaryType === 'vehicle' ? 'véhicule' : 'conducteur'}?
                        </h3>
                        <p className="confirm-modal__text">
                            Êtes-vous sûr de vouloir supprimer ce {screen.summaryType === 'vehicle' ? 'véhicule' : 'conducteur'}? Cette action ne peut pas être annulée.
                        </p>
                    </div>
                </div>
            </Modal>
        </div >
    );
};

export default ScreenSummary;
