import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import NotificationBell from './NotificationBell';
import ProfileDropdown from './ProfileDropdown';

function ShieldEmblem({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="shieldNavy" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="45%" stopColor="#172554" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="shieldSilver" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="40%" stopColor="#94a3b8" />
          <stop offset="70%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
        <linearGradient id="shieldGold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ca8a04" />
          <stop offset="50%" stopColor="#facc15" />
          <stop offset="100%" stop颜色="#a16207" />
        </linearGradient>
      </defs>
      <path
        d="M60 4 L112 24 V72 C112 104 82 128 60 136 C38 128 8 104 8 72 V24 Z"
        fill="url(#shieldNavy)"
        stroke="url(#shieldSilver)"
        strokeWidth="3"
        className="drop-shadow-[0_0_12px_rgba(148,163,184,0.45)]"
      />
      <path
        d="M60 18 L98 34 V70 C98 92 76 110 60 118 C44 110 22 92 22 70 V34 Z"
        fill="none"
        stroke="url(#shieldGold)"
        strokeWidth="2"
        opacity="0.95"
      />
      <path
        d="M60 38 L72 56 H88 L76 68 L80 88 L60 78 L40 88 L44 68 L32 56 H48 Z"
        fill="url(#shieldGold)"
        opacity="0.9"
      />
    </svg>
  );
}

function RippleButton({ children, className, onClick, disabled, 'aria-label': ariaLabel }) {
  const [ripples, setRipples] = useState([]);
  const handleMouseDown = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setRipples((prev) => [...prev, { x: e.clientX - r.left, y: e.clientY - r.top, id: Date.now() }]);
    setTimeout(() => setRipples((p) => p.slice(1)), 600);
  };
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onMouseDown={handleMouseDown}
      onClick={onClick}
      className={`relative overflow-hidden select-none ${className}`}
    >
      {ripples.map((rk) => (
        <span
          key={rk.id}
          className="pointer-events-none absolute h-8 w-8 rounded-full bg-white/30 animate-rippling"
          style={{ left: rk.x - 16, top: rk.y - 16 }}
        />
      ))}
      {children}
    </button>
  );
}

export default function PoliceCommandHeader({
  variant = 'full',
  user,
  onLogout,
  onOfficersTab,
}) {
  const navigate = useNavigate();

  const runQuick = async (label, fn) => {
    const t = toast.loading(`${label}…`);
    try {
      await fn();
      toast.dismiss(t);
    } catch {
      toast.dismiss(t);
      toast.error('Service unavailable');
    }
  };

  const onReportIncident = () =>
    runQuick('Report incident', async () => {
      const { data } = await api.post('/public/quick-actions/report-incident', {});
      toast.success(data.message || 'OK');
      if (data.citizenReportPath) {
        setTimeout(() => navigate(data.citizenReportPath), 400);
      }
    });

  const onNearestStation = () =>
    runQuick('Locate station', async () => {
      const { data } = await api.get('/public/quick-actions/nearest-station');
      toast.success(
        `${data.name} — ${data.address}. Tel: ${data.phone}`,
        { duration: 5500 },
      );
    });

  const onEmergency = () =>
    runQuick('Emergency line', async () => {
      const { data } = await api.post('/public/quick-actions/emergency', {});
      toast.success(`${data.message} Hotline: ${data.hotline}`, { duration: 6000 });
    });

  const quickBtn =
    variant === 'compact'
      ? 'min-w-[100px] px-3 py-2 text-xs md:text-sm'
      : 'min-w-[140px] px-4 py-3 text-sm md:text-base';

  return (
    <header
      className="police-stripes relative overflow-hidden border-b border-amber-600/30 shadow-lg shadow-black/40"
      style={{
        backgroundColor: '#0a1628',
        backgroundImage: `repeating-linear-gradient(
          -32deg,
          transparent,
          transparent 6px,
          rgba(30, 58, 138, 0.12) 6px,
          rgba(30, 58, 138, 0.12) 12px
        )`,
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-900/40 to-transparent" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-6 pt-6 md:px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4 lg:items-start">
              <ShieldEmblem className="h-20 w-20 shrink-0 animate-fadeIn sm:h-24 sm:w-24" />
              <div>
                <h1 className="bg-gradient-to-r from-amber-100 via-white to-slate-300 bg-clip-text text-2xl font-black tracking-tight text-transparent md:text-3xl">
                  Metropolitan Police Command
                </h1>
                <p className="mt-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-400 md:text-sm">
                  Secure · Professional · Ready
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
              <RippleButton
                aria-label="Report incident"
                onClick={onReportIncident}
                className={`group rounded-xl border border-red-500/50 bg-gradient-to-br from-red-950/90 to-slate-950/90 ${quickBtn} font-semibold text-red-100 shadow-[0_0_20px_rgba(239,68,68,0.25)] transition hover:border-red-400 hover:shadow-[0_0_28px_rgba(239,68,68,0.45)] active:scale-[0.98] animate-siren-pulse`}
              >
                <span className="flex items-center justify-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                  </span>
                  Report
                </span>
              </RippleButton>
              <RippleButton
                aria-label="Find nearest station"
                onClick={onNearestStation}
                className={`rounded-xl border border-blue-400/40 bg-gradient-to-br from-blue-950/90 to-slate-950/90 ${quickBtn} font-semibold text-blue-100 shadow-[0_0_18px_rgba(59,130,246,0.25)] transition hover:border-amber-400/60 hover:shadow-[0_0_26px_rgba(251,191,36,0.35)] active:scale-[0.98]`}
              >
                Station
              </RippleButton>
              <RippleButton
                aria-label="Emergency call"
                onClick={onEmergency}
                className={`rounded-xl border border-amber-500/50 bg-gradient-to-br from-amber-950/80 to-slate-950/90 ${quickBtn} font-semibold text-amber-100 shadow-[0_0_18px_rgba(245,158,11,0.3)] transition hover:border-amber-300 hover:shadow-[0_0_26px_rgba(251,191,36,0.45)] active:scale-[0.98]`}
              >
                Emergency
              </RippleButton>
            </div>
          </div>

          {variant === 'full' && user && (
            <div className="flex w-full flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-end lg:w-auto lg:flex-col lg:items-end">
              <nav className="flex flex-wrap items-center justify-center gap-2 text-sm text-slate-200 sm:justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="rounded-lg px-3 py-1.5 transition hover:bg-white/10 hover:text-white"
                >
                  Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/citizen-report')}
                  className="rounded-lg px-3 py-1.5 transition hover:bg-white/10 hover:text-white"
                >
                  Citizen Report
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/traffic-accidents')}
                  className="rounded-lg px-3 py-1.5 transition hover:bg-white/10 hover:text-white"
                >
                  Traffic
                </button>
                {user?.role === 'POLICE_HEAD' && onOfficersTab && (
                  <button
                    type="button"
                    onClick={onOfficersTab}
                    className="rounded-lg px-3 py-1.5 transition hover:bg-white/10 hover:text-white"
                  >
                    Officers
                  </button>
                )}
              </nav>
              <div className="flex items-center justify-center gap-3 border-t border-white/10 pt-3 sm:border-0 sm:pt-0">
                <NotificationBell />
                <ProfileDropdown user={user} onLogout={onLogout} />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
