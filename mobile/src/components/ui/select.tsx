import React, { useState } from "react";
import { Modal, Text, TouchableOpacity, View, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { cn } from "../../lib/utils";

export type SelectOption = {
  label: string;
  value: string;
};

export type SelectProps = {
  label: string;
  value: string;
  options: SelectOption[];
  onSelect: (value: string) => void;
  placeholder?: string;
  /** Inline validation error rendered below the trigger; mirrors TextField. */
  error?: string;
};

export function Select({ label, value, options, onSelect, placeholder, error }: SelectProps) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((o) => o.value === value);

  return (
    <View className="gap-1">
      <Text className="text-base text-ink">{label}</Text>
      <TouchableOpacity
        testID={`select-${label.toLowerCase()}`}
        accessibilityLabel={label}
        // bg-surface instead of bg-white: respects dark / AMOLED theme.
        className={`min-h-touch justify-center rounded-card border px-4 bg-surface ${
          error ? 'border-danger' : 'border-line'
        }`}
        onPress={() => setOpen(true)}
      >
        {/* text-ink-muted instead of the hardcoded #94a3b8 hex. */}
        <Text className={cn("text-base", value ? "text-ink" : "text-ink-muted")}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
      </TouchableOpacity>
      {error ? (
        <Text className="text-sm text-danger" accessibilityLiveRegion="assertive">
          {error}
        </Text>
      ) : null}

      {open && (
        <Modal visible={open} transparent animationType="slide">
          <View className="flex-1 justify-end bg-black/50">
            <SafeAreaView className="max-h-[70%] bg-surface rounded-t-card">
              <View className="flex-row items-center justify-between border-b border-line p-4">
                <Text className="text-lg font-medium text-ink">{label}</Text>
                {/* accessibilityRole + accessibilityLabel so screen-reader users can close the picker. */}
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Dismiss picker"
                  onPress={() => setOpen(false)}
                >
                  {/* text-brand instead of the undefined text-primary token. */}
                  <Text className="text-brand text-base font-medium">Done</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={options}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    testID={`option-${item.value}`}
                    accessibilityRole="menuitem"
                    className="border-b border-line p-4"
                    onPress={() => {
                      onSelect(item.value);
                      setOpen(false);
                    }}
                  >
                    {/* text-brand instead of the undefined text-primary token for the selected state. */}
                    <Text
                      className={cn(
                        "text-base",
                        item.value === value ? "font-bold text-brand" : "text-ink"
                      )}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </SafeAreaView>
          </View>
        </Modal>
      )}
    </View>
  );
}
