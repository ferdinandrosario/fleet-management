import React, { type ReactElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Configure React testing environment for React 18/19 act support
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

// Fixed safe-area metrics so screens using SafeAreaView render without a device.
const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
        staleTime: Infinity,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>
    </SafeAreaProvider>
  );
}

export function renderWithProviders(ui: ReactElement, client = createTestQueryClient()) {
  return render(
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <QueryClientProvider client={client}>{ui}</QueryClientProvider>
    </SafeAreaProvider>
  );
}

// Minimal navigation/route doubles for screen tests. The real props carry dozens
// of methods the screens never touch; `as never` is a single, intentional cast.
export function navProp(navigate: jest.Mock = jest.fn(), goBack: jest.Mock = jest.fn()) {
  return {
    navigate,
    goBack,
    setOptions: jest.fn(),
    addListener: jest.fn(() => jest.fn()),
  } as never;
}

export function routeProp(params: Record<string, unknown> = {}) {
  return { params } as never;
}
