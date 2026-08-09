import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SystemHealth } from './SystemHealth';
import { useAuth } from '../auth/AuthContext';
import { apiRequest } from '../../lib/api';

vi.mock('../auth/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../lib/api', () => ({
  apiRequest: vi.fn(),
}));

describe('SystemHealth Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders 403 unauthorized for non-super-admin users', () => {
    (useAuth as any).mockReturnValue({ role: 'owner' });
    (apiRequest as any).mockResolvedValue({ status: 'error' });
    
    render(<SystemHealth />);
    
    expect(screen.getByText('403 Authorization Required')).toBeDefined();
    expect(screen.getByText('Return to Dashboard')).toBeDefined();
  });

  it('renders the system health dashboard for super_admin', async () => {
    (useAuth as any).mockReturnValue({ role: 'super_admin' });
    (apiRequest as any).mockResolvedValue({
      status: 'success',
      data: {
        system_info: {
          postgresql_version: '15.0',
          ruby_version: '3.2.0',
          rails_version: '7.1.0',
          os_version: 'Ubuntu 24.04',
        }
      }
    });

    render(<SystemHealth />);
    
    expect(screen.getByText('Technical Architecture & Stack Specifications')).toBeDefined();
    
    await waitFor(() => {
      expect(screen.getAllByText('Rails 7.1.0 API (Ruby 3.2.0)').length).toBeGreaterThan(0);
    });
  });

  it('handles API errors gracefully', async () => {
    (useAuth as any).mockReturnValue({ role: 'super_admin' });
    (apiRequest as any).mockRejectedValue(new Error('Network failure'));

    render(<SystemHealth />);
    
    await waitFor(() => {
      expect(screen.getByText('Network failure')).toBeDefined();
    });
  });

  it('handles API errors gracefully when returned as JSON message', async () => {
    (useAuth as any).mockReturnValue({ role: 'super_admin' });
    (apiRequest as any).mockResolvedValue({
      status: 'error',
      error: { message: 'Failed to fetch telemetry' }
    });

    render(<SystemHealth />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch telemetry')).toBeDefined();
    });
  });

  it('handles back to dashboard button for unauthorized', () => {
    (useAuth as any).mockReturnValue({ role: 'owner' });
    (apiRequest as any).mockResolvedValue({ status: 'error' });
    
    const popStateEventSpy = vi.spyOn(window, 'dispatchEvent');
    render(<SystemHealth />);
    
    const backButton = screen.getByText('Return to Dashboard');
    backButton.click();
    
    expect(popStateEventSpy).toHaveBeenCalled();
  });
  
  it('handles back to dashboard button for authorized', async () => {
    (useAuth as any).mockReturnValue({ role: 'super_admin' });
    (apiRequest as any).mockResolvedValue({ status: 'success', data: { system_info: null } });
    
    const popStateEventSpy = vi.spyOn(window, 'dispatchEvent');
    render(<SystemHealth />);
    
    await waitFor(() => {
      expect(screen.getByText('Technical Architecture & Stack Specifications')).toBeDefined();
    });
    
    const backButton = screen.getByLabelText('Back to dashboard');
    backButton.click();
    
    expect(popStateEventSpy).toHaveBeenCalled();
  });
});
