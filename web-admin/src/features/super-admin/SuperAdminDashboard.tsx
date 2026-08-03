import React, { useEffect, useState } from 'react';
import { StatBox } from '../../components/ui/StatBox';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { DataTable, TableColumn } from '../../components/ui/DataTable';
import { apiRequest } from '../../lib/api';
import { t } from '../../lib/i18n';

interface SuperAdminMetrics {
  total_owners_count: number;
  active_owners_count: number;
  active_subscriptions_count: number;
  mrr_paise: number;
}

interface TenantItem {
  id: string;
  name: string;
  slug: string;
  schema: string;
  plan: string;
  status: 'active' | 'trial' | 'past_due' | 'suspended';
  mrr: string;
  vehiclesCount: number;
}

const mockTenants: TenantItem[] = [
  {
    id: 'ten_1',
    name: 'Kaveri Agri & Transport Fleet',
    slug: 'kaveri_agri',
    schema: 'tenant_kaveri_agri',
    plan: 'Enterprise (Annual)',
    status: 'active',
    mrr: '₹14,999/mo',
    vehiclesCount: 18,
  },
  {
    id: 'ten_2',
    name: 'Kongu Heavy Earthmovers',
    slug: 'kongu_jcb',
    schema: 'tenant_kongu_jcb',
    plan: 'Pro Fleet (Monthly)',
    status: 'active',
    mrr: '₹8,999/mo',
    vehiclesCount: 12,
  },
  {
    id: 'ten_3',
    name: 'Vazhai City Transit Buses',
    slug: 'vazhai_buses',
    schema: 'tenant_vazhai_buses',
    plan: 'Starter Plan',
    status: 'trial',
    mrr: '₹3,499/mo',
    vehiclesCount: 5,
  },
  {
    id: 'ten_4',
    name: 'Deccan Commercial Carriers',
    slug: 'deccan_fleet',
    schema: 'tenant_deccan_fleet',
    plan: 'Pro Fleet (Monthly)',
    status: 'past_due',
    mrr: '₹8,999/mo',
    vehiclesCount: 9,
  },
];

export const SuperAdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SuperAdminMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMetrics() {
      setLoading(true);
      const res = await apiRequest('/api/v1/super_admin/dashboard');
      if (res.status === 'success' && res.data?.dashboard) {
        setMetrics(res.data.dashboard);
      } else {
        setError(res.error?.message || 'Failed to fetch platform metrics');
      }
      setLoading(false);
    }

    loadMetrics();
  }, []);

  const tenantColumns: TableColumn<TenantItem>[] = [
    {
      header: 'Tenant Name',
      accessor: (row) => (
        <div>
          <p className="font-semibold text-slate-100">{row.name}</p>
          <p className="text-[11px] text-slate-400 font-mono">slug: {row.slug}</p>
        </div>
      ),
    },
    {
      header: 'Schema Isolation',
      accessor: (row) => (
        <span className="font-mono text-[11px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
          {row.schema}
        </span>
      ),
    },
    { header: 'Subscription Plan', accessor: 'plan' },
    {
      header: 'Fleet Size',
      accessor: (row) => <span className="font-medium text-slate-200">{row.vehiclesCount} Vehicles</span>,
    },
    { header: 'MRR', accessor: 'mrr' },
    {
      header: 'Status',
      accessor: (row) => {
        switch (row.status) {
          case 'active':
            return <Badge variant="success">● Active Tenant</Badge>;
          case 'trial':
            return <Badge variant="info">⏳ Trial Period</Badge>;
          case 'past_due':
            return <Badge variant="danger">⚠️ Payment Overdue</Badge>;
          case 'suspended':
            return <Badge variant="neutral">⛔ Suspended</Badge>;
        }
      },
    },
  ];

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
        <p className="text-sm font-medium">Loading Super Admin Platform Dashboard...</p>
      </div>
    );
  }

  const formattedMrr = metrics
    ? `₹${(metrics.mrr_paise / 100).toLocaleString('en-IN')}`
    : '₹36,496';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-100">{t('super_admin_dashboard')}</h1>
            <Badge variant="info">Multi-Tenant Platform</Badge>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Global tenant provisioning, subscription billing, and infrastructure telemetry
          </p>
        </div>
        <Badge variant="success">ros-apartment active</Badge>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-xl text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox
          title={t('mrr')}
          value={formattedMrr}
          trend="+18.5% MRR growth"
        />
        <StatBox
          title={t('total_owners')}
          value={metrics?.total_owners_count || 4}
          subtitle={`${metrics?.active_owners_count || 4} active tenant schemas`}
        />
        <StatBox
          title={t('active_subscriptions')}
          value={metrics?.active_subscriptions_count || 4}
          subtitle="Razorpay recurring subscriptions"
        />
        <StatBox
          title="Platform Uptime"
          value="99.99%"
          subtitle="PostgreSQL + PostGIS isolation"
        />
      </div>

      {/* Infrastructure Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">Database Engine</span>
            <Badge variant="success">Healthy</Badge>
          </div>
          <p className="text-sm font-semibold text-slate-200">PostgreSQL 17 + PostGIS 3.5</p>
          <p className="text-xs text-slate-400">ros-apartment schema isolation operational</p>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">Background Processing</span>
            <Badge variant="success">Solid Queue</Badge>
          </div>
          <p className="text-sm font-semibold text-slate-200">Rails 8.1.3 Async Workers</p>
          <p className="text-xs text-slate-400">SMS / WhatsApp telemetry notifications queued</p>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">Razorpay Gateway</span>
            <Badge variant="success">Connected</Badge>
          </div>
          <p className="text-sm font-semibold text-slate-200">Payment Webhooks v2</p>
          <p className="text-xs text-slate-400">INR transactions & recurring billing sync</p>
        </Card>
      </div>

      {/* Multitenant Fleet Owners Overview */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-100">Registered Tenant Fleet Owners</h3>
            <p className="text-xs text-slate-400">
              Isolated PostgreSQL schemas (`ros-apartment`) preventing cross-tenant data leakage
            </p>
          </div>
          <Badge variant="info">Razorpay Billing Enabled</Badge>
        </div>
        <DataTable
          columns={tenantColumns}
          data={mockTenants}
          searchPlaceholder="Search tenants by name or slug..."
          searchKey="name"
        />
      </Card>
    </div>
  );
};
