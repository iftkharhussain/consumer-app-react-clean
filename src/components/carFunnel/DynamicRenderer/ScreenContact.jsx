/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Form, Input, Checkbox } from 'antd';
import { useAppDispatch, useAppSelector, setContactData, selectDrivers, selectContactData } from 'store/carFunnel';
import PhoneField from 'components/carFunnel/fields/PhoneField';
import CreditCheckModal from 'components/carFunnel/common/CreditCheckModal';
import { getAssetPath } from 'utils/carFunnel/assetPath';
import 'styles/carFunnel/screens/ScreenContact.css';

// Format phone number as (XXX) XXX-XXXX
const formatPhoneNumber = (value) => {
    if (!value) return '';

    // Remove all non-digits
    let phoneNumber = value.replace(/\D/g, '');

    // If it starts with 1 and has more than 10 digits, strip the 1 (country code)
    if (phoneNumber.length === 11 && phoneNumber.startsWith('1')) {
        phoneNumber = phoneNumber.slice(1);
    } else if (phoneNumber.length > 11 && phoneNumber.startsWith('1')) {
        // Handle cases where more digits might be pasted
        phoneNumber = phoneNumber.slice(1).slice(0, 10);
    } else if (phoneNumber.length > 10) {
        // Cap at 10 digits
        phoneNumber = phoneNumber.slice(0, 10);
    }

    const phoneNumberLength = phoneNumber.length;

    if (phoneNumberLength < 4) {
        return phoneNumber;
    }

    if (phoneNumberLength < 7) {
        return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }

    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
};

