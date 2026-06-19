import { useTranslation } from "react-i18next";
import { ActivityIndicator, Text, View } from "react-native";

import { colors } from "../../theme/tokens";

export function LoadingState() {
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center gap-3 p-6">
      <ActivityIndicator color={colors.brand} accessibilityRole="progressbar" />
      <Text className="text-base text-ink-muted">{t("states.loadingTitle")}</Text>
    </View>
  );
}
