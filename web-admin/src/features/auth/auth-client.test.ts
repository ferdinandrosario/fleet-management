import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loginOwnerApi, loginSuperAdminApi, logoutApi } from './auth-client';
import { apiRequest, setAuthToken, setTenantSlug } from '../../lib/api';

vi.mock('../../lib/api', () => ({
  apiRequest: vi.fn(),
  setAuthToken: vi.fn(),
  setTenantSlug: vi.fn(),
}));

describe('auth-client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loginOwnerApi', () => {
    it('returns success and sets token for valid API response', async () => {
      (apiRequest as any).mockResolvedValue({
        status: 'success',
        data: { access_token: 'valid_token' }
      });

      const res = await loginOwnerApi({ phone: '9999999999', password: 'password', tenantSlug: 'tenant_9999999999' });
      expect(res.status).toBe('success');
      expect(setAuthToken).toHaveBeenCalledWith('valid_token');
    });

    it('returns error when API fails and not demo credentials', async () => {
      (apiRequest as any).mockResolvedValue({ status: 'error', error: { message: 'Invalid credentials' } });

      const res = await loginOwnerApi({ phone: '9999999999', password: 'wrong', tenantSlug: 'tenant_9999999999' });
      expect(res.status).toBe('error');
      expect(setAuthToken).not.toHaveBeenCalled();
    });
  });

  describe('loginSuperAdminApi', () => {
    it('returns success and sets token for valid API response', async () => {
      (apiRequest as any).mockResolvedValue({
        status: 'success',
        data: { access_token: 'valid_admin_token' }
      });

      const res = await loginSuperAdminApi({ email: 'real@example.com', password: 'password' });
      expect(res.status).toBe('success');
      expect(setAuthToken).toHaveBeenCalledWith('valid_admin_token');
      expect(setTenantSlug).toHaveBeenCalledWith('public');
    });

    it('returns error when API fails and not demo credentials', async () => {
      (apiRequest as any).mockResolvedValue({ status: 'error', error: { message: 'Invalid' } });

      const res = await loginSuperAdminApi({ email: 'real@example.com', password: 'wrong' });
      expect(res.status).toBe('error');
    });
  });

  describe('logoutApi', () => {
    it('calls apiRequest to logout and clears token', async () => {
      (apiRequest as any).mockResolvedValue({ status: 'success' });

      await logoutApi();
      expect(apiRequest).toHaveBeenCalledWith('/api/v1/auth/logout', { method: 'DELETE' });
      expect(setAuthToken).toHaveBeenCalledWith(null);
    });
  });
});
