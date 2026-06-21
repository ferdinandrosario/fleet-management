import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

// Auth session state. Tokens live in the device Keychain/Keystore via
// expo-secure-store — NEVER AsyncStorage (mobile/AGENTS.md / security). The
// tenant slug is pinned here and sent as X-Tenant on every request. Token
// rotation/refresh is layered on in Session 3; this is the storage + lifecycle.
const ACCESS_KEY = "fm.accessToken";
const REFRESH_KEY = "fm.refreshToken";
const TENANT_KEY = "fm.tenant";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export type Session = {
  accessToken: string;
  refreshToken: string;
  tenant: string;
};

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  tenant: string | null;
  status: AuthStatus;
  restore: () => Promise<void>;
  setTenant: (tenant: string) => Promise<void>;
  signIn: (session: Session) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  tenant: null,
  status: "loading",

  // Rehydrate from secure storage at app start (the splash/auth gate awaits it).
  restore: async () => {
    const [accessToken, refreshToken, tenant] = await Promise.all([
      SecureStore.getItemAsync(ACCESS_KEY),
      SecureStore.getItemAsync(REFRESH_KEY),
      SecureStore.getItemAsync(TENANT_KEY),
    ]);
    set({
      accessToken,
      refreshToken,
      tenant,
      status: accessToken ? "authenticated" : "unauthenticated",
    });
  },

  // Pin the tenant (business code) before login/register, so X-Tenant is sent.
  // Persisted so it survives a restart even before the user is authenticated.
  setTenant: async (tenant) => {
    await SecureStore.setItemAsync(TENANT_KEY, tenant);
    set({ tenant });
  },

  signIn: async ({ accessToken, refreshToken, tenant }) => {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_KEY, accessToken),
      SecureStore.setItemAsync(REFRESH_KEY, refreshToken),
      SecureStore.setItemAsync(TENANT_KEY, tenant),
    ]);
    set({ accessToken, refreshToken, tenant, status: "authenticated" });
  },

  signOut: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_KEY),
      SecureStore.deleteItemAsync(REFRESH_KEY),
      SecureStore.deleteItemAsync(TENANT_KEY),
    ]);
    set({ accessToken: null, refreshToken: null, tenant: null, status: "unauthenticated" });
  },
}));
