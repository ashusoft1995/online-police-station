import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import PoliceCommandHeader from '../components/PoliceCommandHeader';

const initialSignup = {
  fullName: '',
  username: '',
  email: '',
  password: '',
  role: 'DETECTIVE',
  badgeNumber: '',
  phone: '',
  address: '',
};

function Login({ setUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [signupData, setSignupData] = useState(initialSignup);
  const [signupLoading, setSignupLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { username, password });

      if (response.data?.token) {
        const { token, id, username, email, fullName, role, badgeNumber } = response.data;
        const userPayload = { id, username, email, fullName, role, badgeNumber };
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userPayload));
        setUser(userPayload);
        toast.success(`Welcome, ${fullName || username || 'officer'}`);
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignupField = (e) => {
    const { name, value } = e.target;
    setSignupData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!signupData.email?.trim()) {
      toast.error('Email is required');
      return;
    }
    setSignupLoading(true);
    try {
      const registeredUsername = signupData.username;
      await api.post('/auth/signup', {
        fullName: signupData.fullName,
        username: registeredUsername,
        email: signupData.email.trim(),
        password: signupData.password,
        role: signupData.role,
        badgeNumber: signupData.badgeNumber,
        phone: signupData.phone,
        address: signupData.address,
      });
      toast.success('Officer registered — you can sign in now.');
      setShowSignup(false);
      setSignupData(initialSignup);
      setUsername(registeredUsername);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setSignupLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      toast.error('Enter your email');
      return;
    }
    setForgotLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email: forgotEmail.trim() });
      toast.success(data.message || 'Check your email.');
      if (data.devResetToken) {
        toast.success(`Dev token: ${data.devResetToken}`, { duration: 8000 });
        toast(`Open reset page with this token`, { icon: '🔑' });
      }
      setShowForgot(false);
      setForgotEmail('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Request failed');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <PoliceCommandHeader variant="compact" />

      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="animate-fadeIn w-full max-w-md rounded-2xl border border-slate-200/80 bg-white/90 p-8 shadow-xl shadow-slate-900/5 backdrop-blur-sm">
          <h2 className="mb-6 text-center text-lg font-semibold text-slate-800">Officer sign in</h2>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-700">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="mb-2 block text-sm text-slate-700">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white/80 p-3 outline-none focus:border-police-blue focus:ring-2 focus:ring-police-blue/25"
                required
              />
            </div>

            <div className="mb-2">
              <label className="mb-2 block text-sm text-slate-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white/80 p-3 outline-none focus:border-police-blue focus:ring-2 focus:ring-police-blue/25"
                required
              />
            </div>

            <div className="mb-6 text-right">
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="text-sm text-police-blue hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-police-blue py-3 font-semibold text-white shadow-md transition hover:bg-blue-950 disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-6">
            <button
              type="button"
              onClick={() => setShowSignup(true)}
              className="w-full rounded-xl border-2 border-police-blue/40 py-3 text-center font-semibold text-police-blue transition hover:bg-police-blue/5"
            >
              Register as officer
            </button>
            <p className="text-center text-xs text-slate-500">
              After registration, use your username and password above to sign in.
            </p>
          </div>

          <p className="mt-4 text-center text-sm text-slate-500">
            <Link to="/citizen-report" className="text-police-blue hover:underline">
              Public citizen report (no login)
            </Link>
          </p>
        </div>
      </div>

      {showSignup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-police-blue">Officer registration</h3>
            <p className="mt-1 text-sm text-slate-600">
              One-time signup. Police Head accounts are created by an administrator only.
            </p>
            <form onSubmit={handleSignup} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                name="fullName"
                placeholder="Full name *"
                value={signupData.fullName}
                onChange={handleSignupField}
                className="rounded-lg border border-slate-200 p-2 text-sm sm:col-span-2"
                required
              />
              <input
                name="username"
                placeholder="Username *"
                value={signupData.username}
                onChange={handleSignupField}
                className="rounded-lg border border-slate-200 p-2 text-sm"
                required
              />
              <input
                name="email"
                type="email"
                placeholder="Email *"
                value={signupData.email}
                onChange={handleSignupField}
                className="rounded-lg border border-slate-200 p-2 text-sm"
                required
              />
              <input
                name="password"
                type="password"
                placeholder="Password *"
                value={signupData.password}
                onChange={handleSignupField}
                className="rounded-lg border border-slate-200 p-2 text-sm sm:col-span-2"
                required
                minLength={6}
              />
              <input
                name="badgeNumber"
                placeholder="Badge number *"
                value={signupData.badgeNumber}
                onChange={handleSignupField}
                className="rounded-lg border border-slate-200 p-2 text-sm"
                required
              />
              <input
                name="phone"
                placeholder="Phone *"
                value={signupData.phone}
                onChange={handleSignupField}
                className="rounded-lg border border-slate-200 p-2 text-sm"
                required
              />
              <input
                name="address"
                placeholder="Address"
                value={signupData.address}
                onChange={handleSignupField}
                className="rounded-lg border border-slate-200 p-2 text-sm sm:col-span-2"
              />
              <select
                name="role"
                value={signupData.role}
                onChange={handleSignupField}
                className="rounded-lg border border-slate-200 p-2 text-sm sm:col-span-2"
              >
                <option value="DETECTIVE">Detective</option>
                <option value="OFFICER">Officer</option>
              </select>
              <div className="flex gap-2 sm:col-span-2">
                <button
                  type="button"
                  onClick={() => setShowSignup(false)}
                  className="flex-1 rounded-xl border border-slate-300 py-2 font-medium text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={signupLoading}
                  className="flex-1 rounded-xl bg-police-blue py-2 font-semibold text-white disabled:opacity-50"
                >
                  {signupLoading ? 'Saving…' : 'Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="font-bold text-police-blue">Recover password</h3>
            <p className="mt-2 text-sm text-slate-600">
              We send reset instructions to your registered email. With dev mode enabled, a token may also appear in
              the UI and server logs.
            </p>
            <form onSubmit={handleForgot} className="mt-4 space-y-3">
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="Your email"
                className="w-full rounded-xl border border-slate-200 p-3 text-sm"
                required
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowForgot(false)}
                  className="flex-1 rounded-xl border py-2 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="flex-1 rounded-xl bg-police-blue py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {forgotLoading ? 'Sending…' : 'Send link'}
                </button>
              </div>
              <Link to="/reset-password" className="block text-center text-sm text-police-blue hover:underline">
                I already have a reset token
              </Link>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
