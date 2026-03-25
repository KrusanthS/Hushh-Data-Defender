import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Activity.css';

const Activity = ({ user }) => {
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [logRes, permRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/activity?firebaseId=${user.uid}`),
                    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/permissions?firebaseId=${user.uid}`)
                ]);
                
                // Map app names to IDs for old logs
                const enhancedLogs = logRes.data.map(log => {
                    if (!log.appId) {
                        const app = permRes.data.find(a => a.appName === log.appName);
                        return { ...log, appId: app ? app._id : null };
                    }
                    return log;
                });
                
                setLogs(enhancedLogs);
            } catch (err) {
                console.error("Failed to fetch activity data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user.uid]);

    return (
        <div className="activity-page container">
            <header className="page-header">
                <h2 className="neon-title">Security Activity Stream</h2>
                <p>Real-time audit log of all data interactions and risk mitigations.</p>
            </header>

            <div className="activity-container glass-card">
                {loading ? (
                    <div className="loader">Analyzing activity...</div>
                ) : logs.length === 0 ? (
                    <div className="empty-state">No recent activity detected.</div>
                ) : (
                    <div className="activity-list">
                        {logs.map((log, index) => (
                            <div key={index} className="activity-item">
                                <div className="activity-icon">
                                    {log.action.includes('Risk') ? '🛡️' : log.action.includes('Data') ? '📂' : '👤'}
                                </div>
                                <div className="activity-content">
                                    <div className="activity-main">
                                        <span className="app-name">{log.appName}</span>
                                        <span className="action-text">{log.action}</span>
                                    </div>
                                    <div className="activity-meta">
                                        <span className="timestamp">{new Date(log.timestamp).toLocaleString()}</span>
                                        <span className="status-badge success">Verified</span>
                                    </div>
                                </div>
                                <div 
                                    className="activity-details-link" 
                                    onClick={() => log.appId ? navigate(`/app-detail/${log.appId}`) : navigate(`/dashboard`)}
                                >
                                    <span>Details →</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Activity;
