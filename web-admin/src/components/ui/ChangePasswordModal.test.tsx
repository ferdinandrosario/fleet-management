import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { ChangePasswordModal } from './ChangePasswordModal';
import { apiRequest } from '../../lib/api';

vi.mock('../../lib/api', () => ({
  apiRequest: vi.fn(),
}));

describe('ChangePasswordModal Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(<ChangePasswordModal isOpen={false} onClose={mockOnClose} />);
    expect(screen.queryByText('Change Account Password')).toBeNull();
  });

  it('renders correctly when isOpen is true', () => {
    render(<ChangePasswordModal isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText('Change Account Password')).toBeDefined();
    expect(screen.getByPlaceholderText('••••••••')).toBeDefined();
    expect(screen.getByPlaceholderText('Minimum 6 characters')).toBeDefined();
    expect(screen.getByPlaceholderText('Re-enter new password')).toBeDefined();
  });

  it('validates empty inputs', async () => {
    render(<ChangePasswordModal isOpen={true} onClose={mockOnClose} />);
    
    fireEvent.submit(screen.getByRole('button', { name: /Update Password/i }).closest('form')!);
    
    await waitFor(() => {
      expect(screen.getByText('Please enter your current password')).toBeDefined();
    });
  });

  it('validates new password length', async () => {
    render(<ChangePasswordModal isOpen={true} onClose={mockOnClose} />);
    
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'currentpass' } });
    fireEvent.change(screen.getByPlaceholderText('Minimum 6 characters'), { target: { value: 'short' } });
    fireEvent.submit(screen.getByRole('button', { name: /Update Password/i }).closest('form')!);
    
    await waitFor(() => {
      expect(screen.getByText('New password must be at least 6 characters long')).toBeDefined();
    });
  });

  it('validates password mismatch', async () => {
    render(<ChangePasswordModal isOpen={true} onClose={mockOnClose} />);
    
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'currentpass' } });
    fireEvent.change(screen.getByPlaceholderText('Minimum 6 characters'), { target: { value: 'newpassword' } });
    fireEvent.change(screen.getByPlaceholderText('Re-enter new password'), { target: { value: 'different' } });
    fireEvent.submit(screen.getByRole('button', { name: /Update Password/i }).closest('form')!);
    
    await waitFor(() => {
      expect(screen.getByText('New password and confirm password do not match')).toBeDefined();
    });
  });

  it('handles successful password update', async () => {
    (apiRequest as any).mockResolvedValue({ status: 'success' });

    render(<ChangePasswordModal isOpen={true} onClose={mockOnClose} />);
    
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'currentpass' } });
    fireEvent.change(screen.getByPlaceholderText('Minimum 6 characters'), { target: { value: 'newpassword' } });
    fireEvent.change(screen.getByPlaceholderText('Re-enter new password'), { target: { value: 'newpassword' } });
    fireEvent.submit(screen.getByRole('button', { name: /Update Password/i }).closest('form')!);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('/api/v1/auth/change_password', expect.objectContaining({
        method: 'POST',
      }));
      expect(screen.getByText('Password updated')).toBeDefined();
    });

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it('handles API errors', async () => {
    (apiRequest as any).mockResolvedValue({
      status: 'error',
      error: { message: 'Incorrect current password' }
    });

    render(<ChangePasswordModal isOpen={true} onClose={mockOnClose} />);
    
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrongpass' } });
    fireEvent.change(screen.getByPlaceholderText('Minimum 6 characters'), { target: { value: 'newpassword' } });
    fireEvent.change(screen.getByPlaceholderText('Re-enter new password'), { target: { value: 'newpassword' } });
    fireEvent.submit(screen.getByRole('button', { name: /Update Password/i }).closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('Incorrect current password')).toBeDefined();
    });
  });

  it('handles Escape key to close', () => {
    render(<ChangePasswordModal isOpen={true} onClose={mockOnClose} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(mockOnClose).toHaveBeenCalled();
  });
});
