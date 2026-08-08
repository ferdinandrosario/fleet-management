import { describe, it, expect, beforeEach } from 'vitest';
import { setAuthToken, getAuthToken, setTenantSlug, getTenantSlug } from './api';

describe('web-admin API client in-memory token handling', () => {
  beforeEach(() => {
    setAuthToken(null);
    setTenantSlug(null);
  });

  it('manages auth token strictly in memory', () => {
    expect(getAuthToken()).toBeNull();
    setAuthToken('test_jwt_token_123');
    expect(getAuthToken()).toBe('test_jwt_token_123');
    setAuthToken(null);
    expect(getAuthToken()).toBeNull();
  });

  it('manages tenant slug strictly in memory', () => {
    expect(getTenantSlug()).toBeNull();
    setTenantSlug('karnataka-fleets');
    expect(getTenantSlug()).toBe('karnataka-fleets');
    setTenantSlug(null);
    expect(getTenantSlug()).toBeNull();
  });
});
