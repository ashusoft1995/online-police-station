import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

function OfficerManagement() {
  const STORAGE_KEY = 'officerManagementTableState';
  const [officers, setOfficers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [editingOfficerId, setEditingOfficerId] = useState(null);
  const [editOfficer, setEditOfficer] = useState({ role: 'DETECTIVE', phone: '', status: 'ACTIVE' });
  const [fetchError, setFetchError] = useState('');
  const [newOfficer, setNewOfficer] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    role: 'DETECTIVE',
    badgeNumber: '',
    phone: '',
    address: ''
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchOfficers();
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (saved.search) setSearch(saved.search);
      if (saved.roleFilter) setRoleFilter(saved.roleFilter);
      if (saved.statusFilter) setStatusFilter(saved.statusFilter);
      if (saved.sortField) setSortField(saved.sortField);
      if (saved.sortDirection) setSortDirection(saved.sortDirection);
      if (saved.currentPage) {
        const page = Number(saved.currentPage);
        if (Number.isFinite(page) && page > 0) setCurrentPage(page);
      }
    } catch (err) {
      console.error('Failed to restore officer table state', err);
    }
  }, []);

  useEffect(() => {
    const snapshot = {
      search,
      roleFilter,
      statusFilter,
      sortField,
      sortDirection,
      currentPage
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  }, [search, roleFilter, statusFilter, sortField, sortDirection, currentPage]);

  const fetchOfficers = async () => {
    try {
      setLoading(true);
      setFetchError('');
      const response = await api.get('/users');
      const filtered = response.data.filter(u => u.role !== 'POLICE_HEAD');
      setOfficers(filtered);
    } catch (err) {
      console.error('Error fetching officers', err);
      setFetchError('Error fetching officers. Please try again.');
      toast.error('Failed to fetch officers');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!newOfficer.fullName.trim()) return 'Full Name is required';
    if (!newOfficer.username.trim()) return 'Username is required';
    if (!newOfficer.email.trim()) return 'Email is required';
    if (!newOfficer.password.trim()) return 'Password is required';
    if (!newOfficer.badgeNumber.trim()) return 'Badge Number is required';
    if (!newOfficer.phone.trim()) return 'Phone is required';
    return '';
  };

  const handleAddOfficer = async (e) => {
    e.preventDefault();
    setFormError('');

    const error = validateForm();
    if (error) {
      setFormError(error);
      return;
    }

    try {
      setActionLoading(true);
      await api.post('/auth/signup', newOfficer);
      setShowAddForm(false);
      setNewOfficer({
        fullName: '',
        username: '',
        email: '',
        password: '',
        role: 'DETECTIVE',
        badgeNumber: '',
        phone: '',
        address: ''
      });
      await fetchOfficers();
      toast.success('Officer added');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Error adding officer');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDeleteOfficer = (id) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const openOfficerDetails = (officer) => {
    setSelectedOfficer(officer);
  };

  const closeOfficerDetails = () => {
    setSelectedOfficer(null);
  };

  const startEditOfficer = (officer) => {
    setEditingOfficerId(officer.id);
    setEditOfficer({
      role: officer.role || 'DETECTIVE',
      phone: officer.phone || '',
      status: officer.status || 'ACTIVE'
    });
  };

  const cancelEditOfficer = () => {
    setEditingOfficerId(null);
    setEditOfficer({ role: 'DETECTIVE', phone: '', status: 'ACTIVE' });
  };

  const handleSaveOfficer = async (officer) => {
    try {
      setActionLoading(true);
      await api.put(`/users/${officer.id}`, {
        ...officer,
        role: editOfficer.role,
        phone: editOfficer.phone,
        status: editOfficer.status
      });
      await fetchOfficers();
      toast.success('Officer updated');
      cancelEditOfficer();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update officer');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteOfficer = async () => {
    if (!deleteId) return;
    try {
      setActionLoading(true);
      await api.delete(`/users/${deleteId}`);
      await fetchOfficers();
      toast.success('Officer deleted');
    } catch (err) {
      console.error(err);
      toast.error('Error deleting officer');
    } finally {
      setActionLoading(false);
      setShowDeleteConfirm(false);
      setDeleteId(null);
    }
  };

  const handleToggleStatus = async (officer) => {
    const nextStatus = officer.status === 'INACTIVE' ? 'ACTIVE' : 'INACTIVE';
    try {
      setActionLoading(true);
      await api.put(`/users/${officer.id}`, {
        ...officer,
        status: nextStatus
      });
      await fetchOfficers();
      toast.success(`Officer marked as ${nextStatus}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update officer status');
    } finally {
      setActionLoading(false);
    }
  };

  const exportOfficersCsv = () => {
    const header = ['ID', 'Full Name', 'Username', 'Email', 'Role', 'Badge Number', 'Phone', 'Status'];
    const rows = officers.map((o) => [
      o.id,
      o.fullName || '',
      o.username || '',
      o.email || '',
      o.role || '',
      o.badgeNumber || '',
      o.phone || '',
      o.status || 'ACTIVE'
    ]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `officers-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredOfficers = officers.filter((o) => {
    const matchesSearch =
      o.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      o.username?.toLowerCase().includes(search.toLowerCase()) ||
      o.badgeNumber?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || o.role === roleFilter;
    const officerStatus = o.status || 'ACTIVE';
    const matchesStatus = statusFilter === 'ALL' || officerStatus === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const sortedOfficers = [...filteredOfficers].sort((a, b) => {
    const av = a?.[sortField] ?? '';
    const bv = b?.[sortField] ?? '';
    const baseCompare =
      typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv));
    return sortDirection === 'asc' ? baseCompare : -baseCompare;
  });

  const totalPages = Math.max(1, Math.ceil(sortedOfficers.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedOfficers = sortedOfficers.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  const handleSort = (field) => {
    setCurrentPage(1);
    setSortField((prevField) => {
      if (prevField === field) {
        setSortDirection((prevDir) => (prevDir === 'asc' ? 'desc' : 'asc'));
        return prevField;
      }
      setSortDirection('asc');
      return field;
    });
  };

  const getSortIndicator = (field) => {
    if (sortField !== field) return '↕';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const totalOfficers = officers.length;
  const activeOfficers = officers.filter((o) => (o.status || 'ACTIVE') !== 'INACTIVE').length;
  const inactiveOfficers = totalOfficers - activeOfficers;
  const detectiveCount = officers.filter((o) => o.role === 'DETECTIVE').length;

  const getRoleBadge = (role) => {
    const colors = {
      DETECTIVE: 'bg-blue-100 text-blue-800',
      TRAFFIC_OFFICER: 'bg-yellow-100 text-yellow-800',
      TRAFFIC_POLICE: 'bg-green-100 text-green-800',
      CRIMINAL_PREVENTIVE: 'bg-purple-100 text-purple-800',
      HR_MANAGER: 'bg-gray-100 text-gray-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getRoleName = (role) => {
    const names = {
      DETECTIVE: 'Detective',
      TRAFFIC_OFFICER: 'Traffic Officer',
      TRAFFIC_POLICE: 'Traffic Police',
      CRIMINAL_PREVENTIVE: 'Criminal Preventive',
      HR_MANAGER: 'HR Manager'
    };
    return names[role] || role;
  };

  const resetTableState = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSearch('');
    setRoleFilter('ALL');
    setStatusFilter('ALL');
    setSortField('id');
    setSortDirection('desc');
    setCurrentPage(1);
  };

  return (
    <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 p-[1px] shadow-lg">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-blue-900">Officer Management</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchOfficers}
            disabled={loading || actionLoading}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-60"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={exportOfficersCsv}
            className="px-4 py-2 rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
          >
            Export CSV
          </button>
          <button
            onClick={resetTableState}
            className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            Reset State
          </button>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setFormError('');
              setFetchError('');
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transform hover:scale-105 transition-all duration-300"
          >
            + Add New Officer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-xl transform hover:scale-105 transition-all duration-500">
          <p className="text-xs uppercase text-gray-500">Total Officers</p>
          <p className="text-2xl font-bold text-blue-900">{totalOfficers}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-xl transform hover:scale-105 transition-all duration-500">
          <p className="text-xs uppercase text-gray-500">Active Officers</p>
          <p className="text-2xl font-bold text-green-600">{activeOfficers}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-xl transform hover:scale-105 transition-all duration-500">
          <p className="text-xs uppercase text-gray-500">Inactive Officers</p>
          <p className="text-2xl font-bold text-red-600">{inactiveOfficers}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-xl transform hover:scale-105 transition-all duration-500">
          <p className="text-xs uppercase text-gray-500">Detectives</p>
          <p className="text-2xl font-bold text-purple-700">{detectiveCount}</p>
        </div>
      </div>
      {fetchError && (
        <div className="mb-4 px-4 py-2 bg-red-100 text-red-700 rounded">
          {fetchError}
        </div>
      )}

      {showAddForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Add New Officer</h3>
          {formError && <div className="mb-3 text-red-700">{formError}</div>}
          <form onSubmit={handleAddOfficer} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Full Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="Full Name"
                value={newOfficer.fullName}
                onChange={(e) => setNewOfficer({...newOfficer, fullName: e.target.value})}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Username <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="Username"
                value={newOfficer.username}
                onChange={(e) => setNewOfficer({...newOfficer, username: e.target.value})}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email <span className="text-red-500">*</span></label>
              <input
                type="email"
                placeholder="Email"
                value={newOfficer.email}
                onChange={(e) => setNewOfficer({...newOfficer, email: e.target.value})}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Password <span className="text-red-500">*</span></label>
              <input
                type="password"
                placeholder="Password"
                value={newOfficer.password}
                onChange={(e) => setNewOfficer({...newOfficer, password: e.target.value})}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <select
                value={newOfficer.role}
                onChange={(e) => setNewOfficer({...newOfficer, role: e.target.value})}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="DETECTIVE">Detective</option>
                <option value="TRAFFIC_OFFICER">Traffic Officer</option>
                <option value="TRAFFIC_POLICE">Traffic Police</option>
                <option value="CRIMINAL_PREVENTIVE">Criminal Preventive</option>
                <option value="HR_MANAGER">HR Manager</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Badge Number <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="Badge Number"
                value={newOfficer.badgeNumber}
                onChange={(e) => setNewOfficer({...newOfficer, badgeNumber: e.target.value})}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Phone <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="Phone"
                value={newOfficer.phone}
                onChange={(e) => setNewOfficer({...newOfficer, phone: e.target.value})}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Address</label>
              <input
                type="text"
                placeholder="Address"
                value={newOfficer.address}
                onChange={(e) => setNewOfficer({...newOfficer, address: e.target.value})}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="md:col-span-2 flex justify-end space-x-2">
              <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800" disabled={loading}>Add Officer</button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          type="text"
          placeholder="Search by name, username, or badge..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        >
          <option value="ALL">All Roles</option>
          <option value="DETECTIVE">Detective</option>
          <option value="TRAFFIC_OFFICER">Traffic Officer</option>
          <option value="TRAFFIC_POLICE">Traffic Police</option>
          <option value="CRIMINAL_PREVENTIVE">Criminal Preventive</option>
          <option value="HR_MANAGER">HR Manager</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => handleSort('id')}>ID <span className="text-[10px]">{getSortIndicator('id')}</span></th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => handleSort('fullName')}>Name <span className="text-[10px]">{getSortIndicator('fullName')}</span></th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => handleSort('username')}>Username <span className="text-[10px]">{getSortIndicator('username')}</span></th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => handleSort('role')}>Role <span className="text-[10px]">{getSortIndicator('role')}</span></th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => handleSort('badgeNumber')}>Badge <span className="text-[10px]">{getSortIndicator('badgeNumber')}</span></th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => handleSort('phone')}>Phone <span className="text-[10px]">{getSortIndicator('phone')}</span></th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => handleSort('status')}>Status <span className="text-[10px]">{getSortIndicator('status')}</span></th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-gray-500">Loading officers...</td>
              </tr>
            ) : sortedOfficers.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-gray-500">No officers found</td>
              </tr>
            ) : (
              paginatedOfficers.map(officer => (
                <tr key={officer.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{officer.id}</td>
                  <td className="px-4 py-3 text-sm">{officer.fullName}</td>
                  <td className="px-4 py-3 text-sm">{officer.username}</td>
                  <td className="px-4 py-3">
                    {editingOfficerId === officer.id ? (
                      <select
                        value={editOfficer.role}
                        onChange={(e) => setEditOfficer({ ...editOfficer, role: e.target.value })}
                        className="px-2 py-1 border border-gray-300 rounded text-xs"
                      >
                        <option value="DETECTIVE">Detective</option>
                        <option value="TRAFFIC_OFFICER">Traffic Officer</option>
                        <option value="TRAFFIC_POLICE">Traffic Police</option>
                        <option value="CRIMINAL_PREVENTIVE">Criminal Preventive</option>
                        <option value="HR_MANAGER">HR Manager</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadge(officer.role)}`}>
                        {getRoleName(officer.role)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">{officer.badgeNumber || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm">
                    {editingOfficerId === officer.id ? (
                      <input
                        type="text"
                        value={editOfficer.phone}
                        onChange={(e) => setEditOfficer({ ...editOfficer, phone: e.target.value })}
                        className="px-2 py-1 border border-gray-300 rounded text-xs w-28"
                      />
                    ) : (officer.phone || 'N/A')}
                  </td>
                  <td className="px-4 py-3">
                    {editingOfficerId === officer.id ? (
                      <select
                        value={editOfficer.status}
                        onChange={(e) => setEditOfficer({ ...editOfficer, status: e.target.value })}
                        className="px-2 py-1 border border-gray-300 rounded text-xs"
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        (officer.status || 'ACTIVE') === 'INACTIVE'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {officer.status || 'ACTIVE'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {editingOfficerId === officer.id ? (
                        <>
                          <button
                            onClick={() => handleSaveOfficer(officer)}
                            disabled={actionLoading}
                            className="text-green-600 hover:text-green-800 text-sm disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditOfficer}
                            className="text-gray-600 hover:text-gray-800 text-sm"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => openOfficerDetails(officer)}
                            className="text-slate-600 hover:text-slate-800 text-sm"
                          >
                            View
                          </button>
                          <button
                            onClick={() => startEditOfficer(officer)}
                            className="text-indigo-600 hover:text-indigo-800 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleStatus(officer)}
                            disabled={actionLoading}
                            className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50"
                          >
                            {(officer.status || 'ACTIVE') === 'INACTIVE' ? 'Activate' : 'Deactivate'}
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => confirmDeleteOfficer(officer.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && sortedOfficers.length > 0 && (
        <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p className="text-sm text-gray-600">
            Showing {(safeCurrentPage - 1) * pageSize + 1}-
            {Math.min(safeCurrentPage * pageSize, sortedOfficers.length)} of {sortedOfficers.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage === 1}
              className="px-3 py-1.5 rounded border border-gray-300 text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {safeCurrentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage === totalPages}
              className="px-3 py-1.5 rounded border border-gray-300 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="mb-6">Are you sure you want to delete this officer?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
              <button onClick={handleDeleteOfficer} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700" disabled={actionLoading}>
                {actionLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedOfficer && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{selectedOfficer.fullName || 'Officer Profile'}</h3>
                <p className="text-sm text-gray-500">{selectedOfficer.username}</p>
              </div>
              <button
                onClick={closeOfficerDetails}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Close
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs uppercase text-gray-500">Role</p>
                <p className="mt-1 text-sm font-medium text-gray-900">{getRoleName(selectedOfficer.role)}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs uppercase text-gray-500">Status</p>
                <p className="mt-1 text-sm font-medium text-gray-900">{selectedOfficer.status || 'ACTIVE'}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs uppercase text-gray-500">Badge Number</p>
                <p className="mt-1 text-sm font-medium text-gray-900">{selectedOfficer.badgeNumber || 'N/A'}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs uppercase text-gray-500">Join Date</p>
                <p className="mt-1 text-sm font-medium text-gray-900">{selectedOfficer.joinDate || 'N/A'}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs uppercase text-gray-500">Email</p>
                <p className="mt-1 text-sm font-medium text-gray-900 break-words">{selectedOfficer.email || 'N/A'}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs uppercase text-gray-500">Phone</p>
                <p className="mt-1 text-sm font-medium text-gray-900">{selectedOfficer.phone || 'N/A'}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4 md:col-span-2">
                <p className="text-xs uppercase text-gray-500">Address</p>
                <p className="mt-1 text-sm font-medium text-gray-900">{selectedOfficer.address || 'N/A'}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs uppercase text-gray-500">Department</p>
                <p className="mt-1 text-sm font-medium text-gray-900">{selectedOfficer.department || 'N/A'}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs uppercase text-gray-500">Rank</p>
                <p className="mt-1 text-sm font-medium text-gray-900">{selectedOfficer.rank || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

export default OfficerManagement;