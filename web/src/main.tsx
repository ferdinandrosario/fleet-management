import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { SuperAdminDashboard } from './features/super-admin/SuperAdminDashboard';
import { SystemHealth } from './features/super-admin/SystemHealth';

import { OwnerDashboard } from './features/owner-admin/OwnerDashboard';

import { FontSizeProvider } from './lib/fontSize';
import { ProfileMenu } from './components/ui/ProfileMenu';
import { Card } from './components/ui/Card';
import { Button } from './components/ui/Button';
import { t } from './lib/i18n';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { AuthGate } from './features/auth/AuthGate';
import { Badge } from './components/ui/Badge';
import {
  Zap,
  LayoutDashboard,
  Truck,
  Activity,
  ShieldCheck,
  Code2,
  Lock,
  AlertCircle,
} from 'lucide-react';

const DashboardContent: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);
  const [activeTab, setActiveTab] = useState<'overview' | 'fleet' | 'telemetry'>('overview');

  React.useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  const isDemoRoute = currentPath === '/demo';
  const isSuperAdminRoute = currentPath === '/superadmin' || currentPath === '/health';
  const isHealthRoute = currentPath === '/health' && role === 'super_admin';
  const isHealthUnauthorized = currentPath === '/health' && role !== 'super_admin';
  const isUnknownRoute =
    currentPath !== '/' &&
    currentPath !== '/demo' &&
    currentPath !== '/superadmin' &&
    currentPath !== '/health';

  if (!isAuthenticated) {
    return <AuthGate isDemoRoute={isDemoRoute} isSuperAdminRoute={isSuperAdminRoute} />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] flex flex-col transition-colors duration-250">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/85 backdrop-blur-md transition-colors duration-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex flex-col md:flex-row items-center justify-between gap-2.5 md:gap-4">
          
          {/* Top Row on Mobile: Brand on Left, Profile Menu on Right */}
          <div className="flex items-center justify-between w-full md:w-auto gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="relative shrink-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/25 text-xs sm:text-sm tracking-wider">
                  FM
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-400 border-2 border-[var(--bg-secondary)] rounded-full animate-pulse" title="System Active" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h1 className="font-bold text-sm sm:text-base text-[var(--text-main)] leading-tight tracking-tight truncate">{t('app_title')}</h1>
                  {isDemoRoute ? (
                    <Badge variant="info" className="text-[10px] px-1.5 py-0 shrink-0">
                      <Zap className="w-2.5 h-2.5 inline mr-0.5" />
                      /demo
                    </Badge>
                  ) : isHealthRoute ? (
                    <Badge variant="info" className="text-[10px] px-1.5 py-0 shrink-0">
                      <Code2 className="w-2.5 h-2.5 inline mr-0.5" />
                      /health
                    </Badge>
                  ) : (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-500/12 text-indigo-300 border border-indigo-500/25 shrink-0">
                      LIVE
                    </span>
                  )}
                </div>
                <p className="text-[10px] sm:text-[11px] text-[var(--text-muted)] font-medium truncate">Commercial Fleet SaaS · India</p>
              </div>
            </div>

            {/* Profile menu on mobile (shown on right) */}
            <div className="flex items-center md:hidden shrink-0">
              <ProfileMenu />
            </div>
          </div>

          {/* Navigation Bar Tabs (Scrollable on mobile) */}
          <nav
            role="tablist"
            aria-label="Dashboard sections"
            className="flex items-center gap-1 bg-[var(--input-bg)] p-1 rounded-xl border border-[var(--border-color)] text-xs font-medium w-full md:w-auto overflow-x-auto no-scrollbar whitespace-nowrap justify-start md:justify-center"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'overview' && !isHealthRoute}
              onClick={() => {
                if (isHealthRoute) navigate('/superadmin');
                setActiveTab('overview');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 rounded-lg transition-all cursor-pointer shrink-0 ${
                activeTab === 'overview' && !isHealthRoute
                  ? 'bg-[var(--primary-accent)] text-white shadow-sm font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-secondary)]/50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
              <span>{t('nav_overview')}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'fleet' && !isHealthRoute}
              onClick={() => {
                if (isHealthRoute) navigate('/superadmin');
                setActiveTab('fleet');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 rounded-lg transition-all cursor-pointer shrink-0 ${
                activeTab === 'fleet' && !isHealthRoute
                  ? 'bg-[var(--primary-accent)] text-white shadow-sm font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-secondary)]/50'
              }`}
            >
              <Truck className="w-3.5 h-3.5 shrink-0" />
              <span>{t('nav_fleet')}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'telemetry' && !isHealthRoute}
              onClick={() => {
                if (isHealthRoute) navigate('/superadmin');
                setActiveTab('telemetry');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 rounded-lg transition-all cursor-pointer shrink-0 ${
                activeTab === 'telemetry' && !isHealthRoute
                  ? 'bg-[var(--primary-accent)] text-white shadow-sm font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-secondary)]/50'
              }`}
            >
              <Activity className="w-3.5 h-3.5 shrink-0" />
              <span>{t('nav_telemetry')}</span>
            </button>
          </nav>

          {/* User Profile & Settings Menu (Desktop View) */}
          <div className="hidden md:flex items-center justify-end gap-2 shrink-0">
            <ProfileMenu />
          </div>

        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 animate-fade-in">
        {isUnknownRoute ? (
          <div className="max-w-md mx-auto my-12">
            <Card className="border-rose-500/30 text-center space-y-4 py-10 px-6" style={{ background: 'rgba(244,63,94,0.05)' }}>
              <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-rose-400" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-xl font-bold text-[var(--text-main)]">404 Page Not Found</h2>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  The page <code className="font-mono text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">{currentPath}</code> does not exist.
                </p>
              </div>
              <div className="pt-2">
                <Button onClick={() => navigate('/')} variant="secondary" className="text-xs">
                  Return to Dashboard
                </Button>
              </div>
            </Card>
          </div>
        ) : isHealthUnauthorized ? (
          <div className="max-w-md mx-auto my-12">
            <Card className="border-rose-500/30 text-center space-y-4 py-10 px-6" style={{ background: 'rgba(244,63,94,0.05)' }}>
              <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-rose-400" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-xl font-bold text-[var(--text-main)]">403 Authorization Required</h2>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  System health details at <code className="font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">/health</code> are strictly restricted to Super Administrators.
                </p>
              </div>
              <div className="pt-2">
                <Button onClick={() => navigate('/')} variant="secondary" className="text-xs">
                  Return to Dashboard
                </Button>
              </div>
            </Card>
          </div>
        ) : role === 'owner' ? (
          <OwnerDashboard activeTab={activeTab} />
        ) : isHealthRoute ? (
          <SystemHealth />
        ) : (
          <SuperAdminDashboard activeTab={activeTab} />
        )}
      </main>

      {/* Modern Redesigned Footer */}
      <footer className="border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/70 backdrop-blur-md mt-12 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-[var(--border-color)]">
            {/* Brand & Security */}
            <div className="space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white text-xs shadow-md">
                  FM
                </div>
                <span className="font-bold text-sm text-[var(--text-main)]">{t('app_title')}</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-md">
                {t('platform_footer_desc')}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Enterprise Multi-Tenant Isolation · SSL Encrypted</span>
            </div>
          </div>

          {/* Sub-footer copyright & Role-Restricted Technical Link */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
            <p>© 2026 Fleet Management Platform · All rights reserved.</p>
            
            {role === 'super_admin' ? (
              <button
                onClick={() => navigate('/health')}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all font-mono text-[11px] cursor-pointer"
              >
                <Code2 className="w-3 h-3" />
                <span>System Health & Technical Architecture (/health)</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>Enterprise Encrypted & Isolated</span>
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <FontSizeProvider>
      <DashboardContent />
    </FontSizeProvider>
  </AuthProvider>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
