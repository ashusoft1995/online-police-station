import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

function CitizenReports({ user }) {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, replied, resolved

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get('/reports');
      setReports(response.data.reverse()); // Show newest first
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setLoading(false);
    }
  };

  const handleReply = (report) => {
    setSelectedReport(report);
    setReplyText('');
    setShowReplyModal(true);
  };

  const submitReply = async () => {
    if (!replyText.trim()) return;

    setReplying(true);
    try {
      await api.post(`/reports/${selectedReport.id}/reply`, {
        reply: replyText,
        replyBy: user.fullName
      });
      setShowReplyModal(false);
      setSelectedReport(null);
      setReplyText('');
      fetchReports();
      toast.success('Reply sent');
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    } finally {
      setReplying(false);
    }
  };

  const updateReportStatus = async (reportId, status, priority = null) => {
    try {
      const updateData = { status };
      if (priority) updateData.priority = priority;
      if (status === 'UNDER_REVIEW') {
        updateData.assignedOfficerId = user.id;
        updateData.assignedOfficerName = user.fullName;
      }

      await api.put(`/reports/${reportId}/status`, updateData);
      fetchReports();
      toast.success('Report updated');
    } catch (error) {
      console.error('Error updating report status:', error);
      toast.error('Could not update report');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'UNDER_REVIEW': return 'bg-blue-100 text-blue-800';
      case 'REPLIED': return 'bg-purple-100 text-purple-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredReports = reports.filter(report => {
    if (filter === 'all') return true;
    if (filter === 'pending') return report.status === 'PENDING';
    if (filter === 'replied') return report.status === 'REPLIED';
    if (filter === 'resolved') return report.status === 'RESOLVED';
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading citizen reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Citizen Reports</h2>
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Reports</option>
            <option value="pending">Pending</option>
            <option value="replied">Replied</option>
            <option value="resolved">Resolved</option>
          </select>
          <span className="text-sm text-gray-500">Total: {filteredReports.length}</span>
        </div>
      </div>

      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">No reports found</p>
          </div>
        ) : (
          filteredReports.map(report => (
            <div key={report.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {report.incidentType} Report #{report.id}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(report.status)}`}>
                      {report.status.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(report.priority)}`}>
                      {report.priority}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Location:</strong> {report.location}</p>
                    <p><strong>Date:</strong> {report.date}</p>
                    <p><strong>Anonymous:</strong> {report.anonymous ? 'Yes' : 'No'}</p>
                    {report.assignedOfficerName && (
                      <p><strong>Assigned to:</strong> {report.assignedOfficerName}</p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  {report.status === 'PENDING' && (
                    <button
                      onClick={() => updateReportStatus(report.id, 'UNDER_REVIEW')}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Take Case
                    </button>
                  )}
                  <button
                    onClick={() => handleReply(report)}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Reply
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Description:</h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded">{report.description}</p>
              </div>

              {report.evidenceUrl && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Evidence:</h4>
                  <a
                    href={report.evidenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    View Evidence File
                  </a>
                </div>
              )}

              {report.reply && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Official Reply:</h4>
                  <p className="text-blue-800">{report.reply}</p>
                  <p className="text-xs text-blue-600 mt-2">
                    Replied by {report.replyBy} on {report.replyDate ? new Date(report.replyDate).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              )}

              {report.internalNotes && (
                <div className="bg-yellow-50 p-4 rounded-lg mt-4">
                  <h4 className="font-medium text-yellow-900 mb-2">Internal Notes:</h4>
                  <p className="text-yellow-800">{report.internalNotes}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Reply Modal */}
      {showReplyModal && selectedReport && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Reply to Report #{selectedReport.id}
              </h3>

              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Report Details:</h4>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p><strong>Type:</strong> {selectedReport.incidentType}</p>
                  <p><strong>Location:</strong> {selectedReport.location}</p>
                  <p><strong>Description:</strong> {selectedReport.description}</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Reply
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={6}
                  placeholder="Enter your official response to this citizen report..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReply}
                  disabled={replying || !replyText.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {replying ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CitizenReports;