import React from 'react';
import { loginWithGoogle } from '../firebase';
import axios from 'axios';
import './Login.css';

const Login = ({ setUser }) => {
    const handleLogin = async () => {
        try {
            const user = await loginWithGoogle();
            
            // Sync user with backend
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/users`, {
                name: user.displayName,
                email: user.email,
                firebaseId: user.uid
            });
            
            setUser(user);
        } catch (error) {
            console.error("Login failed", error);
        }
    };

    return (
        <div className="login-page">
            <div className="login-content glass-card">
                <h1 className="neon-title">Hushh DataGuard</h1>
                <p>Secure your personal data. Transparent consent. Fair value.</p>
                <button onClick={handleLogin} className="neon-btn">
                    Login with Google
                </button>
                <div className="login-features">
                    <div className="feature">
                        <span>🛡️</span>
                        <p>Total Privacy Control</p>
                    </div>
                    <div className="feature">
                        <span>📊</span>
                        <p>Data Value Analytics</p>
                    </div>
                    <div className="feature">
                        <span>⚡</span>
                        <p>Instant Permission Kill-Switch</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
