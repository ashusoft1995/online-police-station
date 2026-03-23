import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CitizenReport from './pages/CitizenReport';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import OfficerManagementPage from './components/OfficerManagementPage';
import TrafficAccident from './components/TrafficAccident';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing user');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/citizen-report" element={<CitizenReport />} />
        <Route path="/traffic-accidents" element={<TrafficAccident />} />
        <Route path="/profile" element={<Profile user={user} />} />
        <Route path="/settings" element={<Settings user={user} />} />
        <Route path="/officer-management" element={<OfficerManagementPage user={user} />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route 
          path="/dashboard" 
          element={
            user ? <Dashboard user={user} /> : <Navigate to="/login" />
          } 
        />
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;