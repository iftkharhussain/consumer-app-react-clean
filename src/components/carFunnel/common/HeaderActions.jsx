/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getAssetPath } from 'utils/carFunnel/assetPath';
import SaveQuoteModal from './SaveQuoteModal';
import HelpModal from './HelpModal';
import './HeaderActions.css';

const HeaderActions = () => {
    const [saveModalVisible, setSaveModalVisible] = useState(false);
    const [helpModalVisible, setHelpModalVisible] = useState(false);
    const [portalTarget, setPortalTarget] = useState(null);

    // Check for .nav-funnel element on mount and when DOM changes
    useEffect(() => {
        const findPortalTarget = () => {
            const target = document.querySelector('.nav-funnel');
            setPortalTarget(target);
        };

        // Initial check
        findPortalTarget();

        // Set up a MutationObserver to detect when .nav-funnel is added to the DOM
        const observer = new MutationObserver(() => {
            findPortalTarget();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        return () => observer.disconnect();
    }, []);

    const handleSaveQuote = async (values) => {
        // TODO: Implement save quote logic
        console.log('Saving quote with:', values);
        // You can dispatch to Redux or call an API here
    };

    const handleHelpRequest = async (values) => {
        // TODO: Implement help request logic
        console.log('Help request with:', values);
        // You can dispatch to Redux or call an API here
    };

    const actionsContent = (
        <div className="header-actions">
            <div
                className="header-action-item"
                onClick={() => setHelpModalVisible(true)}
            >
                <img
                    src={getAssetPath('/images/contact-us.svg')}
                    alt="Aide"
                    className="header-action-icon"
                />
                <span className="header-action-text">Aide</span>
            </div>
            <div
                className="header-action-item"
                onClick={() => setSaveModalVisible(true)}
            >
                <img
                    src={getAssetPath('/images/save.svg')}
                    alt="Sauvegarder"
                    className="header-action-icon"
                />
                <span className="header-action-text">Sauvegarder</span>
            </div>
        </div>
    );

    // Modals should always render in place (not portaled)
    const modals = (
        <>
            <SaveQuoteModal
                visible={saveModalVisible}
                onClose={() => setSaveModalVisible(false)}
                onSave={handleSaveQuote}
            />

            <HelpModal
                visible={helpModalVisible}
                onClose={() => setHelpModalVisible(false)}
                onSubmit={handleHelpRequest}
            />
        </>
    );

    // If .nav-funnel exists, portal the actions there
    // Otherwise, render in place (fallback for local development)
    return (
        <>
            {portalTarget
                ? createPortal(actionsContent, portalTarget)
                : actionsContent
            }
            {modals}
        </>
    );
};

export default HeaderActions;
