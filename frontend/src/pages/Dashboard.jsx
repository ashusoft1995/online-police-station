import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import CriminalForm from '../components/CriminalForm';
import NotificationBell from '../components/NotificationBell';
import OfficerManagement from '../components/OfficerManagement';

function Dashboard({ user }) {
  const navigate = useNavigate();
  const [criminals, setCriminals] = useState([]);
  const [stats, setStats] = useState({
    totalCases: 0,
    active: 0,
    solved: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCriminals();
  }, [user, navigate]);

  const fetchCriminals = async () => {
    try {
      setLoading(true);
      const response = await api.get('/criminals');
      setCriminals(response.data);
      
      const total = response.data.length;
      const active = response.data.filter(c => c.status !== 'CASE_CLOSED' && c.status !== 'Case Closed').length;
      const solved = response.data.filter(c => c.status === 'CASE_CLOSED' || c.status === 'Case Closed').length;
      
      setStats({ totalCases: total, active, solved });
    } catch (err) {
      console.error('Error fetching criminals', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'CASE_CLOSED' || status === 'Case Closed') return 'bg-green-100 text-green-800';
    if (status === 'ARRESTED' || status === 'Arrested') return 'bg-blue-100 text-blue-800';
    if (status === 'EVIDENCE_COLLECTION') return 'bg-purple-100 text-purple-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🚔</span>
              <h1 className="text-xl font-bold">Police Station System</h1>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <span className="text-sm">Welcome, {user.fullName}</span>
              <button 
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Welcome back, {user.fullName}!</h2>
          <p className="text-gray-600">{user.role}</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
            <h3 className="text-gray-500 text-sm uppercase tracking-wide">Total Cases</h3>
            <p className="text-3xl font-bold text-blue-900">{stats.totalCases}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <h3 className="text-gray-500 text-sm uppercase tracking-wide">Active Cases</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.active}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <h3 className="text-gray-500 text-sm uppercase tracking-wide">Solved Cases</h3>
            <p className="text-3xl font-bold text-green-600">{stats.solved}</p>
          </div>
        </div>

        {/* Criminal Registration Form */}
        <div className="mt-8">
          <CriminalForm onSuccess={fetchCriminals} />
        </div>

        {/* Officer Management */}
        <div className="mt-8">
          <OfficerManagement />
        </div>

        {/* Criminal List */}
        <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Recent Criminal Cases</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crime</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {criminals.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        No criminals registered yet
                      </td>
                    </tr>
                  ) : (
                    criminals.slice(0, 10).map(criminal => (
                      <tr key={criminal.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{criminal.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{criminal.crime}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(criminal.status)}`}>
                            {criminal.status?.replace(/_/g, ' ') || 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{criminal.crimeDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            criminal.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                            criminal.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {criminal.priority || 'MEDIUM'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;