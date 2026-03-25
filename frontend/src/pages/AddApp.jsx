import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import './AddApp.css';

const AddApp = () => {
    const navigate = useNavigate();
    const [selectedApp, setSelectedApp] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDuration, setSelectedDuration] = useState('30 days');

    // Representing apps currently on the user's device
    const deviceApps = [
        { id: 101, name: 'Uber', risk: 'Medium', data: ['Location', 'Payment Logs'], purpose: 'Ride-hailing and matching', duration: '30 days' },
        { id: 102, name: 'LinkedIn', risk: 'Low', data: ['Profile', 'Connections'], purpose: 'Professional networking', duration: 'Indefinite' },
        { id: 103, name: 'Instagram', risk: 'High', data: ['Location', 'Camera', 'Usage'], purpose: 'Social media and Ads', duration: '90 days' },
        { id: 104, name: 'Google Maps', risk: 'Medium', data: ['Location', 'Search History'], purpose: 'Navigation', duration: '30 days' },
        { id: 105, name: 'Snapchat', risk: 'High', data: ['Camera', 'Contacts', 'Microphone'], purpose: 'Social Messaging', duration: '1 year' }
    ];

    const handleConnectClick = (app) => {
        setSelectedApp(app);
        setSelectedDuration(app.duration || '30 days');
        setIsModalOpen(true);
    };

    const confirmConnect = () => {
        setIsModalOpen(false);
        navigate('/value-explorer', { state: { app: {
            appName: selectedApp.name,
            dataTypes: selectedApp.data,
            purpose: selectedApp.purpose,
            duration: selectedDuration,
            riskLevel: selectedApp.risk
        } } });
    };

    return (
        <div className="add-app-page container">
            <header className="page-header">
                <h2 className="neon-title">Apps on Your Device</h2>
                <p>Select an app to move it to the **Secured Phase** and manage its data impact.</p>
            </header>

            <div className="device-apps-grid">
                {deviceApps.map(app => (
                    <div key={app.id} className="device-app-card glass-card">
                        <div className="app-main">
                            <h3>{app.name}</h3>
                            <span className={`risk-indicator ${app.risk.toLowerCase()}`}>{app.risk} Risk</span>
                        </div>
                        <p className="app-data-preview">Data: {app.data.join(', ')}</p>
                        <button onClick={() => handleConnectClick(app)} className="neon-btn">
                            Move to Secure
                        </button>
                    </div>
                ))}
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={`Secure Connect: ${selectedApp?.name}`}
            >
                <div className="duration-selection" style={{ padding: '10px 0' }}>
                    <p style={{ marginBottom: '15px' }}>Select the time period to grant secure access:</p>
                    <div className="duration-options" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '25px' }}>
                        {['1 Hour - Session only', '24 Hours - Temporary', '7 Days - Short term', '30 Days - Standard', 'Indefinite - Until manually revoked'].map(dur => {
                            const val = dur.split(' - ')[0];
                            return (
                                <button 
                                    key={dur} 
                                    className={`neon-btn ${selectedDuration === val ? 'primary' : 'secondary'}`} 
                                    onClick={() => setSelectedDuration(val)}
                                    style={selectedDuration === val ? { background: 'var(--primary-neon)', color: '#000', borderColor: 'var(--primary-neon)' } : {}}
                                >
                                    {dur}
                                </button>
                            );
                        })}
                    </div>
                    <button className="neon-btn" onClick={confirmConnect} style={{ width: '100%', padding: '15px' }}>Confirm & Proceed</button>
                </div>
            </Modal>
        </div>
    );
};

export default AddApp;
