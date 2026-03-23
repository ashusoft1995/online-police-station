import React, { useState } from 'react';
import api from '../services/api';

function CriminalForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    crime: '',
    description: '',
    location: '',
    crimeDate: '',
    status: 'UNDER_INVESTIGATION',
    priority: 'MEDIUM',
    evidence: '',
    comments: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Get user data from localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        setError('User not authenticated');
        return;
      }

      const criminalData = {
        ...formData,
        reportedBy: user.username,
        reportedByName: user.fullName,
        detectiveBadge: user.badgeNumber
      };

      const response = await api.post('/criminals', criminalData);
      setSuccess('Criminal registered successfully!');
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
      // Reset form
      setFormData({
        name: '',
        crime: '',
        description: '',
        location: '',
        crimeDate: '',
        status: 'UNDER_INVESTIGATION',
        priority: 'MEDIUM',
        evidence: '',
        comments: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register criminal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Criminal Registration</h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 text-green-700 p-4 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter criminal's name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Crime Type
          </label>
          <input
            type="text"
            name="crime"
            value={formData.crime}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter crime type"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the crime"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter location of crime"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of Crime
          </label>
          <input
            type="date"
            name="crimeDate"
            value={formData.crimeDate}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="UNDER_INVESTIGATION">Under Investigation</option>
            <option value="EVIDENCE_COLLECTION">Evidence Collection</option>
            <option value="ARRESTED">Arrested</option>
            <option value="CASE_CLOSED">Case Closed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Evidence
          </label>
          <textarea
            name="evidence"
            value={formData.evidence}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter evidence details"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Comments
          </label>
          <textarea
            name="comments"
            value={formData.comments}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Additional comments"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Registering...' : 'Register Criminal'}
        </button>
      </form>
    </div>
  );
}

export default CriminalForm;