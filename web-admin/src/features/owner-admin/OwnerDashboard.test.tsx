import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { OwnerDashboard } from './OwnerDashboard';
import { apiRequest, getAuthToken, getTenantSlug } from '../../lib/api';

// Mocking dependencies
vi.mock('../../lib/api', () => ({
  apiRequest: vi.fn(),
  getAuthToken: vi.fn(),
  getTenantSlug: vi.fn(),
}));

vi.mock('../../components/ui/FleetRevenueChart', () => ({
  FleetRevenueChart: () => <div data-testid="fleet-revenue-chart" />
}));

vi.mock('./AddVehicleModal', () => ({
  AddVehicleModal: ({ isOpen, onClose, onVehicleCreated }: any) => isOpen ? (
    <div data-testid="add-vehicle-modal">
      <button onClick={() => onClose()}>Close</button>
      <button onClick={() => onVehicleCreated({
        id: 'new_veh',
        name: 'New Tractor',
        category: 'tractor',
        registration: 'TN-99',
        status: 'active',
        rate: '800',
        driver: 'Unassigned',
      })}>Create</button>
    </div>
  ) : null
}));

describe('OwnerDashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (apiRequest as any).mockImplementation(async (url: string) => {
      if (url.includes('/api/v1/reports/dashboard')) {
        return {
          status: 'success',
          data: {
            dashboard: {
              total_revenue_paise: 100000,
              completed_jobs_count: 5,
              total_vehicles_count: 2,
              active_vehicles_count: 1,
              active_drivers_count: 1,
              average_vehicle_rating: 4.5,
              vehicle_utilization_pct: 50.0,
            }
          }
        };
      }
      if (url.includes('/api/v1/vehicles')) {
        return {
          status: 'success',
          data: {
            vehicles: [
              { id: '1', name: 'Tractor 1', status: 'available', hourly_rate_paise: 80000 },
              { id: '2', name: 'Tractor 2', status: 'booked', hourly_rate_paise: 80000 },
              { id: '3', name: 'Tractor 3', status: 'maintenance', hourly_rate_paise: 80000 },
              { id: '4', name: 'Tractor 4', status: 'inactive', hourly_rate_paise: 80000 },
            ],
            pagination: { page: 1, pages: 2, count: 4, limit: 2 }
          }
        };
      }
      return { status: 'error', error: { message: 'Not found' } };
    });
  });

  it('renders the overview tab by default', async () => {
    render(<OwnerDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Fleet Owner Analytics')).toBeDefined();
      expect(screen.getByTestId('fleet-revenue-chart')).toBeDefined();
      expect(screen.getByText('₹1,000')).toBeDefined(); // 100000 cents
      expect(screen.getByText('Tractor 1')).toBeDefined();
    });
  });

  it('renders default metrics and error banner on api failure', async () => {
    (apiRequest as any).mockImplementation(async (url: string) => {
      if (url.includes('/api/v1/reports/dashboard')) {
        return { status: 'error', error: { message: 'Dashboard API failed' } };
      }
      return { status: 'error' };
    });

    render(<OwnerDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Dashboard API failed')).toBeDefined();
      expect(screen.getByText('₹0')).toBeDefined(); // 0 default revenue
    });
  });

  it('renders the fleet tab when activeTab is fleet', async () => {
    render(<OwnerDashboard activeTab="fleet" />);
    
    await waitFor(() => {
      expect(screen.getByText('Fleet Equipment & Machinery Inventory')).toBeDefined();
    });
    
    // pagination test
    fireEvent.click(screen.getByLabelText('Next Page'));
    
    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('/api/v1/vehicles?page=2&limit=20');
    });
  });

  it('renders the telemetry tab when activeTab is telemetry', async () => {
    render(<OwnerDashboard activeTab="telemetry" />);
    
    await waitFor(() => {
      expect(screen.getByText('Real-Time Telemetry & System Operations')).toBeDefined();
      expect(screen.getByText('Telemetry Pings Today')).toBeDefined();
    });
  });

  it('handles CSV export button click', async () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    (getAuthToken as any).mockReturnValue('token');
    (getTenantSlug as any).mockReturnValue('tenant');

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(['test'], { type: 'text/csv' }))
    }) as any;

    globalThis.URL.createObjectURL = vi.fn();
    globalThis.URL.revokeObjectURL = vi.fn();

    render(<OwnerDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Export Bookings CSV')).toBeDefined();
    });

    const exportBtn = screen.getByText('Export Bookings CSV');
    fireEvent.click(exportBtn);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/reports/bookings_csv'),
        expect.objectContaining({
          headers: {
            'Authorization': 'Bearer token',
            'X-Tenant': 'tenant'
          }
        })
      );
      expect(clickSpy).toHaveBeenCalled();
    });
    
    clickSpy.mockRestore();
  });
  
  it('handles CSV export error', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Export failed')) as any;
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<OwnerDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Export Bookings CSV')).toBeDefined();
    });

    fireEvent.click(screen.getByText('Export Bookings CSV'));
    
    // toast would fire but we just verify it doesn't crash
  });

  it('opens and handles AddVehicleModal', async () => {
    render(<OwnerDashboard activeTab="fleet" />);
    
    await waitFor(() => {
      expect(screen.getAllByText('Add Vehicle').length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getAllByText('Add Vehicle')[0]);
    
    expect(screen.getByTestId('add-vehicle-modal')).toBeDefined();
    
    fireEvent.click(screen.getByText('Create'));
    
    await waitFor(() => {
      expect(screen.getByText('New Tractor')).toBeDefined();
    });
    
    // Also test close
    fireEvent.click(screen.getAllByText('Add Vehicle')[0]);
    fireEvent.click(screen.getByText('Close'));
    expect(screen.queryByTestId('add-vehicle-modal')).toBeNull();
  });
});
