import { initI18n } from "../../lib/i18n";
import { renderWithProviders } from "../../test/test-utils";
import { HomeScreen } from "./home-screen";

describe("HomeScreen", () => {
  beforeAll(() => {
    initI18n("en");
  });

  it("renders the authenticated landing", async () => {
    const { getByText } = await renderWithProviders(<HomeScreen />);
    expect(getByText("Fleet Management")).toBeTruthy();
  });
});
