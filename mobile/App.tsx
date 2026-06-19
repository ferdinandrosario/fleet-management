import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { LoadingState } from "./src/components/states/loading-state";
import { HomeScreen } from "./src/features/home/home-screen";
import { WelcomeScreen } from "./src/features/welcome/welcome-screen";
import { bootstrap } from "./src/lib/bootstrap";
import { useAuthStore } from "./src/stores/auth-store";

// Wire i18n + the API client once, before anything renders.
bootstrap();

const queryClient = new QueryClient();
const Stack = createNativeStackNavigator();

export default function App() {
  const status = useAuthStore((state) => state.status);
  const restore = useAuthStore((state) => state.restore);

  // Rehydrate the session from secure storage on launch.
  useEffect(() => {
    restore();
  }, [restore]);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          {status === "loading" ? (
            <LoadingState />
          ) : (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {status === "authenticated" ? (
                <Stack.Screen name="Home" component={HomeScreen} />
              ) : (
                <Stack.Screen name="Welcome" component={WelcomeScreen} />
              )}
            </Stack.Navigator>
          )}
        </NavigationContainer>
        <StatusBar style="dark" />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
