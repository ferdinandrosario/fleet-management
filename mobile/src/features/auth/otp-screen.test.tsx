import { fireEvent, render, waitFor } from "@testing-library/react-native";

import { initI18n } from "../../lib/i18n";
import { useAuthStore } from "../../stores/auth-store";
import { navProp, Providers, routeProp } from "../../test/test-utils";
import { OtpScreen } from "./otp-screen";

const success = (data: unknown) =>
  new Response(JSON.stringify({ status: "success", data, error: null }), { status: 200 });
const failure = (error: unknown) =>
  new Response(JSON.stringify({ status: "error", data: null, error }), { status: 422 });
const tokens = { access_token: "a", refresh_token: "r", user: { id: "u", role: "customer" } };

describe("OtpScreen", () => {
  const fetchSpy = jest.spyOn(globalThis, "fetch");

  beforeAll(() => initI18n("en"));
  beforeEach(async () => {
    fetchSpy.mockReset();
    await useAuthStore.getState().signOut();
    await useAuthStore.getState().setTenant("acme");
  });

  const renderScreen = () =>
    render(
      <Providers>
        <OtpScreen navigation={navProp()} route={routeProp({ phone: "+919876543210" })} />
      </Providers>,
    );

  it("shows the phone and verifies a code, committing the session", async () => {
    fetchSpy.mockResolvedValue(success(tokens));
    const { getByText, getByLabelText, findByLabelText } = await renderScreen();
    expect(getByText("+919876543210")).toBeTruthy();
    await fireEvent.changeText(await findByLabelText("Verification code"), "123456");
    await fireEvent.press(getByLabelText("Verify"));
    await waitFor(() => expect(useAuthStore.getState().status).toBe("authenticated"));
  });

  it("shows an error on a bad code", async () => {
    fetchSpy.mockResolvedValue(failure({ code: "otp_invalid", message: "no" }));
    const { findByLabelText, findByText } = await renderScreen();
    await fireEvent.press(await findByLabelText("Verify"));
    expect(await findByText("Couldn't continue. Check your details and try again.")).toBeTruthy();
  });
});
