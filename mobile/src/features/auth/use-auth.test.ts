import { renderHook } from "@testing-library/react-native";

import { useAuthStore } from "../../stores/auth-store";
import { Providers } from "../../test/test-utils";
import { useLogin, useLogout, useRegister, useRequestOtp, useVerifyOtp } from "./use-auth";

const success = (data: unknown) =>
  new Response(JSON.stringify({ status: "success", data, error: null }), { status: 200 });
const failure = (error: unknown) =>
  new Response(JSON.stringify({ status: "error", data: null, error }), { status: 400 });

const tokens = { access_token: "a", refresh_token: "r", user: { id: "u", role: "customer" } };

describe("use-auth", () => {
  const fetchSpy = jest.spyOn(globalThis, "fetch");

  beforeEach(async () => {
    fetchSpy.mockReset();
    await useAuthStore.getState().signOut();
  });

  it("useLogin commits the session on success", async () => {
    await useAuthStore.getState().setTenant("acme");
    fetchSpy.mockResolvedValue(success(tokens));
    const { result } = await renderHook(() => useLogin(), { wrapper: Providers });
    await result.current.mutateAsync({ phone: "+91", password: "p" });
    expect(useAuthStore.getState().status).toBe("authenticated");
    expect(useAuthStore.getState().accessToken).toBe("a");
  });

  it("useLogin does not commit when the server rejects", async () => {
    await useAuthStore.getState().setTenant("acme");
    fetchSpy.mockResolvedValue(failure({ code: "invalid_credentials", message: "no" }));
    const { result } = await renderHook(() => useLogin(), { wrapper: Providers });
    await result.current.mutateAsync({ phone: "+91", password: "p" });
    expect(useAuthStore.getState().status).toBe("unauthenticated");
  });

  it("does not commit when no tenant is pinned", async () => {
    fetchSpy.mockResolvedValue(success(tokens));
    const { result } = await renderHook(() => useVerifyOtp(), { wrapper: Providers });
    await result.current.mutateAsync({ phone: "+91", code: "123456" });
    expect(useAuthStore.getState().status).toBe("unauthenticated");
  });

  it("useVerifyOtp commits the session on success", async () => {
    await useAuthStore.getState().setTenant("acme");
    fetchSpy.mockResolvedValue(success(tokens));
    const { result } = await renderHook(() => useVerifyOtp(), { wrapper: Providers });
    await result.current.mutateAsync({ phone: "+91", code: "123456" });
    expect(useAuthStore.getState().status).toBe("authenticated");
  });

  it("useRegister returns the result without committing", async () => {
    fetchSpy.mockResolvedValue(success({ id: "u", phone_verification_required: true }));
    const { result } = await renderHook(() => useRegister(), { wrapper: Providers });
    const res = await result.current.mutateAsync({ name: "R", phone: "+91", password: "p" });
    expect(res.ok).toBe(true);
    expect(useAuthStore.getState().status).toBe("unauthenticated");
  });

  it("useRequestOtp posts and returns success", async () => {
    fetchSpy.mockResolvedValue(success({ sent: true }));
    const { result } = await renderHook(() => useRequestOtp(), { wrapper: Providers });
    expect(await result.current.mutateAsync("+91")).toEqual({ ok: true, data: { sent: true } });
  });

  it("useLogout signs out", async () => {
    await useAuthStore.getState().setTenant("acme");
    fetchSpy.mockResolvedValue(success(tokens));
    const login = await renderHook(() => useLogin(), { wrapper: Providers });
    await login.result.current.mutateAsync({ phone: "+91", password: "p" });
    expect(useAuthStore.getState().status).toBe("authenticated");

    fetchSpy.mockResolvedValue(success({ signed_out: true }));
    const logout = await renderHook(() => useLogout(), { wrapper: Providers });
    await logout.result.current.mutateAsync();
    expect(useAuthStore.getState().status).toBe("unauthenticated");
  });
});
