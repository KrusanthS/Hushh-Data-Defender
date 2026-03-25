import React from 'react';
import { useNavigate } from 'react-router-dom';
import RiskBadge from './RiskBadge';
import './AppCard.css';

const AppCard = ({ app }) => {
    const navigate = useNavigate();

    return (
        <div className="app-card glass-card" onClick={() => navigate(`/app-detail/${app._id || app.id}`)}>
            <div className="app-header">
                <h3>{app.appName}</h3>
                <RiskBadge level={app.riskLevel} />
            </div>
            <div className="app-body">
                <p><strong>Data Shared:</strong> {app.dataShared.join(', ')}</p>
                <p><strong>Status:</strong> <span className={`status-${app.status.toLowerCase()}`}>{app.status}</span></p>
                {app.expiryDate && (
                    <p><strong>Expires:</strong> {new Date(app.expiryDate).toLocaleDateString()}</p>
                )}
            </div>
        </div>
    );
};

export default AppCard;
