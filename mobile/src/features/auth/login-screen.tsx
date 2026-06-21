import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../../components/ui/button";
import { TextField } from "../../components/ui/text-field";
import type { AuthStackParamList } from "../../navigation/types";
import { useAuthStore } from "../../stores/auth-store";
import { useLogin } from "./use-auth";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

// On success the login hook commits the session → the auth gate routes to Home,
// so this screen only navigates sideways (to register).
export function LoginScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const setTenant = useAuthStore((state) => state.setTenant);
  const login = useLogin();
  const [tenant, setTenantValue] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const submit = async () => {
    await setTenant(tenant.trim());
    login.mutate({ phone: phone.trim(), password });
  };

  const failed = Boolean(login.data && !login.data.ok);

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView className="flex-1">
        <View className="gap-4 p-4">
          <Text className="text-2xl font-medium text-brand">{t("auth.signInTitle")}</Text>
          <TextField label={t("auth.businessCode")} value={tenant} onChangeText={setTenantValue} />
          <TextField label={t("auth.phone")} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <TextField label={t("auth.password")} value={password} onChangeText={setPassword} secureTextEntry />
          {failed ? <Text className="text-base text-danger">{t("auth.failed")}</Text> : null}
          <Button title={t("auth.signIn")} onPress={submit} />
          <Button title={t("auth.toRegister")} variant="ghost" onPress={() => navigation.navigate("Register")} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
