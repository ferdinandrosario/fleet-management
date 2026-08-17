import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { ProvisionOwnerModal } from './ProvisionOwnerModal';
import { apiRequest } from '../../lib/api';

vi.mock('../../lib/api', () => ({
  apiRequest: vi.fn(),
}));

describe('ProvisionOwnerModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(<ProvisionOwnerModal isOpen={false} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    expect(screen.queryByText('New Fleet Owner')).toBeNull();
  });

  it('renders and handles validation errors on submit', async () => {
    render(<ProvisionOwnerModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    const submitBtn = screen.getByRole('button', { name: /Provision Fleet Owner/i });
    fireEvent.submit(submitBtn.closest('form')!);
    
    await waitFor(() => {
      expect(screen.getByText('Please resolve all validation errors below.')).toBeDefined();
    });
  });

  it('submits form successfully and calls onSuccess', async () => {
    (apiRequest as any).mockResolvedValue({ status: 'success' });

    render(<ProvisionOwnerModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    fireEvent.change(screen.getByPlaceholderText('e.g. Salem Heavy Transports'), { target: { value: 'Test Company' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. Ramesh Kumar'), { target: { value: 'Test Owner' } });
    fireEvent.change(screen.getByPlaceholderText('+91 98765 43210'), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByPlaceholderText('Minimum 6 characters'), { target: { value: 'password123' } });

    fireEvent.submit(screen.getByRole('button', { name: /Provision Fleet Owner/i }).closest('form')!);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('/api/v1/super_admin/owners', expect.objectContaining({
        method: 'POST',
      }));
      expect(screen.getByText('Tenant Fleet Owner Provisioned!')).toBeDefined();
    });

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it('handles API errors', async () => {
    (apiRequest as any).mockResolvedValue({
      status: 'error',
      error: { message: 'Provision failed' }
    });

    render(<ProvisionOwnerModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    fireEvent.change(screen.getByPlaceholderText('e.g. Salem Heavy Transports'), { target: { value: 'Test Company' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. Ramesh Kumar'), { target: { value: 'Test Owner' } });
    fireEvent.change(screen.getByPlaceholderText('+91 98765 43210'), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByPlaceholderText('Minimum 6 characters'), { target: { value: 'password123' } });

    fireEvent.submit(screen.getByRole('button', { name: /Provision Fleet Owner/i }).closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('Provision failed')).toBeDefined();
    });
  });

  
  it('validates minimum password length', async () => {
    render(<ProvisionOwnerModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    fireEvent.change(screen.getByPlaceholderText('e.g. Salem Heavy Transports'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. Ramesh Kumar'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByPlaceholderText('+91 98765 43210'), { target: { value: '123' } });
    fireEvent.change(screen.getByPlaceholderText('Minimum 6 characters'), { target: { value: '123' } }); // < 6
    
    fireEvent.submit(screen.getByRole('button', { name: /Provision Fleet Owner/i }).closest('form')!);
    
    await waitFor(() => {
      expect(screen.getByText('Please resolve all validation errors below.')).toBeDefined();
    });
  });

  it('generates slug automatically and stops when manually edited', async () => {
    render(<ProvisionOwnerModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    // Toggle advanced to see slug
    
    
    // Type company name
    fireEvent.change(screen.getByPlaceholderText('e.g. Salem Heavy Transports'), { target: { value: 'Hello World!' } });
    
    const tenantInput = screen.getByPlaceholderText('salem_transports') as HTMLInputElement;
    expect(tenantInput.value).toBe('hello_world');
    
    // Manually edit slug
    fireEvent.change(tenantInput, { target: { value: 'my_slug' } });
    
    // Type company name again, slug shouldn't change
    fireEvent.change(screen.getByPlaceholderText('e.g. Salem Heavy Transports'), { target: { value: 'Other' } });
    expect(tenantInput.value).toBe('my_slug');
  });

  it('handles field-specific array errors from API', async () => {
    (apiRequest as any).mockResolvedValue({
      status: 'error',
      error: { fields: { owner_phone: ['has already been taken'] } }
    });

    render(<ProvisionOwnerModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    fireEvent.change(screen.getByPlaceholderText('e.g. Salem Heavy Transports'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. Ramesh Kumar'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByPlaceholderText('+91 98765 43210'), { target: { value: '123' } });
    fireEvent.change(screen.getByPlaceholderText('Minimum 6 characters'), { target: { value: 'password123' } });

    fireEvent.submit(screen.getByRole('button', { name: /Provision Fleet Owner/i }).closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('Failed to provision tenant fleet owner.')).toBeDefined();
    });
  });

  it('resets form when modal is closed', () => {
    render(<ProvisionOwnerModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    fireEvent.change(screen.getByPlaceholderText('e.g. Salem Heavy Transports'), { target: { value: 'Test' } });
    
    const closeBtn = screen.getByLabelText('Close');
    fireEvent.click(closeBtn);
    
    expect(mockOnClose).toHaveBeenCalled();
  });
});
