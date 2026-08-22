import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemeToggle } from "../../components/theme-toggle";
import { Button } from "../../components/ui/button";
import type { AuthStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "Welcome">;

// One card per app persona (User.role: customer books, driver drives,
// owner_admin manages) so a first-time visitor recognizes themselves before
// being asked to sign up. Keys resolve through i18next like all copy.
const VALUE_PROPS = [
  { title: "welcome.bookTitle", body: "welcome.bookBody" },
  { title: "welcome.driveTitle", body: "welcome.driveBody" },
  { title: "welcome.manageTitle", body: "welcome.manageBody" },
] as const;

// First-run / unauthenticated landing — the store-download-to-signup bridge:
// brand + tagline, the three persona value props, language choice (kept
// before the buttons: picking a language re-renders everything above and
// below it), then sign in or create an account.
export function WelcomeScreen({ navigation }: Props) {
  const { t } = useTranslation();
  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView className="flex-1">
        <View className="gap-6 p-4">
          <View className="gap-2 pt-4">
            <Text className="text-3xl font-semibold text-brand">{t("common.appName")}</Text>
            <Text className="text-base text-ink-muted">{t("welcome.tagline")}</Text>
          </View>
          <View className="gap-3">
            {VALUE_PROPS.map(({ title, body }) => (
              <View key={title} className="gap-1 rounded-card bg-surface-muted p-4">
                <View className="flex-row items-center gap-2">
                  <View className="h-2 w-2 rounded-full bg-brand" accessible={false} importantForAccessibility="no" />
                  <Text className="text-base font-medium text-ink">{t(title)}</Text>
                </View>
                <Text className="text-sm text-ink-muted">{t(body)}</Text>
              </View>
            ))}
          </View>
          <View className="gap-3">
            <Button title={t("auth.signIn")} onPress={() => navigation.navigate("Login")} />
            <Button
              title={t("auth.createAccount")}
              variant="ghost"
              onPress={() => navigation.navigate("Register")}
            />
            <ThemeToggle />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
