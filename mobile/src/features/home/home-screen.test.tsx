import { fireEvent, render, waitFor } from "@testing-library/react-native";

import { initI18n } from "../../lib/i18n";
import { useAuthStore } from "../../stores/auth-store";
import { Providers } from "../../test/test-utils";
import { HomeScreen } from "./home-screen";

const success = (data: unknown) =>
  new Response(JSON.stringify({ status: "success", data, error: null }), { status: 200 });

describe("HomeScreen", () => {
  const fetchSpy = jest.spyOn(globalThis, "fetch");

  beforeAll(() => initI18n("en"));
  beforeEach(() => fetchSpy.mockReset());

  const renderScreen = () =>
    render(
      <Providers>
        <HomeScreen />
      </Providers>,
    );

  it("renders the authenticated landing", async () => {
    const { findByText } = await renderScreen();
    expect(await findByText("Fleet Management")).toBeTruthy();
  });

  it("logs out when the button is pressed", async () => {
    await useAuthStore.getState().signIn({ accessToken: "a", refreshToken: "r", tenant: "acme" });
    fetchSpy.mockResolvedValue(success({ signed_out: true }));

    const { findByLabelText } = await renderScreen();
    await fireEvent.press(await findByLabelText("Log out"));
    await waitFor(() => expect(useAuthStore.getState().status).toBe("unauthenticated"));
  });
});
