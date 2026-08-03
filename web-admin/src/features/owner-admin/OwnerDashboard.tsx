import React, { useEffect, useState } from 'react';
import { StatBox } from '../../components/ui/StatBox';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { apiRequest } from '../../lib/api';
import { t } from '../../lib/i18n';

interface OwnerMetrics {
  total_revenue_cents: number;
  completed_jobs_count: number;
  total_vehicles_count: number;
  active_vehicles_count: number;
  active_drivers_count: number;
  average_vehicle_rating: number;
  vehicle_utilization_pct: number;
}

export const OwnerDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<OwnerMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOwnerMetrics() {
      setLoading(true);
      const res = await apiRequest('/api/v1/reports/dashboard');
      if (res.status === 'success' && res.data?.dashboard) {
        setMetrics(res.data.dashboard);
      } else {
        setError(res.error?.message || 'Failed to fetch owner fleet metrics');
      }
      setLoading(false);
    }

    loadOwnerMetrics();
  }, []);

  const handleExportCsv = async () => {
    const baseUrl = import.meta.env.VITE_API_URL || '';
    window.open(`${baseUrl}/api/v1/reports/bookings_csv`, '_blank');
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
        <p>Loading Fleet Owner Analytics...</p>
      </div>
    );
  }

  const formattedRevenue = metrics ? `₹${(metrics.total_revenue_cents / 100).toLocaleString('en-IN')}` : '₹0';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">{t('owner_dashboard')}</h1>
          <p className="text-sm text-slate-400">Real-time commercial vehicle fleet utilization and earnings</p>
        </div>
        <Button onClick={handleExportCsv} variant="primary">
          📥 {t('export_csv')}
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox
          title={t('total_revenue')}
          value={formattedRevenue}
          trend="+12.4% this week"
        />
        <StatBox
          title={t('completed_jobs')}
          value={metrics?.completed_jobs_count || 0}
          subtitle="Finished booking assignments"
        />
        <StatBox
          title={t('utilization_rate')}
          value={`${metrics?.vehicle_utilization_pct || 0}%`}
          subtitle={`${metrics?.active_vehicles_count || 0} / ${metrics?.total_vehicles_count || 0} available`}
        />
        <StatBox
          title={t('average_rating')}
          value={`${metrics?.average_vehicle_rating || 5.0} ★`}
          subtitle="Customer reviews score"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Active Fleet Breakdown</h3>
          <p className="text-sm text-slate-400">
            Tractors, JCB excavators, cranes, harvesters, and commercial transport buses.
          </p>
          <div className="mt-4 flex items-center justify-between text-sm py-2 border-b border-slate-800">
            <span className="text-slate-300">Registered Drivers</span>
            <span className="font-semibold text-blue-400">{metrics?.active_drivers_count || 0} Drivers</span>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Driver Payroll & Settlements</h3>
          <p className="text-sm text-slate-400">
            Automated earnings cuts (40%), completed job hours, and leave approval tracking.
          </p>
        </Card>
      </div>
    </div>
  );
};
