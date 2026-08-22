import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import { useEffect } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { LoadingState } from "./src/components/states/loading-state";
import { LoginScreen } from "./src/features/auth/login-screen";
import { OtpScreen } from "./src/features/auth/otp-screen";
import { RegisterScreen } from "./src/features/auth/register-screen";
import { HomeScreen } from "./src/features/home/home-screen";
import { WelcomeScreen } from "./src/features/welcome/welcome-screen";
import { AddVehicleScreen } from "./src/features/vehicles/add-vehicle-screen";
import { LiveMapScreen } from "./src/features/vehicles/live-map-screen";
import { bootstrap } from "./src/lib/bootstrap";
import type { AppStackParamList, AuthStackParamList } from "./src/navigation/types";
import { palette } from "./src/theme/tokens";
import { useAuthStore } from "./src/stores/auth-store";
import { blackThemeVars, useThemeStore } from "./src/stores/theme-store";

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
      <AppStack.Screen name="AddVehicle" component={AddVehicleScreen} />
      <AppStack.Screen name="LiveMap" component={LiveMapScreen} />
    </AppStack.Navigator>
  );
}

export default function App() {
  const status = useAuthStore((state) => state.status);
  const restore = useAuthStore((state) => state.restore);
  const themeMode = useThemeStore((state) => state.mode);
  const restoreTheme = useThemeStore((state) => state.restore);

  // Rehydrate the session from secure storage — and the theme choice from
  // AsyncStorage — on launch, so the loading state already renders in the
  // chosen scheme.
  useEffect(() => {
    restore();
    void restoreTheme();
  }, [restore, restoreTheme]);

  // Non-className surfaces follow the applied scheme: navigation's
  // background (kills the white flash between screens in dark), the status
  // bar icons, and — in black mode — the root View that re-anchors
  // --surface to true #000 for every descendant. NativeWind's reactive
  // hook (not Appearance.getColorScheme()) so an OS light↔dark flip while
  // the mode is "system" re-renders these along with every className.
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme === "dark" ? "dark" : "light";
  const navTheme = scheme === "dark" ? DarkTheme : DefaultTheme;
  const navBackground =
    themeMode === "black" ? "#000000" : palette(scheme).surface;

  return (
    <View className="flex-1" style={themeMode === "black" ? blackThemeVars : undefined}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer
            theme={{
              ...navTheme,
              colors: { ...navTheme.colors, background: navBackground },
            }}
          >
            {status === "loading" ? (
              <LoadingState />
            ) : status === "authenticated" ? (
              <AppNavigator />
            ) : (
              <AuthNavigator />
            )}
          </NavigationContainer>
          <StatusBar style={scheme === "dark" ? "light" : "dark"} />
        </QueryClientProvider>
      </SafeAreaProvider>
    </View>
  );
}
