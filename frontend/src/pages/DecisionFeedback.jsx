import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DecisionFeedback.css';

const DecisionFeedback = () => {
    const navigate = useNavigate();

    return (
        <div className="feedback-page container">
            <div className="feedback-card glass-card">
                <h2 className="neon-title">Decision Feedback</h2>
                <div className="feedback-content">
                    <div className="stat-card">
                        <h3>95%</h3>
                        <p>Privacy Score</p>
                    </div>
                    <div className="stat-card">
                        <h3>450 Hushh Coins</h3>
                        <p>Monthly Data Yield</p>
                    </div>
                </div>
                <div className="feedback-message">
                    <p>Your recent decision to restrict <strong>Location Data</strong> for "HealthifyMe" has increased your privacy score by <strong>15 points</strong>.</p>
                </div>
                <button onClick={() => navigate('/dashboard')} className="neon-btn">Back to Dashboard</button>
            </div>
        </div>
    );
};

export default DecisionFeedback;
