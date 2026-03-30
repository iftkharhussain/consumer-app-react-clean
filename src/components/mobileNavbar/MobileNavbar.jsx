import React from 'react';
import { Link } from 'react-router-dom';

/**
 * MobileNavbar Component
 * Displays the mobile navigation header with logo, version, and menu toggle
 * @param {Function} onMenuClick - Callback function when menu icon is clicked
 */
const MobileNavbar = ({ onMenuClick }) => {
    return (
        <div className="mobile-navbar-header mobile-only">
            <div className="logo-container">
                <Link to="/" style={{ display: 'flex', alignItems: 'flex-end', textDecoration: 'none' }}>
                    <img
                        src="/images/norga-blue-logo.png"
                        alt="Norga"
                        className="norga-logo"
                    />
                    <span className="version-text">Beta</span>
                </Link>
            </div>

            <button
                className="menu-icon-button"
                onClick={onMenuClick}
                aria-label="Toggle menu"
                type="button"
            >
                <img
                    src="/images/nav-icon.svg"
                    alt="Menu"
                />
            </button>
        </div>
    );
};

export default MobileNavbar;
