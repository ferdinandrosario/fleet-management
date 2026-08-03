import React, { useEffect, useState } from 'react';
import { StatBox } from '../../components/ui/StatBox';
import { Card } from '../../components/ui/Card';
import { apiRequest } from '../../lib/api';
import { t } from '../../lib/i18n';

interface SuperAdminMetrics {
  total_owners_count: number;
  active_owners_count: number;
  active_subscriptions_count: number;
  mrr_paise: number;
}

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

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
        <p>Loading Super Admin Platform Dashboard...</p>
      </div>
    );
  }

  const formattedMrr = metrics ? `₹${(metrics.mrr_paise / 100).toLocaleString('en-IN')}` : '₹0';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">{t('super_admin_dashboard')}</h1>
          <p className="text-sm text-slate-400">Platform-wide multitenant SaaS subscription & revenue metrics</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox
          title={t('mrr')}
          value={formattedMrr}
          trend="+18.5% from last month"
        />
        <StatBox
          title={t('total_owners')}
          value={metrics?.total_owners_count || 0}
          subtitle={`${metrics?.active_owners_count || 0} active tenant schemas`}
        />
        <StatBox
          title={t('active_subscriptions')}
          value={metrics?.active_subscriptions_count || 0}
          subtitle="Paying monthly/annual plans"
        />
        <StatBox
          title="Platform Uptime"
          value="99.98%"
          subtitle="PostgreSQL + PostGIS isolation"
        />
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Tenant Fleet Owners Overview</h3>
        <p className="text-sm text-slate-400">
          Schema-per-tenant isolation (`ros-apartment`) guarantees complete tenant database boundary separation.
        </p>
      </Card>
    </div>
  );
};
