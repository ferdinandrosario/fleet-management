import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { SuperAdminDashboard } from './features/super-admin/SuperAdminDashboard';
import { OwnerDashboard } from './features/owner-admin/OwnerDashboard';
import { ThemeProvider } from './lib/theme';
import { ThemeToggle } from './components/ui/ThemeToggle';
import { setLocale, Locale, t } from './lib/i18n';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { AuthGate } from './features/auth/AuthGate';
import { Badge } from './components/ui/Badge';
import { Button } from './components/ui/Button';

const DashboardContent: React.FC = () => {
  const { isAuthenticated, user, role, tenantSlug, setTenant, logout } = useAuth();
  const [currentLocale, setCurrentLocaleState] = useState<Locale>('en');

  const handleLocaleChange = (loc: Locale) => {
    setCurrentLocaleState(loc);
    setLocale(loc);
  };

  if (!isAuthenticated) {
    return <AuthGate />;
  }

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

        {/* User Info, Tenant & Controls */}
        <div className="flex items-center flex-wrap gap-3">
          {/* Authenticated User Badge */}
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-xl border border-slate-700/80 text-xs">
            <Badge variant={role === 'super_admin' ? 'info' : 'success'}>
              {role === 'super_admin' ? t('role_super_admin') : t('role_fleet_owner')}
            </Badge>
            <span className="text-slate-300 font-medium">{user?.phone || user?.email || user?.name}</span>
          </div>

          {/* Tenant Slug Input for Fleet Owner */}
          {role === 'owner' && (
            <div className="flex items-center gap-1.5 text-xs bg-slate-800/60 border border-slate-700/80 px-2.5 py-1 rounded-xl">
              <span className="text-[var(--text-muted)]">Tenant:</span>
              <input
                type="text"
                value={tenantSlug}
                onChange={(e) => setTenant(e.target.value)}
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

          {/* Logout Button */}
          <Button onClick={logout} variant="secondary" className="text-xs px-3 py-1.5">
            🚪 {t('logout')}
          </Button>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 animate-fade-in">
        {role === 'owner' ? <OwnerDashboard /> : <SuperAdminDashboard />}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-color)] py-4 text-center text-xs text-[var(--text-muted)]">
        Fleet Management SaaS Platform · Schema-per-tenant (`ros-apartment`) · Razorpay · 6 Locales
      </footer>
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <ThemeProvider>
      <DashboardContent />
    </ThemeProvider>
  </AuthProvider>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
