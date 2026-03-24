import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      containerClassName="!top-4 !right-4 sm:!top-6 sm:!right-6"
      toastOptions={{
        duration: 4200,
        className: '!text-sm !font-medium !shadow-lg !rounded-xl !px-4 !py-3 !border !border-slate-200/80',
        style: {
          background: 'rgba(255, 255, 255, 0.95)',
          color: '#0f172a',
          backdropFilter: 'blur(8px)',
        },
        success: {
          iconTheme: { primary: '#1e3a8a', secondary: '#fff' },
        },
        error: {
          iconTheme: { primary: '#dc2626', secondary: '#fff' },
        },
      }}
    />
  </React.StrictMode>,
);