import React from "react";
import { View, Text } from "react-native";
import MapView, { PROVIDER_DEFAULT } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useColorScheme } from "nativewind";

import { Button } from "../../components/ui/button";

// Coordinates for Manaparai, Tiruchirappalli, Tamil Nadu.
const INITIAL_REGION = {
  latitude: 10.6094,
  longitude: 78.4119,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
} as const;

export function LiveMapScreen() {
  const navigation = useNavigation();
  // Map's built-in tile style tracks the active scheme so the header surface
  // and the map canvas stay visually consistent across light / dark / AMOLED.
  const { colorScheme } = useColorScheme();

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <Text className="text-lg font-semibold text-ink">Live GPS Map</Text>
        <Button title="Back" variant="ghost" onPress={() => navigation.goBack()} />
      </View>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={{ flex: 1 }}
        initialRegion={INITIAL_REGION}
        userInterfaceStyle={colorScheme === "dark" ? "dark" : "light"}
      >
        {/* Real telemetry points will go here */}
      </MapView>
    </SafeAreaView>
  );
}
