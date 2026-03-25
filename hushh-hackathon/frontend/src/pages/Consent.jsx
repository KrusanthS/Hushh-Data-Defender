import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import RiskBadge from '../components/RiskBadge';
import './Consent.css';

const Consent = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    
    // Default dummy data if no state is passed
    const appData = state?.app || {
        appName: 'FitnessTracker Pro',
        dataTypes: ['Location', 'Steps', 'Heart Rate'],
        purpose: 'Personalized Workout Coaching',
        duration: 'Indefinite',
        riskLevel: 'Medium'
    };

    const handleAccept = () => {
        navigate('/share-data', { state: { app: appData } });
    };

    const handleReject = () => {
        navigate('/dashboard');
    };

    return (
        <div className="consent-page container">
            <div className="consent-card glass-card">
                <header className="consent-header">
                    <h2>Consent Nutrition Label</h2>
                    <p>{appData.appName} is requesting access</p>
                </header>

                <div className="nutrition-grid">
                    <div className="nutrition-item">
                        <label>Data Types</label>
                        <p>{appData.dataTypes.join(', ')}</p>
                    </div>
                    <div className="nutrition-item">
                        <label>Purpose</label>
                        <p>{appData.purpose}</p>
                    </div>
                    <div className="nutrition-item">
                        <label>Duration</label>
                        <p>{appData.duration}</p>
                    </div>
                    <div className="nutrition-item">
                        <label>Risk Level</label>
                        <RiskBadge level={appData.riskLevel} />
                    </div>
                </div>

                <div className="consent-actions">
                    <button onClick={handleReject} className="neon-btn reject-btn">Reject</button>
                    <button onClick={handleAccept} className="neon-btn accept-btn">Continue to Secure Share</button>
                </div>
            </div>
        </div>
    );
};

export default Consent;
