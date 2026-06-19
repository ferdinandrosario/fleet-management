import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

import { SUPPORTED_LANGUAGES } from "../lib/i18n";
import { cn } from "../lib/utils";
import { languageNames } from "../locales/languageNames";
import { useLanguageStore } from "../stores/language-store";

// Language picker for first-run + settings. Each row is a large touch target
// labelled with the language's endonym; the selected one is highlighted.
export function LanguagePicker() {
  const { t } = useTranslation();
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  return (
    <View className="gap-2">
      <Text className="text-lg font-medium text-ink">{t("language.title")}</Text>
      {SUPPORTED_LANGUAGES.map((code) => {
        const selected = code === language;
        return (
          <Pressable
            key={code}
            accessibilityRole="button"
            accessibilityLabel={languageNames[code]}
            accessibilityState={{ selected }}
            onPress={() => setLanguage(code)}
            className={cn(
              "min-h-touch flex-row items-center rounded-card border px-4",
              selected ? "border-brand bg-success-bg" : "border-line",
            )}
          >
            <Text className="text-base text-ink">{languageNames[code]}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
