import { useTranslation } from "react-i18next";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LanguagePicker } from "../../components/language-picker";

// First-run / unauthenticated landing. Surfaces the language picker up front
// (mobile/AGENTS.md: language choice at first run). Auth screens land Session 3.
export function WelcomeScreen() {
  const { t } = useTranslation();
  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView className="flex-1">
        <View className="gap-6 p-4">
          <Text className="text-2xl font-medium text-brand">{t("common.appName")}</Text>
          <LanguagePicker />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
