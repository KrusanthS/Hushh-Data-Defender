import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './ShareData.css';

const ShareData = ({ user }) => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const appData = state?.app || { appName: 'Mock App', riskLevel: 'Low', dataTypes: ['Usage'] };

    const [testMode, setTestMode] = useState(false);
    const [duration, setDuration] = useState('30'); // days

    const handleConfirm = async () => {
        try {
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + parseInt(duration));

            // Save permission
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/permissions`, {
                firebaseId: user.uid,
                appName: appData.appName,
                dataShared: testMode ? ['Anonymized Usage'] : appData.dataTypes,
                riskLevel: appData.riskLevel,
                expiryDate: expiryDate
            });

            // Log activity
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/activity`, {
                firebaseId: user.uid,
                appName: appData.appName,
                action: `Data Shared (${testMode ? 'Test Mode' : 'Full Access'})`
            });

            navigate('/dashboard');
        } catch (error) {
            console.error("Data sharing failed", error);
        }
    };

    return (
        <div className="share-data-page container">
            <div className="share-card glass-card">
                <h2>Safe Data Sharing</h2>
                <p>Summary of sharing with <strong>{appData.appName}</strong></p>

                <div className="share-details">
                    <div className="risk-explanation">
                        <h4>Risk Awareness</h4>
                        <p className={`risk-text-${appData.riskLevel.toLowerCase()}`}>
                            {appData.riskLevel === 'High' 
                                ? "This app requests sensitive data that could be misused if breached." 
                                : appData.riskLevel === 'Medium' 
                                ? "Moderate risk. This app uses data for core features and personalization." 
                                : "Low risk. This app uses minimal data for basic functionality."}
                        </p>
                    </div>

                    <div className="share-option">
                        <label>Expiry Duration (Days)</label>
                        <select value={duration} onChange={(e) => setDuration(e.target.value)}>
                            <option value="7">7 Days</option>
                            <option value="30">30 Days</option>
                            <option value="90">90 Days</option>
                            <option value="365">1 Year</option>
                        </select>
                    </div>

                    <div className="share-option toggle-option">
                        <div>
                            <label>Test Mode (Privacy Enhanced)</label>
                            <p className="subtext">Shares anonymized and limited data only.</p>
                        </div>
                        <input 
                            type="checkbox" 
                            checked={testMode} 
                            onChange={() => setTestMode(!testMode)} 
                        />
                    </div>
                </div>

                <div className="share-actions">
                    <button onClick={() => navigate('/dashboard')} className="neon-btn back-btn">Cancel</button>
                    <button onClick={handleConfirm} className="neon-btn confirm-btn">Confirm & Save</button>
                </div>
            </div>
        </div>
    );
};

export default ShareData;
