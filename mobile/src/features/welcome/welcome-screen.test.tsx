import { fireEvent, render } from "@testing-library/react-native";

import { initI18n } from "../../lib/i18n";
import { navProp, Providers, routeProp } from "../../test/test-utils";
import { WelcomeScreen } from "./welcome-screen";

describe("WelcomeScreen", () => {
  beforeAll(() => initI18n("en"));

  const renderScreen = (navigate = jest.fn()) =>
    render(
      <Providers>
        <WelcomeScreen navigation={navProp(navigate)} route={routeProp()} />
      </Providers>,
    );

  it("shows the app name, language picker, and auth actions", async () => {
    const { findByText } = await renderScreen();
    expect(await findByText("Fleet Management")).toBeTruthy();
    expect(await findByText("Choose your language")).toBeTruthy();
  });

  it("navigates to login and register", async () => {
    const navigate = jest.fn();
    const { findByLabelText } = await renderScreen(navigate);
    await fireEvent.press(await findByLabelText("Sign in"));
    expect(navigate).toHaveBeenCalledWith("Login");
    await fireEvent.press(await findByLabelText("Create account"));
    expect(navigate).toHaveBeenCalledWith("Register");
  });
});
