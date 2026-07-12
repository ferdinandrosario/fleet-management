import AsyncStorage from "@react-native-async-storage/async-storage";
import { colorScheme, vars } from "nativewind";
import { create } from "zustand";

// Global theme state (light / dark / black / system), following the
// language-store pattern. Persisted in AsyncStorage — a UI preference is
// non-sensitive, so the Keychain-backed expo-secure-store (reserved for
// tokens) is the wrong tool. Light/dark/system drive NativeWind's
// imperative colorScheme API (the `.dark:root` variables in global.css);
// "black" is the AMOLED variant of dark: NativeWind's scheme only knows
// light/dark/system, so black rides the dark scheme (every `dark:` class
// still applies) and App.tsx re-anchors the page canvas to true black —
// unlit pixels on OLED panels — by putting `blackThemeVars` on the root
// View. Mirrors personal_manager's web/mobile black theme mechanics.

const STORAGE_KEY = "fm.theme";

export type ThemeMode = "light" | "dark" | "black" | "system";

// Ordered for the toggle's cycle: light → dark → black → system → light.
export const THEME_MODES: ThemeMode[] = ["light", "dark", "black", "system"];

// Only the canvas moves to #000; surface-muted cards and the rest of the
// dark ladder keep their values and float visibly above it.
export const blackThemeVars = vars({ "--surface": "0 0% 0%" });

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "light" || value === "dark" || value === "black" || value === "system";
}

function apply(mode: ThemeMode): void {
  colorScheme.set(mode === "black" ? "dark" : mode);
}

// Non-className APIs (StatusBar, navigation theme, spinners) read the
// APPLIED scheme reactively via NativeWind's useColorScheme() hook — not a
// helper here — so an OS light↔dark flip while the mode is "system"
// re-renders them along with every className. "system" can never resolve
// to black: the OS only knows light/dark, so black is always explicit.

type ThemeState = {
  mode: ThemeMode;
  // Rehydrate the persisted choice at app start (App.tsx effect).
  restore: () => Promise<void>;
  setMode: (mode: ThemeMode) => void;
};

export const useThemeStore = create<ThemeState>((set) => ({
  mode: "system",
  restore: async () => {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const mode = isThemeMode(stored) ? stored : "system";
    apply(mode);
    set({ mode });
  },
  setMode: (mode) => {
    if (mode === "system") void AsyncStorage.removeItem(STORAGE_KEY);
    else void AsyncStorage.setItem(STORAGE_KEY, mode);
    apply(mode);
    set({ mode });
  },
}));
