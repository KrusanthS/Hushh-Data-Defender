import React from 'react';
import './RiskBadge.css';

const RiskBadge = ({ level }) => {
    return (
        <span className={`risk-badge risk-${level.toLowerCase()}`}>
            {level} Risk
        </span>
    );
};

export default RiskBadge;
