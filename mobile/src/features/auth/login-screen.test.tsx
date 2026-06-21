import { fireEvent, render, waitFor } from "@testing-library/react-native";

import { initI18n } from "../../lib/i18n";
import { useAuthStore } from "../../stores/auth-store";
import { navProp, Providers, routeProp } from "../../test/test-utils";
import { LoginScreen } from "./login-screen";

const success = (data: unknown) =>
  new Response(JSON.stringify({ status: "success", data, error: null }), { status: 200 });
const failure = (error: unknown) =>
  new Response(JSON.stringify({ status: "error", data: null, error }), { status: 401 });
const tokens = { access_token: "a", refresh_token: "r", user: { id: "u", role: "customer" } };

describe("LoginScreen", () => {
  const fetchSpy = jest.spyOn(globalThis, "fetch");

  beforeAll(() => initI18n("en"));
  beforeEach(async () => {
    fetchSpy.mockReset();
    await useAuthStore.getState().signOut();
  });

  const renderScreen = (navigate = jest.fn()) =>
    render(
      <Providers>
        <LoginScreen navigation={navProp(navigate)} route={routeProp()} />
      </Providers>,
    );

  it("submits login and commits the session", async () => {
    fetchSpy.mockResolvedValue(success(tokens));
    const { getByLabelText, findByLabelText } = await renderScreen();
    await fireEvent.changeText(await findByLabelText("Business code"), "acme");
    await fireEvent.changeText(getByLabelText("Phone number"), "+919876543210");
    await fireEvent.changeText(getByLabelText("Password"), "secret");
    await fireEvent.press(getByLabelText("Sign in"));

    await waitFor(() => expect(fetchSpy.mock.calls[0]?.[0]).toContain("/api/v1/auth/login"));
    expect(JSON.parse(fetchSpy.mock.calls[0][1]?.body as string)).toEqual({
      phone: "+919876543210",
      password: "secret",
    });
    await waitFor(() => expect(useAuthStore.getState().status).toBe("authenticated"));
  });

  it("shows an error when login fails", async () => {
    fetchSpy.mockResolvedValue(failure({ code: "invalid_credentials", message: "no" }));
    const { findByLabelText, findByText } = await renderScreen();
    await fireEvent.press(await findByLabelText("Sign in"));
    expect(await findByText("Couldn't continue. Check your details and try again.")).toBeTruthy();
  });

  it("navigates to register", async () => {
    const navigate = jest.fn();
    const { findByLabelText } = await renderScreen(navigate);
    await fireEvent.press(await findByLabelText("New here? Create an account"));
    expect(navigate).toHaveBeenCalledWith("Register");
  });
});