export const ScreenContact = ({ screen, onNavigate }) => {
    const dispatch = useAppDispatch();
    const [form] = Form.useForm();
    const [consentChecked, setConsentChecked] = useState(false);
    const [creditCheckConsent, setCreditCheckConsent] = useState(false);
    const [showCreditCheckModal, setShowCreditCheckModal] = useState(false);
    const [consentError, setConsentError] = useState(false);

    // Get first driver data to pre-fill name
    const drivers = useAppSelector(selectDrivers);
    const savedContactData = useAppSelector(selectContactData);

    // Pre-fill the contact name from the first driver into the store (the name/
    // email/phone inputs were removed — this is the logged-in funnel).
    useEffect(() => {
        const firstDriver = drivers[0];
        const firstDriverData = firstDriver?.['1-driver1'] || {};

        let fullName = '';
        if (firstDriverData.firstName || firstDriverData.lastName) {
            fullName = `${firstDriverData.firstName || ''} ${firstDriverData.lastName || ''}`.trim();
        } else if (firstDriverData.fullName) {
            fullName = firstDriverData.fullName;
        }
        if (fullName && !savedContactData.fullName) {
            dispatch(setContactData({ fullName }));
        }

        // Sync consent states from store if they exist
        if (savedContactData.consentChecked !== undefined) {
            setConsentChecked(savedContactData.consentChecked);
        }
        if (savedContactData.creditCheckConsent !== undefined) {
            setCreditCheckConsent(savedContactData.creditCheckConsent);
        }
    }, [drivers, savedContactData, dispatch]);

    const handleValuesChange = (changedValues, allValues) => {
        // Save to contact store immediately on change
        dispatch(setContactData(allValues));
    };

    const proceedWithSubmit = (creditConsent) => {
        // Persist the consent choices (the contact name was pre-filled from the
        // first driver into the store by the effect above).
        dispatch(setContactData({
            consentChecked,
            creditCheckConsent: creditConsent,
        }));

        if (screen.nextScreen) {
            onNavigate(screen.nextScreen, {});
        }
    };

    const handleSubmit = () => {
        // Name/email/phone inputs were removed; only the consents are required here.
        if (!consentChecked) {
            setConsentError(true);
            return;
        }
        setConsentError(false);

        // If credit check consent is not checked, show modal
        if (!creditCheckConsent) {
            setShowCreditCheckModal(true);
            return;
        }

        proceedWithSubmit(true);
    };

    const handleCreditCheckYes = () => {
        setCreditCheckConsent(true);
        dispatch(setContactData({ creditCheckConsent: true }));
        proceedWithSubmit(true);
    };

    const handleCreditCheckNo = () => {
        setShowCreditCheckModal(false);
        setConsentError(true);
    };

    // Phone field config
    const phoneField = {
        name: 'phone',
        placeholder: 'Numéro de téléphone',
        prefix: '+1',
        required: true,
        noLabel: true,
    };

    return (
        <div className="screen-container screen-contact">
            {/* Name / email / phone inputs removed — this is the logged-in funnel,
                so the account/first driver already provides those. */}

            {/* Consent Sections */}
            <div className="consent-sections">
                {/* Data Consent */}
                <div className="consent-card-new">
                    <div className="consent-checkbox-wrapper">
                        <Checkbox
                            checked={consentChecked}
                            onChange={(e) => {
                                const checked = e.target.checked;
                                setConsentChecked(checked);
                                dispatch(setContactData({ consentChecked: checked }));
                                if (checked) setConsentError(false);
                            }}
                        />
                    </div>
                    <div className="consent-divider"></div>
                    <div className="consent-content">
                        <p className="consent-text">
                            En cochant cette case, vous consentez à ce que Courtika Assurances, partenaire d’affaires de Norga, recueille, utilise et partage certains de vos renseignements personnels avec ses assureurs, fournisseurs et partenaires, incluant Norga, afin de se conformer aux exigences réglementaires, notamment pour vous identifier, évaluer vos besoins d’assurance et recueillir votre avis sur nos services.
                        </p>
                    </div>
                </div>

                {/* Credit Check Consent */}
                <div className="consent-card-new">
                    <div className="consent-checkbox-wrapper">
                        <Checkbox
                            checked={creditCheckConsent}
                            onChange={(e) => {
                                const checked = e.target.checked;
                                setCreditCheckConsent(checked);
                                dispatch(setContactData({ creditCheckConsent: checked }));
                                if (checked) setConsentError(false);
                            }}
                        />
                    </div>
                    <div className="consent-divider"></div>
                    <div className="consent-content">
                        <div className="consent-title-wrap">
                            <svg className="consent-icon" fill="none" preserveAspectRatio="xMidYMid meet" viewBox="0 0 21.4412 25.0001">
                                <g>
                                    <path d="M21.3838 6.14863C21.3362 5.39463 20.8916 4.72651 20.2256 4.40238L11.5941 0.20175C11.0413 -0.0672499 10.3999 -0.0672499 9.84686 0.20175L1.21534 4.40238C0.549054 4.72651 0.104688 5.39463 0.0570957 6.14863C-0.752488 18.9721 7.27197 23.6442 9.90247 24.8246C10.4242 25.0586 11.0167 25.0586 11.5387 24.8246C14.1692 23.6445 22.1937 18.9721 21.3841 6.14863H21.3838Z" fill="#1A1ABA" />
                                    <path d="M8.10569 1.97875C8.05732 1.97875 8.01102 1.95092 7.98903 1.90322C7.95851 1.83722 7.98593 1.75825 8.05034 1.72697L10.0898 0.734459C10.1542 0.703186 10.2313 0.731278 10.2618 0.797269C10.2923 0.86326 10.2649 0.942238 10.2005 0.97351L8.16104 1.96603C8.14319 1.97477 8.12431 1.97875 8.10569 1.97875Z" fill="#91B3FA" />
                                    <path d="M0.720416 8.90017C0.651097 8.90017 0.593676 8.84372 0.591607 8.77243C0.56419 7.9384 0.578674 7.06859 0.634285 6.18739C0.668168 5.6478 0.986829 5.1681 1.4656 4.93515L7.2721 2.10946C7.3365 2.07819 7.41358 2.10628 7.4441 2.17227C7.47463 2.23826 7.44721 2.31724 7.3828 2.34851L1.57604 5.17393C1.18185 5.36581 0.919838 5.76043 0.891645 6.20435C0.836552 7.07707 0.822326 7.93814 0.849484 8.76342C0.851812 8.83657 0.795943 8.89752 0.724813 8.90017C0.723261 8.90017 0.721968 8.90017 0.720416 8.90017Z" fill="#91B3FA" />
                                    <path d="M19.2944 6.64958C19.2849 6.4585 19.1739 6.28783 19.005 6.20567L10.9358 2.2788C10.7979 2.21175 10.6381 2.21175 10.5005 2.2788L2.43128 6.2054C2.26238 6.28756 2.15142 6.45824 2.14185 6.64932C1.90311 11.4327 2.98144 15.424 5.34915 18.5174C7.15429 20.8758 9.26593 22.1397 10.5033 22.7294C10.6396 22.7943 10.7966 22.7943 10.933 22.7294C12.1704 22.1397 14.282 20.8758 16.0871 18.5174C18.4548 15.424 19.5332 11.4327 19.2944 6.64932V6.64958Z" fill="#91B3FA" />
                                    <path d="M8.3354 11.7885H7.53125V8.50485C7.53125 7.21498 8.47352 6.1252 9.72308 5.96963L11.3673 5.76476C12.075 5.67651 12.7871 5.9039 13.3209 6.38837C13.8545 6.87283 14.1608 7.56958 14.1608 8.30025V11.167H13.3566V8.30025C13.3566 7.80545 13.1492 7.33344 12.7879 7.00534C12.4263 6.67724 11.9441 6.52326 11.4646 6.58289L9.82033 6.78776C8.97402 6.89324 8.33566 7.63133 8.33566 8.50511V11.7888L8.3354 11.7885Z" fill="white" />
                                    <path d="M7.29211 11.0512L14.3417 10.651C14.628 10.6348 14.8688 10.8683 14.8688 11.162V16.8844C14.8688 17.1672 14.6451 17.3961 14.3694 17.3961H7.4892C7.21968 17.3961 6.99879 17.177 6.99 16.9011L6.82058 11.5789C6.81179 11.3009 7.02104 11.0666 7.29211 11.0512Z" fill="white" />
                                    <path clipRule="evenodd" d="M5.1212 10.3146C2.39215 10.3146 0.171875 8.03965 0.171875 5.24311C0.171875 2.44658 2.39215 0.171875 5.1212 0.171875C7.85025 0.171875 10.0705 2.44684 10.0705 5.24311C10.0705 8.03938 7.85025 10.3146 5.1212 10.3146Z" fill="#40C099" fillRule="evenodd" />
                                    <path d="M5.11771 0.344531C7.7583 0.344531 9.89917 2.53787 9.89917 5.24377C9.89917 7.94967 7.75856 10.143 5.11771 10.143C2.47686 10.143 0.336249 7.94967 0.336249 5.24377C0.336249 2.53787 2.47686 0.344531 5.11771 0.344531ZM5.11771 0C4.42711 0 3.75668 0.138607 3.12556 0.412112C2.51618 0.676341 1.96887 1.05427 1.49889 1.53582C1.02892 2.01736 0.660083 2.57789 0.402206 3.20255C0.135276 3.84921 0 4.53589 0 5.24377C0 5.95165 0.135276 6.63833 0.402206 7.28499C0.660083 7.90938 1.02892 8.47017 1.49889 8.95172C1.96887 9.43327 2.51592 9.8112 3.12556 10.0754C3.75668 10.3489 4.42685 10.4875 5.11771 10.4875C5.80857 10.4875 6.47874 10.3489 7.10986 10.0754C7.71924 9.8112 8.26655 9.43327 8.73653 8.95172C9.2065 8.47017 9.57534 7.90965 9.83322 7.28499C10.1001 6.63833 10.2354 5.95165 10.2354 5.24377C10.2354 4.53589 10.1001 3.84921 9.83322 3.20255C9.57534 2.57815 9.2065 2.01736 8.73653 1.53582C8.26655 1.05427 7.7195 0.676341 7.10986 0.412112C6.47874 0.138607 5.80857 0 5.11771 0Z" fill="white" />
                                    <path clipRule="evenodd" d="M7.21495 2.98688L4.04749 6.11893L3.20686 5.19877C3.05193 5.04929 2.8088 5.04002 2.63188 5.16696C2.45936 5.29842 2.41073 5.52952 2.51678 5.7153L3.51207 7.37435C3.60933 7.5286 3.77745 7.62374 3.96782 7.62374C4.15819 7.62374 4.32166 7.5286 4.41891 7.37435C4.57824 7.16127 7.61716 3.44908 7.61716 3.44908C8.01523 3.03219 7.5331 2.66487 7.21469 2.98211V2.98661L7.21495 2.98688Z" fill="white" fillRule="evenodd" />
                                </g>
                            </svg>
                            <h3 className="consent-title">Vous pourriez économiser sans affecter votre cote de crédit</h3>
                        </div>
                        <p className="consent-text">
                            En cochant cette case, vous autorisez les assureurs à consulter vos informations de crédit afin de vous offrir la meilleure prime possible lors des soumissions, des modifications et des renouvellements. Cette vérification n’affectera pas votre cote de crédit.
                        </p>
                    </div>
                </div>
                {consentError && (
                    <div className="consent-error-msg">
                        Veuillez accepter les conditions pour continuer
                    </div>
                )}
            </div>

            {/* Submit Button */}
            <button onClick={handleSubmit} className="btn-submit-new">
                Obtenir mes soumissions
                <img src={getAssetPath('/images/right-arrow-icon.svg')} alt="" className="arrow" />
            </button>

            <p className="submit-disclaimer">
                En cliquant sur « Obtenir mes soumissions », vous consentez à être contacté par Norga et/ou Courtika Assurances par téléphone et/ou par courriel aux coordonnées fournies.
            </p>

            <CreditCheckModal
                visible={showCreditCheckModal}
                onClose={() => setShowCreditCheckModal(false)}
                onYes={handleCreditCheckYes}
                onNo={handleCreditCheckNo}
            />
        </div>
    );
};

export default ScreenContact;
