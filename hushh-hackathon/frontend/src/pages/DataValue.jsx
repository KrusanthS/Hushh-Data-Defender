import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Modal from '../components/Modal';
import RiskBadge from '../components/RiskBadge';
import './DataValue.css';

const DataValue = ({ user, refreshCoins }) => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [permissions, setPermissions] = useState([]);
    const [userProfile, setUserProfile] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    const dataTypes = [
        { name: 'Location', value: 150, description: 'GPS history, real-time tracking, and frequent places.', risk: 'High', color: '#00f2ff', points: ['GPS Coordinates', 'WiFi Triangulation', 'Address History'] },
        { name: 'Financial', value: 200, description: 'Transaction history, spending patterns, and credit cards.', risk: 'High', color: '#ff00ff', points: ['Card Last 4 Digits', 'Billing Address', 'Merchant Category'] },
        { name: 'Social', value: 80, description: 'Interests, brands followed, and purchase intent.', risk: 'Medium', color: '#7000ff', points: ['Follower List', 'Likes & Reactions', 'Direct Messages'] },
        { name: 'Health', value: 120, description: 'Heart rate, sleep cycles, and daily activity logs.', risk: 'Medium', color: '#00ff88', points: ['ECG Data', 'Step Count', 'Sleep Duration'] },
        { name: 'Contacts', value: 50, description: 'Phone numbers, emails, and social connections.', risk: 'High', color: '#ff4444', points: ['Full Name', 'Phone Number', 'Social Media Handles'] }
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [permRes, profRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/permissions?firebaseId=${user.uid}`),
                    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/profile?firebaseId=${user.uid}`)
                ]);
                setPermissions(permRes.data);
                setUserProfile(profRes.data);
            } catch (err) {
                console.error("Failed to fetch data", err);
            }
        };
        fetchData();
    }, [user.uid]);

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const focus = query.get('category');
        if (focus) {
            const cat = dataTypes.find(t => t.name.toLowerCase().includes(focus.toLowerCase()));
            if (cat) {
                setSelectedCategory(cat);
                setIsModalOpen(true);
            }
        }
    }, [location.search]);

    const handleBuySubscription = async (cost) => {
        if (!userProfile || userProfile.hushhCoins < cost) {
            alert("Not enough Hushh Coins!");
            return;
        }

        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/users/update-coins`, {
                firebaseId: user.uid,
                amount: -cost
            });
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/activity`, {
                firebaseId: user.uid,
                appName: 'Hushh Economy',
                action: `Subscription Purchased for ${cost} Hushh Coins`
            });
            alert("Subscription active! - " + cost + " Hushh Coins");
            if (refreshCoins) refreshCoins();
            // Refresh local profile for balance update
            const profRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/profile?firebaseId=${user.uid}`);
            setUserProfile(profRes.data);
        } catch (err) {
            console.error("Purchase failed", err);
        }
    };

    const getLinkedApps = (categoryName) => {
        if (!categoryName) return [];
        return permissions.filter(app => 
            app.dataShared.some(data => data.toLowerCase().includes(categoryName.toLowerCase()))
        );
    };

    return (
        <div className="data-value-page container">
            <header className="page-header">
                <h2 className="neon-title">Hushh Coin Explorer</h2>
                <p>Manage your data assets and spend your Hushh Coins on premium services.</p>
            </header>
            
            <div className="value-stats glass-card shadow-neon">
                <div className="stat highlight">
                    <label>Balance</label>
                    <h3 className="neon-text">💎 {userProfile?.hushhCoins || 0} <small>HC</small></h3>
                </div>
                <div className="stat">
                    <label>Daily Yield</label>
                    <h3>24 <small>HC</small></h3>
                </div>
            </div>

            <div className="value-grid">
                {dataTypes.map((type, index) => (
                    <div 
                        key={index} 
                        className="value-card glass-card clickable"
                        style={{"--accent-color": type.color}}
                        onClick={() => { setSelectedCategory(type); setIsModalOpen(true); }}
                    >
                        <div className="card-bg-glow"></div>
                        <div className="card-top">
                            <span className="type-icon">💠</span>
                            <div className={`risk-tag-mini ${type.risk.toLowerCase()}`}>{type.risk}</div>
                        </div>
                        <h3>{type.name}</h3>
                        <div className="price-tag">{type.value}<small> Hushh Coins/mo</small></div>
                        <div className="app-count-tag">{getLinkedApps(type.name).length} Connected Apps</div>
                    </div>
                ))}
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={`${selectedCategory?.name} Data Hub`}
            >
                <div className="category-details-popup">
                    <section className="data-points-list">
                        <h4>Data Points Covered</h4>
                        <div className="points-pills">
                            {selectedCategory?.points.map((p, i) => (
                                <span key={i} className="point-pill">{p}</span>
                            ))}
                        </div>
                    </section>

                    <section className="linked-apps-section">
                        <h4>Security Breakdown</h4>
                        <div className="security-sub-section">
                            <h5>🛡️ Secured Apps (Low Risk)</h5>
                            <div className="linked-apps-list">
                                {getLinkedApps(selectedCategory?.name || '').filter(a => a.riskLevel === 'Low').length > 0 ? (
                                    getLinkedApps(selectedCategory?.name || '').filter(a => a.riskLevel === 'Low').map(app => (
                                        <div key={app._id} className="linked-app-item glass-card mini secured">
                                            <div className="app-info">
                                                <strong>{app.appName}</strong>
                                                <RiskBadge level={app.riskLevel} />
                                            </div>
                                            <button onClick={() => navigate(`/app-detail/${app._id || app.id}`)} className="neon-btn small">Details</button>
                                        </div>
                                    ))
                                ) : <p className="text-muted mini">No secured apps in this category.</p>}
                            </div>
                        </div>

                        <div className="security-sub-section warning">
                            <h5>⚠️ Needs Security (Moderate/High Risk)</h5>
                            <div className="linked-apps-list">
                                {getLinkedApps(selectedCategory?.name || '').filter(a => a.riskLevel !== 'Low').length > 0 ? (
                                    getLinkedApps(selectedCategory?.name || '').filter(a => a.riskLevel !== 'Low').map(app => (
                                        <div key={app._id} className="linked-app-item glass-card mini risky">
                                            <div className="app-info">
                                                <strong>{app.appName}</strong>
                                                <RiskBadge level={app.riskLevel} />
                                            </div>
                                            <button onClick={() => navigate(`/app-detail/${app._id || app.id}`)} className="neon-btn small warning">Secure Now</button>
                                        </div>
                                    ))
                                ) : <p className="text-muted mini">All apps in this category are secured!</p>}
                            </div>
                        </div>
                    </section>

                    <section className="shop-section">
                        <h4>Spend Hushh Coins</h4>
                        <div className="subscription-card glass-card">
                            <div className="sub-info">
                                <strong>Hushh Premium Protection</strong>
                                <p>Automatic anonymization for all {selectedCategory?.name} links.</p>
                            </div>
                            <button 
                                onClick={() => handleBuySubscription(50)} 
                                className="neon-btn secondary"
                            >
                                Buy for 50 Hushh Coins
                            </button>
                        </div>
                    </section>
                </div>
            </Modal>
        </div>
    );
};

export default DataValue;
