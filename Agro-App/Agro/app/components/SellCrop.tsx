import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown";

import { cropData } from "../data/cropData";

type FormState = {
  imageUri: string;
  cropName: string;
  cropVariety: string;
  quantity: string;
  quantityUnit: string;
  expectedPrice: string;
  readyDate: string;
  farmerName: string;
  mobileNumber: string;
  email: string;
  description: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

type DropdownOption = {
  label: string;
  value: string;
};

const unitOptions: DropdownOption[] = [
  { label: "Kilogram (kg)", value: "kg" },
  { label: "Quintal", value: "quintal" },
  { label: "Ton", value: "ton" },
];

const initialForm: FormState = {
  imageUri: "",
  cropName: "",
  cropVariety: "",
  quantity: "",
  quantityUnit: "",
  expectedPrice: "",
  readyDate: "",
  farmerName: "",
  mobileNumber: "",
  email: "",
  description: "",
};

const formatLocalDate = (date: Date) => {
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
};

const getUnitLabel = (value: string) => {
  const item = unitOptions.find((unit) => unit.value === value);
  return item ? item.label : "unit";
};

const FieldLabel = ({ label, required = false }: { label: string; required?: boolean }) => (
  <Text className="mb-2 text-sm font-semibold text-gray-700">
    {label}
    {required ? <Text className="text-red-500"> *</Text> : null}
  </Text>
);

export default function SellCrop() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [submitError, setSubmitError] = useState("");

  const cropOptions = useMemo<DropdownOption[]>(() => {
    return cropData.map((crop) => ({ label: crop, value: crop }));
  }, []);

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setSubmitError("");
    setSubmitSuccess("");
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.status !== "granted") {
      Alert.alert("Permission required", "Please allow access to your photos to upload a crop image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      updateField("imageUri", result.assets[0].uri);
    }
  };

  const validateForm = () => {
    const nextErrors: FormErrors = {};

    if (!form.imageUri.trim()) nextErrors.imageUri = "Please select a crop image.";
    if (!form.cropName.trim()) nextErrors.cropName = "Please select a crop.";

    const quantity = Number(form.quantity);
    if (!form.quantity.trim() || !Number.isFinite(quantity) || quantity <= 0) {
      nextErrors.quantity = "Quantity must be greater than zero.";
    }

    if (!form.quantityUnit.trim()) nextErrors.quantityUnit = "Please select a quantity unit.";

    const expectedPrice = Number(form.expectedPrice);
    if (!form.expectedPrice.trim() || !Number.isFinite(expectedPrice) || expectedPrice <= 0) {
      nextErrors.expectedPrice = "Expected price must be greater than zero.";
    }

    if (!form.readyDate.trim()) nextErrors.readyDate = "Please select the harvest date.";
    if (!form.farmerName.trim()) nextErrors.farmerName = "Farmer name is required.";

    if (!/^[0-9]{10}$/.test(form.mobileNumber.trim())) {
      nextErrors.mobileNumber = "Please enter a valid 10-digit mobile number.";
    }

    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }

    return nextErrors;
  };

  const getWeather = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,rain,wind_speed_10m,weather_code&hourly=precipitation_probability&timezone=auto`
      );
      return await response.json();
    } catch (error) {
      console.log("Weather fetch failed:", error);
      return null;
    }
  };

  const handleSubmit = async () => {
    const nextErrors = validateForm();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setSubmitSuccess("");
      setSubmitError("Please complete all required fields correctly.");
      return;
    }

    setLoading(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      const latitudeValue = await AsyncStorage.getItem("latitude");
      const longitudeValue = await AsyncStorage.getItem("longitude");

      const latitude = Number(latitudeValue ?? 0);
      const longitude = Number(longitudeValue ?? 0);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        throw new Error("Your location is not available. Please enable device location and try again.");
      }

      await AsyncStorage.setItem("latitude", latitude.toString());
      await AsyncStorage.setItem("longitude", longitude.toString());

      await getWeather(latitude, longitude);

      const payload = {
        cropName: form.cropName.trim(),
        cropVariety: form.cropVariety.trim(),
        quantity: Number(form.quantity),
        quantityUnit: form.quantityUnit,
        expectedPrice: Number(form.expectedPrice),
        readyDate: form.readyDate,
        farmerName: form.farmerName.trim(),
        mobileNumber: form.mobileNumber.trim(),
        email: form.email.trim(),
        description: form.description.trim(),
        imageUri: form.imageUri,
        latitude,
        longitude,
      };

      console.log("Crop for sale payload:", payload);

      await new Promise((resolve) => setTimeout(resolve, 1200));

      setSubmitSuccess("Crop posted successfully. Buyers can now view your listing.");
      handleReset();
    } catch (error: any) {
      console.log("Crop posting failed:", error);
      setSubmitError(error?.message || "Unable to post the crop right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setErrors({});
    setSubmitError("");
    setSubmitSuccess("");
    setSelectedDate(new Date());
    setShowDatePicker(false);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-green-50"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 36 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-5 rounded-3xl bg-gradient-to-br from-green-700 via-emerald-600 to-lime-500 p-5 shadow-sm shadow-green-900/20">
          <Text className="text-3xl font-extrabold text-white">Sell Your Crop</Text>
          <Text className="mt-2 text-sm text-green-50">Post your crop and connect with buyers.</Text>
        </View>

        <View className="rounded-3xl border border-green-200 bg-white p-4 shadow-sm shadow-green-100">
          <View className="mb-5 flex-row items-center">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-2xl bg-green-100">
              <MaterialCommunityIcons name="sprout" size={22} color="#15803d" />
            </View>
            <View>
              <Text className="text-lg font-bold text-green-800">Crop Listing Details</Text>
              <Text className="text-xs text-gray-500">Add your crop details and contact information</Text>
            </View>
          </View>

          <View className="space-y-4">
            <View>
              <FieldLabel label="Crop Image" required />
              <Pressable
                onPress={pickImage}
                className="items-center justify-center rounded-2xl border border-dashed border-green-300 bg-green-50 p-4"
              >
                {form.imageUri ? (
                  <Image source={{ uri: form.imageUri }} className="h-40 w-full rounded-2xl" resizeMode="cover" />
                ) : (
                  <View className="items-center py-2">
                    <MaterialCommunityIcons name="image-plus" size={34} color="#15803d" />
                    <Text className="mt-2 text-base font-semibold text-green-700">Select crop image</Text>
                    <Text className="mt-1 text-xs text-gray-500">Tap to upload a photo</Text>
                  </View>
                )}
              </Pressable>
              {errors.imageUri ? <Text className="mt-2 text-xs text-red-500">{errors.imageUri}</Text> : null}
            </View>

            <View>
              <FieldLabel label="Crop Name" required />
              <Dropdown
                data={cropOptions}
                labelField="label"
                valueField="value"
                value={form.cropName}
                search
                searchPlaceholder="Search crop"
                placeholder="Select crop"
                maxHeight={260}
                onChange={(item: DropdownOption) => updateField("cropName", item.value)}
                style={{
                  borderWidth: 1,
                  borderColor: errors.cropName ? "#ef4444" : "#bbf7d0",
                  borderRadius: 14,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  backgroundColor: "#fff",
                }}
                placeholderStyle={{ color: "#6b7280" }}
                selectedTextStyle={{ color: "#065f46", fontWeight: "600" }}
                itemTextStyle={{ color: "#111827" }}
              />
              {errors.cropName ? <Text className="mt-2 text-xs text-red-500">{errors.cropName}</Text> : null}
            </View>

            <View>
              <FieldLabel label="Crop Variety" />
              <TextInput
                value={form.cropVariety}
                onChangeText={(value) => updateField("cropVariety", value)}
                placeholder="e.g. Hybrid, Desi, Red variety"
                className="rounded-2xl border border-green-200 bg-white px-4 py-3 text-base text-gray-800"
                autoCapitalize="words"
              />
            </View>

            <View className="flex-row items-start gap-3">
              <View className="flex-1">
                <FieldLabel label="Quantity" required />
                <TextInput
                  value={form.quantity}
                  onChangeText={(value) => updateField("quantity", value.replace(/[^0-9.]/g, ""))}
                  placeholder="e.g. 250"
                  keyboardType="numeric"
                  className="rounded-2xl border border-green-200 bg-white px-4 py-3 text-base text-gray-800"
                />
                {errors.quantity ? <Text className="mt-2 text-xs text-red-500">{errors.quantity}</Text> : null}
              </View>

              <View className="w-36">
                <FieldLabel label="Unit" required />
                <Dropdown
                  data={unitOptions}
                  labelField="label"
                  valueField="value"
                  value={form.quantityUnit}
                  placeholder="Select"
                  maxHeight={200}
                  onChange={(item: DropdownOption) => updateField("quantityUnit", item.value)}
                  style={{
                    borderWidth: 1,
                    borderColor: errors.quantityUnit ? "#ef4444" : "#bbf7d0",
                    borderRadius: 14,
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                    backgroundColor: "#fff",
                  }}
                  placeholderStyle={{ color: "#6b7280" }}
                  selectedTextStyle={{ color: "#065f46", fontWeight: "600" }}
                  itemTextStyle={{ color: "#111827" }}
                />
                {errors.quantityUnit ? <Text className="mt-2 text-xs text-red-500">{errors.quantityUnit}</Text> : null}
              </View>
            </View>

            <View>
              <FieldLabel label="Expected Price" required />
              <TextInput
                value={form.expectedPrice}
                onChangeText={(value) => updateField("expectedPrice", value.replace(/[^0-9.]/g, ""))}
                placeholder="e.g. 3200"
                keyboardType="numeric"
                className="rounded-2xl border border-green-200 bg-white px-4 py-3 text-base text-gray-800"
              />
              <Text className="mt-2 text-xs text-gray-500">
                Price is for the selected quantity unit: {form.quantityUnit ? getUnitLabel(form.quantityUnit) : "unit"}
              </Text>
              {errors.expectedPrice ? <Text className="mt-2 text-xs text-red-500">{errors.expectedPrice}</Text> : null}
            </View>

            <View>
              <FieldLabel label="Ready / Harvest Date" required />
              <Pressable
                onPress={() => setShowDatePicker(true)}
                className="flex-row items-center justify-between rounded-2xl border border-green-200 bg-white px-4 py-3"
              >
                <Text className={form.readyDate ? "text-gray-800" : "text-gray-400"}>
                  {form.readyDate ? new Date(form.readyDate).toLocaleDateString() : "Select harvest date"}
                </Text>
                <MaterialCommunityIcons name="calendar-range" size={20} color="#15803d" />
              </Pressable>
              {showDatePicker ? (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  minimumDate={new Date()}
                  display="default"
                  onChange={(_, date) => {
                    if (date) {
                      const formattedDate = formatLocalDate(date);
                      setSelectedDate(date);
                      updateField("readyDate", formattedDate);
                    }
                    setShowDatePicker(false);
                  }}
                />
              ) : null}
              {errors.readyDate ? <Text className="mt-2 text-xs text-red-500">{errors.readyDate}</Text> : null}
            </View>

            <View>
              <FieldLabel label="Farmer Name" required />
              <TextInput
                value={form.farmerName}
                onChangeText={(value) => updateField("farmerName", value)}
                placeholder="Enter farmer name"
                className="rounded-2xl border border-green-200 bg-white px-4 py-3 text-base text-gray-800"
                autoCapitalize="words"
              />
              {errors.farmerName ? <Text className="mt-2 text-xs text-red-500">{errors.farmerName}</Text> : null}
            </View>

            <View>
              <FieldLabel label="Mobile Number" required />
              <TextInput
                value={form.mobileNumber}
                onChangeText={(value) => updateField("mobileNumber", value.replace(/[^0-9]/g, "").slice(0, 10))}
                placeholder="Enter 10-digit mobile number"
                keyboardType="phone-pad"
                maxLength={10}
                className="rounded-2xl border border-green-200 bg-white px-4 py-3 text-base text-gray-800"
              />
              {errors.mobileNumber ? <Text className="mt-2 text-xs text-red-500">{errors.mobileNumber}</Text> : null}
            </View>

            <View>
              <FieldLabel label="Email" />
              <TextInput
                value={form.email}
                onChangeText={(value) => updateField("email", value)}
                placeholder="Enter email address"
                keyboardType="email-address"
                autoCapitalize="none"
                className="rounded-2xl border border-green-200 bg-white px-4 py-3 text-base text-gray-800"
              />
              {errors.email ? <Text className="mt-2 text-xs text-red-500">{errors.email}</Text> : null}
            </View>

            <View>
              <FieldLabel label="Description" />
              <TextInput
                value={form.description}
                onChangeText={(value) => updateField("description", value)}
                placeholder="Describe freshness, quality, organic farming, storage condition, and harvest details."
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                className="min-h-[120px] rounded-2xl border border-green-200 bg-white px-4 py-3 text-base text-gray-800"
              />
            </View>
          </View>

          {submitError ? (
            <View className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
              <Text className="text-sm font-medium text-red-600">{submitError}</Text>
            </View>
          ) : null}

          {submitSuccess ? (
            <View className="mt-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3">
              <Text className="text-sm font-medium text-green-700">{submitSuccess}</Text>
            </View>
          ) : null}

          <View className="mt-6 flex-row gap-3">
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              className={`flex-1 rounded-2xl px-4 py-3 ${loading ? "bg-green-300" : "bg-green-700"}`}
            >
              <Text className="text-center text-base font-bold text-white">
                {loading ? "Posting..." : "Post Crop for Sale"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleReset}
              className="rounded-2xl border border-green-200 bg-white px-4 py-3"
            >
              <Text className="text-base font-bold text-green-700">Reset</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
