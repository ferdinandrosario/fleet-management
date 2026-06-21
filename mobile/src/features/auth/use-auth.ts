import { useMutation } from "@tanstack/react-query";

import { useAuthStore } from "../../stores/auth-store";
import * as client from "./auth-client";
import type { TokenPair } from "./auth-client";

// Commit a token pair to the session store (shared by login + otp-verify). The
// tenant was pinned earlier via setTenant, so X-Tenant was already sent.
async function commitSession(pair: TokenPair): Promise<void> {
  const tenant = useAuthStore.getState().tenant;
  if (!tenant) return;
  await useAuthStore.getState().signIn({
    accessToken: pair.access_token,
    refreshToken: pair.refresh_token,
    tenant,
  });
}

export function useRegister() {
  return useMutation({ mutationFn: client.register });
}

export function useRequestOtp() {
  return useMutation({ mutationFn: client.requestOtp });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: ({ phone, code }: { phone: string; code: string }) => client.verifyOtp(phone, code),
    onSuccess: async (res) => {
      if (res.ok) await commitSession(res.data);
    },
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: ({ phone, password }: { phone: string; password: string }) => client.login(phone, password),
    onSuccess: async (res) => {
      if (res.ok) await commitSession(res.data);
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: client.logout,
    onSuccess: async () => {
      await useAuthStore.getState().signOut();
    },
  });
}
