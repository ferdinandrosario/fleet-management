import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { AddVehicleModal } from './AddVehicleModal';
import { apiRequest } from '../../lib/api';

vi.mock('../../lib/api', () => ({
  apiRequest: vi.fn(),
}));

vi.mock('../../lib/i18n', () => ({
  t: (key: string) => {
    const translations: Record<string, string> = {
      name_required: 'Name is required',
      reg_required: 'Registration is required',
      hourly_rate_required: 'Hourly rate required',
      invalid_json: 'Invalid JSON',
      save_vehicle: 'Save Vehicle',
      saving_vehicle: 'Saving Vehicle...',
    };
    return translations[key] || key;
  },
}));

describe('AddVehicleModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnVehicleCreated = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(
      <AddVehicleModal
        isOpen={false}
        onClose={mockOnClose}
        onVehicleCreated={mockOnVehicleCreated}
      />
    );
    expect(screen.queryByText('add_new_vehicle')).toBeNull();
  });

  it('renders correctly and fetches models when isOpen is true', async () => {
    (apiRequest as any).mockResolvedValueOnce({
      status: 'success',
      data: {
        vehicle_models: [
          { id: '1', make: 'Mahindra', name: 'Arjun 555', category: 'tractor' },
          { id: '2', make: 'Swaraj', name: '744 FE', category: 'tractor' },
        ],
      },
    });

    render(
      <AddVehicleModal
        isOpen={true}
        onClose={mockOnClose}
        onVehicleCreated={mockOnVehicleCreated}
      />
    );

    expect(screen.getByText('add_new_vehicle')).toBeDefined();
    expect(apiRequest).toHaveBeenCalledWith('/api/v1/discovery/vehicle_models');

    await waitFor(() => {
      expect(screen.getByText('Mahindra')).toBeDefined();
      expect(screen.getByText('Swaraj')).toBeDefined();
    });
  });

  it('handles API failure gracefully when fetching models', async () => {
    (apiRequest as any).mockRejectedValueOnce(new Error('Network error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AddVehicleModal
        isOpen={true}
        onClose={mockOnClose}
        onVehicleCreated={mockOnVehicleCreated}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText('Mahindra')).toBeNull();
    });
    consoleSpy.mockRestore();
  });

  it('validates form inputs', async () => {
    (apiRequest as any).mockResolvedValueOnce({ status: 'success', data: [] });

    render(
      <AddVehicleModal
        isOpen={true}
        onClose={mockOnClose}
        onVehicleCreated={mockOnVehicleCreated}
      />
    );

    const form = screen.getByRole('button', { name: /Save Vehicle/i }).closest('form')!;
    
    // Fill required fields so HTML5 validation passes
    fireEvent.change(screen.getByLabelText('vehicle_name'), { target: { value: 'Valid Name' } });
    fireEvent.change(screen.getByLabelText('registration_number'), { target: { value: 'TN-12' } });
    fireEvent.change(screen.getByLabelText('hourly_rate (₹)'), { target: { value: '800' } });
    fireEvent.change(screen.getByLabelText('daily_rate (₹)'), { target: { value: '6000' } });
    
    // Invalid JSON for custom validation
    fireEvent.change(screen.getByPlaceholderText('e.g. {"bucket_capacity": "1.1 cu.m", "hp": 45}'), {
      target: { value: 'invalid_json' }
    });

    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Invalid JSON format for specifications')).toBeDefined();
    });
  });

  it('handles successful vehicle creation', async () => {
    (apiRequest as any).mockResolvedValueOnce({ status: 'success', data: [] }); // fetch models
    (apiRequest as any).mockResolvedValueOnce({
      status: 'success',
      data: {
        vehicle: {
          id: 'veh_123',
          name: 'Test Tractor',
          category: 'tractor',
          registration_number: 'TN-11',
          hourly_rate_cents: 80000,
        },
      },
    });

    render(
      <AddVehicleModal
        isOpen={true}
        onClose={mockOnClose}
        onVehicleCreated={mockOnVehicleCreated}
      />
    );

    const nameInput = screen.getByLabelText('vehicle_name');
    const regInput = screen.getByLabelText('registration_number');
    const hourlyInput = screen.getByLabelText('hourly_rate (₹)');
    const dailyInput = screen.getByLabelText('daily_rate (₹)');
    const specsInput = screen.getByPlaceholderText('e.g. {"bucket_capacity": "1.1 cu.m", "hp": 45}');

    fireEvent.change(nameInput, { target: { value: 'Test Tractor' } });
    fireEvent.change(regInput, { target: { value: 'TN-11' } });
    fireEvent.change(hourlyInput, { target: { value: '800' } });
    fireEvent.change(dailyInput, { target: { value: '6000' } });
    fireEvent.change(specsInput, { target: { value: '{"hp": 50}' } });

    fireEvent.submit(screen.getByRole('button', { name: /Save Vehicle/i }).closest('form')!);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('/api/v1/vehicles', expect.objectContaining({
        method: 'POST',
      }));
      expect(mockOnVehicleCreated).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('handles API validation errors', async () => {
    (apiRequest as any).mockResolvedValueOnce({ status: 'success', data: [] });
    (apiRequest as any).mockResolvedValueOnce({
      status: 'error',
      error: {
        fields: {
          name: ['already exists'],
          registration_number: 'invalid format'
        }
      }
    });

    render(
      <AddVehicleModal
        isOpen={true}
        onClose={mockOnClose}
        onVehicleCreated={mockOnVehicleCreated}
      />
    );

    fireEvent.change(screen.getByLabelText('vehicle_name'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText('registration_number'), { target: { value: 'TN-11' } });
    fireEvent.change(screen.getByLabelText('hourly_rate (₹)'), { target: { value: '800' } });
    fireEvent.change(screen.getByLabelText('daily_rate (₹)'), { target: { value: '6000' } });

    fireEvent.submit(screen.getByRole('button', { name: /Save Vehicle/i }).closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('already exists')).toBeDefined();
    });
  });

  it('handles plan limit exceeded error', async () => {
    (apiRequest as any).mockResolvedValueOnce({ status: 'success', data: [] });
    (apiRequest as any).mockResolvedValueOnce({
      status: 'error',
      error: {
        code: 'plan_limit_exceeded',
      }
    });

    render(
      <AddVehicleModal
        isOpen={true}
        onClose={mockOnClose}
        onVehicleCreated={mockOnVehicleCreated}
      />
    );

    fireEvent.change(screen.getByLabelText('vehicle_name'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText('registration_number'), { target: { value: 'TN-11' } });
    fireEvent.change(screen.getByLabelText('hourly_rate (₹)'), { target: { value: '800' } });
    fireEvent.change(screen.getByLabelText('daily_rate (₹)'), { target: { value: '6000' } });

    fireEvent.submit(screen.getByRole('button', { name: /Save Vehicle/i }).closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('plan_limit_reached')).toBeDefined();
    });
  });

  it('handles general API errors', async () => {
    (apiRequest as any).mockResolvedValueOnce({ status: 'success', data: [] });
    (apiRequest as any).mockResolvedValueOnce({
      status: 'error',
      error: {
        message: 'Something went wrong',
      }
    });

    render(
      <AddVehicleModal
        isOpen={true}
        onClose={mockOnClose}
        onVehicleCreated={mockOnVehicleCreated}
      />
    );

    fireEvent.change(screen.getByLabelText('vehicle_name'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText('registration_number'), { target: { value: 'TN-11' } });
    fireEvent.change(screen.getByLabelText('hourly_rate (₹)'), { target: { value: '800' } });
    fireEvent.change(screen.getByLabelText('daily_rate (₹)'), { target: { value: '6000' } });

    fireEvent.submit(screen.getByRole('button', { name: /Save Vehicle/i }).closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('Something went wrong')).toBeDefined();
    });
  });

  it('handles fallback to mock creation when error is missing', async () => {
    (apiRequest as any).mockResolvedValueOnce({ status: 'success', data: [] });
    (apiRequest as any).mockResolvedValueOnce({
      status: 'success', // or something unexpected without vehicle and no error
    });

    render(
      <AddVehicleModal
        isOpen={true}
        onClose={mockOnClose}
        onVehicleCreated={mockOnVehicleCreated}
      />
    );

    fireEvent.change(screen.getByLabelText('vehicle_name'), { target: { value: 'Mock Tractor' } });
    fireEvent.change(screen.getByLabelText('registration_number'), { target: { value: 'TN-11' } });
    fireEvent.change(screen.getByLabelText('hourly_rate (₹)'), { target: { value: '800' } });
    fireEvent.change(screen.getByLabelText('daily_rate (₹)'), { target: { value: '6000' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. {"bucket_capacity": "1.1 cu.m", "hp": 45}'), { target: { value: '' } });

    fireEvent.submit(screen.getByRole('button', { name: /Save Vehicle/i }).closest('form')!);

    await waitFor(() => {
      expect(mockOnVehicleCreated).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Mock Tractor',
        rate: '₹800/hr',
      }));
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

});
