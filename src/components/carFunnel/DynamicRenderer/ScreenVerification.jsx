/* eslint-disable */
import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useAppSelector, selectContactData } from 'store/carFunnel';
import { submitFormData } from 'components/carFunnel/PhoneVerification/formSubmissionApi';
import 'styles/carFunnel/screens/ScreenVerification.css';

/**
 * ScreenVerification — two-step phone verification (OTP) has been REMOVED for the
 * internal funnel. This final step submits the lead directly (stubbed in UI/UX
 * mode) and shows a simple confirmation. No phone re-entry, no OTP screen.
 */
export const ScreenVerification = () => {
    const contactData = useAppSelector(selectContactData);
    const reduxState = useSelector((state) => state);
    const submittedRef = useRef(false);

    useEffect(() => {
        if (submittedRef.current) return;
        submittedRef.current = true;
        Promise.resolve(
            submitFormData({
                reduxState,
                verification: { skipped: true, verifiedAt: new Date().toISOString(), channel: 'sms', isTestNumber: false },
            })
        ).catch(() => {});
        // eslint-disable-next-line
    }, []);

    const contact = contactData?.email || contactData?.phone || '';

    return (
        <div className="screen-container screen-verification">
            <div
                style={{
                    maxWidth: 542,
                    margin: '0 auto',
                    background: '#fff',
                    borderRadius: 12,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    padding: '48px 32px',
                    textAlign: 'center',
                }}
            >
                <div
                    style={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        background: '#E9F9F2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px',
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3FC098" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                    </svg>
                </div>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1A1ABA', margin: '0 0 8px' }}>Demande envoyée!</h1>
                <p style={{ fontSize: 15, color: '#4B5565', margin: 0, lineHeight: 1.6 }}>
                    Merci. Un conseiller Norga vous contactera sous peu{contact ? <> à <strong>{contact}</strong></> : ''}.
                </p>
            </div>
        </div>
    );
};

export default ScreenVerification;
