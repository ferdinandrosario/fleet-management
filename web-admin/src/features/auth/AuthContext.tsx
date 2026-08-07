import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  loginOwnerApi,
  loginSuperAdminApi,
  logoutApi,
  AuthUser,
  LoginOwnerPayload,
  LoginSuperAdminPayload,
} from './auth-client';
import { setAuthToken, setTenantSlug } from '../../lib/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  role: 'owner' | 'super_admin';
  tenantSlug: string;
  loginOwner: (payload: LoginOwnerPayload) => Promise<{ success: boolean; message?: string }>;
  loginSuperAdmin: (payload: LoginSuperAdminPayload) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  setTenant: (slug: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const savedUser = sessionStorage.getItem('fm_user');
      const savedToken = sessionStorage.getItem('fm_token');
      if (savedUser && savedToken) {
        setAuthToken(savedToken);
        const parsed = JSON.parse(savedUser);
        if (parsed.tenantSlug) setTenantSlug(parsed.tenantSlug);
        return parsed;
      }
    } catch {
      // ignore JSON parse errors
    }
    return null;
  });

  const [role, setRole] = useState<'owner' | 'super_admin'>(() => {
    try {
      const savedUser = sessionStorage.getItem('fm_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.role) return parsed.role;
      }
    } catch {
      // ignore
    }
    return 'owner';
  });

  const [tenantSlug, setTenantSlugState] = useState<string>(() => {
    try {
      const savedTenant = sessionStorage.getItem('fm_tenant');
      if (savedTenant) return savedTenant;
    } catch {
      // ignore
    }
    return 'demo_tenant';
  });

  const setTenant = (slug: string) => {
    setTenantSlugState(slug);
    setTenantSlug(slug);
  };

  const loginOwner = async (payload: LoginOwnerPayload) => {
    setTenant(payload.tenantSlug);
    const res = await loginOwnerApi(payload);
    if (res.status === 'success' && res.data) {
      const authUser: AuthUser = {
        id: res.data.user?.id || 'owner_1',
        phone: payload.phone,
        name: res.data.user?.name || 'Fleet Owner',
        role: 'owner',
        tenantSlug: payload.tenantSlug,
      };
      setUser(authUser);
      setRole('owner');
      try {
        sessionStorage.setItem('fm_user', JSON.stringify(authUser));
      } catch {
        // ignore storage errors
      }
      return { success: true };
    } else {
      return {
        success: false,
        message: res.error?.message || 'Invalid credentials',
      };
    }
  };

  const loginSuperAdmin = async (payload: LoginSuperAdminPayload) => {
    setTenant('public');
    const res = await loginSuperAdminApi(payload);
    if (res.status === 'success' && res.data) {
      const authUser: AuthUser = {
        id: res.data.super_admin?.id || 'super_admin_1',
        email: payload.email,
        name: 'Super Admin',
        role: 'super_admin',
        tenantSlug: 'public',
      };
      setUser(authUser);
      setRole('super_admin');
      try {
        sessionStorage.setItem('fm_user', JSON.stringify(authUser));
      } catch {
        // ignore storage errors
      }
      return { success: true };
    } else {
      return {
        success: false,
        message: res.error?.message || 'Invalid super admin credentials',
      };
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      setRole('owner');
      try {
        sessionStorage.removeItem('fm_user');
      } catch {
        // ignore storage errors
      }
      setAuthToken(null);
      setTenantSlug(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        role,
        tenantSlug,
        loginOwner,
        loginSuperAdmin,
        logout,
        setTenant,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
