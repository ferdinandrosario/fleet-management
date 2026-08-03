// Shared API client handling JWT token, X-Tenant header, and backend response envelope.

let inMemoryToken: string | null = null;
let currentTenant: string | null = null;

export const setAuthToken = (token: string | null) => {
  inMemoryToken = token;
};

export const setTenantSlug = (slug: string | null) => {
  currentTenant = slug;
};

export const getTenantSlug = () => currentTenant;

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data: T | null;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string[]>;
  } | null;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const baseUrl = import.meta.env.VITE_API_URL || '';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (inMemoryToken) {
    headers['Authorization'] = `Bearer ${inMemoryToken}`;
  }

  if (currentTenant) {
    headers['X-Tenant'] = currentTenant;
  }

  try {
    const res = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    const body: ApiResponse<T> = await res.json();
    return body;
  } catch (err: any) {
    return {
      status: 'error',
      data: null,
      error: {
        code: 'network_error',
        message: err.message || 'Failed to connect to backend server.',
      },
    };
  }
}
