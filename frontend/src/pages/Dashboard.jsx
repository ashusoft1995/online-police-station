import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import api from '../services/api';
import CriminalForm from '../components/CriminalForm';
import OfficerManagement from '../components/OfficerManagement';
import CaseDetailsModal from '../components/CaseDetailsModal';
import TrafficAccident from '../components/TrafficAccident';
import PoliceCommandHeader from '../components/PoliceCommandHeader';
import CitizenReports from '../components/CitizenReports';

function Dashboard({ user }) {
  const navigate = useNavigate();
  const [criminals, setCriminals] = useState([]);
  const [stats, setStats] = useState({
    totalCases: 0,
    active: 0,
    solved: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(
    () => (window.location.hash.replace('#', '') === 'traffic' ? 'traffic' : 'criminals')
  );
  const [trafficAccidents, setTrafficAccidents] = useState([]);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [caseSummary, setCaseSummary] = useState(null);
  const [clearanceRateApi, setClearanceRateApi] = useState(null);
  const [trafficLoading, setTrafficLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [trafficError, setTrafficError] = useState('');
  const [reportsError, setReportsError] = useState('');
  const [statsError, setStatsError] = useState('');

  async function fetchTrafficAccidents() {
    setTrafficLoading(true);
    setTrafficError('');
    try {
      const response = await api.get('/traffic/accidents');
      setTrafficAccidents(response.data);
    } catch (err) {
      setTrafficError('Unable to load traffic incidents right now.');
      console.error('Error fetching traffic accidents', err);
    } finally {
      setTrafficLoading(false);
    }
  }

  async function fetchReports() {
    setReportsLoading(true);
    setReportsError('');
    try {
      const response = await api.get('/reports');
      setReports(response.data);
    } catch (err) {
      setReportsError('Unable to load citizen reports right now.');
      console.error('Error fetching reports', err);
    } finally {
      setReportsLoading(false);
    }
  }

  async function fetchUsers() {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users', err);
    }
  }

  async function fetchStatistics() {
    setStatsLoading(true);
    setStatsError('');
    try {
      const [performanceRes, casesRes, clearanceRes] = await Promise.all([
        api.get('/statistics/performance'),
        api.get('/statistics/cases'),
        api.get('/statistics/clearance-rate')
      ]);

      setPerformanceData(
        (performanceRes.data || []).map((item) => ({
          name: item.officerName || 'Unknown',
          casesSolved: item.casesSolved || 0
        }))
      );
      setCaseSummary(casesRes.data || null);
      setClearanceRateApi(clearanceRes.data?.clearanceRate ?? null);
    } catch (err) {
      console.error('Error fetching statistics', err);
      setPerformanceData([]);
      setCaseSummary(null);
      setClearanceRateApi(null);
      setStatsError('Unable to load performance statistics right now.');
    } finally {
      setStatsLoading(false);
    }
  }

  async function fetchCriminals() {
    try {
      const response = await api.get('/criminals');
      setCriminals(response.data);
      
      // Calculate stats
      const totalCases = response.data.length;
      const active = response.data.filter(c => c.status !== 'CASE_CLOSED' && c.status !== 'Case Closed').length;
      const solved = response.data.filter(c => c.status === 'CASE_CLOSED' || c.status === 'Case Closed').length;
      
      setStats({
        totalCases,
        active,
        solved
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching criminals', err);
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    Promise.resolve().then(() => {
      fetchCriminals();
      fetchReports();
      fetchTrafficAccidents();
      fetchUsers();
      fetchStatistics();
    });

  }, [user, navigate]);

  // Update URL hash when tab changes
  useEffect(() => {
    const hash = activeTab === 'traffic' ? '#traffic' : '';
    window.location.hash = hash;
  }, [activeTab]);

  const getStatusColor = (status) => {
    if (status === 'CASE_CLOSED' || status === 'Case Closed') return 'bg-green-100 text-green-800';
    if (status === 'ARRESTED' || status === 'Arrested') return 'bg-blue-100 text-blue-800';
    if (status === 'EVIDENCE_COLLECTION') return 'bg-purple-100 text-purple-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getIncidentStatusBadge = (status) => {
    if (status === 'RESOLVED') return 'bg-green-100 text-green-800';
    if (status === 'UNDER_REVIEW') return 'bg-blue-100 text-blue-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const recentTrafficIncidents = [...trafficAccidents].slice(-5).reverse();
  const recentReports = [...reports].slice(-3).reverse();

  const solvedStatuses = new Set(['CASE_CLOSED', 'Case Closed']);
  const activeStatuses = new Set(['ARRESTED', 'Arrested', 'EVIDENCE_COLLECTION', 'UNDER_INVESTIGATION']);
  const solvedCasesLocal = criminals.filter((criminal) => solvedStatuses.has(criminal.status)).length;
  const activeCasesLocal = criminals.filter((criminal) => activeStatuses.has(criminal.status)).length;
  const pendingCasesLocal = Math.max(criminals.length - solvedCasesLocal - activeCasesLocal, 0);

  const solvedCases = caseSummary?.solvedCases ?? solvedCasesLocal;
  const activeCases = caseSummary?.activeCases ?? activeCasesLocal;
  const pendingCases = caseSummary?.pendingCases ?? pendingCasesLocal;

  const officerPerformanceLocal = Object.values(
    criminals.reduce((acc, criminal) => {
      if (!solvedStatuses.has(criminal.status)) return acc;
      const key = criminal.reportedBy || criminal.reportedByName || 'Unknown';
      if (!acc[key]) {
        acc[key] = {
          name: criminal.reportedByName || criminal.reportedBy || 'Unknown',
          casesSolved: 0
        };
      }
      acc[key].casesSolved += 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b.casesSolved - a.casesSolved)
    .slice(0, 5);
  const officerPerformance = performanceData.length > 0 ? performanceData : officerPerformanceLocal;

  const caseStatusData = [
    { name: 'Solved Cases', value: solvedCases, color: '#10b981' },
    { name: 'Active Cases', value: activeCases, color: '#3b82f6' },
    { name: 'Pending Cases', value: pendingCases, color: '#f59e0b' }
  ];

  const totalCases = caseStatusData.reduce((sum, item) => sum + item.value, 0);
  const clearanceRate = clearanceRateApi != null
    ? Number(clearanceRateApi).toFixed(1)
    : (totalCases ? ((solvedCases / totalCases) * 100).toFixed(1) : '0.0');

  const averageResolutionTimeDays = solvedCases
    ? Math.max(Math.round((criminals.length * 14) / solvedCases), 1)
    : 0;
  const activeDetectives = caseSummary?.activeDetectives
    ?? users.filter((u) => u?.role && u.role !== 'CITIZEN' && u.status !== 'INACTIVE').length;
  const monthlyTrendUp = solvedCases >= activeCases;

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <PoliceCommandHeader
        variant="full"
        user={user}
        onLogout={handleLogout}
        onOfficersTab={user?.role === 'POLICE_HEAD' ? () => setActiveTab('officers') : undefined}
      />

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

        {/* Tabs */}
        <div className="mt-8 flex space-x-4 flex-wrap gap-2">
          <button
            className={`rounded px-4 py-2 font-semibold ${activeTab === 'criminals' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
            onClick={() => setActiveTab('criminals')}
          >
            Criminals
            <span className={`ml-2 rounded-full px-2 py-1 text-xs ${activeTab === 'criminals' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
              {criminals.length}
            </span>
          </button>
          <button
            className={`rounded px-4 py-2 font-semibold ${activeTab === 'reports' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
            onClick={() => setActiveTab('reports')}
          >
            Citizen Reports
            <span className={`ml-2 rounded-full px-2 py-1 text-xs ${activeTab === 'reports' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
              {reports.filter(r => r.status === 'PENDING').length}
            </span>
          </button>
          <button
            className={`rounded px-4 py-2 font-semibold ${activeTab === 'traffic' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
            onClick={() => setActiveTab('traffic')}
          >
            Traffic Accidents
            <span className={`ml-2 rounded-full px-2 py-1 text-xs ${activeTab === 'traffic' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
              {trafficAccidents.length}
            </span>
          </button>
          {user?.role === 'POLICE_HEAD' && (
            <button
              className={`rounded px-4 py-2 font-semibold ${activeTab === 'officers' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
              onClick={() => setActiveTab('officers')}
            >
              Officer Management
            </button>
          )}
        </div>

        {activeTab === 'criminals' ? (
          <>
            {/* Criminal Registration Form */}
            <div className="mt-8">
              <CriminalForm onSuccess={fetchCriminals} />
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
                          <tr
                            key={criminal.id}
                            className="hover:bg-gray-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                            tabIndex={0}
                            onClick={() => { setSelectedCase(criminal); setIsModalOpen(true); }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setSelectedCase(criminal);
                                setIsModalOpen(true);
                              }
                            }}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {criminal.name}
                            </td>
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

            {/* Recent Traffic Incidents */}
            <div className="mt-8 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 p-[1px] shadow-md hover:shadow-xl transition-all duration-500 animate-fadeIn">
              <div className="rounded-2xl bg-white/80 backdrop-blur-sm">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Recent Traffic Incidents
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchTrafficAccidents}
                    disabled={trafficLoading}
                    className="rounded-lg px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    {trafficLoading ? 'Refreshing...' : 'Refresh'}
                  </button>
                  <button
                    onClick={() => navigate('/traffic-accidents')}
                    className="rounded-lg px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105 transition-all duration-300"
                  >
                    View All
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicles Involved</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Injuries</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {trafficLoading ? (
                      [...Array(5)].map((_, index) => (
                        <tr key={`traffic-skeleton-${index}`} className="animate-pulse">
                          <td className="px-6 py-4"><div className="h-4 rounded bg-gray-200 w-32" /></td>
                          <td className="px-6 py-4"><div className="h-4 rounded bg-gray-200 w-24" /></td>
                          <td className="px-6 py-4"><div className="h-4 rounded bg-gray-200 w-28" /></td>
                          <td className="px-6 py-4"><div className="h-4 rounded bg-gray-200 w-20" /></td>
                          <td className="px-6 py-4"><div className="h-6 rounded-full bg-gray-200 w-24" /></td>
                        </tr>
                      ))
                    ) : trafficError ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-red-600">
                          {trafficError}
                        </td>
                      </tr>
                    ) : recentTrafficIncidents.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                          No recent incidents available
                        </td>
                      </tr>
                    ) : (
                      recentTrafficIncidents.map((incident) => (
                        <tr key={incident.id} className="hover:bg-blue-50/60 transition-colors duration-300">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{incident.location || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{incident.date || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{incident.vehiclesInvolved || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{incident.injuries || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${getIncidentStatusBadge(incident.status)}`}>
                              {(incident.status || 'PENDING').replace(/_/g, ' ')}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            </div>

            {/* Recent Citizen Reports */}
            <div className="mt-8 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 p-[1px] shadow-md hover:shadow-xl transition-all duration-500 animate-fadeIn">
              <div className="rounded-2xl bg-white/80 backdrop-blur-sm">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Recent Citizen Reports
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchReports}
                    disabled={reportsLoading}
                    className="rounded-lg px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    {reportsLoading ? 'Refreshing...' : 'Refresh'}
                  </button>
                  <button
                    onClick={() => setActiveTab('reports')}
                    className="rounded-lg px-4 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transform hover:scale-105 transition-all duration-300"
                  >
                    View All Reports
                  </button>
                </div>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reportsLoading ? (
                  [...Array(3)].map((_, index) => (
                    <div key={`report-skeleton-${index}`} className="rounded-xl border border-gray-100 bg-white p-5 animate-pulse">
                      <div className="h-4 rounded bg-gray-200 w-2/3 mb-3" />
                      <div className="h-3 rounded bg-gray-200 w-full mb-2" />
                      <div className="h-3 rounded bg-gray-200 w-1/2 mb-2" />
                      <div className="h-3 rounded bg-gray-200 w-2/5 mb-4" />
                      <div className="h-6 rounded-full bg-gray-200 w-24" />
                    </div>
                  ))
                ) : reportsError ? (
                  <div className="col-span-full text-center text-red-600 py-8">{reportsError}</div>
                ) : recentReports.length === 0 ? (
                  <div className="col-span-full text-center text-gray-500 py-8">No recent reports available</div>
                ) : (
                  recentReports.map((report) => (
                    <div
                      key={report.id}
                      className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-xl transform hover:scale-105 transition-all duration-500"
                    >
                      <h3 className="text-base font-semibold text-gray-900">{report.incidentType || 'Unknown Incident'}</h3>
                      <p className="text-sm text-gray-600 mt-1">{report.location || 'Unknown location'}</p>
                      <p className="text-sm text-gray-500 mt-2">Report Date: {report.date || 'N/A'}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Reporter: {report.anonymous ? 'Anonymous' : (report.assignedOfficerName || 'Citizen')}
                      </p>
                      <span className={`inline-block mt-3 px-3 py-1 text-xs rounded-full ${getIncidentStatusBadge(report.status)}`}>
                        {(report.status || 'PENDING').replace(/_/g, ' ')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
            </div>

            {/* Performance Statistics */}
            <div className="mt-8 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 p-[1px] shadow-md hover:shadow-xl transition-all duration-500 animate-fadeIn">
              <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-6">
              <h2 className="text-lg font-semibold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Police Performance Metrics
              </h2>
              <div className="mb-4 flex justify-end">
                <button
                  onClick={fetchStatistics}
                  disabled={statsLoading}
                  className="rounded-lg px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {statsLoading ? 'Refreshing...' : 'Refresh Stats'}
                </button>
              </div>
              {statsError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {statsError}
                </div>
              )}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="rounded-xl bg-white p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-600 mb-4">Officer Performance Chart</h3>
                  <div className="h-72">
                    {statsLoading ? (
                      <div className="h-full w-full rounded-lg bg-gray-100 animate-pulse" />
                    ) : officerPerformance.length === 0 ? (
                      <div className="h-full w-full flex items-center justify-center text-gray-500">
                        No officer performance data available
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={officerPerformance}>
                          <defs>
                            <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.95} />
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.7} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Bar dataKey="casesSolved" fill="url(#colorCases)" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                <div className="rounded-xl bg-white p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-600 mb-4">Case Statistics</h3>
                  <div className="h-72">
                    {statsLoading ? (
                      <div className="h-full w-full rounded-lg bg-gray-100 animate-pulse" />
                    ) : totalCases === 0 ? (
                      <div className="h-full w-full flex items-center justify-center text-gray-500">
                        No case statistics available
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={caseStatusData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={95}
                            paddingAngle={3}
                          >
                            {caseStatusData.map((entry) => (
                              <Cell key={entry.name} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend
                            formatter={(value) => {
                              const section = caseStatusData.find((item) => item.name === value);
                              const percentage = totalCases ? Math.round(((section?.value || 0) / totalCases) * 100) : 0;
                              return `${value} (${percentage}%)`;
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                  <p className="text-center -mt-5 text-sm text-gray-500">Total Cases: {totalCases}</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-xl bg-white p-4 shadow-sm hover:shadow-xl transform hover:scale-105 transition-all duration-500">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Overall Clearance Rate</p>
                  <p className="text-2xl font-bold text-blue-700 transition-all duration-500">
                    {statsLoading ? <span className="inline-block h-8 w-20 rounded bg-gray-200 animate-pulse" /> : `${clearanceRate}%`}
                  </p>
                </div>
                <div className="rounded-xl bg-white p-4 shadow-sm hover:shadow-xl transform hover:scale-105 transition-all duration-500">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Average Resolution Time</p>
                  <p className="text-2xl font-bold text-indigo-700 transition-all duration-500">
                    {statsLoading ? <span className="inline-block h-8 w-24 rounded bg-gray-200 animate-pulse" /> : `${averageResolutionTimeDays} days`}
                  </p>
                </div>
                <div className="rounded-xl bg-white p-4 shadow-sm hover:shadow-xl transform hover:scale-105 transition-all duration-500">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Active Detectives</p>
                  <p className="text-2xl font-bold text-emerald-700 transition-all duration-500">
                    {statsLoading ? <span className="inline-block h-8 w-16 rounded bg-gray-200 animate-pulse" /> : activeDetectives}
                  </p>
                </div>
                <div className="rounded-xl bg-white p-4 shadow-sm hover:shadow-xl transform hover:scale-105 transition-all duration-500">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Monthly Trend</p>
                  <p className={`text-2xl font-bold transition-all duration-500 ${monthlyTrendUp ? 'text-green-600' : 'text-red-600'}`}>
                    {statsLoading ? <span className="inline-block h-8 w-28 rounded bg-gray-200 animate-pulse" /> : (monthlyTrendUp ? '↑ Improving' : '↓ Needs Attention')}
                  </p>
                </div>
              </div>
            </div>
            </div>
          </>
        ) : activeTab === 'reports' ? (
          <div className="mt-8">
            <CitizenReports user={user} />
          </div>
        ) : activeTab === 'traffic' ? (
          <div className="mt-8">
            <TrafficAccident />
          </div>
        ) : activeTab === 'officers' && user?.role === 'POLICE_HEAD' ? (
          <div className="mt-8">
            <OfficerManagement />
          </div>
        ) : null}

        {activeTab === 'criminals' && (
          <CaseDetailsModal
            isOpen={isModalOpen}
            caseData={selectedCase}
            user={user}
            onClose={() => setIsModalOpen(false)}
            onUpdated={() => {
              fetchCriminals();
              setIsModalOpen(false);
            }}
          />
        )}
      </main>
    </div>
  );
}

export default Dashboard;