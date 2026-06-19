import { Text, View } from "react-native";

import { Button } from "../ui/button";

// Generic centered message used by the empty/error/offline states. A screen
// should always render one of loading / empty / error / offline / content —
// never a blank view (mobile/AGENTS.md UX).
export type StateMessageProps = {
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function StateMessage({ title, body, actionLabel, onAction }: StateMessageProps) {
  return (
    <View className="flex-1 items-center justify-center gap-2 p-6">
      <Text className="text-center text-lg font-medium text-ink">{title}</Text>
      {body ? <Text className="text-center text-base text-ink-muted">{body}</Text> : null}
      {actionLabel && onAction ? (
        <View className="mt-2">
          <Button title={actionLabel} onPress={onAction} variant="ghost" />
        </View>
      ) : null}
    </View>
  );
}
