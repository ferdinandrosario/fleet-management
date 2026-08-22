import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    // Validate per-field and collect all errors before submitting so the user
    // sees every problem at once rather than fixing one at a time.
    const errors: Record<string, string> = {};
    if (!category) errors.category = "Category is required.";
    if (!make) errors.make = "Make is required.";
    if (!varietyId) errors.varietyId = "Variety is required.";
    if (!name.trim()) errors.name = "Display name is required.";
    if (!registrationNumber.trim()) errors.registrationNumber = "Registration number is required.";
    if (!hourlyRate || isNaN(parseFloat(hourlyRate))) errors.hourlyRate = "Enter a valid hourly rate.";
    if (!dailyRate || isNaN(parseFloat(dailyRate))) errors.dailyRate = "Enter a valid daily rate.";

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    createVehicle({
      vehicle_model_id: varietyId,
      name,
      category,
      registration_number: registrationNumber,
      hourly_rate_paise: Math.round(parseFloat(hourlyRate) * 100),
      daily_rate_paise: Math.round(parseFloat(dailyRate) * 100),
      model_year: modelYear ? parseInt(modelYear, 10) : undefined,
    })
      .then((result) => {
        setSubmitting(false);
        if (result.ok) {
          queryClient.invalidateQueries({ queryKey: ["vehicles"] });
          navigation.goBack();
        } else {
          setFieldErrors({ _form: result.error.message });
        }
      })
      .catch(() => {
        setSubmitting(false);
        setFieldErrors({ _form: "An unexpected error occurred." });
      });
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView contentContainerClassName="p-4 gap-4">
        <Text className="text-2xl font-bold text-ink mb-2">Add Vehicle</Text>

        {fieldErrors._form ? (
          <Text className="text-sm text-danger" accessibilityLiveRegion="assertive">
            {fieldErrors._form}
          </Text>
        ) : null}

        <Select
          label="Category"
          value={category}
          options={categories}
          placeholder="Select a category"
          error={fieldErrors.category}
          onSelect={(val) => {
            setCategory(val);
            setMake("");
            setVarietyId("");
            setFieldErrors((e) => ({ ...e, category: "", make: "", varietyId: "" }));
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
              setFieldErrors((e) => ({ ...e, make: "", varietyId: "" }));
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
          error={fieldErrors.name}
        />

        <TextField
          label="Registration Number"
          value={registrationNumber}
          onChangeText={setRegistrationNumber}
          placeholder="e.g. MH12AB1234"
          autoCapitalize="words"
          error={fieldErrors.registrationNumber}
        />

        <TextField
          label="Model Year"
          value={modelYear}
          onChangeText={setModelYear}
          placeholder="e.g. 2022"
          keyboardType="numeric"
        />

        <TextField
          label="Hourly Rate (₹)"
          value={hourlyRate}
          onChangeText={setHourlyRate}
          placeholder="e.g. 500"
          keyboardType="decimal-pad"
          error={fieldErrors.hourlyRate}
        />

        <TextField
          label="Daily Rate (₹)"
          value={dailyRate}
          onChangeText={setDailyRate}
          placeholder="e.g. 4000"
          keyboardType="decimal-pad"
          error={fieldErrors.dailyRate}
        />

        <View className="mt-4">
          <Button
            title="Save Vehicle"
            onPress={handleSubmit}
            disabled={submitting}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
