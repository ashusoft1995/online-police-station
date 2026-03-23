import React, { useState, useEffect } from 'react';
import api from '../services/api';

function TrafficAccident() {
  const [formData, setFormData] = useState({
    location: '',
    date: '',
    vehiclesInvolved: '',
    injuries: '',
    description: ''
  });
  const [accidents, setAccidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAccidents = async () => {
    try {
      const response = await api.get('/traffic/accidents');
      setAccidents(response.data.reverse());
    } catch (err) {
      console.error('Error fetching accidents', err);
      setError('Failed to load accidents.');
    }
  };

  useEffect(() => {
    fetchAccidents();
  }, []);

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
    setSuccess('');

    if (!formData.location || !formData.date || !formData.vehiclesInvolved || !formData.description) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/traffic/accidents', formData);
      setSuccess('Accident registered successfully.');
      resetForm();
      await fetchAccidents();
    } catch (err) {
      console.error('Error saving accident', err);
      setError(err.response?.data?.message || 'Failed to register accident.');
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

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-lg bg-white p-6 shadow">
          <h1 className="text-2xl font-bold text-gray-800">Traffic Accident Report</h1>
          <p className="text-sm text-gray-500">Register a new traffic accident incident.</p>

          {error && <div className="mt-4 rounded bg-red-100 p-3 text-red-700">{error}</div>}
          {success && <div className="mt-4 rounded bg-green-100 p-3 text-green-700">{success}</div>}

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
                className="w-full rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Accident'}
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-xl font-bold text-gray-800">Recent Traffic Accidents</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2">Location</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Vehicles</th>
                  <th className="px-4 py-2">Injuries</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {accidents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                      No accident records found.
                    </td>
                  </tr>
                ) : (
                  accidents.map((accident) => (
                    <tr key={accident.id} className="border-t">
                      <td className="px-4 py-2">{accident.location}</td>
                      <td className="px-4 py-2">{accident.date}</td>
                      <td className="px-4 py-2">{accident.vehiclesInvolved}</td>
                      <td className="px-4 py-2">{accident.injuries || 'N/A'}</td>
                      <td className="px-4 py-2">
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadge(accident.status)}`}>
                          {accident.status || 'REPORTED'}
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
    </div>
  );
}

export default TrafficAccident;
