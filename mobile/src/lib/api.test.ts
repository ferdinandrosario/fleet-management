import { configureApiClient, querystring, request } from "./api";

const ok = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });
const fail = (body: unknown) => new Response(JSON.stringify(body), { status: 400 });

// Read the headers object api.ts passed to fetch. It always passes a plain
// record; the single cast narrows HeadersInit (a plain assignment is rejected).
const headersOf = (call: [unknown, RequestInit?]) => call[1]?.headers as Record<string, string>;

describe("api client", () => {
  const fetchSpy = jest.spyOn(globalThis, "fetch");

  beforeEach(() => {
    fetchSpy.mockReset();
    configureApiClient({ getAccessToken: () => null, getTenant: () => null, getLanguage: () => "en" });
  });

  it("unwraps a success envelope", async () => {
    fetchSpy.mockResolvedValue(ok({ status: "success", data: { id: 1 }, error: null }));
    expect(await request<{ id: number }>("/api/v1/health")).toEqual({ ok: true, data: { id: 1 } });
  });

  it("unwraps an error envelope", async () => {
    fetchSpy.mockResolvedValue(fail({ status: "error", data: null, error: { code: "x", message: "nope" } }));
    expect(await request("/api/v1/health")).toEqual({ ok: false, error: { code: "x", message: "nope" } });
  });

  it("falls back to a generic error when the envelope omits one", async () => {
    fetchSpy.mockResolvedValue(fail({ status: "error", data: null, error: null }));
    expect(await request("/api/v1/x")).toEqual({
      ok: false,
      error: { code: "unknown_error", message: "Something went wrong." },
    });
  });

  it("attaches Authorization, X-Tenant, and Accept-Language", async () => {
    configureApiClient({ getAccessToken: () => "tok", getTenant: () => "acme", getLanguage: () => "hi" });
    fetchSpy.mockResolvedValue(ok({ status: "success", data: {}, error: null }));
    await request("/api/v1/x");
    const headers = headersOf(fetchSpy.mock.calls[0]);
    expect(headers.Authorization).toBe("Bearer tok");
    expect(headers["X-Tenant"]).toBe("acme");
    expect(headers["Accept-Language"]).toBe("hi");
  });

  it("omits auth headers when there is no token or tenant", async () => {
    fetchSpy.mockResolvedValue(ok({ status: "success", data: {}, error: null }));
    await request("/api/v1/x");
    const headers = headersOf(fetchSpy.mock.calls[0]);
    expect(headers.Authorization).toBeUndefined();
    expect(headers["X-Tenant"]).toBeUndefined();
  });

  it("serializes a JSON body for writes", async () => {
    fetchSpy.mockResolvedValue(ok({ status: "success", data: {}, error: null }));
    await request("/api/v1/x", { method: "POST", body: { a: 1 } });
    const opts = fetchSpy.mock.calls[0][1];
    expect(opts?.method).toBe("POST");
    expect(opts?.body).toBe(JSON.stringify({ a: 1 }));
  });

  it("returns network_error when fetch rejects", async () => {
    fetchSpy.mockRejectedValue(new Error("offline"));
    expect(await request("/api/v1/x")).toEqual({
      ok: false,
      error: { code: "network_error", message: "Network request failed." },
    });
  });

  it("returns invalid_response when the body is not JSON", async () => {
    fetchSpy.mockResolvedValue(new Response("not json", { status: 200 }));
    const res = await request("/api/v1/x");
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe("invalid_response");
  });

  it("uses no auth headers and en language before it is configured", async () => {
    // Fresh module = the default context (no token/tenant getters wired yet).
    let fresh!: typeof import("./api");
    jest.isolateModules(() => {
      // isolateModules needs a sync require to get a fresh module copy.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      fresh = require("./api");
    });
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ status: "success", data: {}, error: null }), { status: 200 }),
    );
    await fresh.request("/api/v1/x");
    const headers = fetchSpy.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers.Authorization).toBeUndefined();
    expect(headers["X-Tenant"]).toBeUndefined();
    expect(headers["Accept-Language"]).toBe("en");
  });

  describe("querystring", () => {
    it("builds a sorted query string, skipping nullish values", () => {
      expect(querystring({ b: 2, a: 1, c: null, d: undefined })).toBe("?a=1&b=2");
    });

    it("returns an empty string when there are no usable params", () => {
      expect(querystring({})).toBe("");
    });
  });
});
