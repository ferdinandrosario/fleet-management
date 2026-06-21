import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LanguagePicker } from "../../components/language-picker";
import { Button } from "../../components/ui/button";
import type { AuthStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "Welcome">;

// First-run / unauthenticated landing: language choice up front, then sign in
// or create an account.
export function WelcomeScreen({ navigation }: Props) {
  const { t } = useTranslation();
  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView className="flex-1">
        <View className="gap-6 p-4">
          <Text className="text-2xl font-medium text-brand">{t("common.appName")}</Text>
          <LanguagePicker />
          <View className="gap-3">
            <Button title={t("auth.signIn")} onPress={() => navigation.navigate("Login")} />
            <Button
              title={t("auth.createAccount")}
              variant="ghost"
              onPress={() => navigation.navigate("Register")}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
