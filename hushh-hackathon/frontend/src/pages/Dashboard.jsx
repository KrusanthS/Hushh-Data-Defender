import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AppCard from '../components/AppCard';
import './Dashboard.css';

const Dashboard = ({ user, hushhCoins, refreshCoins }) => {
    const navigate = useNavigate();
    const [permissions, setPermissions] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [permRes, logRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/permissions?firebaseId=${user.uid}`),
                    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/activity?firebaseId=${user.uid}`)
                ]);
                setPermissions(permRes.data);
                setLogs(logRes.data);
            } catch (err) {
                console.error("Error fetching dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user.uid]);

    const handleKillSwitch = async () => {
        if (window.confirm("Are you sure you want to revoke ALL permissions? This will disconnect all apps.")) {
            try {
                await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/permissions/revoke-all`, { firebaseId: user.uid });
                await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/activity`, {
                    firebaseId: user.uid,
                    appName: 'System',
                    action: 'All Permissions Revoked (Kill Switch)'
                });
                // Refresh data
                const permRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/permissions?firebaseId=${user.uid}`);
                const logRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/activity?firebaseId=${user.uid}`);
                setPermissions(permRes.data);
                setLogs(logRes.data);
            } catch (err) {
                console.error("Kill switch failed", err);
            }
        }
    };

    if (loading) return <div className="loader">Loading Dashboard...</div>;

    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <div>
                    <h1>Welcome, <span className="neon-title">{user.displayName}</span></h1>
                    <p>Manage your digital footprint and data permissions.</p>
                </div>
                <div className="header-actions">
                    <div className="dashboard-coin-stats glass-card shadow-neon" onClick={() => navigate('/value-explorer')}>
                        <label>Your Balance</label>
                        <h3>💎 {hushhCoins} <small>HC</small></h3>
                    </div>
                    {hushhCoins < 300 && (
                        <button className="neon-btn secondary pulse" onClick={async () => {
                            try {
                                await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/users/update-coins`, {
                                    firebaseId: user.uid,
                                    amount: 300
                                });
                                refreshCoins();
                                alert("Beta Bonus Claimed! +300 HC");
                            } catch (err) { console.error(err); }
                        }}>🎁 Claim 300 HC Bonus</button>
                    )}
                    <button className="neon-btn primary" onClick={() => navigate('/add-app')}>+ Connect New App</button>
                    <button onClick={handleKillSwitch} className="kill-switch-btn">
                        🚨 Kill Switch
                    </button>
                </div>
            </header>

            <section className="dashboard-insights glass-card">
                <div className="insight-card">
                    <h3>Data Exposure Score</h3>
                    <div className="score-container">
                        <div className="score-circle" style={{"--score": permissions.filter(p => p.riskLevel === 'Low').length / (permissions.length || 1) * 100}}>
                            <span>{Math.round(permissions.filter(p => p.riskLevel === 'Low').length / (permissions.length || 1) * 100)}%</span>
                        </div>
                        <p>Your data is {permissions.filter(p => p.riskLevel === 'Low').length / (permissions.length || 1) * 100 > 70 ? 'well protected' : 'at risk'}.</p>
                    </div>
                </div>
                <div className="insight-card">
                    <h3>Permission Distribution</h3>
                    <div className="mini-chart">
                        {['Location', 'Financial', 'Social', 'Health', 'Contacts'].map(cat => {
                            const count = permissions.filter(p => p.dataShared.some(d => d.includes(cat))).length;
                            const pct = (count / (permissions.length || 1)) * 100;
                            return (
                                <div key={cat} className="chart-bar-row">
                                    <label>{cat}</label>
                                    <div className="bar-bg">
                                        <div className="bar-fill" style={{width: `${pct}%`}}></div>
                                    </div>
                                    <span>{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="insight-card center-stat">
                    <h3>Services</h3>
                    <div className="big-stat">{permissions.length}</div>
                    <p>Active Data Passports</p>
                </div>
            </section>

            <section className="dashboard-grid">
                <div className="connected-apps">
                    <h2>Connected Apps</h2>
                    <div className="apps-list">
                        {permissions.length > 0 ? (
                            permissions.map(app => <AppCard key={app._id} app={app} />)
                        ) : (
                            <p className="empty-msg">No apps connected yet. Start sharing data safely!</p>
                        )}
                    </div>
                </div>

                <div className="activity-summary">
                    <h2>Recent Activity</h2>
                    <div className="logs-list glass-card">
                        {logs.slice(0, 5).map(log => (
                            <div key={log._id || log.id} className="log-item">
                                <span className="log-action">{log.action}</span>
                                <span className="log-app">{log.appName}</span>
                                <span className="log-time">{new Date(log.timestamp).toLocaleDateString()}</span>
                            </div>
                        ))}
                        {logs.length === 0 && <p>No recent activity.</p>}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
