import * as client from "./auth-client";

const ok = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });
const envelope = (data: unknown) => ok({ status: "success", data, error: null });

// The request body api.ts sent (it always JSON-stringifies a plain object).
const bodyOf = (call: [unknown, RequestInit?]) => JSON.parse(call[1]?.body as string);
const urlOf = (call: [unknown, RequestInit?]) => call[0] as string;
const methodOf = (call: [unknown, RequestInit?]) => call[1]?.method;

describe("auth-client", () => {
  const fetchSpy = jest.spyOn(globalThis, "fetch");
  beforeEach(() => fetchSpy.mockReset());

  it("register posts the user payload", async () => {
    fetchSpy.mockResolvedValue(envelope({ id: "u1", phone_verification_required: true }));
    const res = await client.register({ name: "Ravi", phone: "+91987", password: "secret" });
    expect(urlOf(fetchSpy.mock.calls[0])).toContain("/api/v1/auth/register");
    expect(methodOf(fetchSpy.mock.calls[0])).toBe("POST");
    expect(bodyOf(fetchSpy.mock.calls[0])).toEqual({ user: { name: "Ravi", phone: "+91987", password: "secret" } });
    expect(res).toEqual({ ok: true, data: { id: "u1", phone_verification_required: true } });
  });

  it("requestOtp posts the phone", async () => {
    fetchSpy.mockResolvedValue(envelope({ sent: true }));
    await client.requestOtp("+91987");
    expect(bodyOf(fetchSpy.mock.calls[0])).toEqual({ phone: "+91987" });
  });

  it("verifyOtp posts phone + code", async () => {
    fetchSpy.mockResolvedValue(envelope({ access_token: "a", refresh_token: "r", user: {} }));
    await client.verifyOtp("+91987", "123456");
    expect(urlOf(fetchSpy.mock.calls[0])).toContain("/api/v1/auth/otp/verify");
    expect(bodyOf(fetchSpy.mock.calls[0])).toEqual({ phone: "+91987", code: "123456" });
  });

  it("login posts phone + password", async () => {
    fetchSpy.mockResolvedValue(envelope({ access_token: "a", refresh_token: "r", user: {} }));
    await client.login("+91987", "secret");
    expect(bodyOf(fetchSpy.mock.calls[0])).toEqual({ phone: "+91987", password: "secret" });
  });

  it("logout sends DELETE", async () => {
    fetchSpy.mockResolvedValue(envelope({ signed_out: true }));
    await client.logout();
    expect(urlOf(fetchSpy.mock.calls[0])).toContain("/api/v1/auth/logout");
    expect(methodOf(fetchSpy.mock.calls[0])).toBe("DELETE");
  });
});
