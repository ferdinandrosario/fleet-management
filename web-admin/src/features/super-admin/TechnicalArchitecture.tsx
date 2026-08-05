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
import { ApiDocsAccess } from './ApiDocsAccess';

export const TechnicalArchitecture: React.FC = () => {
  const { role } = useAuth();

  const handleBackToDashboard = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // Guard: Strict Role Authorization (Only Super Admin)
  if (role !== 'super_admin') {
    return (
      <div className="max-w-3xl mx-auto my-12 p-6">
        <Card className="border-rose-500/30 bg-rose-950/20 text-center space-y-4 py-12">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-rose-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">403 Authorization Required</h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto mt-2">
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

      {/* Core Tech Stack Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Backend API */}
        <Card className="space-y-3 relative overflow-hidden border-blue-500/20 bg-gradient-to-br from-blue-950/20 to-transparent">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <Server className="w-5 h-5 text-red-400" />
            </div>
            <Badge variant="info">API Gateway</Badge>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">Rails 8.1.3 API</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Ruby 4.0.6 runtime</p>
          </div>
          <div className="space-y-1.5 pt-2 text-xs text-slate-300">
            <div className="flex items-center justify-between border-t border-slate-800/80 pt-1.5">
              <span className="text-slate-400">Queue Worker</span>
              <span className="font-mono text-emerald-400">Solid Queue</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Caching Engine</span>
              <span className="font-mono text-emerald-400">Solid Cache</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">WebSockets</span>
              <span className="font-mono text-emerald-400">Solid Cable</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Asset Pipeline</span>
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
            <h3 className="text-lg font-bold text-slate-100">React 19.2 + TypeScript</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Vite 6.0 bundler</p>
          </div>
          <div className="space-y-1.5 pt-2 text-xs text-slate-300">
            <div className="flex items-center justify-between border-t border-slate-800/80 pt-1.5">
              <span className="text-slate-400">UI Components</span>
              <span className="font-mono text-cyan-400">shadcn/ui + Tremor</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Styling Engine</span>
              <span className="font-mono text-cyan-400">Vanilla CSS + Tailwind v3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">State & Auth</span>
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
            <h3 className="text-lg font-bold text-slate-100">React Native 0.85</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Expo SDK 56</p>
          </div>
          <div className="space-y-1.5 pt-2 text-xs text-slate-300">
            <div className="flex items-center justify-between border-t border-slate-800/80 pt-1.5">
              <span className="text-slate-400">Language</span>
              <span className="font-mono text-indigo-400">TypeScript</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Styling</span>
              <span className="font-mono text-indigo-400">NativeWind v4</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">UI Kit</span>
              <span className="font-mono text-indigo-400">react-native-reusables</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">React Core</span>
              <span className="font-mono text-indigo-400">React 19.2</span>
            </div>
          </div>
        </Card>

        {/* Database & Multi-Tenancy */}
        <Card className="space-y-3 relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 to-transparent">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <Badge variant="success">PostgreSQL 17</Badge>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">PostGIS 3.5 Spatial</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">ros-apartment isolation</p>
          </div>
          <div className="space-y-1.5 pt-2 text-xs text-slate-300">
            <div className="flex items-center justify-between border-t border-slate-800/80 pt-1.5">
              <span className="text-slate-400">Multi-Tenancy</span>
              <span className="font-mono text-emerald-400">Schema-per-tenant</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Payments</span>
              <span className="font-mono text-emerald-400">Razorpay API</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">GIS Engine</span>
              <span className="font-mono text-emerald-400">PostGIS Spatial Index</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Target OS</span>
              <span className="font-mono text-emerald-400">Ubuntu 26.04 LTS</span>
            </div>
          </div>
        </Card>
      </div>

      {/* System Topology Diagram */}
      <Card className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" />
              <span>Multi-Tenant Architecture & Telemetry Flow</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              End-to-end request lifecycle from web/mobile clients to schema-isolated databases and async workers
            </p>
          </div>
          <Badge variant="info" className="self-start sm:self-auto">Production Topology</Badge>
        </div>

        {/* Visual Flow diagram cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center space-y-2 relative">
            <div className="w-8 h-8 mx-auto rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Globe className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-200 uppercase">1. Client Layer</h4>
            <p className="text-[11px] text-slate-400">React 19 Vite Web Admin + Expo React Native Mobile</p>
            <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-600 font-mono text-xs">➔</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center space-y-2 relative">
            <div className="w-8 h-8 mx-auto rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Server className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-200 uppercase">2. Rails 8.1 API</h4>
            <p className="text-[11px] text-slate-400">Rack Middleware + JWT Authentication + Tenant Middleware</p>
            <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-600 font-mono text-xs">➔</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center space-y-2 relative">
            <div className="w-8 h-8 mx-auto rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Database className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-200 uppercase">3. PostgreSQL 17 + PostGIS</h4>
            <p className="text-[11px] text-slate-400">Isolated Schemas (`tenant_kaveri_agri`, `tenant_kongu_jcb`, etc.)</p>
            <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-600 font-mono text-xs">➔</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center space-y-2">
            <div className="w-8 h-8 mx-auto rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Cpu className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-200 uppercase">4. Background Workers</h4>
            <p className="text-[11px] text-slate-400">Solid Queue Async Tasks + Razorpay Webhook Handlers</p>
          </div>
        </div>
      </Card>

      {/* Detailed Technical Specifications Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Backend & DB Specifications */}
        <Card className="space-y-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-red-400" />
            <span>Backend Stack Specifications</span>
          </h3>

          <div className="divide-y divide-slate-800 text-xs">
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-400 font-medium">Framework & Version</span>
              <span className="font-mono font-semibold text-slate-200">Rails 8.1.3 API (Ruby 4.0.6)</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-400 font-medium">Database Engine</span>
              <span className="font-mono font-semibold text-slate-200">PostgreSQL 17.2 + PostGIS 3.5</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-400 font-medium">Multi-Tenant Isolation</span>
              <span className="font-mono font-semibold text-blue-400">ros-apartment (Schema Isolation)</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-400 font-medium">Job Processing Queue</span>
              <span className="font-mono font-semibold text-emerald-400">Solid Queue (DB Backed)</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-400 font-medium">Caching & Real-time</span>
              <span className="font-mono font-semibold text-amber-400">Solid Cache + Solid Cable</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-400 font-medium">Payment Integration</span>
              <span className="font-mono font-semibold text-purple-400">Razorpay (INR Subscriptions)</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-400 font-medium">Test Suite Coverage</span>
              <span className="font-mono font-semibold text-emerald-400">100% Line Coverage (SimpleCov)</span>
            </div>
          </div>
        </Card>

        {/* Frontend & Mobile Specifications */}
        <Card className="space-y-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span>Frontend & Mobile Specifications</span>
          </h3>

          <div className="divide-y divide-slate-800 text-xs">
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-400 font-medium">Web Admin Framework</span>
              <span className="font-mono font-semibold text-slate-200">React 19.2 (Vite 6.0, TS 5.7)</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-400 font-medium">Web Styling & Components</span>
              <span className="font-mono font-semibold text-slate-200">Vanilla CSS + shadcn/ui + Tremor</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-400 font-medium">Mobile Native Runtime</span>
              <span className="font-mono font-semibold text-indigo-400">React Native 0.85 (Expo SDK 56)</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-400 font-medium">Mobile Styling</span>
              <span className="font-mono font-semibold text-indigo-400">NativeWind v4 + react-native-reusables</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-400 font-medium">Client Validation</span>
              <span className="font-mono font-semibold text-emerald-400">Inline Form Validation (Model Parity)</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-400 font-medium">Hosting Platform / OS</span>
              <span className="font-mono font-semibold text-slate-200">Ubuntu 26.04 LTS Containerized</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Security & Access Notice */}
      <Card className="bg-slate-900/90 border-slate-800 flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 shrink-0">
          <Lock className="w-5 h-5 text-amber-400" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-slate-100">Super Admin Information Security Policy</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            These technical specifications are kept hidden from general fleet owner accounts, drivers, and non-admin users to mitigate target profiling and framework fingerprinting risks. Only authenticated users with the <span className="font-mono text-blue-400 font-semibold">super_admin</span> role can view this endpoint (`/technical` and `/tecnical`).
          </p>
        </div>
      </Card>

      {/* API Docs Access Control */}
      <ApiDocsAccess />
    </div>
  );
};
