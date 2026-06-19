import { cva } from "class-variance-authority";
import { Pressable, Text } from "react-native";

import { cn } from "../../lib/utils";

// Owned primitive (mobile/AGENTS.md). Large touch target, high contrast.
// Extend variants by editing the cva map here — never from a feature folder.
const container = cva("min-h-touch flex-row items-center justify-center rounded-card px-5", {
  variants: {
    variant: {
      primary: "bg-brand",
      danger: "bg-danger",
      ghost: "border border-line bg-transparent",
    },
    disabled: { true: "opacity-50", false: "" },
  },
  defaultVariants: { variant: "primary", disabled: false },
});

const label = cva("text-base font-medium", {
  variants: {
    variant: {
      primary: "text-ink-inverse",
      danger: "text-ink-inverse",
      ghost: "text-ink",
    },
  },
  defaultVariants: { variant: "primary" },
});

export type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: "primary" | "danger" | "ghost";
  disabled?: boolean;
};

export function Button({ title, onPress, variant = "primary", disabled = false }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className={cn(container({ variant, disabled }))}
    >
      <Text className={cn(label({ variant }))}>{title}</Text>
    </Pressable>
  );
}
