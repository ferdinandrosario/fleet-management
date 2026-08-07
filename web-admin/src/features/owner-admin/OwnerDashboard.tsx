import React, { useEffect, useState } from 'react';
import { Download, AlertCircle, Star, Plus } from 'lucide-react';
import { StatBox } from '../../components/ui/StatBox';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { FleetRevenueChart } from '../../components/ui/FleetRevenueChart';
import { DataTable, TableColumn } from '../../components/ui/DataTable';
import { AddVehicleModal, VehicleData } from './AddVehicleModal';
import { apiRequest } from '../../lib/api';
import { t } from '../../lib/i18n';

export interface SystemInfo {
  postgresql_version: string;
  postgis_version?: string | null;
  ruby_version: string;
  rails_version: string;
}

interface OwnerMetrics {
  total_revenue_cents: number;
  completed_jobs_count: number;
  total_vehicles_count: number;
  active_vehicles_count: number;
  active_drivers_count: number;
  average_vehicle_rating: number;
  vehicle_utilization_pct: number;
  system_info?: SystemInfo;
}

const mockFleetVehicles: VehicleData[] = [
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

const defaultOwnerMetrics: OwnerMetrics = {
  total_revenue_cents: 48500000,
  completed_jobs_count: 34,
  total_vehicles_count: 8,
  active_vehicles_count: 6,
  active_drivers_count: 5,
  vehicle_utilization_pct: 75.0,
  average_vehicle_rating: 4.8,
};

interface OwnerDashboardProps {
  activeTab?: 'overview' | 'fleet' | 'telemetry';
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ activeTab = 'overview' }) => {
  const [metrics, setMetrics] = useState<OwnerMetrics | null>(null);
  const [vehicles, setVehicles] = useState<VehicleData[]>(mockFleetVehicles);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState<{ page: number; pages: number; count: number; limit: number }>({
    page: 1,
    pages: 1,
    count: mockFleetVehicles.length,
    limit: 20,
  });
  const [isLazyLoad, setIsLazyLoad] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVehiclesPage = async (pageToFetch: number, append: boolean = false) => {
    if (append) setLoadingMore(true);
    const vehiclesRes = await apiRequest(`/api/v1/vehicles?page=${pageToFetch}&limit=20`);
    if (vehiclesRes.status === 'success' && vehiclesRes.data?.vehicles) {
      const mapped: VehicleData[] = vehiclesRes.data.vehicles.map((v: any) => ({
        id: v.uuid || v.id,
        name: v.name,
        category: v.category?.replace('_', ' ').toUpperCase() || 'EQUIPMENT',
        registration: v.registration_number,
        status: v.status === 'available' ? 'active' : v.status === 'booked' ? 'on_trip' : v.status === 'maintenance' ? 'in_service' : v.status,
        rate: `₹${(v.hourly_rate_cents / 100).toLocaleString('en-IN')}/hr`,
        driver: 'Assigned Driver',
      }));

      if (append) {
        setVehicles((prev) => [...prev, ...mapped]);
      } else {
        setVehicles(mapped);
      }

      if (vehiclesRes.data.pagination) {
        setPagination(vehiclesRes.data.pagination);
      }
      setPage(pageToFetch);
    }
    if (append) setLoadingMore(false);
  };

  useEffect(() => {
    async function loadOwnerMetrics() {
      setLoading(true);
      const res = await apiRequest('/api/v1/reports/dashboard');
      if (res.status === 'success' && res.data?.dashboard) {
        setMetrics(res.data.dashboard);
        setError(null);
      } else {
        setMetrics(defaultOwnerMetrics);
        setError(null);
      }

      await fetchVehiclesPage(1, false);
      setLoading(false);
    }

    loadOwnerMetrics();
  }, []);

  const handlePageChange = (newPage: number) => {
    fetchVehiclesPage(newPage, false);
  };

  const handleLoadMore = () => {
    if (page < pagination.pages && !loadingMore) {
      fetchVehiclesPage(page + 1, true);
    }
  };

  const handleExportCsv = async () => {
    const baseUrl = import.meta.env.VITE_API_URL || '';
    window.open(`${baseUrl}/api/v1/reports/bookings_csv`, '_blank');
  };

  const handleVehicleCreated = (newVehicle: VehicleData) => {
    setVehicles((prev) => [newVehicle, ...prev]);
    setMetrics((prev) => {
      if (!prev) return null;
      const total = prev.total_vehicles_count + 1;
      const active = prev.active_vehicles_count + 1;
      return {
        ...prev,
        total_vehicles_count: total,
        active_vehicles_count: active,
        vehicle_utilization_pct: Math.round((active / total) * 100),
      };
    });
  };

  const getStatusBadge = (status: VehicleData['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Available</Badge>;
      case 'on_trip':
        return <Badge variant="info">On Assignment</Badge>;
      case 'in_service':
        return <Badge variant="warning">In Maintenance</Badge>;
      case 'inactive':
        return <Badge variant="danger">Inactive</Badge>;
    }
  };

  const vehicleColumns: TableColumn<VehicleData>[] = [
    {
      header: 'Vehicle Name',
      accessor: (row) => (
        <div>
          <p className="font-semibold" style={{ color: 'var(--text-main)' }}>{row.name}</p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{row.category}</p>
        </div>
      ),
    },
    { header: 'Registration', accessor: 'registration' },
    {
      header: 'Assigned Driver',
      accessor: (row) => <span className="font-medium" style={{ color: 'var(--text-main)' }}>{row.driver}</span>,
    },
    { header: 'Booking Rate', accessor: 'rate' },
    { header: 'Status', accessor: (row) => getStatusBadge(row.status) },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-64 rounded-lg" style={{ background: 'var(--color-surface-raised)' }} />
            <div className="h-4 w-96 rounded-lg" style={{ background: 'var(--color-surface-raised)' }} />
          </div>
          <div className="h-9 w-28 rounded-xl" style={{ background: 'var(--color-surface-raised)' }} />
        </div>
        {/* Stat cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl" style={{ background: 'var(--color-surface-raised)', borderRadius: 12, border: '1px solid var(--border-color)' }} />
          ))}
        </div>
        {/* Chart skeleton */}
        <div className="h-52 rounded-xl" style={{ background: 'var(--color-surface-raised)', borderRadius: 12, border: '1px solid var(--border-color)' }} />
      </div>
    );
  }

  const formattedRevenue = metrics
    ? `₹${(metrics.total_revenue_cents / 100).toLocaleString('en-IN')}`
    : '₹0';

  // --- Fleet Equipment Dedicated View ---
  if (activeTab === 'fleet') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-main)' }}>Fleet Equipment &amp; Machinery Inventory</h1>
              <Badge variant="info">{vehicles.length} Machinery Registered</Badge>
            </div>
            <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Commercial fleet inventory across tractors, JCB excavators, cranes, harvesters &amp; buses
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              onClick={() => setIsAddModalOpen(true)}
              variant="primary"
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white"
            >
              <Plus className="w-4 h-4" />
              <span>{t('add_vehicle')}</span>
            </Button>
            <Button onClick={handleExportCsv} variant="outline" className="flex-1 sm:flex-none flex items-center justify-center gap-1.5">
              <Download className="w-4 h-4" />
              <span>{t('export_csv')}</span>
            </Button>
          </div>
        </div>

        {/* Equipment Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatBox
            title="Total Registered Fleet"
            value={metrics?.total_vehicles_count || vehicles.length}
            subtitle="Commercial heavy machinery"
          />
          <StatBox
            title="Available & Ready"
            value={metrics?.active_vehicles_count || vehicles.filter((v) => v.status === 'active').length}
            subtitle="Ready for instant booking"
          />
          <StatBox
            title="On Active Job"
            value={vehicles.filter((v) => v.status === 'on_trip').length}
            subtitle="Live driver assignment"
          />
          <StatBox
            title="Under Maintenance"
            value={vehicles.filter((v) => v.status === 'in_service').length}
            subtitle="In service bay"
          />
        </div>

        {/* Fleet Equipment Table */}
        <Card className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold" style={{ color: 'var(--text-main)' }}>Active Machinery Directory</h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Search and manage operational rates and driver assignments</p>
            </div>
            <Badge variant="neutral" className="self-start sm:self-auto">Schema Isolated</Badge>
          </div>
          <DataTable
            columns={vehicleColumns}
            data={vehicles}
            searchPlaceholder="Search vehicle name, category, or driver..."
            searchKey="name"
            pagination={pagination}
            onPageChange={handlePageChange}
            onLoadMore={handleLoadMore}
            hasMore={page < pagination.pages}
            loadingMore={loadingMore}
            isLazyLoad={isLazyLoad}
            onToggleLazyLoad={setIsLazyLoad}
          />
        </Card>

        {/* Add Vehicle Modal */}
        <AddVehicleModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onVehicleCreated={handleVehicleCreated}
        />
      </div>
    );
  }

  // --- Telemetry & System Dedicated View ---
  if (activeTab === 'telemetry') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-main)' }}>Real-Time Telemetry &amp; System Operations</h1>
              <Badge variant="success">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1 inline-block" />
                Live GPS Stream
              </Badge>
            </div>
            <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Vehicle location telemetry, engine diagnostics, PostGIS spatial tracking &amp; tenant isolation status
            </p>
          </div>
          <div
            className="flex items-center gap-2 font-mono text-xs px-3 py-1.5 rounded-lg self-start sm:self-auto"
            style={{ color: 'var(--text-muted)', background: 'var(--color-surface-sunken)', border: '1px solid var(--border-color)' }}
          >
            <span>Schema: tenant_kaveri_agri</span>
          </div>
        </div>

        {/* Telemetry KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatBox
            title="Telemetry Pings Today"
            value="1,420 pings"
            subtitle="POST /api/v1/bookings/:id/gps_pings"
          />
          <StatBox
            title="Active Driver Tracks"
            value={`${vehicles.filter((v) => v.status === 'on_trip').length} Active Trip`}
            subtitle="GPS location stream live"
          />
          <StatBox
            title="System Uptime"
            value="99.99%"
            subtitle={metrics?.system_info ? `PostgreSQL ${metrics.system_info.postgresql_version} ${metrics.system_info.postgis_version ? `+ PostGIS ${metrics.system_info.postgis_version}` : ''}` : 'PostgreSQL Engine'}
          />
          <StatBox
            title="Queue Processor"
            value="Solid Queue"
            subtitle="0 pending telemetry jobs"
          />
        </div>

        {/* Live GPS Telemetry Feed */}
        <Card className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold" style={{ color: 'var(--text-main)' }}>Live Vehicle Telemetry Feed</h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Real-time GPS coordinates, operating speed, and engine thermal telemetry</p>
            </div>
            <Badge variant="info" className="self-start sm:self-auto">4G LTE Cellular GPS</Badge>
          </div>

          <div className="overflow-x-auto no-scrollbar rounded-xl" style={{ border: '1px solid var(--border-color)' }}>
            <table className="w-full text-xs text-left min-w-[700px]" style={{ color: 'var(--text-muted)' }}>
              <thead style={{ background: 'var(--color-surface-sunken)', borderBottom: '1px solid var(--border-color)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                <tr>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Vehicle</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Registration</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Current GPS Coordinates</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Speed</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Engine Thermal</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Telemetry Status</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Last Ping</th>
                </tr>
              </thead>
              <tbody style={{ color: 'var(--text-muted)', borderColor: 'var(--border-color)' }}>
                {[
                  { name: 'Mahindra 575 DI Tractor', reg: 'TN-37-AX-4821', coords: '11.6643° N, 78.1460° E (Salem)', speed: '24 km/h', temp: '82°C (Normal)', badge: <Badge variant="info">Transmitting</Badge>, last: '2s ago' },
                  { name: 'JCB 3DX Super Excavator', reg: 'TN-37-BX-9012', coords: '11.0168° N, 76.9558° E (Coimbatore)', speed: '0 km/h (Idle)', temp: '65°C (Idle)', badge: <Badge variant="success">Standby</Badge>, last: '45s ago' },
                  { name: 'Escorts Hydra Crane 15T', reg: 'TN-37-CY-3344', coords: '10.7905° N, 78.7047° E (Trichy)', speed: '0 km/h', temp: 'Off', badge: <Badge variant="warning">In Service</Badge>, last: '5m ago' },
                  { name: 'Ashok Leyland Viking Bus 40s', reg: 'TN-37-DZ-7788', coords: '9.9252° N, 78.1198° E (Madurai)', speed: '0 km/h', temp: 'Off', badge: <Badge variant="success">Parked</Badge>, last: '12m ago' },
                ].map((row) => (
                  <tr
                    key={row.reg}
                    style={{ borderBottom: '1px solid var(--border-color)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-row-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                  >
                    <td className="px-4 py-3 font-medium whitespace-nowrap" style={{ color: 'var(--text-main)' }}>{row.name}</td>
                    <td className="px-4 py-3 font-mono whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{row.reg}</td>
                    <td className="px-4 py-3 font-mono whitespace-nowrap text-emerald-400">{row.coords}</td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{row.speed}</td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{row.temp}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{row.badge}</td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{row.last}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  }

  // --- Overview Default View ---
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <h1
              className="text-xl sm:text-2xl font-bold"
              style={{ color: 'var(--text-main)' }}
            >
              {t('owner_dashboard')}
            </h1>
            <Badge variant="success">Live Operations</Badge>
          </div>
          <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Real-time commercial vehicle fleet utilization, driver assignments, and revenue reports
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            variant="primary"
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white"
          >
            <Plus className="w-4 h-4" />
            <span>{t('add_vehicle')}</span>
          </Button>
          <Button onClick={handleExportCsv} variant="outline" className="flex-1 sm:flex-none flex items-center justify-center gap-1.5">
            <Download className="w-4 h-4" />
            <span>{t('export_csv')}</span>
          </Button>
        </div>
      </div>

      {error && (
        <div
          className="p-4 rounded-xl text-sm flex items-center justify-between"
          style={{ background: 'rgba(244,63,94,0.10)', border: '1px solid rgba(244,63,94,0.28)', color: 'var(--danger-color)' }}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <span className="text-xs" style={{ opacity: 0.75 }}>Check tenant API connection</span>
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
          value={
            <span className="flex items-center gap-1">
              <span>{metrics?.average_vehicle_rating || 5.0}</span>
              <Star className="w-4 h-4 text-amber-400 fill-amber-400 inline" />
            </span>
          }
          subtitle="Customer satisfaction score"
        />
      </div>

      {/* Charts & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="lg:col-span-2">
          <FleetRevenueChart />
        </Card>

        <Card className="space-y-4">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>Driver Payroll &amp; Settlements</h3>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Automated 40% driver share split, hours tracked, and weekly payout statuses.
          </p>
          <div className="space-y-2 pt-2">
            {[
              { name: 'Ramesh Kumar', role: 'Tractor Driver · 38 hrs', badge: <Badge variant="success">Paid ₹15,200</Badge> },
              { name: 'Suresh Babu', role: 'JCB Operator · 42 hrs', badge: <Badge variant="warning">Pending ₹20,160</Badge> },
              { name: 'Karthik Raja', role: 'Crane Operator · 20 hrs', badge: <Badge variant="info">Processing</Badge> },
            ].map((driver) => (
              <div
                key={driver.name}
                className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: 'var(--color-surface-sunken)', border: '1px solid var(--border-color)' }}
              >
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-main)' }}>{driver.name}</p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{driver.role}</p>
                </div>
                {driver.badge}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Fleet Inventory Table — summary snapshot; full table lives in the Fleet tab */}
      <Card className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold" style={{ color: 'var(--text-main)' }}>Fleet Equipment Inventory</h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Live status across tractors, JCB excavators, cranes, harvesters, and commercial buses
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              onClick={() => setIsAddModalOpen(true)}
              variant="primary"
              className="flex items-center gap-1.5 text-xs px-3 py-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('add_vehicle')}</span>
            </Button>
            <Badge variant="neutral">{metrics?.total_vehicles_count || vehicles.length} Total Vehicles</Badge>
          </div>
        </div>
        <DataTable
          columns={vehicleColumns}
          data={vehicles}
          searchPlaceholder="Search vehicles or drivers..."
          searchKey="name"
          pagination={pagination}
          onPageChange={handlePageChange}
          onLoadMore={handleLoadMore}
          hasMore={page < pagination.pages}
          loadingMore={loadingMore}
          isLazyLoad={isLazyLoad}
          onToggleLazyLoad={setIsLazyLoad}
        />
      </Card>

      {/* Add Vehicle Modal */}
      <AddVehicleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onVehicleCreated={handleVehicleCreated}
      />
    </div>
  );
};
