import AsyncStorage from "@react-native-async-storage/async-storage";
import { colorScheme } from "nativewind";

import { resolveScheme, THEME_MODES, useThemeStore } from "./theme-store";

// NativeWind's imperative API is mocked so apply() can be asserted without a
// real RN runtime; `vars` passes its input through so blackThemeVars stays a
// plain inspectable object. AsyncStorage uses the official in-memory mock
// wired up in jest.setup.ts.
jest.mock("nativewind", () => ({
  colorScheme: { set: jest.fn() },
  vars: (input: Record<string, string>) => input,
}));

const setColorScheme = colorScheme.set as jest.Mock;

describe("theme store", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    setColorScheme.mockClear();
    useThemeStore.setState({ mode: "system" });
  });

  it("THEME_MODES lists the four modes in cycle order", () => {
    expect(THEME_MODES).toEqual(["light", "dark", "black", "system"]);
  });

  it("defaults to system", () => {
    expect(useThemeStore.getState().mode).toBe("system");
  });

  it("setMode persists an explicit mode and drives the color scheme", async () => {
    useThemeStore.getState().setMode("dark");
    expect(useThemeStore.getState().mode).toBe("dark");
    expect(setColorScheme).toHaveBeenCalledWith("dark");
    expect(await AsyncStorage.getItem("fm.theme")).toBe("dark");
  });

  it("maps black onto the dark scheme (NativeWind has no black)", async () => {
    useThemeStore.getState().setMode("black");
    expect(useThemeStore.getState().mode).toBe("black");
    expect(setColorScheme).toHaveBeenCalledWith("dark");
    expect(await AsyncStorage.getItem("fm.theme")).toBe("black");
  });

  it("setMode(system) clears storage", async () => {
    useThemeStore.getState().setMode("dark");
    useThemeStore.getState().setMode("system");
    expect(await AsyncStorage.getItem("fm.theme")).toBeNull();
    expect(setColorScheme).toHaveBeenLastCalledWith("system");
  });

  it("restore rehydrates a stored mode", async () => {
    await AsyncStorage.setItem("fm.theme", "black");
    await useThemeStore.getState().restore();
    expect(useThemeStore.getState().mode).toBe("black");
    expect(setColorScheme).toHaveBeenCalledWith("dark");
  });

  it("restore falls back to system for an unknown value", async () => {
    await AsyncStorage.setItem("fm.theme", "neon");
    await useThemeStore.getState().restore();
    expect(useThemeStore.getState().mode).toBe("system");
  });

  it("resolveScheme maps explicit modes and defers system to the OS", () => {
    expect(resolveScheme("light")).toBe("light");
    expect(resolveScheme("dark")).toBe("dark");
    expect(resolveScheme("black")).toBe("dark");
    // jest's RN preset reports no OS scheme -> light.
    expect(resolveScheme("system")).toBe("light");
  });
});
