import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

const incidentTypes = ['Theft', 'Assault', 'Accident', 'Other'];

function CitizenReport() {
  const [formData, setFormData] = useState({
    incidentType: 'Theft',
    location: '',
    description: '',
    date: '',
    anonymous: false,
    evidenceFile: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'file') {
      setFormData((prev) => ({ ...prev, evidenceFile: files[0] || null }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setFormData({
      incidentType: 'Theft',
      location: '',
      description: '',
      date: '',
      anonymous: false,
      evidenceFile: null
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.location || !formData.description || !formData.date) {
      setError('Please fill in required fields.');
      return;
    }

    setLoading(true);

    try {
      const payload = new FormData();
      payload.append('incidentType', formData.incidentType);
      payload.append('location', formData.location);
      payload.append('description', formData.description);
      payload.append('date', formData.date);
      payload.append('anonymous', formData.anonymous);
      if (formData.evidenceFile) {
        payload.append('evidenceFile', formData.evidenceFile);
      }

      await api.post('/reports', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess('Report submitted successfully. Thank you.');
      toast.success('Report submitted. Thank you.');
      resetForm();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit report.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="animate-fadeIn mx-auto max-w-3xl rounded-2xl border border-slate-200/80 bg-white/90 p-8 shadow-xl shadow-slate-900/5 backdrop-blur-sm">
        <h1 className="mb-6 text-3xl font-bold text-gray-800">Citizen Incident Report</h1>

        {error && <div className="rounded bg-red-100 p-3 text-sm text-red-700">{error}</div>}
        {success && <div className="rounded bg-green-100 p-3 text-sm text-green-700">{success}</div>}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-2 block font-medium text-gray-700">Incident Type *</label>
            <select
              name="incidentType"
              value={formData.incidentType}
              onChange={handleChange}
              className="w-full rounded border py-2 px-3 outline-none focus:border-blue-500"
            >
              {incidentTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block font-medium text-gray-700">Location *</label>
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full rounded border py-2 px-3 outline-none focus:border-blue-500"
              placeholder="Enter incident location"
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-medium text-gray-700">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              className="w-full rounded border p-3 outline-none focus:border-blue-500"
              placeholder="Describe what happened"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-medium text-gray-700">Date *</label>
              <input
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full rounded border py-2 px-3 outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="flex items-center pt-6">
              <input
                id="anonymous"
                name="anonymous"
                type="checkbox"
                checked={formData.anonymous}
                onChange={handleChange}
                className="mr-2 h-4 w-4"
              />
              <label htmlFor="anonymous" className="text-gray-700">Report anonymously</label>
            </div>
          </div>

          <div>
            <label className="mb-2 block font-medium text-gray-700">Evidence File (optional)</label>
            <input
              type="file"
              name="evidenceFile"
              onChange={handleChange}
              accept="image/*,application/pdf"
              className="w-full text-sm text-gray-700"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CitizenReport;
