import { useColorScheme } from "nativewind";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Text, View } from "react-native";

import { palette } from "../../theme/tokens";

export function LoadingState() {
  const { t } = useTranslation();
  // ActivityIndicator color is a prop, not a className — resolve the brand
  // hex for the applied scheme (brighter teal in dark/black). NativeWind's
  // reactive hook so an OS flip under "system" recolors it with the rest.
  const { colorScheme } = useColorScheme();
  return (
    <View className="flex-1 items-center justify-center gap-3 p-6">
      <ActivityIndicator
        color={palette(colorScheme === "dark" ? "dark" : "light").brand}
        accessibilityRole="progressbar"
      />
      <Text className="text-base text-ink-muted">{t("states.loadingTitle")}</Text>
    </View>
  );
}
