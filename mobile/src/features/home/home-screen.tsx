import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemeToggle } from "../../components/theme-toggle";
import { Button } from "../../components/ui/button";
import { useLogout } from "../auth/use-auth";

// Authenticated landing placeholder — confirms role-aware routing. Real role
// dashboards (customer / driver / owner) are built from Session 5 on.
export function HomeScreen() {
  const { t } = useTranslation();
  const logout = useLogout();

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="flex-1 items-center justify-center gap-6 p-4">
        <Text className="text-xl font-medium text-ink">{t("common.appName")}</Text>
        <ThemeToggle />
        <Button title={t("auth.logout")} variant="ghost" onPress={() => logout.mutate()} />
      </View>
    </SafeAreaView>
  );
}
