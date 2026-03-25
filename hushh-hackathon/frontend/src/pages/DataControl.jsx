import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RiskBadge from '../components/RiskBadge';
import './DataControl.css';

const DataControl = ({ user }) => {
    const [permissions, setPermissions] = useState([]);
    const [selectedApp, setSelectedApp] = useState(null);

    useEffect(() => {
        const fetchPermissions = async () => {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/permissions?firebaseId=${user.uid}`);
            setPermissions(res.data);
            if (res.data.length > 0) setSelectedApp(res.data[0]);
        };
        fetchPermissions();
    }, [user.uid]);

    const handleSecureNow = (app, category) => {
        const catMap = {
            'Location': 'location',
            'Heart Rate': 'health',
            'Steps': 'health',
            'Financial': 'financial',
            'Social': 'social',
            'Contacts': 'contacts'
        };
        const focus = catMap[category] || 'location';
        navigate(`/data-value?category=${focus}&app=${app.appName}`);
    };

    return (
        <div className="data-control-page container">
            <h2 className="neon-title">Data Control Center</h2>
            <div className="control-grid">
                <aside className="app-sidebar glass-card">
                    {permissions.map(app => (
                        <div 
                            key={app._id} 
                            className={`app-item ${selectedApp?._id === app._id ? 'active' : ''}`}
                            onClick={() => setSelectedApp(app)}
                        >
                            {app.appName}
                        </div>
                    ))}
                </aside>
                
                <main className="control-main glass-card">
                    {selectedApp ? (
                        <>
                            <div className="control-header">
                                <h3>{selectedApp.appName}</h3>
                                <RiskBadge level={selectedApp.riskLevel} />
                            </div>
                            
                            <div className="risk-analysis">
                                <h4>Why is this {selectedApp.riskLevel} risk?</h4>
                                <p>This app accesses: <strong>{selectedApp.dataShared.join(', ')}</strong>. {selectedApp.riskLevel === 'High' ? 'Sensitve data access increases vulnerability.' : 'Standard data access.'}</p>
                            </div>

                            <div className="mitigation-suggestions">
                                <h4>Security Suggestions</h4>
                                <div className="suggestion-item">
                                    <p>Refine <strong>{selectedApp.dataShared[0]}</strong> to lower risk level to Low.</p>
                                    <button 
                                        onClick={() => handleSecureNow(selectedApp, selectedApp.dataShared[0])} 
                                        className="neon-btn small"
                                    >
                                        Secure Now
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <p>No apps selected.</p>
                    )}
                </main>
            </div>
        </div>
    );
};

export default DataControl;
