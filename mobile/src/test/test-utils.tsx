import type { ReactElement } from "react";

import { render } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Fixed safe-area metrics so screens using SafeAreaView render without a device.
const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

export function renderWithProviders(ui: ReactElement) {
  return render(<SafeAreaProvider initialMetrics={initialMetrics}>{ui}</SafeAreaProvider>);
}
