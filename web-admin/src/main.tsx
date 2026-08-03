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
import { LogOut, ShieldAlert, Zap } from 'lucide-react';

const DashboardContent: React.FC = () => {
  const { isAuthenticated, user, role, tenantSlug, setTenant, logout } = useAuth();
  const [currentLocale, setCurrentLocaleState] = useState<Locale>('en');
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);

  React.useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  const handleLocaleChange = (loc: Locale) => {
    setCurrentLocaleState(loc);
    setLocale(loc);
  };

  const isDemoRoute = currentPath === '/demo';

  if (!isAuthenticated) {
    return <AuthGate isDemoRoute={isDemoRoute} />;
  }

  // Access Control: Only Super Admin can access /demo
  if (isDemoRoute && role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] flex flex-col justify-center items-center px-4 py-12">
        <div className="max-w-md w-full p-6 bg-slate-900 border border-rose-500/30 rounded-2xl space-y-4 text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-100">Access Denied</h2>
          <p className="text-xs text-slate-400">
            The <code className="text-rose-400 font-mono">/demo</code> portal is restricted exclusively to authenticated Super Admin platform operators.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Button onClick={() => navigate('/')} variant="primary" className="text-xs">
              Go to Main Portal
            </Button>
            <Button onClick={logout} variant="secondary" className="text-xs">
              Logout
            </Button>
          </div>
        </div>
      </div>
    );
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
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base text-[var(--text-main)] leading-tight">{t('app_title')}</h1>
              {isDemoRoute && (
                <Badge variant="info">
                  <Zap className="w-3 h-3 inline mr-1" />
                  /demo Portal
                </Badge>
              )}
            </div>
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
          <Button onClick={logout} variant="secondary" className="text-xs px-3 py-1.5 flex items-center gap-1.5">
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('logout')}</span>
          </Button>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 animate-fade-in">
        {role === 'owner' ? <OwnerDashboard /> : <SuperAdminDashboard />}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-color)] py-4 text-center text-xs text-[var(--text-muted)] flex flex-col sm:flex-row items-center justify-between px-6 gap-2">
        <span>Fleet Management SaaS Platform · Schema-per-tenant (`ros-apartment`) · Razorpay · 6 Locales</span>
        <div>
          {isDemoRoute ? (
            <button
              onClick={() => navigate('/')}
              className="text-blue-400 hover:underline cursor-pointer"
            >
              Main Portal (/)
            </button>
          ) : (
            <button
              onClick={() => navigate('/demo')}
              className="text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Super Admin /demo Portal</span>
            </button>
          )}
        </div>
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
