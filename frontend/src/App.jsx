import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ValueExplorer from './pages/ValueExplorer';
import ShareData from './pages/ShareData';
import DataValue from './pages/DataValue';
import Activity from './pages/Activity';
import AppDetail from './pages/AppDetail';
import SafeDataSharing from './pages/SafeDataSharing';
import AddApp from './pages/AddApp';
import Profile from './pages/Profile';
import ChatBot from './components/ChatBot';

import axios from 'axios';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hushhCoins, setHushhCoins] = useState(0);

  const fetchCoins = async (firebaseId) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/profile?firebaseId=${firebaseId}`);
      setHushhCoins(res.data.hushhCoins);
    } catch (err) {
      console.error("Error fetching coins", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchCoins(currentUser.uid);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="loader">Loading...</div>;

  return (
    <Router>
      <div className="app">
        <Navbar user={user} hushhCoins={hushhCoins} />
        <main className="container">
          <Routes>
            <Route path="/" element={!user ? <Login setUser={setUser} /> : <Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={user ? <Dashboard user={user} hushhCoins={hushhCoins} refreshCoins={() => fetchCoins(user.uid)} /> : <Navigate to="/" />} />
            <Route path="/value-explorer" element={user ? <ValueExplorer user={user} refreshCoins={() => fetchCoins(user.uid)} /> : <Navigate to="/" />} />
            <Route path="/share-data" element={user ? <ShareData user={user} /> : <Navigate to="/" />} />
            <Route path="/data-value" element={user ? <DataValue user={user} refreshCoins={() => fetchCoins(user.uid)} /> : <Navigate to="/" />} />
            <Route path="/activity" element={user ? <Activity user={user} /> : <Navigate to="/" />} />
            <Route path="/app-detail/:id" element={user ? <AppDetail user={user} /> : <Navigate to="/" />} />
            <Route path="/safe-share" element={user ? <SafeDataSharing user={user} /> : <Navigate to="/" />} />
            <Route path="/add-app" element={user ? <AddApp user={user} /> : <Navigate to="/" />} />
            <Route path="/profile" element={user ? <Profile user={user} hushhCoins={hushhCoins} refreshCoins={() => fetchCoins(user?.uid)} /> : <Navigate to="/" />} />
          </Routes>
        </main>
        <ChatBot />
      </div>
    </Router>
  );
}

export default App;
