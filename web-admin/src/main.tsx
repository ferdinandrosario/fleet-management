import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { SuperAdminDashboard } from './features/super-admin/SuperAdminDashboard';
import { OwnerDashboard } from './features/owner-admin/OwnerDashboard';
import { ThemeProvider } from './lib/theme';
import { ThemeToggle } from './components/ui/ThemeToggle';
import { setLocale, Locale, t } from './lib/i18n';
import { setTenantSlug } from './lib/api';

const AppContent: React.FC = () => {
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
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] flex flex-col transition-colors duration-250">
      {/* Top Navbar */}
      <header className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/90 backdrop-blur sticky top-0 z-50 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            FM
          </div>
          <div>
            <h1 className="font-bold text-base text-[var(--text-main)] leading-tight">{t('app_title')}</h1>
            <p className="text-xs text-[var(--text-muted)]">Fleet Management · India</p>
          </div>
        </div>

        {/* View Switcher, Tenant & Controls */}
        <div className="flex items-center flex-wrap gap-3">
          {/* Admin Mode Switcher */}
          <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 text-xs">
            <button
              onClick={() => setView('owner')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                view === 'owner'
                  ? 'bg-blue-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Fleet Owner
            </button>
            <button
              onClick={() => setView('super_admin')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                view === 'super_admin'
                  ? 'bg-blue-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Super Admin
            </button>
          </div>

          {/* Tenant Slug Input */}
          {view === 'owner' && (
            <div className="flex items-center gap-1.5 text-xs bg-slate-800/60 border border-slate-700/80 px-2.5 py-1 rounded-xl">
              <span className="text-[var(--text-muted)]">Tenant:</span>
              <input
                type="text"
                value={tenantInput}
                onChange={(e) => handleTenantChange(e.target.value)}
                className="bg-transparent text-slate-200 font-mono w-24 focus:outline-none text-xs"
                placeholder="tenant_slug"
              />
            </div>
          )}

          {/* Theme Selector */}
          <ThemeToggle />

          {/* i18n Language Selector */}
          <select
            value={currentLocale}
            onChange={(e) => handleLocaleChange(e.target.value as Locale)}
            className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
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
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 animate-fade-in">
        {view === 'owner' ? <OwnerDashboard /> : <SuperAdminDashboard />}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-color)] py-4 text-center text-xs text-[var(--text-muted)]">
        Fleet Management SaaS Platform · Schema-per-tenant (`ros-apartment`) · Razorpay · 6 Locales
      </footer>
    </div>
  );
};

const App: React.FC = () => (
  <ThemeProvider>
    <AppContent />
  </ThemeProvider>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
