import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

const statusOptions = [
  'UNDER_INVESTIGATION',
  'EVIDENCE_COLLECTION',
  'ARRESTED',
  'CASE_CLOSED'
];

function CaseDetailsModal({ isOpen, onClose, caseData, user, onUpdated }) {
  const [status, setStatus] = useState(caseData?.status || 'UNDER_INVESTIGATION');
  const [commentText, setCommentText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (caseData) {
      setStatus(caseData.status || 'UNDER_INVESTIGATION');
      setCommentText('');
      setError('');
    }
  }, [caseData, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (event) => {
      if (event.key === 'Escape' || event.key === 'Esc') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !caseData) return null;

  const canEdit = user?.role === 'POLICE_HEAD';

  const handleSave = async () => {
    if (!canEdit) {
      toast.error('Only Police Head can update case status and comments.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const updatedComments = commentText.trim()
        ? `${caseData.comments ? caseData.comments + '\n' : ''}${commentText.trim()}`
        : caseData.comments || '';

      const payload = {
        ...caseData,
        status,
        comments: updatedComments
      };

      await api.put(`/criminals/${caseData.id}`, payload);
      toast.success('Case updated');
      setCommentText('');
      if (onUpdated) onUpdated();
    } catch (err) {
      console.error('Error updating case', err);
      const msg = err.response?.data?.message || 'Failed to update case.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-800">Case Details</h2>
          <button
            onClick={onClose}
            className="rounded bg-red-500 px-3 py-1 text-xs font-semibold text-white hover:bg-red-600"
          >
            Close
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="text-lg font-semibold">{caseData.name || '-'}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Crime</p>
            <p className="text-lg font-semibold">{caseData.crime || '-'}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Location</p>
            <p className="text-lg font-semibold">{caseData.location || '-'}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Date</p>
            <p className="text-lg font-semibold">{caseData.crimeDate || '-'}</p>
          </div>

          <div className="md:col-span-2">
            <p className="text-sm text-gray-500">Description</p>
            <p className="whitespace-pre-line rounded border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
              {caseData.description || '-'}
            </p>
          </div>

          <div className="md:col-span-2">
            <p className="text-sm text-gray-500">Evidence</p>
            <p className="whitespace-pre-line rounded border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
              {caseData.evidence || '-'}
            </p>
          </div>

          <div className="md:col-span-2">
            <p className="text-sm text-gray-500">Existing Comments</p>
            <p className="whitespace-pre-line rounded border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
              {caseData.comments || 'No comments yet.'}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-gray-600">Status</p>
            <select
              disabled={!canEdit}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded border p-2 outline-none focus:border-blue-500"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-600">Priority</p>
            <input
              value={caseData.priority || '-'}
              disabled
              className="w-full cursor-not-allowed rounded border bg-gray-100 p-2 text-gray-500"
            />
          </div>
        </div>

        {canEdit && (
          <div className="mt-4">
            <p className="text-sm font-semibold text-gray-600">Add Comment</p>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment for this case..."
              className="h-24 w-full rounded border p-2 outline-none focus:border-blue-500"
            />
          </div>
        )}

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-5 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="rounded border px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            disabled={!canEdit || saving}
            onClick={handleSave}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CaseDetailsModal;
