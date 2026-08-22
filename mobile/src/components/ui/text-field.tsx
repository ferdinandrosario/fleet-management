import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { useColorScheme } from "nativewind";

import { palette } from "../../theme/tokens";

export type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "phone-pad" | "numeric" | "decimal-pad";
  autoCapitalize?: "none" | "words";
  /** Inline validation error rendered below the input; mirrors the web Input component. */
  error?: string;
};

// Owned labeled input. The label doubles as the accessibility label.
// Focus border: resolves brand hex from the token palette so the active-field
// highlight stays correct across light / dark / AMOLED. Placeholder colour
// uses inkMuted from the same palette (replaces the hardcoded #94a3b8 hex).
// Error border: uses danger hex so the invalid state is immediately visible.
export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  error,
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const { colorScheme } = useColorScheme();
  const colors = palette(colorScheme === "dark" ? "dark" : "light");

  // Priority: error > focused > default. Keeps the invalid border visible even
  // when the field regains focus so the user always knows what to fix.
  const borderColor = error ? colors.danger : focused ? colors.brand : colors.line;

  return (
    <View className="gap-1">
      <Text className="text-base text-ink">{label}</Text>
      <TextInput
        accessibilityLabel={label}
        aria-invalid={Boolean(error)}
        className="min-h-touch rounded-card border px-4 text-base text-ink"
        style={{ borderColor }}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={colors.inkMuted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
      {error ? (
        <Text className="text-sm text-danger" accessibilityLiveRegion="assertive">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
