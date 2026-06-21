import { Text, TextInput, View } from "react-native";

export type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "phone-pad";
  autoCapitalize?: "none" | "words";
};

// Owned labeled input. The label doubles as the accessibility label.
export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
}: TextFieldProps) {
  return (
    <View className="gap-1">
      <Text className="text-base text-ink">{label}</Text>
      <TextInput
        accessibilityLabel={label}
        className="min-h-touch rounded-card border border-line px-4 text-base text-ink"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );
}
