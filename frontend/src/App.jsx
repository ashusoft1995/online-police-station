import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
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
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="animate-fadeIn text-center">
          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-2 border-slate-200 border-t-police-blue shadow-sm" />
          <p className="mt-5 text-sm font-medium text-slate-600">Loading workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/citizen-report" element={<CitizenReport />} />
        <Route
          path="/traffic-accidents"
          element={user ? <TrafficAccident /> : <Navigate to="/login" />}
        />
        <Route path="/profile" element={<Profile user={user} />} />
        <Route path="/settings" element={<Settings user={user} />} />
        <Route path="/officer-management" element={<OfficerManagementPage user={user} />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/reset-password" element={<ResetPassword />} />
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