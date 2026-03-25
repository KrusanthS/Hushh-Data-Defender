import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Modal from '../components/Modal';
import './value.css';

const ValueExplorer = ({ user, refreshCoins }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [pendingApp, setPendingApp] = useState(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    useEffect(() => {
        if (location.state && location.state.app) {
            setPendingApp(location.state.app);
            setIsConfirmModalOpen(true);
        }
    }, [location.state]);

    const handleConfirmConnection = async () => {
        if (!pendingApp) return;

        try {
            let expiryTime = Date.now() + 30 * 24 * 60 * 60 * 1000; // Default 30 days
            if (pendingApp.duration === '1 Hour') {
                expiryTime = Date.now() + 1 * 60 * 60 * 1000;
            } else if (pendingApp.duration === '24 Hours') {
                expiryTime = Date.now() + 24 * 60 * 60 * 1000;
            } else if (pendingApp.duration === '7 Days') {
                expiryTime = Date.now() + 7 * 24 * 60 * 60 * 1000;
            } else if (pendingApp.duration === '30 Days') {
                expiryTime = Date.now() + 30 * 24 * 60 * 60 * 1000;
            } else if (pendingApp.duration === 'Indefinite') {
                expiryTime = Date.now() + 3650 * 24 * 60 * 60 * 1000; // 10 years
            }

            // Save to backend
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/permissions`, {
                firebaseId: user.uid,
                appName: pendingApp.appName,
                dataShared: pendingApp.dataTypes,
                riskLevel: pendingApp.riskLevel,
                expiryDate: new Date(expiryTime)
            });

            // Credit user with 25 coins for securing an app
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/users/update-coins`, {
                firebaseId: user.uid,
                amount: 25
            });

            // Log activity
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/activity`, {
                firebaseId: user.uid,
                appName: pendingApp.appName,
                action: 'Moved to Secured Phase'
            });

            if (refreshCoins) refreshCoins();
            alert(`${pendingApp.appName} is now SECURED! +25 Hushh Coins earned.`);
            navigate('/dashboard');
        } catch (err) {
            console.error("Failed to connect app", err);
            alert("Failed to connect app. Please try again.");
        }
    };
    const dataCards = [
        { id: 'email', name: 'Email Address', coins: 5, icon: '📧', risk: 'Low' },
        { id: 'browsing', name: 'Browsing Data', coins: 20, icon: '🌐', risk: 'Medium' },
        { id: 'purchase', name: 'Purchase History', coins: 50, icon: '🛍️', risk: 'Medium' },
        { id: 'location', name: 'Location Data', coins: 30, icon: '📍', risk: 'High' }
    ];

    const [selectedData, setSelectedData] = useState(['email']);
    const [totalCoins, setTotalCoins] = useState(5);
    const [streak, setStreak] = useState(3);
    const [level, setLevel] = useState('Bronze');

    useEffect(() => {
        let calculatedCoins = dataCards.reduce((acc, card) => {
            return selectedData.includes(card.id) ? acc + card.coins : acc;
        }, 0);

        // Add bonus logic
        if (selectedData.length >= 3) {
            calculatedCoins += 15;
        }

        setTotalCoins(calculatedCoins);

        // Update Level
        if (calculatedCoins >= 500) setLevel('Gold');
        else if (calculatedCoins >= 100) setLevel('Silver');
        else setLevel('Bronze');
    }, [selectedData]);

    const toggleData = (id) => {
        setSelectedData(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const getBonusMessage = () => {
        if (selectedData.length === 0) return "Share your first data type for a bonus!";
        if (selectedData.length < 4) return `Share ${4 - selectedData.length} more data type(s) for +15 extra coins!`;
        return "🔥 Maximum sharing bonus active!";
    };

    return (
        <div className="value-explorer-page">
            <header className="explorer-header">
                <h1 className="neon-text-blue">Your Data Value</h1>
                <p className="subtitle">Turn your data into rewards — on your terms.</p>
            </header>

            <div className="explorer-grid">
                <section className="cards-container">
                    {dataCards.map(card => (
                        <div 
                            key={card.id} 
                            className={`data-card glass-card ${selectedData.includes(card.id) ? 'active' : ''}`}
                            onClick={() => toggleData(card.id)}
                        >
                            <div className="card-icon">{card.icon}</div>
                            <div className="card-info">
                                <h3>{card.name}</h3>
                                <p className="coin-amount">+{card.coins} Hushh Coins</p>
                            </div>
                            <div className="toggle-switch">
                                <div className={`switch-slider ${selectedData.includes(card.id) ? 'on' : 'off'}`}></div>
                            </div>
                            <div className="card-glow"></div>
                        </div>
                    ))}
                </section>

                <aside className="stats-sidebar">
                    <div className="earnings-panel glass-card shadow-neon">
                        <label>Your Monthly Earnings</label>
                        <h2 className="total-coins">{totalCoins} <span className="coin-label">Coins</span></h2>
                        <div className="booster-tag">{getBonusMessage()}</div>
                    </div>

                    <div className="streak-panel glass-card">
                        <div className="streak-header">
                            <h3>Daily Sharing Streak</h3>
                            <span className="streak-count">🔥 {streak} Days</span>
                        </div>
                        <div className="progress-bar-bg">
                            <div className="progress-bar-fill" style={{ width: `${(streak / 5) * 100}%` }}></div>
                        </div>
                        <p className="streak-footer">Day 5 → +25 coins bonus</p>
                    </div>

                    <div className="level-panel glass-card">
                        <label>Current Status</label>
                        <div className={`level-badge ${level.toLowerCase()}`}>{level} Member</div>
                    </div>

                    <div className="insights-panel glass-card">
                        <h4>Data Insights</h4>
                        <p>Your most valuable data: <strong>Purchase History</strong></p>
                    </div>

                    <div className="ai-rec glass-card">
                        <h4>AI Recommendation</h4>
                        <p>We suggest sharing <strong>Location Data</strong> for +30 coins with low risk profiles.</p>
                    </div>
                </aside>
            </div>

            <section className="visualization-section glass-card">
                <h3>Data Yield Visualization</h3>
                <div className="bar-graph">
                    {dataCards.map(card => (
                        <div key={card.id} className="graph-bar-container">
                            <div 
                                className={`graph-bar ${selectedData.includes(card.id) ? 'active' : ''}`}
                                style={{ height: selectedData.includes(card.id) ? `${card.coins * 3}px` : '0px' }}
                            >
                                <span className="bar-value">{selectedData.includes(card.id) ? card.coins : ''}</span>
                            </div>
                            <label>{card.id}</label>
                        </div>
                    ))}
                </div>
            </section>

            <footer className="explorer-footer">
                <button className="neon-btn primary large shadow pulse">Manage My Data Sharing</button>
            </footer>

            <Modal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                title="New App Security Request"
            >
                {pendingApp && (
                    <div className="connection-confirmation">
                        <div className="security-banner">
                            🛡️ SECURE PHASE INITIALIZED
                        </div>
                        <p>You're moving <strong>{pendingApp.appName}</strong> into the secured zone. This will wrap its data access in our Hushh Shield.</p>
                        
                        <div className="app-data-card glass-card">
                            <label>Data to be Wrapped:</label>
                            <div className="data-tags">
                                {pendingApp.dataTypes.map((d, i) => <span key={i} className="data-tag-confirm">✔️ {d}</span>)}
                            </div>
                        </div>

                        <div className="impact-summary">
                            <p><strong>Security Gain:</strong> +25 Trust Score</p>
                            <p><strong>Monthly Reward:</strong> +10 Hushh Coins</p>
                            <p><strong>Access Duration:</strong> {pendingApp.duration || 'Session Only'}</p>
                        </div>

                        <button onClick={handleConfirmConnection} className="neon-btn primary large w-100">
                            Confirm Secure Connection
                        </button>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ValueExplorer;
