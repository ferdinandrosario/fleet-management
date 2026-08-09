import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { AuthGate } from './AuthGate';
import { useAuth } from './AuthContext';
import { t } from '../../lib/i18n';

vi.mock('./AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../lib/i18n', () => ({
  t: (key: string) => key,
}));

describe('AuthGate Component', () => {
  const mockLoginOwner = vi.fn();
  const mockLoginSuperAdmin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      loginOwner: mockLoginOwner,
      loginSuperAdmin: mockLoginSuperAdmin,
    });
  });

  it('renders owner login form by default', () => {
    render(<AuthGate />);
    expect(screen.getByText('owner_auth_title')).toBeDefined();
    expect(screen.getByLabelText('phone_number')).toBeDefined();
    expect(screen.getByLabelText('password')).toBeDefined();
  });

  it('renders super admin login form when isSuperAdminRoute is true', () => {
    render(<AuthGate isSuperAdminRoute={true} />);
    expect(screen.getByText('superadmin_auth_title')).toBeDefined();
    expect(screen.getByLabelText('email_address')).toBeDefined();
  });

  it('handles owner login submission successfully', async () => {
    mockLoginOwner.mockResolvedValue({ success: true });
    render(<AuthGate />);

    fireEvent.change(screen.getByLabelText('Workspace Name (Tenant ID)'), { target: { value: 'demo' } });
    fireEvent.change(screen.getByLabelText('phone_number'), { target: { value: '9876543210' } });
    fireEvent.change(screen.getByLabelText('password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText('sign_in'));

    await waitFor(() => {
      expect(mockLoginOwner).toHaveBeenCalledWith({ phone: '9876543210', password: 'password123', tenantSlug: 'demo' });
      expect(screen.getByText('login_success')).toBeDefined();
    });
  });

  it('shows error if fields are empty on owner login', async () => {
    render(<AuthGate />);
    fireEvent.click(screen.getByText('sign_in'));

    await waitFor(() => {
      expect(screen.getByText('login_error_required')).toBeDefined();
      expect(mockLoginOwner).not.toHaveBeenCalled();
    });
  });

  it('shows error on failed login', async () => {
    mockLoginOwner.mockResolvedValue({ success: false, message: 'Invalid info' });
    render(<AuthGate />);

    fireEvent.change(screen.getByLabelText('Workspace Name (Tenant ID)'), { target: { value: 'demo' } });
    fireEvent.change(screen.getByLabelText('phone_number'), { target: { value: '987' } });
    fireEvent.change(screen.getByLabelText('password'), { target: { value: 'pwd' } });
    fireEvent.click(screen.getByText('sign_in'));

    await waitFor(() => {
      expect(screen.getByText('Invalid info')).toBeDefined();
    });
  });

  it('toggles forgot password form', async () => {
    render(<AuthGate />);
    
    const forgotBtn = screen.getByText('Forgot Password?');
    fireEvent.click(forgotBtn);

    expect(screen.getByText('Reset Password')).toBeDefined();
    expect(screen.getByLabelText('Primary Email Address')).toBeDefined();

    const backBtn = screen.getByText('Back to Login');
    fireEvent.click(backBtn);

    expect(screen.getByText('owner_auth_title')).toBeDefined();
  });

  it('handles forgot password submission', async () => {
    render(<AuthGate />);
    
    fireEvent.click(screen.getByText('Forgot Password?'));
    
    const emailInput = screen.getByLabelText('Primary Email Address');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    fireEvent.click(screen.getByText('Send Reset Link'));
    
    await waitFor(() => {
      expect(screen.getByText('Reset link sent to your email. Valid for 3 minutes.')).toBeDefined();
    }, { timeout: 2000 });
  });
});
