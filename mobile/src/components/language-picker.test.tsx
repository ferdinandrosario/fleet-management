import { fireEvent, render } from "@testing-library/react-native";

import { initI18n } from "../lib/i18n";
import { useLanguageStore } from "../stores/language-store";
import { LanguagePicker } from "./language-picker";

describe("LanguagePicker", () => {
  beforeAll(() => {
    initI18n("en");
  });

  beforeEach(() => {
    useLanguageStore.setState({ language: "en" });
  });

  it("lists all six languages by endonym", async () => {
    const { getByText } = await render(<LanguagePicker />);
    ["English", "தமிழ்", "മലയാളം", "తెలుగు", "मराठी", "हिन्दी"].forEach((name) => {
      expect(getByText(name)).toBeTruthy();
    });
  });

  it("changes the language when a row is pressed", async () => {
    const { getByRole } = await render(<LanguagePicker />);
    fireEvent.press(getByRole("button", { name: "हिन्दी" }));
    expect(useLanguageStore.getState().language).toBe("hi");
  });
});
