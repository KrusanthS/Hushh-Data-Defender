import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Modal from '../components/Modal';
import RiskBadge from '../components/RiskBadge';
import './AppDetail.css';

const AppDetail = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [app, setApp] = useState(null);
    const [isClarityOpen, setIsClarityOpen] = useState(false);

    useEffect(() => {
        const fetchApp = async () => {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/permissions?firebaseId=${user.uid}`);
            const found = res.data.find(a => (a._id === id || a.id === id));
            setApp(found || null);
        };
        fetchApp();
    }, [id, user.uid]);

    const handleSecureNow = () => {
        setIsClarityOpen(true);
    };

    const confirmSecurity = () => {
        const catMap = {
            'Location': 'location',
            'Heart Rate': 'health',
            'Steps': 'health',
            'Financial': 'financial',
            'Social': 'social',
            'Contacts': 'contacts'
        };
        const focusCategory = app.dataShared && app.dataShared.length > 0 ? app.dataShared[0] : 'Location';
        const focus = catMap[focusCategory] || 'location';
        navigate(`/data-value?category=${focus}&app=${app.appName}`);
    };

    if (!app) return (
        <div className="loader container">
            <h3>App not found or still loading...</h3>
            <button onClick={() => navigate('/dashboard')} className="neon-btn">Back to Dashboard</button>
        </div>
    );

    return (
        <div className="app-detail-page container">
            <header className="detail-header">
                <button onClick={() => navigate('/dashboard')} className="back-btn">
                   <span className="icon">←</span> Back to Dashboard
                </button>
            </header>

            <div className="detail-hero glass-card">
                <div className="hero-info">
                    <div className="app-icon-large">{app.appName[0]}</div>
                    <div className="app-meta">
                        <h2>{app.appName}</h2>
                        <div className="status-row">
                            <RiskBadge level={app.riskLevel} />
                            <span className={`status-dot ${app.status.toLowerCase()}`}></span>
                            <span className="status-text">{app.status}</span>
                        </div>
                    </div>
                </div>
                {app.riskLevel !== 'Low' && (
                    <div className="hero-action">
                        <button onClick={handleSecureNow} className="neon-btn primary shadow">Secure Now</button>
                    </div>
                )}
            </div>

            <div className="detail-grid">
                <div className="detail-main">
                    <section className="info-section glass-card">
                        <h3 className="section-title">Data Permissions</h3>
                        <p className="description text-muted">This application has access to the following data categories:</p>
                        <div className="data-tags">
                            {app.dataShared.map((data, i) => (
                                <span key={i} className="data-tag">
                                    <span className="tag-icon">🔒</span>
                                    {data}
                                </span>
                            ))}
                        </div>
                    </section>

                    <section className="info-section glass-card">
                        <h3 className="section-title">Risk Analysis</h3>
                        <div className="risk-breakdown">
                            <div className="risk-factor">
                                <h4>Why it's {app.riskLevel} risk?</h4>
                                <p>The combination of permissions allowed gives the developer access to your persistent {app.dataShared && app.dataShared.length > 0 ? app.dataShared[0].toLowerCase() : 'shared'} data. This could be used for behavioral profiling or third-party data brokerage.</p>
                            </div>
                            <div className="impact-box">
                                <h5>Security Impact</h5>
                                <p>Medium vulnerability for identity spoofing and location tracking.</p>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="detail-sidebar">
                    <section className="info-section glass-card mini">
                        <h3>App Metadata</h3>
                        <div className="meta-list">
                            <div className="meta-item">
                                <label>Last Synced</label>
                                <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="meta-item">
                                <label>Expiry Date</label>
                                <span>{new Date(app.expiryDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </section>

                    <section className="info-section glass-card mini">
                        <h3>Compliance</h3>
                        <p className="text-small">✅ GDPR Compliant</p>
                        <p className="text-small">✅ SOC2 Audited</p>
                    </section>
                </div>
            </div>

            <Modal 
                isOpen={isClarityOpen} 
                onClose={() => setIsClarityOpen(false)} 
                title={`${app.appName} Clarity Layer`}
            >
                <div className="clarity-layer-content">
                    <section className="clarity-intro">
                        <h4>Transparency First.</h4>
                        <p>We're about to wrap your connection to <strong>{app.appName}</strong> in a security vault. Here's exactly what that means for your <strong>{app.dataShared && app.dataShared[0]}</strong> data:</p>
                    </section>

                    <div className="clarity-steps">
                        <div className="clarity-step">
                            <div className="step-num">01</div>
                            <div className="step-text">
                                <strong>Instant Anonymization</strong>
                                <p>Your real identifies are stripped and replaced with temporary Hushh IDs.</p>
                            </div>
                        </div>
                        <div className="clarity-step">
                            <div className="step-num">02</div>
                            <div className="step-text">
                                <strong>Granular Filters</strong>
                                <p>We block sensitive sub-attributes (like precise GPS coordinates) while allowing the app to function.</p>
                            </div>
                        </div>
                        <div className="clarity-step">
                            <div className="step-num">03</div>
                            <div className="step-text">
                                <strong>Kill-Switch Ready</strong>
                                <p>You can sever this link at any moment from your SafeShare dashboard.</p>
                            </div>
                        </div>
                    </div>

                    <div className="clarity-footer">
                        <p className="fear-reducer">Privacy is a human right. You're making a great choice.</p>
                        <button onClick={confirmSecurity} className="neon-btn primary large w-100">
                            Proceed to Secure My Data
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AppDetail;
