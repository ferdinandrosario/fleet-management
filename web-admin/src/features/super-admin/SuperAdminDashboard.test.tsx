import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { SuperAdminDashboard } from './SuperAdminDashboard';
import { apiRequest } from '../../lib/api';

vi.mock('../../lib/api', () => ({
  apiRequest: vi.fn(),
}));

vi.mock('./ApiDocsAccess', () => ({
  ApiDocsAccess: () => <div data-testid="api-docs-access" />
}));

vi.mock('./ProvisionOwnerModal', () => ({
  ProvisionOwnerModal: ({ isOpen, onClose, onSuccess }: any) => isOpen ? (
    <div data-testid="provision-owner-modal">
      <button onClick={() => onClose()}>Close</button>
      <button onClick={() => onSuccess()}>Success</button>
    </div>
  ) : null
}));

describe('SuperAdminDashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (apiRequest as any).mockImplementation(async (url: string) => {
      if (url.includes('/api/v1/super_admin/dashboard')) {
        return {
          status: 'success',
          data: {
            dashboard: {
              total_owners_count: 5,
              active_owners_count: 5,
              active_subscriptions_count: 5,
              mrr_paise: 500000,
            }
          }
        };
      }
      if (url.includes('/api/v1/super_admin/owners')) {
        return {
          status: 'success',
          data: {
            owners: [
              { id: '1', name: 'Owner 1', tenant: 'tenant1', status: 'active', mrr_cents: 1000 },
              { id: '2', name: 'Owner 2', tenant: 'tenant2', status: 'trial' },
              { id: '3', name: 'Owner 3', tenant: 'tenant3', status: 'past_due' },
              { id: '4', name: 'Owner 4', tenant: 'tenant4', status: 'suspended' },
            ],
            pagination: { page: 1, pages: 2, count: 4, limit: 2 }
          }
        };
      }
      return { status: 'error', error: { message: 'Not found' } };
    });
  });

  it('renders the overview tab by default', async () => {
    render(<SuperAdminDashboard />);
    
    expect(document.querySelector('.animate-pulse')).toBeDefined();
    
    await waitFor(() => {
      expect(screen.getByText('Super Admin Platform Dashboard')).toBeDefined();
      expect(screen.getByTestId('api-docs-access')).toBeDefined();
      expect(screen.getByText('₹5,000')).toBeDefined(); // 500000 paise -> ₹5000
    });
  });

  it('handles api failures gracefully and uses defaults', async () => {
    (apiRequest as any).mockImplementation(async () => {
      return { status: 'error', error: { message: 'Dashboard failed' } };
    });
    render(<SuperAdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('₹36,496')).toBeDefined();
    });
  });

  it('renders the fleet tab when activeTab is fleet', async () => {
    render(<SuperAdminDashboard activeTab="fleet" />);
    
    await waitFor(() => {
      expect(screen.getByText('Platform Multi-Tenant Fleet Equipment')).toBeDefined();
    });
    
    // Test pagination
    fireEvent.click(screen.getByLabelText('Next Page'));
    
    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('/api/v1/super_admin/owners?page=2&limit=20');
    });
  });

  it('renders the telemetry tab when activeTab is telemetry', async () => {
    render(<SuperAdminDashboard activeTab="telemetry" />);
    
    await waitFor(() => {
      expect(screen.getByText('Infrastructure Telemetry & System Health')).toBeDefined();
    });
  });



  it('handles provision new owner modal', async () => {
    render(<SuperAdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getAllByText('Provision New Owner')[0]).toBeDefined();
    });

    fireEvent.click(screen.getAllByText('Provision New Owner')[0]);
    expect(screen.getByTestId('provision-owner-modal')).toBeDefined();
    
    fireEvent.click(screen.getByText('Success'));
    
    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('/api/v1/super_admin/owners?page=1&limit=20');
    });
    
    fireEvent.click(screen.getAllByText('Provision New Owner')[0]);
    fireEvent.click(screen.getByText('Close'));
    expect(screen.queryByTestId('provision-owner-modal')).toBeNull();
  });
});
