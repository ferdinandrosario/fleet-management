import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  ShieldAlert,
  Server,
  Code2,
  Smartphone,
  Database,
  Layers,
  Cpu,
  Globe,
  Lock,
  ArrowLeft,
  Terminal,
} from 'lucide-react';
import { apiRequest } from '../../lib/api';

export interface SystemInfo {
  postgresql_version: string;
  postgis_version?: string | null;
  ruby_version: string;
  rails_version: string;
  os_version: string;
}

export const TechnicalArchitecture: React.FC = () => {
  const { role } = useAuth();
  const [systemInfo, setSystemInfo] = React.useState<SystemInfo | null>(null);
  const [fetchError, setFetchError] = React.useState<string | null>(null);

  React.useEffect(() => {
    apiRequest('/api/v1/health')
      .then((res) => {
        if (res.status === 'success' && res.data?.system_info) {
          setSystemInfo(res.data.system_info);
        } else if (res.error?.message) {
          setFetchError(res.error.message);
        }
      })
      .catch((err) => {
        setFetchError(err instanceof Error ? err.message : String(err));
      });
  }, []);

  const handleBackToDashboard = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // Guard: Strict Role Authorization (Only Super Admin)
  if (role !== 'super_admin') {
    return (
      <div className="max-w-3xl mx-auto my-12 p-6">
      <Card className="border-rose-500/30 text-center space-y-4 py-12" style={{ background: 'rgba(244,63,94,0.05)' }}>
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-rose-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>403 Authorization Required</h2>
            <p className="text-sm max-w-md mx-auto mt-2" style={{ color: 'var(--text-muted)' }}>
              Technical specifications, architecture details, and framework versions are strictly restricted to Super Administrators.
            </p>
          </div>
          <div className="pt-2">
            <Button onClick={handleBackToDashboard} variant="secondary" className="inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Dashboard</span>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <Button onClick={handleBackToDashboard} variant="secondary" className="p-2 h-auto text-xs">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[var(--text-main)]">Technical Architecture & Stack Specifications</h1>
              <Badge variant="info">Super Admin Portal Only</Badge>
            </div>
          </div>
          <p className="text-sm text-[var(--text-muted)] mt-2">
            Confidential infrastructure telemetry, schema isolation details, and framework version manifest for Fleet Management.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success">
            <Lock className="w-3 h-3 inline mr-1" />
            Restricted Confidential Access
          </Badge>
        </div>
      </div>

      {fetchError && (
        <Card className="border-rose-500/30 bg-rose-950/20 text-rose-300 space-y-2 p-4">
          <div className="flex items-center gap-2 font-bold text-sm text-rose-400">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>Telemetry Detection Error</span>
          </div>
          <p className="text-xs font-mono">{fetchError}</p>
        </Card>
      )}

      {/* Core Tech Stack Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Backend API */}
        <Card className="space-y-3 relative overflow-hidden border-red-500/20 bg-gradient-to-br from-red-950/20 to-transparent">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <Server className="w-5 h-5 text-red-400" />
            </div>
            <Badge variant="info">API Gateway</Badge>
          </div>
          <div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>
              {systemInfo ? `Rails ${systemInfo.rails_version} API` : 'Rails API'}
            </h3>
            <p className="font-mono mt-0.5" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              {systemInfo ? `Ruby ${systemInfo.ruby_version} runtime` : 'Ruby runtime'}
            </p>
          </div>
          <div className="space-y-1.5 pt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <div className="flex items-center justify-between pt-1.5" style={{ borderTop: '1px solid var(--border-color)' }}>
              <span>Queue Worker</span>
              <span className="font-mono text-emerald-400">Solid Queue</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Caching Engine</span>
              <span className="font-mono text-emerald-400">Solid Cache</span>
            </div>
            <div className="flex items-center justify-between">
              <span>WebSockets</span>
              <span className="font-mono text-emerald-400">Solid Cable</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Asset Pipeline</span>
              <span className="font-mono text-emerald-400">Propshaft</span>
            </div>
          </div>
        </Card>

        {/* Web Admin SPA */}
        <Card className="space-y-3 relative overflow-hidden border-cyan-500/20 bg-gradient-to-br from-cyan-950/20 to-transparent">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Code2 className="w-5 h-5 text-cyan-400" />
            </div>
            <Badge variant="success">Web Admin SPA</Badge>
          </div>
          <div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>React {React.version}</h3>
            <p className="font-mono mt-0.5" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>TypeScript &amp; Vite Bundler</p>
          </div>
          <div className="space-y-1.5 pt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <div className="flex items-center justify-between pt-1.5" style={{ borderTop: '1px solid var(--border-color)' }}>
              <span>UI Components</span>
              <span className="font-mono text-cyan-400">shadcn/ui + Tremor</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Styling Engine</span>
              <span className="font-mono text-cyan-400">Vanilla CSS + Tailwind v3</span>
            </div>
            <div className="flex items-center justify-between">
              <span>State &amp; Auth</span>
              <span className="font-mono text-cyan-400">Context API + JWT</span>
            </div>
          </div>
        </Card>

        {/* Mobile App */}
        <Card className="space-y-3 relative overflow-hidden border-indigo-500/20 bg-gradient-to-br from-indigo-950/20 to-transparent">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-indigo-400" />
            </div>
            <Badge variant="info">Cross-Platform</Badge>
          </div>
          <div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>React Native Mobile</h3>
            <p className="font-mono mt-0.5" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Expo Framework</p>
          </div>
          <div className="space-y-1.5 pt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <div className="flex items-center justify-between pt-1.5" style={{ borderTop: '1px solid var(--border-color)' }}>
              <span>Language</span>
              <span className="font-mono text-indigo-400">TypeScript</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Styling</span>
              <span className="font-mono text-indigo-400">NativeWind v4</span>
            </div>
            <div className="flex items-center justify-between">
              <span>UI Kit</span>
              <span className="font-mono text-indigo-400">react-native-reusables</span>
            </div>
            <div className="flex items-center justify-between">
              <span>React Core</span>
              <span className="font-mono text-indigo-400">React {React.version}</span>
            </div>
          </div>
        </Card>

        {/* Database & Multi-Tenancy */}
        <Card className="space-y-3 relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 to-transparent">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <Badge variant="success">
              {systemInfo ? `PostgreSQL ${systemInfo.postgresql_version}` : 'PostgreSQL Engine'}
            </Badge>
          </div>
          <div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>
              {systemInfo?.postgis_version ? `PostGIS ${systemInfo.postgis_version} Spatial` : 'PostGIS Spatial Engine'}
            </h3>
            <p className="font-mono mt-0.5" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>ros-apartment isolation</p>
          </div>
          <div className="space-y-1.5 pt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <div className="flex items-center justify-between pt-1.5" style={{ borderTop: '1px solid var(--border-color)' }}>
              <span>Multi-Tenancy</span>
              <span className="font-mono text-emerald-400">Schema-per-tenant</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Payments</span>
              <span className="font-mono text-emerald-400">Razorpay API</span>
            </div>
            <div className="flex items-center justify-between">
              <span>GIS Engine</span>
              <span className="font-mono text-emerald-400">
                {systemInfo?.postgis_version ? `PostGIS ${systemInfo.postgis_version}` : 'PostGIS Spatial Index'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Target OS</span>
              <span className="font-mono text-emerald-400">{systemInfo ? systemInfo.os_version : 'Host OS'}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* System Topology Diagram */}
      <Card className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
              <Layers className="w-5 h-5" style={{ color: '#818cf8' }} />
              <span>Multi-Tenant Architecture &amp; Telemetry Flow</span>
            </h3>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              End-to-end request lifecycle from web/mobile clients to schema-isolated databases and async workers
            </p>
          </div>
          <Badge variant="info" className="self-start sm:self-auto">Production Topology</Badge>
        </div>

        {/* Visual Flow diagram cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-2">
          <div
            className="p-4 rounded-xl text-center space-y-2 relative"
            style={{ background: 'var(--color-surface-sunken)', border: '1px solid var(--border-color)' }}
          >
            <div className="w-8 h-8 mx-auto rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Globe className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>1. Client Layer</h4>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>React 19 Vite Web Admin + Expo React Native Mobile</p>
            <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 font-mono text-xs" style={{ color: 'var(--border-color)' }}>➔</div>
          </div>

          <div
            className="p-4 rounded-xl text-center space-y-2 relative"
            style={{ background: 'var(--color-surface-sunken)', border: '1px solid var(--border-color)' }}
          >
            <div className="w-8 h-8 mx-auto rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Server className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>2. Rails API</h4>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              {systemInfo ? `Rails ${systemInfo.rails_version} API (Ruby ${systemInfo.ruby_version})` : 'Rack Middleware + Tenant Middleware'}
            </p>
            <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 font-mono text-xs" style={{ color: 'var(--border-color)' }}>➔</div>
          </div>

          <div
            className="p-4 rounded-xl text-center space-y-2 relative"
            style={{ background: 'var(--color-surface-sunken)', border: '1px solid var(--border-color)' }}
          >
            <div className="w-8 h-8 mx-auto rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Database className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>3. PostgreSQL + PostGIS</h4>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              {systemInfo ? `PostgreSQL ${systemInfo.postgresql_version} ${systemInfo.postgis_version ? `+ PostGIS ${systemInfo.postgis_version}` : ''}` : 'Isolated Schemas (`ros-apartment`)'}
            </p>
            <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 font-mono text-xs" style={{ color: 'var(--border-color)' }}>➔</div>
          </div>

          <div
            className="p-4 rounded-xl text-center space-y-2"
            style={{ background: 'var(--color-surface-sunken)', border: '1px solid var(--border-color)' }}
          >
            <div className="w-8 h-8 mx-auto rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Cpu className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>4. Background Workers</h4>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Solid Queue Async Tasks + Razorpay Webhook Handlers</p>
          </div>
        </div>
      </Card>

      {/* Detailed Technical Specifications Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Backend & DB Specifications */}
        <Card className="space-y-4">
          <h3 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
            <Terminal className="w-4 h-4 text-red-400" />
            <span>Backend Stack Specifications</span>
          </h3>

          <div className="divide-y text-xs" style={{ borderColor: 'var(--border-color)' }}>
            <div className="py-2.5 flex items-center justify-between">
              <span className="font-medium" style={{ color: 'var(--text-muted)' }}>Framework &amp; Version</span>
              <span className="font-mono font-semibold" style={{ color: 'var(--text-main)' }}>
                {systemInfo ? `Rails ${systemInfo.rails_version} API (Ruby ${systemInfo.ruby_version})` : 'Rails API'}
              </span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="font-medium" style={{ color: 'var(--text-muted)' }}>Database Engine</span>
              <span className="font-mono font-semibold" style={{ color: 'var(--text-main)' }}>
                {systemInfo ? `PostgreSQL ${systemInfo.postgresql_version} ${systemInfo.postgis_version ? `+ PostGIS ${systemInfo.postgis_version}` : ''}` : 'PostgreSQL Engine'}
              </span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="font-medium" style={{ color: 'var(--text-muted)' }}>Multi-Tenant Isolation</span>
              <span className="font-mono font-semibold" style={{ color: '#a5b4fc' }}>ros-apartment (Schema Isolation)</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="font-medium" style={{ color: 'var(--text-muted)' }}>Job Processing Queue</span>
              <span className="font-mono font-semibold text-emerald-400">Solid Queue (DB Backed)</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="font-medium" style={{ color: 'var(--text-muted)' }}>Caching &amp; Real-time</span>
              <span className="font-mono font-semibold text-amber-400">Solid Cache + Solid Cable</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="font-medium" style={{ color: 'var(--text-muted)' }}>Payment Integration</span>
              <span className="font-mono font-semibold text-purple-400">Razorpay (INR Subscriptions)</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="font-medium" style={{ color: 'var(--text-muted)' }}>Test Suite Coverage</span>
              <span className="font-mono font-semibold text-emerald-400">100% Line Coverage (SimpleCov)</span>
            </div>
          </div>
        </Card>

        {/* Frontend & Mobile Specifications */}
        <Card className="space-y-4">
          <h3 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span>Frontend &amp; Mobile Specifications</span>
          </h3>

          <div className="divide-y text-xs" style={{ borderColor: 'var(--border-color)' }}>
            <div className="py-2.5 flex items-center justify-between">
              <span className="font-medium" style={{ color: 'var(--text-muted)' }}>Web Admin Framework</span>
              <span className="font-mono font-semibold" style={{ color: 'var(--text-main)' }}>React {React.version} (Vite + TypeScript)</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="font-medium" style={{ color: 'var(--text-muted)' }}>Web Styling &amp; Components</span>
              <span className="font-mono font-semibold" style={{ color: 'var(--text-main)' }}>Vanilla CSS + shadcn/ui + Tremor</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="font-medium" style={{ color: 'var(--text-muted)' }}>Mobile Native Runtime</span>
              <span className="font-mono font-semibold text-indigo-400">React Native Engine (Expo SDK)</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="font-medium" style={{ color: 'var(--text-muted)' }}>Mobile Styling</span>
              <span className="font-mono font-semibold text-indigo-400">NativeWind v4 + react-native-reusables</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="font-medium" style={{ color: 'var(--text-muted)' }}>Client Validation</span>
              <span className="font-mono font-semibold text-emerald-400">Inline Form Validation (Model Parity)</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="font-medium" style={{ color: 'var(--text-muted)' }}>Hosting Platform / OS</span>
              <span className="font-mono font-semibold" style={{ color: 'var(--text-main)' }}>
                {systemInfo ? systemInfo.os_version : 'Host OS'}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Security & Access Notice */}
      <Card className="flex items-start gap-4" style={{ background: 'var(--color-surface-sunken)', border: '1px solid var(--border-color)' }}>
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 shrink-0">
          <Lock className="w-5 h-5 text-amber-400" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>Super Admin Information Security Policy</h4>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            These technical specifications are kept hidden from general fleet owner accounts, drivers, and non-admin users to mitigate target profiling and framework fingerprinting risks. Only authenticated users with the{' '}
            <span className="font-mono font-semibold" style={{ color: '#a5b4fc' }}>super_admin</span>{' '}
            role can view this endpoint (`/tech`).
          </p>
        </div>
      </Card>
    </div>
  );
};
