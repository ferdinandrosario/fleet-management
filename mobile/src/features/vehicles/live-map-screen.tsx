import React from "react";
import { View, StyleSheet, Text } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Button } from "../../components/ui/button";

export function LiveMapScreen() {
  const navigation = useNavigation();
  
  // Coordinates for Manaparai, Tiruchirappalli, Tamil Nadu
  const initialRegion = {
    latitude: 10.6094,
    longitude: 78.4119,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };


  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Live GPS Map</Text>
        <Button title="Back" variant="ghost" onPress={() => navigation.goBack()} />
      </View>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={initialRegion}
        userInterfaceStyle="dark"
      >
        {/* Real telemetry points will go here */}
      </MapView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // Slate 900
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '600',
  },
  map: {
    flex: 1,
  },
});
