import { useTranslation } from "react-i18next";

import { useThemeStore, type ThemeMode } from "../stores/theme-store";
import { Button } from "./ui/button";

// Cycles the theme on each press: light → dark → black → system → light.
// Black is the AMOLED true-black variant of dark (see stores/theme-store.ts).
// The store owns persistence and the NativeWind color scheme — this
// component only renders the current choice and advances it.
const NEXT: Record<ThemeMode, ThemeMode> = {
  light: "dark",
  dark: "black",
  black: "system",
  system: "light",
};

export function ThemeToggle() {
  const { t } = useTranslation();
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);

  return (
    <Button
      title={`${t("theme.title")}: ${t(`theme.${mode}`)}`}
      variant="ghost"
      onPress={() => setMode(NEXT[mode])}
    />
  );
}
