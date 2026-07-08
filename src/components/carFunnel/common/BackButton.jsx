/* eslint-disable */
import React from 'react';
import { Button } from 'antd';
import { getAssetPath } from 'utils/carFunnel/assetPath';
import 'styles/carFunnel/components/BackButton.css';

const BackButton = ({ onClick }) => {
    return (
        <Button
            type="link"
            onClick={onClick}
            className="back-button back-screen-btn"
        >
            <img
                src={getAssetPath('/images/left-arrow.svg')}
                alt="Back"
                className="back-button__icon"
            />
            <span className="back-button__text">Précédent</span>
        </Button>
    );
};

export default BackButton;
