// The one HTTP transport for the whole app. Feature clients call `request`;
// TanStack Query wraps those in hooks. The envelope shape mirrors the backend
// contract (mobile/AGENTS.md "API contract"). No second fetch wrapper anywhere.

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

export type ApiError = {
  code: string;
  message: string;
  fields?: Record<string, string[]>;
};

// Discriminated result so callers must handle both arms (no thrown errors for
// expected failures — network, validation, auth).
export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };

// The server-derived context the client attaches to every request. Wired to the
// auth + language stores via `configureApiClient` (kept injectable so api.ts has
// no store import — avoids a cycle and keeps it unit-testable).
export type ApiContext = {
  getAccessToken: () => string | null;
  getTenant: () => string | null;
  getLanguage: () => string;
};

let context: ApiContext = {
  getAccessToken: () => null,
  getTenant: () => null,
  getLanguage: () => "en",
};

export function configureApiClient(next: ApiContext): void {
  context = next;
}

type QueryParams = Record<string, string | number | boolean | null | undefined>;

// Deterministic (sorted) query string; nullish values are skipped. Returns "" so
// callers can append unconditionally.
export function querystring(params: QueryParams): string {
  const pairs = Object.keys(params)
    .sort()
    .filter((key) => params[key] !== null && params[key] !== undefined)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(String(params[key]))}`);
  return pairs.length ? `?${pairs.join("&")}` : "";
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
};

export async function request<T>(path: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
  const { method = "GET", body, signal } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept-Language": context.getLanguage(),
  };
  const token = context.getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const tenant = context.getTenant();
  if (tenant) headers["X-Tenant"] = tenant;

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch {
    return { ok: false, error: { code: "network_error", message: "Network request failed." } };
  }

  let envelope: { status: string; data: T; error: ApiError | null };
  try {
    envelope = await response.json();
  } catch {
    return { ok: false, error: { code: "invalid_response", message: "Malformed server response." } };
  }

  if (envelope.status === "success") {
    return { ok: true, data: envelope.data };
  }
  return {
    ok: false,
    error: envelope.error ?? { code: "unknown_error", message: "Something went wrong." },
  };
}
