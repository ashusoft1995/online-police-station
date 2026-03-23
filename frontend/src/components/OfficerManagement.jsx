import React, { useState, useEffect } from 'react';
import api from '../services/api';

function OfficerManagement() {
  const [officers, setOfficers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
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
  const [toast, setToast] = useState({ message: '', type: '' });

  useEffect(() => {
    fetchOfficers();
  }, []);

  useEffect(() => {
    if (toast.message) {
      const id = setTimeout(() => setToast({ message: '', type: '' }), 3000);
      return () => clearTimeout(id);
    }
  }, [toast]);

  const fetchOfficers = async () => {
    try {
      const response = await api.get('/users');
      const filtered = response.data.filter(u => u.role !== 'POLICE_HEAD');
      setOfficers(filtered);
    } catch (err) {
      console.error('Error fetching officers', err);
      setToast({ message: 'Failed to fetch officers', type: 'error' });
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
      setLoading(true);
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
      setToast({ message: 'Officer added successfully', type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: err.response?.data?.error || 'Error adding officer', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteOfficer = (id) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteOfficer = async () => {
    if (!deleteId) return;
    try {
      setLoading(true);
      await api.delete(`/users/${deleteId}`);
      await fetchOfficers();
      setToast({ message: 'Officer deleted successfully', type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: 'Error deleting officer', type: 'error' });
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setDeleteId(null);
    }
  };

  const filteredOfficers = officers.filter(o =>
    o.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    o.username?.toLowerCase().includes(search.toLowerCase())
  );

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

  if (loading) return <div className="text-center py-8">Loading officers...</div>;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-blue-900">Officer Management</h2>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setFormError('');
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          + Add New Officer
        </button>
      </div>

      {toast.message && (
        <div className={`fixed top-5 right-5 px-4 py-2 rounded shadow-lg text-white ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.message}
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

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Badge</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredOfficers.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">No officers found</td>
              </tr>
            ) : (
              filteredOfficers.map(officer => (
                <tr key={officer.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{officer.id}</td>
                  <td className="px-4 py-3 text-sm">{officer.fullName}</td>
                  <td className="px-4 py-3 text-sm">{officer.username}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadge(officer.role)}`}>
                      {getRoleName(officer.role)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{officer.badgeNumber || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm">{officer.phone || 'N/A'}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => confirmDeleteOfficer(officer.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="mb-6">Are you sure you want to delete this officer?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
              <button onClick={handleDeleteOfficer} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700" disabled={loading}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OfficerManagement;