import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../firebase';
import './Profile.css';

const Profile = ({ user, hushhCoins, refreshCoins }) => {
    const [stats, setStats] = useState({
        appsCount: 0,
        activityCount: 0,
        privacyScore: 85
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [perms, logs] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/permissions?firebaseId=${user.uid}`),
                    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/activity?firebaseId=${user.uid}`)
                ]);
                setStats({
                    appsCount: perms?.data?.length || 0,
                    activityCount: logs?.data?.length || 0,
                    privacyScore: 100 - ((perms?.data || []).filter(p => p.riskLevel === 'High').length * 10)
                });
            } catch (err) {
                console.error("Failed to fetch profile stats", err);
            }
        };
        fetchStats();
    }, [user.uid]);

    const handleLogout = () => {
        import('../firebase').then(module => {
            module.logout();
        });
    };

    const handleInvite = async () => {
        const shareData = {
            title: 'Hushh DataGuard',
            text: 'Join me on Hushh DataGuard to secure your data and earn Hushh Coins!',
            url: window.location.origin
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/users/update-coins`, {
                    firebaseId: user.uid,
                    amount: 50
                });
                alert("Invite successful! 50 Hushh Coins credited.");
                refreshCoins();
            } else {
                window.open(`https://wa.me/?text=${encodeURIComponent(shareData.text + ' ' + shareData.url)}`);
                await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/users/update-coins`, {
                    firebaseId: user.uid,
                    amount: 50
                });
                alert("Invite link opened! 50 Hushh Coins credited.");
                refreshCoins();
            }
        } catch (err) {
            console.error("Sharing failed", err);
        }
    };

    return (
        <div className="profile-page container">
            <div className="coin-dashboard glass-card shadow-neon">
                <div className="coin-balance">
                    <span className="coin-label">Hushh Balance</span>
                    <h2 className="coin-value">💎 {hushhCoins || 0} Hushh Coins</h2>
                </div>
                <button onClick={handleInvite} className="neon-btn invite-btn shadow">Invite & Earn 50 Hushh Coins</button>
            </div>

            <header className="profile-header glass-card">
                <div className="profile-hero">
                    <img src={user?.photoURL || 'https://via.placeholder.com/150'} alt="Profile" className="profile-avatar shadow" />
                    <div className="profile-meta">
                        <h2>{user?.displayName || 'Hushh User'}</h2>
                        <p className="email">{user?.email || 'No Email'}</p>
                        <div className="badge-row">
                            <span className="user-badge gold">Premium Citizen</span>
                            <span className="user-badge blue">Verified DataGuard</span>
                        </div>
                    </div>
                </div>
                <div className="profile-actions">
                    <button onClick={handleLogout} className="neon-btn danger">Logout Securely</button>
                </div>
            </header>

            <div className="profile-grid">
                <section className="stats-panel glass-card">
                    <h3>Account Insights</h3>
                    <div className="stat-grid">
                        <div className="stat-item">
                            <label>Connected Apps</label>
                            <div className="stat-value">{stats.appsCount}</div>
                        </div>
                        <div className="stat-item">
                            <label>Security Events</label>
                            <div className="stat-value">{stats.activityCount}</div>
                        </div>
                        <div className="stat-item">
                            <label>Privacy Index</label>
                            <div className="stat-value highlight">{stats.privacyScore}%</div>
                        </div>
                    </div>
                </section>

                <section className="data-points glass-card">
                    <h3>Personal Data Vault</h3>
                    <p className="text-muted">Information synced from your Google Identity:</p>
                    <div className="vault-list">
                        <div className="vault-item">
                            <span>UID</span>
                            <code>{user?.uid?.substring(0, 12) || 'N/A'}...</code>
                        </div>
                        <div className="vault-item">
                            <span>Auth Provider</span>
                            <strong>Google OAuth</strong>
                        </div>
                        <div className="vault-item">
                            <span>Last Login</span>
                            <strong>{new Date().toLocaleDateString()}</strong>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Profile;
