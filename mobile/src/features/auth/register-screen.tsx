import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../../components/ui/button";
import { TextField } from "../../components/ui/text-field";
import type { AuthStackParamList } from "../../navigation/types";
import { useAuthStore } from "../../stores/auth-store";
import { useRegister } from "./use-auth";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

export function RegisterScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const setTenant = useAuthStore((state) => state.setTenant);
  const register = useRegister();
  const [tenant, setTenantValue] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const submit = async () => {
    await setTenant(tenant.trim());
    const phoneValue = phone.trim();
    register.mutate(
      { name: name.trim(), phone: phoneValue, password },
      { onSuccess: (res) => res.ok && navigation.navigate("Otp", { phone: phoneValue }) },
    );
  };

  const failed = Boolean(register.data && !register.data.ok);

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView className="flex-1">
        <View className="gap-4 p-4">
          <Text className="text-2xl font-medium text-brand">{t("auth.registerTitle")}</Text>
          <TextField label={t("auth.businessCode")} value={tenant} onChangeText={setTenantValue} />
          <TextField label={t("auth.name")} value={name} onChangeText={setName} autoCapitalize="words" />
          <TextField label={t("auth.phone")} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <TextField label={t("auth.password")} value={password} onChangeText={setPassword} secureTextEntry />
          {failed ? <Text className="text-base text-danger">{t("auth.failed")}</Text> : null}
          <Button title={t("auth.createAccount")} onPress={submit} />
          <Button title={t("auth.toLogin")} variant="ghost" onPress={() => navigation.navigate("Login")} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
