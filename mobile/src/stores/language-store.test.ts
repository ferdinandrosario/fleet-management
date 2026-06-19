import i18n, { initI18n } from "../lib/i18n";
import { useLanguageStore } from "./language-store";

describe("language store", () => {
  beforeAll(() => {
    initI18n("en");
  });

  beforeEach(() => {
    useLanguageStore.setState({ language: "en" });
    i18n.changeLanguage("en");
  });

  it("defaults to the device language (en in tests)", () => {
    expect(useLanguageStore.getState().language).toBe("en");
  });

  it("setLanguage updates both the store and i18n", () => {
    useLanguageStore.getState().setLanguage("hi");
    expect(useLanguageStore.getState().language).toBe("hi");
    expect(i18n.language).toBe("hi");
  });
});
