import React, { useEffect, useState } from 'react';
import { StatBox } from '../../components/ui/StatBox';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { FleetRevenueChart } from '../../components/ui/FleetRevenueChart';
import { DataTable, TableColumn } from '../../components/ui/DataTable';
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

interface VehicleItem {
  id: string;
  name: string;
  category: string;
  registration: string;
  status: 'active' | 'in_service' | 'on_trip' | 'inactive';
  rate: string;
  driver: string;
}

const mockFleetVehicles: VehicleItem[] = [
  {
    id: 'veh_1',
    name: 'Mahindra 575 DI Tractor',
    category: 'Tractor / Agri',
    registration: 'TN-37-AX-4821',
    status: 'on_trip',
    rate: '₹800/hr',
    driver: 'Ramesh Kumar',
  },
  {
    id: 'veh_2',
    name: 'JCB 3DX Super Excavator',
    category: 'Heavy Earthmover',
    registration: 'TN-37-BX-9012',
    status: 'active',
    rate: '₹1,600/hr',
    driver: 'Suresh Babu',
  },
  {
    id: 'veh_3',
    name: 'Escorts Hydra Crane 15T',
    category: 'Crane / Lifting',
    registration: 'TN-37-CY-3344',
    status: 'in_service',
    rate: '₹2,200/hr',
    driver: 'Karthik Raja',
  },
  {
    id: 'veh_4',
    name: 'Ashok Leyland Viking Bus 40s',
    category: 'Passenger Bus',
    registration: 'TN-37-DZ-7788',
    status: 'active',
    rate: '₹4,500/day',
    driver: 'Murugan P',
  },
];

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

  const getStatusBadge = (status: VehicleItem['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">● Ready</Badge>;
      case 'on_trip':
        return <Badge variant="info">⚡ On Assignment</Badge>;
      case 'in_service':
        return <Badge variant="warning">🔧 Servicing</Badge>;
      case 'inactive':
        return <Badge variant="danger">⛔ Inactive</Badge>;
    }
  };

  const vehicleColumns: TableColumn<VehicleItem>[] = [
    {
      header: 'Vehicle Name',
      accessor: (row) => (
        <div>
          <p className="font-semibold text-slate-100">{row.name}</p>
          <p className="text-[11px] text-slate-400">{row.category}</p>
        </div>
      ),
    },
    { header: 'Registration', accessor: 'registration' },
    {
      header: 'Assigned Driver',
      accessor: (row) => <span className="text-slate-300 font-medium">{row.driver}</span>,
    },
    { header: 'Booking Rate', accessor: 'rate' },
    { header: 'Status', accessor: (row) => getStatusBadge(row.status) },
  ];

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
        <p className="text-sm font-medium">Loading Commercial Fleet Analytics...</p>
      </div>
    );
  }

  const formattedRevenue = metrics
    ? `₹${(metrics.total_revenue_cents / 100).toLocaleString('en-IN')}`
    : '₹0';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-100">{t('owner_dashboard')}</h1>
            <Badge variant="success">Live Operations</Badge>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time commercial vehicle fleet utilization, driver assignments, and revenue reports
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleExportCsv} variant="primary">
            📥 {t('export_csv')}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-xl text-sm flex items-center justify-between">
          <span>⚠️ {error}</span>
          <span className="text-xs text-rose-400/80">Check tenant API connection</span>
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox
          title={t('total_revenue')}
          value={formattedRevenue}
          trend="+12.4% vs last week"
        />
        <StatBox
          title={t('completed_jobs')}
          value={metrics?.completed_jobs_count || 0}
          subtitle="Finished booking jobs"
        />
        <StatBox
          title={t('utilization_rate')}
          value={`${metrics?.vehicle_utilization_pct || 0}%`}
          subtitle={`${metrics?.active_vehicles_count || 0} of ${metrics?.total_vehicles_count || 0} active`}
        />
        <StatBox
          title={t('average_rating')}
          value={`${metrics?.average_vehicle_rating || 5.0} ★`}
          subtitle="Customer satisfaction score"
        />
      </div>

      {/* Charts & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <FleetRevenueChart />
        </Card>

        <Card className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-200">Driver Payroll & Settlements</h3>
          <p className="text-xs text-slate-400">
            Automated 40% driver share split, hours tracked, and weekly payout statuses.
          </p>
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div>
                <p className="text-xs font-semibold text-slate-200">Ramesh Kumar</p>
                <p className="text-[11px] text-slate-400">Tractor Driver · 38 hrs</p>
              </div>
              <Badge variant="success">Paid ₹15,200</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div>
                <p className="text-xs font-semibold text-slate-200">Suresh Babu</p>
                <p className="text-[11px] text-slate-400">JCB Operator · 42 hrs</p>
              </div>
              <Badge variant="warning">Pending ₹20,160</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div>
                <p className="text-xs font-semibold text-slate-200">Karthik Raja</p>
                <p className="text-[11px] text-slate-400">Crane Operator · 20 hrs</p>
              </div>
              <Badge variant="info">Processing</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Fleet Inventory Table */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-100">Fleet Equipment Inventory</h3>
            <p className="text-xs text-slate-400">
              Live status across tractors, JCB excavators, cranes, harvesters, and commercial buses
            </p>
          </div>
          <Badge variant="neutral">{metrics?.total_vehicles_count || 4} Total Vehicles</Badge>
        </div>
        <DataTable
          columns={vehicleColumns}
          data={mockFleetVehicles}
          searchPlaceholder="Search vehicles or drivers..."
          searchKey="name"
        />
      </Card>
    </div>
  );
};
