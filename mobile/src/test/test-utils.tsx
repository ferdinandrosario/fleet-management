import type { ReactElement, ReactNode } from "react";
import { useState } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Fixed safe-area metrics so screens using SafeAreaView render without a device.
const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

export function Providers({ children }: { children: ReactNode }) {
  // One stable client per mount — inlining makeQueryClient() would create a new
  // one on every re-render and orphan in-flight mutations.
  const [queryClient] = useState(makeQueryClient);
  return (
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SafeAreaProvider>
  );
}

export function renderWithProviders(ui: ReactElement) {
  return render(<Providers>{ui}</Providers>);
}

// Minimal navigation/route doubles for screen tests. The real props carry dozens
// of methods the screens never touch; `as never` is a single, intentional cast.
export function navProp(navigate: jest.Mock = jest.fn()) {
  return { navigate } as never;
}

export function routeProp(params: Record<string, unknown> = {}) {
  return { params } as never;
}
