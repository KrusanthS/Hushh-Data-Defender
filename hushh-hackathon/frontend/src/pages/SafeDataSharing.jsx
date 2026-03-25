import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import RiskBadge from '../components/RiskBadge';
import './SafeDataSharing.css';

const SafeDataSharing = ({ user }) => {
    const [permissions, setPermissions] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        trustScore: 85,
        vaults: 0,
        snoops: 12
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [permRes, logRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/permissions?firebaseId=${user.uid}`),
                    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/activity?firebaseId=${user.uid}`)
                ]);
                setPermissions(permRes.data);
                setLogs(logRes.data);
                setStats(prev => ({ ...prev, vaults: permRes.data.length }));
            } catch (err) {
                console.error("Error fetching data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user.uid]);

    const [revokedApp, setRevokedApp] = useState(null);

    const getPlainEnglishSummary = (dataShared) => {
        if (!dataShared || dataShared.length === 0) return "No sensitive data access detected.";
        const list = dataShared.join(", ");
        return `This app can see your ${list}, but Hushh limits this to essential functionality only.`;
    };

    const handleRevoke = async (appId, appName) => {
        if (window.confirm(`Revoke all access for ${appName} instantly?`)) {
            try {
                await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/permissions`, {
                    firebaseId: user.uid,
                    appName: appName,
                    riskLevel: 'High'
                });
                await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/activity`, {
                    firebaseId: user.uid,
                    appName: appName,
                    appId: appId,
                    action: 'Revoked Access Instantly'
                });
                setRevokedApp(appName);
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } catch (err) {
                console.error("Revocation failed", err);
            }
        }
    };

    if (loading) return <div className="loader">Initializing SafeShare...</div>;

    return (
        <div className="safe-share-page container">
            <header className="safe-share-header glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flex: 1 }}>
                    <div className="lock-icon" style={{ fontSize: '3rem' }}>🔒</div>
                    <div className="header-text">
                        <h3 style={{ margin: 0, marginBottom: '10px' }}>Your data is completely locked down.</h3>
                        <p style={{ margin: 0 }}>SafeShare ensures no third-party app can access your personal information without your explicit, temporary consent. You are 100% in control and can sever connections instantly below.</p>
                    </div>
                </div>
                <button className="neon-btn primary" onClick={() => navigate('/add-app')} style={{ whiteSpace: 'nowrap' }}>+ Connect New App</button>
            </header>

            <div className="stats-row">
                <div className="stat-card glass-card">
                    <label>OVERALL TRUST SCORE</label>
                    <div className="stat-main">
                        <span className="stat-value">{stats.trustScore}</span>
                        <span className="stat-max">/100</span>
                    </div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-icon">📦</div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.vaults}</span>
                        <label>ACTIVE SAFE VAULTS</label>
                    </div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-icon">👁️‍🗨️</div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.snoops}</span>
                        <label>SNOOPS BLOCKED</label>
                    </div>
                </div>
            </div>

            <div className="content-grid">
                <section className="passports-section">
                    <div className="section-header">
                        <h2>Active Data Passports</h2>
                        <span className="encryption-tag">End-to-End Encrypted</span>
                    </div>
                    <div className="passport-list">
                        {revokedApp && (
                            <div className="revocation-success-overlay glass-card">
                                <span className="check-icon">🛡️</span>
                                <h4>Connection Severed</h4>
                                <p>All data links to <strong>{revokedApp}</strong> have been instantly invalidated.</p>
                            </div>
                        )}
                        {permissions.map(app => (
                            <div key={app._id || app.id} className="passport-card glass-card">
                                <div className="passport-top">
                                    <div className="app-brand">
                                        <div className="app-icon-mini">{app.appName[0]}</div>
                                        <div className="app-info">
                                            <h4>{app.appName}</h4>
                                            <p className="plain-english-summary">{getPlainEnglishSummary(app.dataShared)}</p>
                                            <div className="data-tags">
                                                {app.dataShared.map((tag, i) => (
                                                    <span key={i} className="data-tag">✔️ {tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="passport-meta">
                                        <div className={`sensitivity-tag ${app.riskLevel.toLowerCase()}`}>
                                            🛡️ {app.riskLevel.toUpperCase()} SENSITIVITY
                                        </div>
                                        <div className="duration-tag">
                                            🕒 {app.expiryDate ? `Expires: ${new Date(app.expiryDate).toLocaleDateString()}` : (app.riskLevel === 'Low' ? 'Session Only' : 'Manual Revoke Only')}
                                        </div>
                                    </div>
                                </div>
                                <div className="passport-bottom">
                                    <p className="passport-footer">You are the boss. You can sever this secure link at any given time.</p>
                                    <button onClick={() => handleRevoke(app._id || app.id, app.appName)} className="revoke-btn">
                                        🔒 Revoke Access Instantly
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <aside className="audit-sidebar">
                    <h2>Trust Audit Log</h2>
                    <div className="audit-card glass-card">
                        <p className="audit-intro">A transparent historical record of exactly where your data has traveled.</p>
                        <div className="audit-list">
                            {logs.slice(0, 6).map(log => (
                                <div key={log._id || log.id} className={`audit-item ${log.action.toLowerCase().includes('revoked') ? 'revoked' : 'granted'}`}>
                                    <div className="audit-dot"></div>
                                    <div className="audit-info">
                                        <strong>{log.action}</strong>
                                        <span className="app-name">{log.appName}</span>
                                        <span className="time-ago">ABOUT 1 HOUR AGO</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default SafeDataSharing;
