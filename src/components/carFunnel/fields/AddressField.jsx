/* eslint-disable */
import React, { useEffect, useRef, useState } from 'react';
import { Form, Input } from 'antd';
import { useSelector } from 'react-redux';
import { selectCurrentDriverIndex, selectDrivers } from 'store/carFunnel/slices/formSlice';
import postalCodeApiService from 'services/carFunnel/postalCodeApiService';
import { USE_MOCK_DATA } from 'config/carFunnel/config';
import './AddressField.css';

const { useWatch } = Form;


/**
 * AddressField Component with Canada Post AddressComplete
 * Uses Canada Post AddressComplete API for address autocomplete
 * Restricts to Canadian addresses only
 * Formats address as {postalCode}-{address}
 * Auto-fills from first driver for subsequent drivers
 */

// Canada Post AddressComplete API key
const CANADA_POST_API_KEY = 'nd48-jk75-dd76-ph41';

const MapPinIcon = () => (
    <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
        <path d="M7 9.5C8.38071 9.5 9.5 8.38071 9.5 7C9.5 5.61929 8.38071 4.5 7 4.5C5.61929 4.5 4.5 5.61929 4.5 7C4.5 8.38071 5.61929 9.5 7 9.5Z" stroke="#9B9B9B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 17C10.5 13 13 10.3137 13 7C13 3.68629 10.3137 1 7 1C3.68629 1 1 3.68629 1 7C1 10.3137 3.5 13 7 17Z" stroke="#9B9B9B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const LockIcon = () => (
    <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
        <path d="M11.6667 7.33333V4.66667C11.6667 3.429 11.175 2.242 10.2998 1.36684C9.42467 0.491665 8.23768 0 7 0C5.76232 0 4.57534 0.491665 3.70017 1.36684C2.825 2.242 2.33333 3.429 2.33333 4.66667V7.33333M1.33333 7.33333H12.6667C13.403 7.33333 14 7.93025 14 8.66667V14.6667C14 15.4031 13.403 16 12.6667 16H1.33333C0.596954 16 0 15.4031 0 14.6667V8.66667C0 7.93025 0.596954 7.33333 1.33333 7.33333Z" fill="#9B9B9B" />
        <circle cx="7" cy="11.5" r="1.5" fill="white" />
    </svg>
);

