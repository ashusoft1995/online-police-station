import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import PoliceCommandHeader from '../components/PoliceCommandHeader';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token: token.trim(), newPassword });
      toast.success('Password updated. You can sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PoliceCommandHeader variant="compact" />
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="animate-fadeIn w-full max-w-md rounded-2xl border border-slate-200/80 bg-white/95 p-8 shadow-xl">
          <h1 className="text-center text-xl font-bold text-police-blue">Set new password</h1>
          <p className="mt-2 text-center text-sm text-slate-600">
            Enter the token from your email (or the dev token from the forgot-password response).
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm text-slate-700">Reset token</label>
              <input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-police-blue focus:ring-2 focus:ring-police-blue/25"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-700">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-police-blue focus:ring-2"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-700">Confirm</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-police-blue focus:ring-2"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-police-blue py-3 font-semibold text-white shadow disabled:opacity-50"
            >
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm">
            <Link to="/login" className="text-police-blue hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
