import { fireEvent, render, waitFor } from "@testing-library/react-native";

import { initI18n } from "../../lib/i18n";
import { useAuthStore } from "../../stores/auth-store";
import { navProp, Providers, routeProp } from "../../test/test-utils";
import { RegisterScreen } from "./register-screen";

const success = (data: unknown) =>
  new Response(JSON.stringify({ status: "success", data, error: null }), { status: 200 });
const failure = (error: unknown) =>
  new Response(JSON.stringify({ status: "error", data: null, error }), { status: 422 });

describe("RegisterScreen", () => {
  const fetchSpy = jest.spyOn(globalThis, "fetch");

  beforeAll(() => initI18n("en"));
  beforeEach(async () => {
    fetchSpy.mockReset();
    await useAuthStore.getState().signOut();
  });

  const renderScreen = (navigate = jest.fn()) =>
    render(
      <Providers>
        <RegisterScreen navigation={navProp(navigate)} route={routeProp()} />
      </Providers>,
    );

  it("registers and navigates to OTP with the phone", async () => {
    fetchSpy.mockResolvedValue(success({ id: "u", phone_verification_required: true }));
    const navigate = jest.fn();
    const { getByLabelText, findByLabelText } = await renderScreen(navigate);
    await fireEvent.changeText(await findByLabelText("Business code"), "acme");
    await fireEvent.changeText(getByLabelText("Name"), "Ravi");
    await fireEvent.changeText(getByLabelText("Phone number"), "+919876543210");
    await fireEvent.changeText(getByLabelText("Password"), "secret");
    await fireEvent.press(getByLabelText("Create account"));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith("Otp", { phone: "+919876543210" }));
  });

  it("shows an error when registration fails", async () => {
    fetchSpy.mockResolvedValue(failure({ code: "validation_failed", message: "no" }));
    const { findByLabelText, findByText } = await renderScreen();
    await fireEvent.press(await findByLabelText("Create account"));
    expect(await findByText("Couldn't continue. Check your details and try again.")).toBeTruthy();
  });

  it("navigates to login", async () => {
    const navigate = jest.fn();
    const { findByLabelText } = await renderScreen(navigate);
    await fireEvent.press(await findByLabelText("Have an account? Sign in"));
    expect(navigate).toHaveBeenCalledWith("Login");
  });
});
