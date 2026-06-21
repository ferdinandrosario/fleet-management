import { request, type ApiResult } from "../../lib/api";

// Mirrors backend UserSerializer field-by-field (mobile/AGENTS.md).
export type AuthUser = {
  id: string;
  name: string;
  phone: string;
  role: "customer" | "driver" | "owner_admin";
  locale: string;
  phone_verified: boolean;
};

export type TokenPair = {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
};

export type RegisterInput = {
  name: string;
  phone: string;
  password: string;
  locale?: string;
};

export type RegisterResult = {
  id: string;
  phone_verification_required: boolean;
};

export function register(input: RegisterInput): Promise<ApiResult<RegisterResult>> {
  return request("/api/v1/auth/register", { method: "POST", body: { user: input } });
}

export function requestOtp(phone: string): Promise<ApiResult<{ sent: boolean }>> {
  return request("/api/v1/auth/otp", { method: "POST", body: { phone } });
}

export function verifyOtp(phone: string, code: string): Promise<ApiResult<TokenPair>> {
  return request("/api/v1/auth/otp/verify", { method: "POST", body: { phone, code } });
}

export function login(phone: string, password: string): Promise<ApiResult<TokenPair>> {
  return request("/api/v1/auth/login", { method: "POST", body: { phone, password } });
}

export function logout(): Promise<ApiResult<{ signed_out: boolean }>> {
  return request("/api/v1/auth/logout", { method: "DELETE" });
}
