import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../../components/ui/button";
import { Select } from "../../components/ui/select";
import { TextField } from "../../components/ui/text-field";
import { createVehicle, fetchVehicleModels } from "./vehicles-client";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AppStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<AppStackParamList, "AddVehicle">;

export function AddVehicleScreen({ navigation }: Props) {
  const queryClient = useQueryClient();
  const [category, setCategory] = useState("");
  const [make, setMake] = useState("");
  const [varietyId, setVarietyId] = useState("");
  
  const [name, setName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [dailyRate, setDailyRate] = useState("");
  const [modelYear, setModelYear] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { data: modelsResult } = useQuery({
    queryKey: ["vehicle_models"],
    queryFn: fetchVehicleModels,
  });

  const catalog = modelsResult?.ok ? modelsResult.data.vehicle_models : [];

  const categories = useMemo(() => {
    const cats = Array.from(new Set(catalog.map((m) => m.category)));
    return cats.map((c) => ({ label: c, value: c }));
  }, [catalog]);

  const makes = useMemo(() => {
    if (!category) return [];
    const mks = Array.from(new Set(catalog.filter((m) => m.category === category).map((m) => m.make)));
    return mks.map((m) => ({ label: m, value: m }));
  }, [catalog, category]);

  const varieties = useMemo(() => {
    if (!category || !make) return [];
    return catalog
      .filter((m) => m.category === category && m.make === make)
      .map((m) => ({ label: m.name, value: m.id }));
  }, [catalog, category, make]);

  const mutation = useMutation({
    mutationFn: createVehicle,
    onSuccess: (result) => {
      if (result.ok) {
        queryClient.invalidateQueries({ queryKey: ["vehicles"] });
        navigation.goBack();
      } else {
        setErrorMsg(result.error.message);
      }
    },
  });

  const handleSubmit = () => {
    setErrorMsg("");
    if (!varietyId || !name || !registrationNumber || !hourlyRate || !dailyRate) {
      setErrorMsg("Please fill all required fields.");
      return;
    }
    mutation.mutate({
      vehicle_model_id: varietyId,
      name,
      category,
      registration_number: registrationNumber,
      hourly_rate_cents: parseInt(hourlyRate, 10) * 100,
      daily_rate_cents: parseInt(dailyRate, 10) * 100,
      model_year: modelYear ? parseInt(modelYear, 10) : undefined,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView contentContainerClassName="p-4 gap-4">
        <Text className="text-2xl font-bold text-ink mb-2">Add Vehicle</Text>

        {errorMsg ? <Text className="text-red-500 mb-2">{errorMsg}</Text> : null}

        <Select
          label="Category"
          value={category}
          options={categories}
          placeholder="Select a category"
          onSelect={(val) => {
            setCategory(val);
            setMake("");
            setVarietyId("");
          }}
        />

        {category ? (
          <Select
            label="Make"
            value={make}
            options={makes}
            placeholder="Select a make"
            onSelect={(val) => {
              setMake(val);
              setVarietyId("");
            }}
          />
        ) : null}

        {make ? (
          <Select
            label="Variety"
            value={varietyId}
            options={varieties}
            placeholder="Select a variety"
            onSelect={setVarietyId}
          />
        ) : null}

        <TextField
          label="Display Name"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Tata Ace Gold #1"
        />

        <TextField
          label="Registration Number"
          value={registrationNumber}
          onChangeText={setRegistrationNumber}
          placeholder="e.g. MH12AB1234"
          autoCapitalize="words"
        />

        <TextField
          label="Model Year"
          value={modelYear}
          onChangeText={setModelYear}
          placeholder="e.g. 2022"
          keyboardType="phone-pad"
        />

        <TextField
          label="Hourly Rate (₹)"
          value={hourlyRate}
          onChangeText={setHourlyRate}
          placeholder="e.g. 500"
          keyboardType="phone-pad"
        />

        <TextField
          label="Daily Rate (₹)"
          value={dailyRate}
          onChangeText={setDailyRate}
          placeholder="e.g. 4000"
          keyboardType="phone-pad"
        />

        <View className="mt-4">
          <Button
            title="Save Vehicle"
            onPress={handleSubmit}
            disabled={mutation.isPending}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
