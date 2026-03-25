import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, logout } from '../firebase';
import './Navbar.css';

const Navbar = ({ user, hushhCoins }) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <nav className="navbar glass-header">
            <div className="nav-container">
                <Link to={user ? "/dashboard" : "/"} className="nav-logo">
                    <span className="brand-icon">🛡️</span>
                    Hushh <span>DataGuard</span>
                </Link>

                {user && (
                    <div className="nav-middle">
                        <span className="coin-display" onClick={() => navigate('/value-explorer')}>
                            💰 <span className="coin-val">{hushhCoins}</span> HC
                        </span>
                    </div>
                )}

                <div className="nav-links">
                    {user ? (
                        <>
                            <Link to="/dashboard">Dashboard</Link>
                            <Link to="/value-explorer">Value Explorer</Link>
                            <Link to="/safe-share">Safe Share</Link>
                            <Link to="/data-value">Data Value Hub</Link>
                            <Link to="/activity">Activity</Link>
                            <Link to="/profile" className="profile-link">
                                {user.photoURL && <img src={user.photoURL} alt="Avatar" className="nav-avatar" />}
                                Profile
                            </Link>
                        </>
                    ) : (
                        <Link to="/" className="login-link">Login</Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
