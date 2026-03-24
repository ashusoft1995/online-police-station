import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

function TrafficAccident() {
  const STORAGE_KEY = 'trafficAccidentTableState';
  const [formData, setFormData] = useState({
    location: '',
    date: '',
    vehiclesInvolved: '',
    injuries: '',
    description: ''
  });
  const [accidents, setAccidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState({});
  const [selectedAccident, setSelectedAccident] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [pageInput, setPageInput] = useState('1');

  const fetchAccidents = async () => {
    setListLoading(true);
    try {
      setError('');
      const response = await api.get('/traffic/accidents');
      setAccidents(response.data.reverse());
    } catch (err) {
      console.error('Error fetching accidents', err);
      const msg = 'Failed to load accidents.';
      setError(msg);
      toast.error(msg);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchAccidents();
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (saved.search) setSearch(saved.search);
      if (saved.statusFilter) setStatusFilter(saved.statusFilter);
      if (saved.fromDate) setFromDate(saved.fromDate);
      if (saved.toDate) setToDate(saved.toDate);
      if (saved.sortField) setSortField(saved.sortField);
      if (saved.sortDirection) setSortDirection(saved.sortDirection);
      if (saved.currentPage) {
        const page = Number(saved.currentPage);
        if (Number.isFinite(page) && page > 0) {
          setCurrentPage(page);
          setPageInput(String(page));
        }
      }
    } catch (err) {
      console.error('Failed to restore traffic table state', err);
    }
  }, []);

  useEffect(() => {
    const snapshot = {
      search,
      statusFilter,
      fromDate,
      toDate,
      sortField,
      sortDirection,
      currentPage
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  }, [search, statusFilter, fromDate, toDate, sortField, sortDirection, currentPage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      location: '',
      date: '',
      vehiclesInvolved: '',
      injuries: '',
      description: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.location || !formData.date || !formData.vehiclesInvolved || !formData.description) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/traffic/accidents', formData);
      toast.success('Accident registered');
      resetForm();
      await fetchAccidents();
    } catch (err) {
      console.error('Error saving accident', err);
      const msg = err.response?.data?.message || 'Failed to register accident.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch ((status || '').toUpperCase()) {
      case 'REPORTED':
        return 'bg-yellow-100 text-yellow-800';
      case 'INVESTIGATING':
        return 'bg-blue-100 text-blue-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAccidents = accidents.filter((accident) => {
    const matchesSearch =
      accident.location?.toLowerCase().includes(search.toLowerCase()) ||
      accident.vehiclesInvolved?.toLowerCase().includes(search.toLowerCase());
    const currentStatus = (accident.status || 'REPORTED').toUpperCase();
    const matchesStatus = statusFilter === 'ALL' || currentStatus === statusFilter;
    const accidentDate = accident.date ? new Date(accident.date) : null;
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    const matchesFrom = !from || (accidentDate && accidentDate >= from);
    const matchesTo = !to || (accidentDate && accidentDate <= to);
    return matchesSearch && matchesStatus && matchesFrom && matchesTo;
  });

  const sortedAccidents = [...filteredAccidents].sort((a, b) => {
    const av = a?.[sortField] ?? '';
    const bv = b?.[sortField] ?? '';
    const baseCompare =
      typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv));
    return sortDirection === 'asc' ? baseCompare : -baseCompare;
  });

  const totalPages = Math.max(1, Math.ceil(sortedAccidents.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedAccidents = sortedAccidents.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  const trendMap = filteredAccidents.reduce((acc, item) => {
    const key = item.date || 'Unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const trendData = Object.entries(trendMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))
    .slice(-7);

  const handleUpdateStatus = async (accidentId) => {
    const status = selectedStatus[accidentId];
    if (!status) {
      toast.error('Select a status before updating.');
      return;
    }
    try {
      setActionLoading(true);
      setError('');
      await api.put(`/traffic/accidents/${accidentId}/status`, { status });
      toast.success('Status updated');
      await fetchAccidents();
    } catch (err) {
      console.error('Error updating status', err);
      const msg = 'Failed to update accident status.';
      setError(msg);
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const exportAccidentsCsv = () => {
    if (filteredAccidents.length === 0) {
      toast.error('No rows to export for the current filters.');
      return;
    }
    const header = ['Location', 'Date', 'Vehicles Involved', 'Injuries', 'Status'];
    const rows = filteredAccidents.map((a) => [
      a.location || '',
      a.date || '',
      a.vehiclesInvolved || '',
      a.injuries || '',
      a.status || 'REPORTED'
    ]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `traffic-accidents-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('CSV downloaded');
  };

  const buildTimeline = (accident) => {
    const status = (accident?.status || 'REPORTED').toUpperCase();
    return [
      { label: 'Incident Reported', done: true },
      { label: 'Under Investigation', done: ['INVESTIGATING', 'RESOLVED', 'CLOSED'].includes(status) },
      { label: 'Case Resolved', done: ['RESOLVED', 'CLOSED'].includes(status) },
      { label: 'Case Closed', done: status === 'CLOSED' }
    ];
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setFromDate('');
    setToDate('');
    setCurrentPage(1);
    setPageInput('1');
  };

  const resetTableState = () => {
    localStorage.removeItem(STORAGE_KEY);
    clearFilters();
    setSortField('date');
    setSortDirection('desc');
    setCurrentPage(1);
    setPageInput('1');
  };

  const handleSort = (field) => {
    setCurrentPage(1);
    setPageInput('1');
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortField(field);
    setSortDirection('asc');
  };

  const getSortIndicator = (field) => {
    if (sortField !== field) return '↕';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const handleGoToPage = () => {
    const page = Number(pageInput);
    if (!Number.isFinite(page) || page < 1) {
      setCurrentPage(1);
      setPageInput('1');
      return;
    }
    const bounded = Math.min(totalPages, Math.floor(page));
    setCurrentPage(bounded);
    setPageInput(String(bounded));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 p-[1px] shadow-lg">
          <div className="rounded-2xl bg-white/90 backdrop-blur-sm p-6">
          <h1 className="text-2xl font-bold text-gray-800">Traffic Accident Report</h1>
          <p className="text-sm text-gray-500">Register a new traffic accident incident.</p>

          {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50/90 p-3 text-sm text-red-800">{error}</div>}

          <form onSubmit={handleSubmit} className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Location*</label>
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="mt-1 block w-full rounded border py-2 px-3 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date*</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="mt-1 block w-full rounded border py-2 px-3 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Vehicles Involved*</label>
              <input
                name="vehiclesInvolved"
                value={formData.vehiclesInvolved}
                onChange={handleChange}
                className="mt-1 block w-full rounded border py-2 px-3 focus:border-blue-500 focus:outline-none"
                placeholder="e.g. Car, Truck, Motorcycle"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Injuries</label>
              <input
                name="injuries"
                value={formData.injuries}
                onChange={handleChange}
                className="mt-1 block w-full rounded border py-2 px-3 focus:border-blue-500 focus:outline-none"
                placeholder="Describe injuries if any"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description*</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="mt-1 block w-full rounded border p-3 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transform hover:scale-[1.01] transition-all duration-300"
              >
                {loading ? 'Submitting...' : 'Submit Accident'}
              </button>
            </div>
          </form>
        </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 p-[1px] shadow-lg">
          <div className="rounded-2xl bg-white/90 backdrop-blur-sm p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-bold text-gray-800">Recent Traffic Accidents</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchAccidents}
                disabled={listLoading}
                className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 disabled:opacity-60"
              >
                {listLoading ? 'Refreshing...' : 'Refresh'}
              </button>
              <button
                onClick={exportAccidentsCsv}
                className="rounded-lg bg-indigo-100 px-3 py-2 text-sm text-indigo-700 hover:bg-indigo-200"
              >
                Export CSV
              </button>
              <button
                onClick={resetTableState}
                className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200"
              >
                Reset State
              </button>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by location or vehicle..."
              className="w-full rounded border px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded border px-3 py-2 focus:border-blue-500 focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="REPORTED">REPORTED</option>
              <option value="INVESTIGATING">INVESTIGATING</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded border px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded border px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="mt-3 flex justify-end">
            <button
              onClick={clearFilters}
              className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200"
            >
              Clear Filters
            </button>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-lg bg-white border border-gray-200 p-3">
              <p className="text-xs uppercase text-gray-500">Filtered Incidents</p>
              <p className="text-xl font-bold text-blue-700">{filteredAccidents.length}</p>
            </div>
            <div className="rounded-lg bg-white border border-gray-200 p-3">
              <p className="text-xs uppercase text-gray-500">Resolved</p>
              <p className="text-xl font-bold text-green-700">
                {filteredAccidents.filter((a) => (a.status || '').toUpperCase() === 'RESOLVED').length}
              </p>
            </div>
            <div className="rounded-lg bg-white border border-gray-200 p-3">
              <p className="text-xs uppercase text-gray-500">Investigating</p>
              <p className="text-xl font-bold text-amber-700">
                {filteredAccidents.filter((a) => (a.status || '').toUpperCase() === 'INVESTIGATING').length}
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-gray-200 bg-white p-3">
            <p className="text-sm font-semibold text-gray-700 mb-2">7-Day Incident Trend</p>
            <div className="h-48">
              {trendData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                  No trend data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke="#2563eb" fillOpacity={1} fill="url(#colorIncidents)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 cursor-pointer select-none" onClick={() => handleSort('location')}>
                    Location <span className="text-xs text-gray-500">{getSortIndicator('location')}</span>
                  </th>
                  <th className="px-4 py-2 cursor-pointer select-none" onClick={() => handleSort('date')}>
                    Date <span className="text-xs text-gray-500">{getSortIndicator('date')}</span>
                  </th>
                  <th className="px-4 py-2 cursor-pointer select-none" onClick={() => handleSort('vehiclesInvolved')}>
                    Vehicles <span className="text-xs text-gray-500">{getSortIndicator('vehiclesInvolved')}</span>
                  </th>
                  <th className="px-4 py-2">Injuries</th>
                  <th className="px-4 py-2 cursor-pointer select-none" onClick={() => handleSort('status')}>
                    Status <span className="text-xs text-gray-500">{getSortIndicator('status')}</span>
                  </th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {listLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-500">Loading accidents...</td>
                  </tr>
                ) : filteredAccidents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                      No accident records found.
                    </td>
                  </tr>
                ) : (
                  paginatedAccidents.map((accident) => (
                    <tr
                      key={accident.id}
                      className="border-t hover:bg-blue-50/40 transition-colors duration-300 cursor-pointer"
                      onClick={() => setSelectedAccident(accident)}
                    >
                      <td className="px-4 py-2">{accident.location}</td>
                      <td className="px-4 py-2">{accident.date}</td>
                      <td className="px-4 py-2">{accident.vehiclesInvolved}</td>
                      <td className="px-4 py-2">{accident.injuries || 'N/A'}</td>
                      <td className="px-4 py-2">
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadge(accident.status)}`}>
                          {accident.status || 'REPORTED'}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedStatus[accident.id] || (accident.status || 'REPORTED')}
                            onChange={(e) => setSelectedStatus((prev) => ({ ...prev, [accident.id]: e.target.value }))}
                            className="rounded border px-2 py-1 text-xs"
                          >
                            <option value="REPORTED">REPORTED</option>
                            <option value="INVESTIGATING">INVESTIGATING</option>
                            <option value="RESOLVED">RESOLVED</option>
                            <option value="CLOSED">CLOSED</option>
                          </select>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(accident.id);
                            }}
                            disabled={actionLoading}
                            className="rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                          >
                            Update
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAccident(accident);
                            }}
                            className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {!listLoading && filteredAccidents.length > 0 && (
            <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <p className="text-sm text-gray-600">
                Showing {(safeCurrentPage - 1) * pageSize + 1}-
                {Math.min(safeCurrentPage * pageSize, filteredAccidents.length)} of {filteredAccidents.length}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    setCurrentPage((p) => {
                      const next = Math.max(1, p - 1);
                      setPageInput(String(next));
                      return next;
                    });
                  }}
                  disabled={safeCurrentPage === 1}
                  className="px-3 py-1.5 rounded border border-gray-300 text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {safeCurrentPage} / {totalPages}
                </span>
                <button
                  onClick={() => {
                    setCurrentPage((p) => {
                      const next = Math.min(totalPages, p + 1);
                      setPageInput(String(next));
                      return next;
                    });
                  }}
                  disabled={safeCurrentPage === totalPages}
                  className="px-3 py-1.5 rounded border border-gray-300 text-sm disabled:opacity-50"
                >
                  Next
                </button>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  className="w-20 px-2 py-1.5 rounded border border-gray-300 text-sm"
                  placeholder="Page"
                />
                <button
                  onClick={handleGoToPage}
                  className="px-3 py-1.5 rounded border border-gray-300 text-sm hover:bg-gray-50"
                >
                  Go
                </button>
              </div>
            </div>
          )}
        </div>
        </div>

        {selectedAccident && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Traffic Incident Details</h3>
                  <p className="text-sm text-gray-500">{selectedAccident.location || 'Unknown location'}</p>
                </div>
                <button
                  onClick={() => setSelectedAccident(null)}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Close
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs uppercase text-gray-500">Date</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">{selectedAccident.date || 'N/A'}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs uppercase text-gray-500">Status</p>
                  <span className={`mt-1 inline-block rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadge(selectedAccident.status)}`}>
                    {selectedAccident.status || 'REPORTED'}
                  </span>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs uppercase text-gray-500">Vehicles Involved</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">{selectedAccident.vehiclesInvolved || 'N/A'}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs uppercase text-gray-500">Injuries</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">{selectedAccident.injuries || 'No injuries reported'}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 md:col-span-2">
                  <p className="text-xs uppercase text-gray-500">Description</p>
                  <p className="mt-1 text-sm text-gray-800">{selectedAccident.description || 'No description available.'}</p>
                </div>
              </div>

              <div className="px-6 pb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Investigation Timeline</h4>
                <div className="space-y-2">
                  {buildTimeline(selectedAccident).map((step, idx) => (
                    <div key={step.label} className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${step.done ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <p className={`text-sm ${step.done ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                        {idx + 1}. {step.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TrafficAccident;
