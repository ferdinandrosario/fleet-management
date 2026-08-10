import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { AuthProvider, useAuth } from './AuthContext';
import { loginOwnerApi, loginSuperAdminApi, logoutApi } from './auth-client';
import { setAuthToken, setTenantSlug } from '../../lib/api';

vi.mock('./auth-client', () => ({
  loginOwnerApi: vi.fn(),
  loginSuperAdminApi: vi.fn(),
  logoutApi: vi.fn(),
}));

vi.mock('../../lib/api', () => ({
  setAuthToken: vi.fn(),
  setTenantSlug: vi.fn(),
}));

const TestComponent = () => {
  const { user, role, tenantSlug, loginOwner, loginSuperAdmin, logout, setTenant } = useAuth();
  
  return (
    <div>
      <div data-testid="user-id">{user?.id || 'none'}</div>
      <div data-testid="role">{role}</div>
      <div data-testid="tenant">{tenantSlug}</div>
      <button onClick={() => loginOwner({ phone: '123', password: 'pwd', tenantSlug: 'tenant_123' })}>Login Owner</button>
      <button onClick={() => loginSuperAdmin({ email: 'a@b.c', password: 'pwd' })}>Login Admin</button>
      <button onClick={() => logout()}>Logout</button>
      <button onClick={() => setTenant('new_tenant')}>Set Tenant</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('initializes with default values', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(screen.getByTestId('user-id').textContent).toBe('none');
    expect(screen.getByTestId('role').textContent).toBe('owner');
    expect(screen.getByTestId('tenant').textContent).toBe('demo_tenant');
  });

  it('loads user from sessionStorage if available', () => {
    sessionStorage.setItem('fm_user', JSON.stringify({ id: 'saved_1', role: 'super_admin', tenantSlug: 'tenant_saved' }));
    sessionStorage.setItem('fm_token', 'saved_token');
    sessionStorage.setItem('fm_tenant', 'tenant_saved');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(screen.getByTestId('user-id').textContent).toBe('saved_1');
    expect(screen.getByTestId('role').textContent).toBe('super_admin');
    expect(screen.getByTestId('tenant').textContent).toBe('tenant_saved');
    expect(setAuthToken).toHaveBeenCalledWith('saved_token');
    expect(setTenantSlug).toHaveBeenCalledWith('tenant_saved');
  });

  it('handles loginOwner success', async () => {
    (loginOwnerApi as any).mockResolvedValue({
      status: 'success',
      data: { user: { id: 'owner_test_1', name: 'Test Owner' } }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Login Owner'));

    await waitFor(() => {
      expect(screen.getByTestId('user-id').textContent).toBe('owner_test_1');
      expect(screen.getByTestId('role').textContent).toBe('owner');
      expect(screen.getByTestId('tenant').textContent).toBe('tenant_123'); // From cleanPhone '123'
    });
  });

  it('handles loginOwner error', async () => {
    (loginOwnerApi as any).mockResolvedValue({
      status: 'error',
      error: { message: 'Failed' }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Login Owner'));

    await waitFor(() => {
      expect(screen.getByTestId('user-id').textContent).toBe('none');
    });
  });

  it('handles loginSuperAdmin success', async () => {
    (loginSuperAdminApi as any).mockResolvedValue({
      status: 'success',
      data: { super_admin: { id: 'admin_test_1' } }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Login Admin'));

    await waitFor(() => {
      expect(screen.getByTestId('user-id').textContent).toBe('admin_test_1');
      expect(screen.getByTestId('role').textContent).toBe('super_admin');
      expect(screen.getByTestId('tenant').textContent).toBe('public');
    });
  });

  it('handles logout', async () => {
    (logoutApi as any).mockResolvedValue({});
    sessionStorage.setItem('fm_user', JSON.stringify({ id: 'saved_1', role: 'owner' }));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Logout'));

    await waitFor(() => {
      expect(screen.getByTestId('user-id').textContent).toBe('none');
      expect(setAuthToken).toHaveBeenCalledWith(null);
      expect(setTenantSlug).toHaveBeenCalledWith(null);
      expect(sessionStorage.getItem('fm_user')).toBeNull();
    });
  });

  it('throws error when useAuth is used outside of provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestComponent />)).toThrow('useAuth must be used within an AuthProvider');
    consoleError.mockRestore();
  });

  it('ignores sessionStorage errors during login', async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage full');
    });

    (loginOwnerApi as any).mockResolvedValue({
      status: 'success',
      data: { user: { id: 'test_1' } }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Login Owner'));

    await waitFor(() => {
      expect(screen.getByTestId('user-id').textContent).toBe('test_1');
    });
    
    setItemSpy.mockRestore();
  });

  it('handles invalid login payload (admin)', async () => {
    (loginSuperAdminApi as any).mockResolvedValue({
      status: 'error'
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Login Admin'));

    await waitFor(() => {
      expect(screen.getByTestId('user-id').textContent).toBe('none');
    });
  });

  it('ignores invalid JSON in sessionStorage on init', () => {
    sessionStorage.setItem('fm_user', 'invalid-json');
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(screen.getByTestId('user-id').textContent).toBe('none');
  });
});
