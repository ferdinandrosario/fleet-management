import { useTranslation } from "react-i18next";
import { ActivityIndicator, Text, View } from "react-native";

import { resolveScheme, useThemeStore } from "../../stores/theme-store";
import { palette } from "../../theme/tokens";

export function LoadingState() {
  const { t } = useTranslation();
  // ActivityIndicator color is a prop, not a className — resolve the brand
  // hex for the active scheme (brighter teal in dark/black).
  const mode = useThemeStore((state) => state.mode);
  return (
    <View className="flex-1 items-center justify-center gap-3 p-6">
      <ActivityIndicator
        color={palette(resolveScheme(mode)).brand}
        accessibilityRole="progressbar"
      />
      <Text className="text-base text-ink-muted">{t("states.loadingTitle")}</Text>
    </View>
  );
}
