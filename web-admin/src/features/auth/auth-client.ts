import { apiRequest, setAuthToken, setTenantSlug, ApiResponse } from '../../lib/api';

export interface LoginOwnerPayload {
  phone: string;
  password: string;
  tenantSlug: string;
}

export interface LoginSuperAdminPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  phone?: string;
  email?: string;
  name?: string;
  role: 'owner' | 'super_admin';
  tenantSlug: string;
}

export interface AuthSuccessData {
  access_token: string;
  refresh_token?: string;
  user?: any;
  super_admin?: any;
}

export async function loginOwnerApi(
  payload: LoginOwnerPayload
): Promise<ApiResponse<AuthSuccessData>> {
  setTenantSlug(payload.tenantSlug);
  const response = await apiRequest<AuthSuccessData>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      phone: payload.phone,
      password: payload.password,
    }),
  });

  if (response.status === 'success' && response.data?.access_token) {
    setAuthToken(response.data.access_token);
  }
  return response;
}

export async function loginSuperAdminApi(
  payload: LoginSuperAdminPayload
): Promise<ApiResponse<AuthSuccessData>> {
  setTenantSlug('public');
  const response = await apiRequest<AuthSuccessData>('/api/v1/super_admin/login', {
    method: 'POST',
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
    }),
  });

  if (response.status === 'success' && response.data?.access_token) {
    setAuthToken(response.data.access_token);
  }
  return response;
}

export async function logoutApi(): Promise<ApiResponse<any>> {
  const res = await apiRequest('/api/v1/auth/logout', {
    method: 'DELETE',
  });
  setAuthToken(null);
  return res;
}
