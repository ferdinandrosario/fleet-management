import { initI18n } from "../../lib/i18n";
import { renderWithProviders } from "../../test/test-utils";
import { WelcomeScreen } from "./welcome-screen";

describe("WelcomeScreen", () => {
  beforeAll(() => {
    initI18n("en");
  });

  it("shows the app name and the language picker", async () => {
    const { getByText } = await renderWithProviders(<WelcomeScreen />);
    expect(getByText("Fleet Management")).toBeTruthy();
    expect(getByText("Choose your language")).toBeTruthy();
  });
});
