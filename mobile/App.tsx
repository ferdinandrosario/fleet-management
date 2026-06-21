import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { LoadingState } from "./src/components/states/loading-state";
import { LoginScreen } from "./src/features/auth/login-screen";
import { OtpScreen } from "./src/features/auth/otp-screen";
import { RegisterScreen } from "./src/features/auth/register-screen";
import { HomeScreen } from "./src/features/home/home-screen";
import { WelcomeScreen } from "./src/features/welcome/welcome-screen";
import { bootstrap } from "./src/lib/bootstrap";
import type { AppStackParamList, AuthStackParamList } from "./src/navigation/types";
import { useAuthStore } from "./src/stores/auth-store";

// Wire i18n + the API client once, before anything renders.
bootstrap();

const queryClient = new QueryClient();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="Otp" component={OtpScreen} />
    </AuthStack.Navigator>
  );
}

function AppNavigator() {
  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      <AppStack.Screen name="Home" component={HomeScreen} />
    </AppStack.Navigator>
  );
}

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
          ) : status === "authenticated" ? (
            <AppNavigator />
          ) : (
            <AuthNavigator />
          )}
        </NavigationContainer>
        <StatusBar style="dark" />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
