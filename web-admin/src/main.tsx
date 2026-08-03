import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { SuperAdminDashboard } from './features/super-admin/SuperAdminDashboard';
import { OwnerDashboard } from './features/owner-admin/OwnerDashboard';
import { setLocale, Locale, t } from './lib/i18n';
import { setTenantSlug } from './lib/api';

const App: React.FC = () => {
  const [view, setView] = useState<'owner' | 'super_admin'>('owner');
  const [currentLocale, setCurrentLocaleState] = useState<Locale>('en');
  const [tenantInput, setTenantInput] = useState<string>('demo_tenant');

  const handleLocaleChange = (loc: Locale) => {
    setCurrentLocaleState(loc);
    setLocale(loc);
  };

  const handleTenantChange = (slug: string) => {
    setTenantInput(slug);
    setTenantSlug(slug);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            FM
          </div>
          <div>
            <h1 className="font-bold text-slate-100">{t('app_title')}</h1>
            <p className="text-xs text-slate-400">Multi-tenant Commercial Fleet SaaS</p>
          </div>
        </div>

        {/* View Switcher & Controls */}
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => setView('owner')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                view === 'owner' ? 'bg-blue-600 text-white font-medium shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Owner Admin
            </button>
            <button
              onClick={() => setView('super_admin')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                view === 'super_admin' ? 'bg-blue-600 text-white font-medium shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Super Admin
            </button>
          </div>

          {/* Tenant Input */}
          {view === 'owner' && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Tenant:</span>
              <input
                type="text"
                value={tenantInput}
                onChange={(e) => handleTenantChange(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 w-28 focus:outline-none focus:border-blue-500"
                placeholder="tenant_slug"
              />
            </div>
          )}

          {/* Language Selector */}
          <select
            value={currentLocale}
            onChange={(e) => handleLocaleChange(e.target.value as Locale)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="en">English (EN)</option>
            <option value="hi">हिंदी (HI)</option>
            <option value="ta">தமிழ் (TA)</option>
            <option value="ml">മലയാളം (ML)</option>
            <option value="te">తెలుగు (TE)</option>
            <option value="mr">मराठी (MR)</option>
          </select>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {view === 'owner' ? <OwnerDashboard /> : <SuperAdminDashboard />}
      </main>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
