import { request } from "./api";
import { bootstrap } from "./bootstrap";
import { useAuthStore } from "../stores/auth-store";
import { useLanguageStore } from "../stores/language-store";

describe("bootstrap", () => {
  const fetchSpy = jest.spyOn(globalThis, "fetch");

  beforeEach(() => {
    fetchSpy.mockReset();
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ status: "success", data: {}, error: null }), { status: 200 }),
    );
  });

  it("wires the API client to the auth and language stores", async () => {
    bootstrap();
    useAuthStore.setState({ accessToken: "tok", tenant: "acme" });
    useLanguageStore.setState({ language: "en" });

    await request("/api/v1/x");

    // Plain record always passed by api.ts; single cast narrows HeadersInit.
    const headers = fetchSpy.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer tok");
    expect(headers["X-Tenant"]).toBe("acme");
    expect(headers["Accept-Language"]).toBe("en");
  });
});