export const AddressField = ({ field, isLastField = false, form, onChange }) => {
    const inputRef = useRef(null);
    const addressControlRef = useRef(null);
    const isInitializingRef = useRef(false);
    const [inputValue, setInputValue] = useState('');
    const currentDriverIndex = useSelector(selectCurrentDriverIndex);
    const drivers = useSelector(selectDrivers);
    const [showManualPostalCode, setShowManualPostalCode] = useState(false);
    const [isManualAddress, setIsManualAddress] = useState(false);
    const [apiError, setApiError] = useState(null);
    const postalCodeTimeoutRef = useRef(null);

    // Watch values to sync with internal state (essential for back/forward navigation)
    const formAddressValue = useWatch(field.name, form);
    const formPostalCode = useWatch('postalCode', form);
    const formComponents = useWatch(`${field.name}_components`, form);

    const notifyChange = (changedValues) => {
        if (onChange) {
            onChange(changedValues);
        }
    };

    // Sync internal state whenever the form value changes
    useEffect(() => {
        if (formAddressValue !== undefined && formAddressValue !== inputValue) {
            setInputValue(formAddressValue || '');
        }
    }, [formAddressValue]);

    useEffect(() => {
        // Show manual postal code field if we have an address but no postal code components
        if (formAddressValue && !formPostalCode && (!formComponents || !formComponents.postalCode)) {
            setShowManualPostalCode(true);
        } else if (formPostalCode) {
            setShowManualPostalCode(true);
        }
    }, [formAddressValue, formPostalCode, formComponents]);



    useEffect(() => {
        // Wait for Canada Post AddressComplete to be loaded (scripts are in HTML head)
        const waitForCanadaPost = () => {
            // Check if already loaded
            if (window.pca) {
                initializeAddressComplete();
                return;
            }

            // Poll for pca object (scripts are loaded in HTML)
            const checkInterval = setInterval(() => {
                if (window.pca) {
                    clearInterval(checkInterval);
                    initializeAddressComplete();
                }
            }, 100);

            // Clear interval on cleanup
            return () => clearInterval(checkInterval);
        };

        const initializeAddressComplete = () => {
            // Prevent multiple simultaneous initializations
            if (isInitializingRef.current) {
                return;
            }

            if (!inputRef.current?.input || !window.pca) {
                return;
            }

            // Set initializing flag
            isInitializingRef.current = true;

            // Clean up any existing control first
            if (addressControlRef.current) {
                try {
                    addressControlRef.current.destroy();
                    addressControlRef.current = null;
                } catch (e) {
                    console.error('Error cleaning up existing AddressComplete:', e);
                }
            }

            // Small delay to ensure clean state
            setTimeout(() => {
                createAddressCompleteInstance();
            }, 50);
        };

        const createAddressCompleteInstance = () => {
            if (!inputRef.current?.input || !window.pca) {
                isInitializingRef.current = false;
                return;
            }

            try {
                // Get the actual input element
                const inputElement = inputRef.current.input;

                // Define the fields mapping
                const fields = [
                    { element: inputElement, field: '', mode: window.pca.fieldMode.SEARCH }
                ];

                // Define options for Canada Post AddressComplete
                const options = {
                    key: CANADA_POST_API_KEY,
                    countries: { codesList: 'CAN' }, // Restrict to Canada only
                    searchFilters: "Province='QC'", // Restrict to Quebec only
                    culture: 'fr-CA', // French Canadian
                    bar: { visible: false } // Hide the powered by bar
                };

                // Create the AddressComplete control
                addressControlRef.current = new window.pca.Address(fields, options);

                // Listen for address selection (populate event)
                addressControlRef.current.listen('populate', handleAddressSelect);

                // Reset initializing flag
                isInitializingRef.current = false;

            } catch (error) {
                console.error('Error creating AddressComplete:', error);
                isInitializingRef.current = false;
            }
        };

        const handleAddressSelect = (address) => {
            if (!address) {
                return;
            }

            // Extract address components from Canada Post response
            const streetNumber = address.BuildingNumber || '';
            const route = address.Street || '';
            const city = address.City || '';
            const province = address.ProvinceCode || address.Province || '';
            const postalCode = address.PostalCode || '';
            const country = address.CountryName || 'Canada';
            const subpremise = address.SubBuilding || ''; // For apartment/suite numbers

            // Format: [AppNumber-]CivicNumber StreetName, City, Province, PostalCode, Country
            let displayAddress = '';
            if (subpremise && streetNumber) {
                displayAddress = `${subpremise}-${streetNumber} ${route}`;
            } else if (streetNumber) {
                displayAddress = `${streetNumber} ${route}`;
            } else {
                displayAddress = route;
            }

            const cityParts = [];
            if (city) cityParts.push(city);
            if (province) cityParts.push(province);
            if (postalCode) cityParts.push(postalCode);
            cityParts.push(country);

            const cityString = cityParts.join(', ');
            if (cityString) {
                displayAddress += `, ${cityString}`;
            }

            // Format for submission as {postalCode}-{address}
            const formattedValue = postalCode ? `${postalCode}-${displayAddress}` : displayAddress;

            // Fetch location index from postal code
            const fetchLocationIndex = async () => {
                if (postalCode) {
                    try {
                        const result = await postalCodeApiService.getLocationIndex(postalCode);
                        if (result && result.success && result.data?.gcpcid) {
                            console.log('Location index found:', result.data.gcpcid);
                            setApiError(null);
                            return result.data;
                        } else if (result && result.success === false) {
                            // Check if it's a valid Quebec postal code by FSA (First 3 characters)
                            const fsa = postalCode.substring(0, 3).toUpperCase();
                            const isQuebecPostalCode = /^[GHJ]/.test(fsa);
                            
                            if (isQuebecPostalCode) {
                                // Valid Quebec postal code, just no location index data available
                                console.warn('Location index not found for Quebec postal code, but allowing it:', postalCode);
                                setApiError(null);
                                return null; // No location index, but still valid
                            } else {
                                // Not a Quebec postal code
                                const errorMsg = 'Ce code postal est hors de notre zone de service. Nous desservons uniquement le Québec.';
                                setApiError(errorMsg);
                                setShowManualPostalCode(false);
                                return null;
                            }
                        }
                    } catch (error) {
                        console.error('Error fetching location index:', error);
                    }
                }
                setApiError(null);
                return null;
            };

            // Store both formatted address and components
            const addressData = {
                fullAddress: displayAddress,
                streetNumber,
                route,
                city,
                province,
                postalCode,
                country,
                street: `${streetNumber} ${route}`.trim(),
                formattedValue // Store the formatted value for submission
            };

            // Update local state first
            setInputValue(displayAddress);
            setShowManualPostalCode(!postalCode);

            // Fetch location index and update form
            fetchLocationIndex().then(locationData => {
                const updatedAddressData = {
                    ...addressData,
                    locationIndex: locationData?.gcpcid || null,
                    locationCity: locationData?.city || city,
                    locationFsa: locationData?.fsa || postalCode?.substring(0, 3)
                };

                // Update form value with display address that includes postal code and location index
                const updateValues = {
                    [field.name]: displayAddress,
                    [`${field.name}_components`]: updatedAddressData,
                    postalCode: postalCode,
                    locationIndex: locationData?.gcpcid || null
                };
                form.setFieldsValue(updateValues);
                notifyChange(updateValues);

                // Only set error if apiError is set (which means non-Quebec postal code)
                if (apiError && postalCode) {
                    setTimeout(() => {
                        form.setFields([
                            {
                                name: field.name,
                                errors: [apiError]
                            }
                        ]);
                    }, 100);
                }
            });
        };

        waitForCanadaPost();

        // Cleanup
        return () => {
            // Reset initializing flag
            isInitializingRef.current = false;

            // Clean up AddressComplete control
            if (addressControlRef.current) {
                try {
                    addressControlRef.current.destroy();
                    addressControlRef.current = null;
                } catch (e) {
                    console.error('Error cleaning up AddressComplete:', e);
                }
            }
        };
    }, [field.name, form]);

    const itemClass = isLastField ? 'ant-form-item-no-margin' : 'ant-form-item-standard-margin';
    const manualPostalClass = [
        'mt-16',
        'mb-0',
        'display-none' // Always hide the manual postal code field
    ].join(' ');

    const handleManualToggle = () => {
        setIsManualAddress(!isManualAddress);
        if (!isManualAddress) {
            setInputValue('');
            form.setFieldsValue({ [field.name]: '' });
            notifyChange({ [field.name]: '' });
        }
    };

    const handlePostalCodeUpdate = async (pcValue) => {
        // Clear previous timeout
        if (postalCodeTimeoutRef.current) {
            clearTimeout(postalCodeTimeoutRef.current);
        }

        // Debounce the API call - wait 500ms after user stops typing
        postalCodeTimeoutRef.current = setTimeout(async () => {
            let locationData = null;
            let hasApiError = false;

            if (pcValue && /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/.test(pcValue)) {
                try {
                    const result = await postalCodeApiService.getLocationIndex(pcValue);
                    if (result && result.success && result.data?.gcpcid) {
                        locationData = result.data;
                        setApiError(null);
                        console.log('Location index found:', locationData.gcpcid);
                    } else if (result && result.success === false) {
                        // Check if it's a valid Quebec postal code by FSA
                        const fsa = pcValue.substring(0, 3).toUpperCase();
                        const isQuebecPostalCode = /^[GHJ]/.test(fsa);
                        
                        if (isQuebecPostalCode) {
                            // Valid Quebec postal code, just no location index available
                            console.warn('Location index not found for Quebec postal code, but allowing it:', pcValue);
                            setApiError(null);
                        } else {
                            // Not a Quebec postal code
                            hasApiError = true;
                            const frenchError = 'Ce code postal est hors de notre zone de service. Nous desservons uniquement le Québec.';
                            setApiError(frenchError);
                            form.setFields([
                                {
                                    name: 'postalCode',
                                    errors: [frenchError]
                                }
                            ]);
                        }
                    } else {
                        setApiError(null);
                    }
                } catch (error) {
                    console.error('Error fetching location index:', error);
                }
            }

            // Update address data with postal code and location index
            const currentComponents = form.getFieldValue(`${field.name}_components`) || {};
            const updatedComponents = {
                ...currentComponents,
                postalCode: pcValue,
                locationIndex: locationData?.gcpcid || null,
                locationCity: locationData?.city || currentComponents.city,
                locationFsa: locationData?.fsa || pcValue?.substring(0, 3)
            };

            const updateValues = {
                [`${field.name}_components`]: updatedComponents,
                locationIndex: locationData?.gcpcid || null
            };
            form.setFieldsValue(updateValues);
            notifyChange(updateValues);

            if (!hasApiError) {
                form.validateFields([field.name]);
            }

            // If in manual mode, update the full display address
            if (isManualAddress) {
                handleManualAddressChange();
            }
        }, 500);
    };

    const handleManualAddressChange = () => {
        const fullStreet = form.getFieldValue('manual_street');
        const city = form.getFieldValue('manual_city');
        const pc = form.getFieldValue('postalCode');
        const province = 'Québec';
        const country = 'Canada';

        const parts = [];
        if (fullStreet) parts.push(fullStreet);
        if (city) parts.push(city);
        if (province) parts.push(province);
        if (pc) parts.push(pc);
        parts.push(country);

        const displayAddress = parts.join(', ');
        setInputValue(displayAddress);

        const currentComponents = form.getFieldValue(`${field.name}_components`) || {};
        const updateValues = {
            [field.name]: displayAddress,
            [`${field.name}_components`]: {
                ...currentComponents,
                fullAddress: displayAddress,
                street: fullStreet,
                city,
                province: 'QC',
                postalCode: pc,
                country: 'Canada',
                formattedValue: pc ? `${pc}-${displayAddress}` : displayAddress
            }
        };
        form.setFieldsValue(updateValues);
        notifyChange(updateValues);
    };

    return (
        <>
            {!isManualAddress ? (
                <Form.Item
                    label={field.noLabel ? null : field.label}
                    name={field.name}
                    rules={[
                        { required: field.required !== false, message: '*Requis' },
                        {
                            validator: async (_, value) => {
                                // If we have an API error, block validation
                                if (apiError) {
                                    return Promise.reject(apiError);
                                }

                                // Check if postal code exists (either from Canada Post or manual input)
                                const postalCode = form.getFieldValue('postalCode');
                                const addressComponents = form.getFieldValue(`${field.name}_components`);

                                // If address is filled but no postal code, reject
                                if (value && !postalCode && !addressComponents?.postalCode) {
                                    return Promise.reject('Code postal requis');
                                }
                                return Promise.resolve();
                            }
                        }
                    ]}
                    className={itemClass}
                >
                    <Input
                        ref={inputRef}
                        placeholder={field.placeholder || 'Entrez votre adresse'}
                        autoComplete="off"
                        value={inputValue}
                        prefix={<MapPinIcon />}
                        onChange={(e) => {
                            const v = e.target.value;
                            setInputValue(v);
                            // Mock only when Canada Post AddressComplete (window.pca) isn't
                            // loaded. Now that the pca script + key are in index.html, the real
                            // autocomplete handles populate; this dummy fill is the fallback.
                            if (USE_MOCK_DATA && !window.pca && v) {
                                const mockUpdate = {
                                    [field.name]: v,
                                    postalCode: 'H3C 0S5',
                                    [`${field.name}_components`]: {
                                        fullAddress: v,
                                        city: 'Montréal',
                                        province: 'QC',
                                        postalCode: 'H3C 0S5',
                                        country: 'Canada',
                                        formattedValue: `H3C 0S5-${v}`,
                                    },
                                    locationIndex: '0000',
                                };
                                setApiError(null);
                                form.setFieldsValue(mockUpdate);
                                notifyChange(mockUpdate);
                            } else {
                                form.setFieldsValue({ [field.name]: v });
                                notifyChange({ [field.name]: v });
                            }
                        }}
                    />
                    {/* Hidden field to store address components */}
                    <Form.Item
                        name={`${field.name}_components`}
                        noStyle
                        hidden
                    >
                        <Input type="hidden" />
                    </Form.Item>
                    {/* Hidden field to store location index */}
                    <Form.Item
                        name="locationIndex"
                        noStyle
                        hidden
                    >
                        <Input type="hidden" />
                    </Form.Item>
                    <div style={{ marginTop: '8px', display: 'none' }}>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                handleManualToggle();
                            }}
                            className="address-field__manual-link"
                        >
                            Je ne trouve pas mon adresse
                        </a>
                    </div>
                </Form.Item>
            ) : (
                <div className="manual-address-form" style={{ background: '#fff', borderRadius: '12px', padding: '0', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 className="address-field__manual-title">Entrez l'adresse manuellement</h3>
                        <div
                            onClick={handleManualToggle}

                            style={{ cursor: 'pointer', padding: '4px' }}
                        >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13 1L1 13M1 1L13 13" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>

                    <Form.Item
                        name="manual_street"
                        label="Numéro civique et rue"
                        rules={[{ required: true, message: '*Requis' }]}
                        className="mb-16"
                    >
                        <Input
                            id="manual_street"
                            prefix={<MapPinIcon />}
                            placeholder="1234 Nom de la rue"
                            onChange={handleManualAddressChange}
                        />
                    </Form.Item>

                    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                        <Form.Item
                            name="manual_city"
                            label="Ville"
                            rules={[{ required: true, message: '*Requis' }]}
                            className="flex-1"
                            style={{ flex: 1, marginBottom: 0 }}
                        >
                            <Input
                                id="manual_city"
                                placeholder="Sélectionner une ville"
                                onChange={handleManualAddressChange}
                            />
                        </Form.Item>

                        {/* Postal Code field - Hidden */}
                        <Form.Item
                            name="postalCode"
                            hidden
                        >
                            <Input
                                id="manual_postal"
                                placeholder="G1H 1H1"
                                onChange={(e) => handlePostalCodeUpdate(e.target.value)}
                            />
                        </Form.Item>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                        <Form.Item
                            label="Province"
                            className="flex-1"
                            style={{ flex: 1, marginBottom: 0 }}
                        >
                            <Input
                                value="Québec"
                                disabled
                                style={{ background: '#F5F5F5', color: '#9B9B9B' }}
                            />
                        </Form.Item>
                        <Form.Item
                            label="Pays"
                            className="flex-1"
                            style={{ flex: 1, marginBottom: 0 }}
                        >
                            <Input
                                value="Canada"
                                disabled
                                style={{ background: '#F5F5F5', color: '#9B9B9B' }}
                            />
                        </Form.Item>
                    </div>
                </div>
            )}

            {/* Manual Postal Code Field - Shown if Canada Post doesn't return one AND NOT in visual manual mode (since it's now integrated there) */}
            {!isManualAddress && (
                <Form.Item
                    name="postalCode"
                    label={showManualPostalCode ? "Code postal" : null}
                    rules={[
                        { required: showManualPostalCode, message: '*Code postal requis' },
                        {
                            pattern: /^[GHJghj]\d[A-Za-z]\s?\d[A-Za-z]\d$/,
                            message: 'Format invalide ou hors Québec (ex: H4B 2S3)'
                        },
                        {
                            validator: async () => {
                                if (apiError) {
                                    return Promise.reject(apiError);
                                }
                                return Promise.resolve();
                            }
                        }
                    ]}
                    className={manualPostalClass}
                >
                    <Input
                        placeholder="A1A 1A1"
                        onChange={(e) => handlePostalCodeUpdate(e.target.value)}
                    />
                </Form.Item>
            )}
        </>
    );
};

export default AddressField;
