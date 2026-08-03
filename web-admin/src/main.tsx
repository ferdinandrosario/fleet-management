import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { SuperAdminDashboard } from './features/super-admin/SuperAdminDashboard';
import { TechnicalArchitecture } from './features/super-admin/TechnicalArchitecture';
import { OwnerDashboard } from './features/owner-admin/OwnerDashboard';
import { ThemeProvider } from './lib/theme';
import { ThemeToggle } from './components/ui/ThemeToggle';
import { setLocale, Locale, t } from './lib/i18n';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { AuthGate } from './features/auth/AuthGate';
import { Badge } from './components/ui/Badge';
import { Button } from './components/ui/Button';
import {
  LogOut,
  Zap,
  LayoutDashboard,
  Truck,
  Activity,
  Globe,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Code2,
  Lock,
} from 'lucide-react';

const DashboardContent: React.FC = () => {
  const { isAuthenticated, user, role, tenantSlug, setTenant, logout } = useAuth();
  const [currentLocale, setCurrentLocaleState] = useState<Locale>('en');
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

  const handleLocaleChange = (loc: Locale) => {
    setCurrentLocaleState(loc);
    setLocale(loc);
  };

  const isDemoRoute = currentPath === '/demo';
  const isTechnicalRoute = currentPath === '/technical' || currentPath === '/tecnical';

  if (!isAuthenticated) {
    return <AuthGate isDemoRoute={isDemoRoute} />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] flex flex-col transition-colors duration-250">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/85 backdrop-blur-md transition-colors duration-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Brand & Active Scope */}
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20 text-sm tracking-wider">
                  FM
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[var(--bg-secondary)] rounded-full animate-pulse" title="System Active" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-base text-[var(--text-main)] leading-tight tracking-tight">{t('app_title')}</h1>
                  {isDemoRoute ? (
                    <Badge variant="info">
                      <Zap className="w-3 h-3 inline mr-1" />
                      /demo
                    </Badge>
                  ) : isTechnicalRoute ? (
                    <Badge variant="info">
                      <Code2 className="w-3 h-3 inline mr-1" />
                      /technical
                    </Badge>
                  ) : (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      LIVE
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[var(--text-muted)] font-medium">Commercial Fleet SaaS · India</p>
              </div>
            </div>

            {/* Quick Mobile Logout */}
            <div className="md:hidden">
              <Button onClick={logout} variant="secondary" className="px-2.5 py-1 text-xs">
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Navigation Bar Tabs */}
          <nav className="flex items-center gap-1 bg-[var(--input-bg)] p-1 rounded-xl border border-[var(--border-color)] text-xs font-medium w-full md:w-auto justify-center">
            <button
              type="button"
              onClick={() => {
                if (isTechnicalRoute) navigate('/');
                setActiveTab('overview');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'overview' && !isTechnicalRoute
                  ? 'bg-[var(--primary-accent)] text-white shadow-sm font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-secondary)]/50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>{t('nav_overview')}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (isTechnicalRoute) navigate('/');
                setActiveTab('fleet');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'fleet' && !isTechnicalRoute
                  ? 'bg-[var(--primary-accent)] text-white shadow-sm font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-secondary)]/50'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>{t('nav_fleet')}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (isTechnicalRoute) navigate('/');
                setActiveTab('telemetry');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'telemetry' && !isTechnicalRoute
                  ? 'bg-[var(--primary-accent)] text-white shadow-sm font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-secondary)]/50'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{t('nav_telemetry')}</span>
            </button>

            {/* Super Admin Technical Architecture Tab */}
            {role === 'super_admin' && (
              <button
                type="button"
                onClick={() => navigate('/technical')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  isTechnicalRoute
                    ? 'bg-[var(--primary-accent)] text-white shadow-sm font-semibold'
                    : 'text-blue-400 hover:text-blue-300 hover:bg-[var(--bg-secondary)]/50'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>{t('nav_technical')}</span>
              </button>
            )}
          </nav>

          {/* User Controls & Settings */}
          <div className="flex items-center flex-wrap justify-end gap-2.5 w-full md:w-auto">
            {/* Tenant Input for Owner Role */}
            {role === 'owner' && (
              <div className="flex items-center gap-1.5 text-xs bg-[var(--input-bg)] border border-[var(--border-color)] px-2.5 py-1 rounded-xl">
                <Building2 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span className="text-[var(--text-muted)] font-medium">{t('tenant_label')}</span>
                <input
                  type="text"
                  value={tenantSlug}
                  onChange={(e) => setTenant(e.target.value)}
                  className="bg-transparent text-[var(--text-main)] font-mono w-24 focus:outline-none text-xs font-semibold"
                  placeholder="tenant_slug"
                />
              </div>
            )}

            {/* i18n Language Picker */}
            <div className="relative flex items-center">
              <Globe className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-2.5 pointer-events-none" />
              <select
                value={currentLocale}
                onChange={(e) => handleLocaleChange(e.target.value as Locale)}
                className="bg-[var(--input-bg)] border border-[var(--border-color)] hover:border-[var(--primary-accent)] rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-[var(--text-main)] focus:outline-none cursor-pointer font-medium"
              >
                <option value="en">English (EN)</option>
                <option value="hi">हिंदी (HI)</option>
                <option value="ta">தமிழ் (TA)</option>
                <option value="ml">മലയാളം (ML)</option>
                <option value="te">తెలుగు (TE)</option>
                <option value="mr">मराठी (MR)</option>
              </select>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Profile Pill & Logout */}
            <div className="hidden sm:flex items-center gap-2 bg-[var(--input-bg)] px-3 py-1 rounded-xl border border-[var(--border-color)] text-xs">
              <Badge variant={role === 'super_admin' ? 'info' : 'success'}>
                {role === 'super_admin' ? t('role_super_admin') : t('role_fleet_owner')}
              </Badge>
              <span className="text-[var(--text-main)] font-medium max-w-[130px] truncate">
                {user?.phone || user?.email || user?.name}
              </span>
            </div>

            <Button onClick={logout} variant="secondary" className="hidden md:flex text-xs px-3 py-1.5 items-center gap-1.5">
              <LogOut className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span>{t('logout')}</span>
            </Button>
          </div>

        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 animate-fade-in">
        {isTechnicalRoute ? (
          <TechnicalArchitecture />
        ) : role === 'owner' ? (
          <OwnerDashboard />
        ) : (
          <SuperAdminDashboard />
        )}
      </main>

      {/* Modern Redesigned Footer */}
      <footer className="border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/70 backdrop-blur-md mt-12 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-[var(--border-color)]">
            
            {/* Column 1: Brand & Security */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-md">
                  FM
                </div>
                <span className="font-bold text-sm text-[var(--text-main)]">{t('app_title')} SaaS</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                {t('platform_footer_desc')}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Enterprise Multi-Tenant Data Isolation</span>
              </div>
            </div>

            {/* Column 2: Platform Features */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Platform Features</h4>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-[var(--input-bg)] border border-[var(--border-color)] text-[var(--text-main)] flex items-center gap-1.5">
                  <Layers className="w-3 h-3 text-blue-400" />
                  {t('schema_isolation')}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[var(--input-bg)] border border-[var(--border-color)] text-[var(--text-main)] flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-amber-400" />
                  {t('razorpay_integrated')}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[var(--input-bg)] border border-[var(--border-color)] text-[var(--text-main)] flex items-center gap-1.5">
                  <Globe className="w-3 h-3 text-emerald-400" />
                  {t('locales_supported')} (EN · HI · TA · ML · TE · MR)
                </span>
              </div>
            </div>

            {/* Column 3: Portal Switcher & Operational Status */}
            <div className="space-y-3 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Portal Navigation</h4>
                {isDemoRoute ? (
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="w-full text-left p-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border-color)] hover:border-[var(--primary-accent)] transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-main)] group-hover:text-[var(--primary-accent)]">
                      <span>{t('main_portal')} (/)</span>
                      <span className="text-[10px] text-[var(--text-muted)]">Click to switch</span>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Return to live operational environment</p>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate('/demo')}
                    className="w-full text-left p-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border-color)] hover:border-[var(--primary-accent)] transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-main)] group-hover:text-[var(--primary-accent)]">
                      <span className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span>{t('demo_portal')}</span>
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)]">Click to switch</span>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Pre-filled credentials for owner & admin</p>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] pt-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t('system_status')} · 99.99% Uptime</span>
              </div>
            </div>

          </div>

          {/* Sub-footer copyright & Role-Restricted Technical Link */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
            <p>© 2026 Fleet Management SaaS Platform · All rights reserved.</p>
            
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
      <DashboardContent />
    </ThemeProvider>
  </AuthProvider>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
