import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { SuperAdminDashboard } from './features/super-admin/SuperAdminDashboard';
import { TechnicalArchitecture } from './features/super-admin/TechnicalArchitecture';
import { OwnerDashboard } from './features/owner-admin/OwnerDashboard';
import { ThemeProvider } from './lib/theme';
import { FontSizeProvider } from './lib/fontSize';
import { ProfileMenu } from './components/ui/ProfileMenu';
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
  const isTechnicalRoute = currentPath === '/technical' || currentPath === '/tecnical';
  const isSuperAdminRoute = currentPath.toLowerCase().replace(/\/$/, '') === '/superadmin';

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
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20 text-xs sm:text-sm tracking-wider">
                  FM
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-500 border-2 border-[var(--bg-secondary)] rounded-full animate-pulse" title="System Active" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h1 className="font-bold text-sm sm:text-base text-[var(--text-main)] leading-tight tracking-tight truncate">{t('app_title')}</h1>
                  {isDemoRoute ? (
                    <Badge variant="info" className="text-[10px] px-1.5 py-0 shrink-0">
                      <Zap className="w-2.5 h-2.5 inline mr-0.5" />
                      /demo
                    </Badge>
                  ) : isTechnicalRoute ? (
                    <Badge variant="info" className="text-[10px] px-1.5 py-0 shrink-0">
                      <Code2 className="w-2.5 h-2.5 inline mr-0.5" />
                      /technical
                    </Badge>
                  ) : (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
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
          <nav className="flex items-center gap-1 bg-[var(--input-bg)] p-1 rounded-xl border border-[var(--border-color)] text-xs font-medium w-full md:w-auto overflow-x-auto no-scrollbar whitespace-nowrap justify-start md:justify-center">
            <button
              type="button"
              onClick={() => {
                if (isTechnicalRoute) navigate('/');
                setActiveTab('overview');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 rounded-lg transition-all cursor-pointer shrink-0 ${
                activeTab === 'overview' && !isTechnicalRoute
                  ? 'bg-[var(--primary-accent)] text-white shadow-sm font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-secondary)]/50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
              <span>{t('nav_overview')}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (isTechnicalRoute) navigate('/');
                setActiveTab('fleet');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 rounded-lg transition-all cursor-pointer shrink-0 ${
                activeTab === 'fleet' && !isTechnicalRoute
                  ? 'bg-[var(--primary-accent)] text-white shadow-sm font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-secondary)]/50'
              }`}
            >
              <Truck className="w-3.5 h-3.5 shrink-0" />
              <span>{t('nav_fleet')}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (isTechnicalRoute) navigate('/');
                setActiveTab('telemetry');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 rounded-lg transition-all cursor-pointer shrink-0 ${
                activeTab === 'telemetry' && !isTechnicalRoute
                  ? 'bg-[var(--primary-accent)] text-white shadow-sm font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-secondary)]/50'
              }`}
            >
              <Activity className="w-3.5 h-3.5 shrink-0" />
              <span>{t('nav_telemetry')}</span>
            </button>

            {/* Super Admin Technical Architecture Tab */}
            {role === 'super_admin' && (
              <button
                type="button"
                onClick={() => navigate('/technical')}
                className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 rounded-lg transition-all cursor-pointer shrink-0 ${
                  isTechnicalRoute
                    ? 'bg-[var(--primary-accent)] text-white shadow-sm font-semibold'
                    : 'text-blue-400 hover:text-blue-300 hover:bg-[var(--bg-secondary)]/50'
                }`}
              >
                <Code2 className="w-3.5 h-3.5 shrink-0" />
                <span>{t('nav_technical')}</span>
              </button>
            )}
          </nav>

          {/* User Profile & Settings Menu (Desktop View) */}
          <div className="hidden md:flex items-center justify-end gap-2 shrink-0">
            <ProfileMenu />
          </div>

        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 animate-fade-in">
        {isTechnicalRoute ? (
          <TechnicalArchitecture />
        ) : role === 'owner' ? (
          <OwnerDashboard activeTab={activeTab} />
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
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-md">
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
                onClick={() => navigate('/technical')}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-all font-mono text-[11px]"
              >
                <Code2 className="w-3 h-3" />
                <span>Technical Architecture & Versions (/technical)</span>
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
    <ThemeProvider>
      <FontSizeProvider>
        <DashboardContent />
      </FontSizeProvider>
    </ThemeProvider>
  </AuthProvider>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
