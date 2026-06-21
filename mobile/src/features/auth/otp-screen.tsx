import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../../components/ui/button";
import { TextField } from "../../components/ui/text-field";
import type { AuthStackParamList } from "../../navigation/types";
import { useVerifyOtp } from "./use-auth";

type Props = NativeStackScreenProps<AuthStackParamList, "Otp">;

// On success the verify hook commits the session → the auth gate routes to Home.
export function OtpScreen({ route }: Props) {
  const { t } = useTranslation();
  const { phone } = route.params;
  const verify = useVerifyOtp();
  const [code, setCode] = useState("");

  const failed = Boolean(verify.data && !verify.data.ok);

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView className="flex-1">
        <View className="gap-4 p-4">
          <Text className="text-2xl font-medium text-brand">{t("auth.verifyTitle")}</Text>
          <Text className="text-base text-ink-muted">{phone}</Text>
          <TextField label={t("auth.code")} value={code} onChangeText={setCode} keyboardType="phone-pad" />
          {failed ? <Text className="text-base text-danger">{t("auth.failed")}</Text> : null}
          <Button title={t("auth.verify")} onPress={() => verify.mutate({ phone, code: code.trim() })} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
