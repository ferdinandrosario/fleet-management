import { deviceLanguage, initI18n, isSupported, resources, SUPPORTED_LANGUAGES } from "./i18n";

describe("i18n", () => {
  it("declares the English locale", () => {
    expect(SUPPORTED_LANGUAGES).toEqual(["en"]);
    expect(Object.keys(resources)).toEqual(["en"]);
  });

  it("recognizes supported codes and rejects the rest", () => {
    expect(isSupported("en")).toBe(true);
    expect(isSupported("hi")).toBe(false);
    expect(isSupported("fr")).toBe(false);
    expect(isSupported(null)).toBe(false);
  });

  it("defaults the device language to en (mocked en-US device)", () => {
    expect(deviceLanguage()).toBe("en");
  });

  it("falls back to en when the device locale is unsupported", () => {
    // `require` returns the real mocked module (an `import *` interop copy
    // wouldn't be the object i18n.ts reads), so the spy actually takes effect.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const localization = require("expo-localization");
    const spy = jest
      .spyOn(localization, "getLocales")
      .mockReturnValue([{ languageCode: "fr", languageTag: "fr-FR" }]);
    expect(deviceLanguage()).toBe("en");
    spy.mockRestore();
  });

  it("initializes and translates in English", () => {
    const i18n = initI18n("en");
    expect(i18n.isInitialized).toBe(true);
    expect(i18n.t("common.retry")).toBe("Retry");
    expect(i18n.t("common.cancel")).toBe("Cancel");
  });

  it("is idempotent on a second init", () => {
    expect(() => initI18n("en")).not.toThrow();
  });
});
