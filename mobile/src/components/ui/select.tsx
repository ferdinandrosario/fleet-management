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
};

export function Select({ label, value, options, onSelect, placeholder }: SelectProps) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((o) => o.value === value);

  return (
    <View className="gap-1">
      <Text className="text-base text-ink">{label}</Text>
      <TouchableOpacity
        testID={`select-${label.toLowerCase()}`}
        accessibilityLabel={label}
        className="min-h-touch justify-center rounded-card border border-line px-4 bg-white"
        onPress={() => setOpen(true)}
      >
        <Text className={cn("text-base", value ? "text-ink" : "text-[#94a3b8]")}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
      </TouchableOpacity>

      {open && (
        <Modal visible={open} transparent animationType="none">
          <View className="flex-1 justify-end bg-black/50">
            <SafeAreaView className="max-h-[70%] bg-surface rounded-t-card">
              <View className="flex-row items-center justify-between border-b border-line p-4">
                <Text className="text-lg font-medium text-ink">{label}</Text>
                <TouchableOpacity onPress={() => setOpen(false)}>
                  <Text className="text-primary text-base font-medium">Done</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={options}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    testID={`option-${item.value}`}
                    className="border-b border-line p-4"
                    onPress={() => {
                      onSelect(item.value);
                      setOpen(false);
                    }}
                  >
                    <Text
                      className={cn(
                        "text-base",
                        item.value === value ? "font-bold text-primary" : "text-ink"
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
