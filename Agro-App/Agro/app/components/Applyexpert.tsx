import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown";

import { locationData } from "../data/locationData";

type DropdownOption = {
  label: string;
  value: string;
};

const cropOptions = [
  "Rice",
  "Wheat",
  "Maize",
  "Sugarcane",
  "Cotton",
  "Groundnut",
  "Tomato",
  "Chilli",
  "Onion",
  "Potato",
  "Paddy",
  "Coconut",
  "Coffee",
  "Arecanut",
  "Banana",
  "Vegetables",
  "Pulses",
  "Fruits",
  "Mango",
  "Grapes",
];

const initialForm = {
  profilePhoto: "",
  fullName: "",
  phoneNumber: "",
  email: "",
  experience: "",
  description: "",
  aadhaarNumber: "",
  verificationStatus: "Pending",
  aadhaarFileName: "",
  certificateFileName: "",
  state: "",
  district: "",
  taluka: "",
  place: "",
};

export default function Applyexpert() {
  const [form, setForm] = useState(initialForm);
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [cropSearch, setCropSearch] = useState("");
  const [showCropOptions, setShowCropOptions] = useState(false);

  const states = locationData.states;

  const stateOptions = useMemo<DropdownOption[]>(() => {
    return states.map((name) => ({ label: name, value: name }));
  }, [states]);

  const filteredDistricts = useMemo<DropdownOption[]>(() => {
    if (form.state !== "Karnataka") return [];
    return Object.keys(locationData.karnataka).map((name) => ({
      label: name,
      value: name,
    }));
  }, [form.state]);

  const filteredTalukas = useMemo<DropdownOption[]>(() => {
    if (!form.district || form.state !== "Karnataka") return [];

    const districtData = locationData.karnataka[
      form.district as keyof typeof locationData.karnataka
    ];

    return (districtData ?? []).map((name) => ({ label: name, value: name }));
  }, [form.district, form.state]);

  const filteredPlaces = useMemo<DropdownOption[]>(() => {
    if (!form.taluka || form.state !== "Karnataka") return [];
    return [{ label: form.taluka, value: form.taluka }];
  }, [form.taluka, form.state]);

  const filteredCropOptions = useMemo(() => {
    return cropOptions.filter((crop) => {
      const matchesSearch = crop.toLowerCase().includes(cropSearch.toLowerCase());
      const notSelected = !selectedCrops.includes(crop);
      return matchesSearch && notSelected;
    });
  }, [cropSearch, selectedCrops]);

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleCrop = (crop: string) => {
    setSelectedCrops((prev) =>
      prev.includes(crop) ? prev.filter((item) => item !== crop) : [...prev, crop]
    );
  };

  const handlePhotoUpload = () => {
    setForm((prev) => ({ ...prev, profilePhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80" }));
  };

  const handleFileUpload = (type: "aadhaar" | "certificate") => {
    if (type === "aadhaar") {
      updateField("aadhaarFileName", "aadhaar-card.jpg");
    } else {
      updateField("certificateFileName", "agriculture-certificate.pdf");
    }
  };

  const handleSave = () => {
    Alert.alert("Frontend Ready", "The expert form UI is prepared. No backend logic was added.");
  };

  const handleReset = () => {
    setForm(initialForm);
    setSelectedCrops([]);
    setCropSearch("");
    setShowCropOptions(false);
  };

  return (
    <View className="flex-1 bg-green-50">
      <View className="bg-green-700 px-5 py-5">
        <Text className="text-white text-2xl font-bold">Apply as Expert</Text>
        <Text className="text-green-100 mt-1">
          Share your profile details for government verification
        </Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <View className="rounded-2xl border border-green-200 bg-white p-4 shadow-sm">
          <View className="flex-row items-center mb-4">
            <MaterialCommunityIcons name="account-circle" size={24} color="#15803d" />
            <Text className="ml-2 text-lg font-bold text-green-800">Public Information</Text>
          </View>

          <Pressable
            onPress={handlePhotoUpload}
            className="items-center justify-center rounded-2xl border border-dashed border-green-300 bg-green-50 p-4"
          >
            {form.profilePhoto ? (
              <Image source={{ uri: form.profilePhoto }} className="h-28 w-28 rounded-full" />
            ) : (
              <View className="items-center">
                <MaterialCommunityIcons name="camera-plus" size={34} color="#15803d" />
                <Text className="mt-2 font-semibold text-green-700">Upload Profile Photo</Text>
                <Text className="text-xs text-gray-500 mt-1">Tap to preview a sample image</Text>
              </View>
            )}
          </Pressable>

          <View className="mt-4">
            <Label text="Full Name" required />
            <TextInput
              value={form.fullName}
              onChangeText={(value) => updateField("fullName", value)}
              placeholder="Enter your full name"
              className="mt-1 rounded-xl border border-green-200 bg-white px-3 py-3 text-gray-800"
            />
          </View>

          <View className="mt-4">
            <Label text="Phone Number" required />
            <TextInput
              value={form.phoneNumber}
              onChangeText={(value) => updateField("phoneNumber", value)}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              className="mt-1 rounded-xl border border-green-200 bg-white px-3 py-3 text-gray-800"
            />
          </View>

          <View className="mt-4">
            <Label text="Email Address" />
            <TextInput
              value={form.email}
              onChangeText={(value) => updateField("email", value)}
              placeholder="Enter email address"
              keyboardType="email-address"
              className="mt-1 rounded-xl border border-green-200 bg-white px-3 py-3 text-gray-800"
            />
          </View>

          <View className="mt-4">
            <Label text="Crop Expertise" required />
            <TouchableOpacity
              onPress={() => setShowCropOptions((prev) => !prev)}
              className="mt-1 rounded-xl border border-green-200 bg-white px-3 py-3"
            >
              <Text className="text-gray-500">
                {selectedCrops.length > 0 ? selectedCrops.join(", ") : "Select crops"}
              </Text>
            </TouchableOpacity>

            <TextInput
              value={cropSearch}
              onChangeText={setCropSearch}
              placeholder="Search crops"
              className="mt-2 rounded-xl border border-green-200 bg-green-50 px-3 py-3 text-gray-800"
            />

            {showCropOptions && (
              <View className="mt-2 rounded-xl border border-green-200 bg-white p-2">
                {filteredCropOptions.length > 0 ? (
                  filteredCropOptions.map((crop) => (
                    <TouchableOpacity
                      key={crop}
                      onPress={() => toggleCrop(crop)}
                      className="rounded-lg px-3 py-2"
                    >
                      <Text className="text-gray-700">{crop}</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text className="px-3 py-2 text-sm text-gray-500">No more crops available</Text>
                )}
              </View>
            )}

            {selectedCrops.length > 0 && (
              <View className="mt-3 flex-row flex-wrap">
                {selectedCrops.map((crop) => (
                  <TouchableOpacity
                    key={crop}
                    onPress={() => toggleCrop(crop)}
                    className="mr-2 mb-2 rounded-full bg-green-700 px-3 py-2"
                  >
                    <Text className="text-white">{crop} ×</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View className="mt-4">
            <Label text="State" required />
            <Dropdown
              data={stateOptions}
              labelField="label"
              valueField="value"
              placeholder="Select state"
              value={form.state}
              search
              searchPlaceholder="Search state"
              maxHeight={220}
              onChange={(item) => {
                updateField("state", item.value);
                updateField("district", "");
                updateField("taluka", "");
                updateField("place", "");
              }}
              style={{
                borderWidth: 1,
                borderColor: "#d1fae5",
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 12,
                backgroundColor: "white",
              }}
              placeholderStyle={{ color: "#6b7280" }}
              selectedTextStyle={{ color: "#065f46", fontWeight: "600" }}
              itemTextStyle={{ color: "#111827" }}
            />
          </View>

          <View className="mt-4">
            <Label text="District" required />
            <Dropdown
              data={filteredDistricts}
              labelField="label"
              valueField="value"
              placeholder="Select district"
              value={form.district}
              search
              searchPlaceholder="Search district"
              maxHeight={220}
              onChange={(item) => {
                updateField("district", item.value);
                updateField("taluka", "");
                updateField("place", "");
              }}
              style={{
                borderWidth: 1,
                borderColor: "#d1fae5",
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 12,
                backgroundColor: "white",
              }}
              placeholderStyle={{ color: "#6b7280" }}
              selectedTextStyle={{ color: "#065f46", fontWeight: "600" }}
              itemTextStyle={{ color: "#111827" }}
            />
          </View>

          <View className="mt-4">
            <Label text="Taluka" required />
            <Dropdown
              data={filteredTalukas}
              labelField="label"
              valueField="value"
              placeholder="Select taluka"
              value={form.taluka}
              search
              searchPlaceholder="Search taluka"
              maxHeight={220}
              onChange={(item) => {
                updateField("taluka", item.value);
                updateField("place", "");
              }}
              style={{
                borderWidth: 1,
                borderColor: "#d1fae5",
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 12,
                backgroundColor: "white",
              }}
              placeholderStyle={{ color: "#6b7280" }}
              selectedTextStyle={{ color: "#065f46", fontWeight: "600" }}
              itemTextStyle={{ color: "#111827" }}
            />
          </View>

          <View className="mt-4">
            <Label text="Place / Village" required />
            <Dropdown
              data={filteredPlaces}
              labelField="label"
              valueField="value"
              placeholder="Select place"
              value={form.place}
              search
              searchPlaceholder="Search place"
              maxHeight={220}
              onChange={(item) => updateField("place", item.value)}
              style={{
                borderWidth: 1,
                borderColor: "#d1fae5",
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 12,
                backgroundColor: "white",
              }}
              placeholderStyle={{ color: "#6b7280" }}
              selectedTextStyle={{ color: "#065f46", fontWeight: "600" }}
              itemTextStyle={{ color: "#111827" }}
            />
          </View>

          <View className="mt-4">
            <Label text="Years of Experience" required />
            <TextInput
              value={form.experience}
              onChangeText={(value) => updateField("experience", value)}
              placeholder="e.g. 8"
              keyboardType="numeric"
              className="mt-1 rounded-xl border border-green-200 bg-white px-3 py-3 text-gray-800"
            />
          </View>

          <View className="mt-4">
            <Label text="Description / About Expert" />
            <TextInput
              value={form.description}
              onChangeText={(value) => updateField("description", value)}
              placeholder="Describe your expertise and background"
              multiline
              numberOfLines={5}
              className="mt-1 min-h-28 rounded-xl border border-green-200 bg-white px-3 py-3 text-gray-800"
            />
          </View>
        </View>

        <View className="mt-5 rounded-2xl border border-green-200 bg-white p-4 shadow-sm">
          <View className="flex-row items-center mb-4">
            <MaterialCommunityIcons name="shield-check" size={24} color="#15803d" />
            <Text className="ml-2 text-lg font-bold text-green-800">Government Verification</Text>
          </View>

          <View className="mt-2">
            <Label text="Aadhaar Number" required />
            <TextInput
              value={form.aadhaarNumber}
              onChangeText={(value) => updateField("aadhaarNumber", value)}
              placeholder="Enter aadhaar number"
              keyboardType="numeric"
              className="mt-1 rounded-xl border border-green-200 bg-white px-3 py-3 text-gray-800"
            />
          </View>

          <View className="mt-4">
            <Label text="Upload Aadhaar Card" required />
            <TouchableOpacity
              onPress={() => handleFileUpload("aadhaar")}
              className="mt-1 flex-row items-center justify-between rounded-xl border border-green-200 bg-green-50 px-3 py-3"
            >
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="file-document-outline" size={20} color="#15803d" />
                <Text className="ml-2 text-gray-700">
                  {form.aadhaarFileName || "Choose file"}
                </Text>
              </View>
              <MaterialCommunityIcons name="upload" size={20} color="#15803d" />
            </TouchableOpacity>
          </View>

          <View className="mt-4">
            <Label text="Upload Agriculture Degree / Certificate" required />
            <TouchableOpacity
              onPress={() => handleFileUpload("certificate")}
              className="mt-1 flex-row items-center justify-between rounded-xl border border-green-200 bg-green-50 px-3 py-3"
            >
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="school-outline" size={20} color="#15803d" />
                <Text className="ml-2 text-gray-700">
                  {form.certificateFileName || "Choose file"}
                </Text>
              </View>
              <MaterialCommunityIcons name="upload" size={20} color="#15803d" />
            </TouchableOpacity>
          </View>

          <View className="mt-4">
            <Label text="Verification Status" />
            <View className="mt-1 rounded-xl border border-green-200 bg-white px-3 py-3">
              <Text className="text-gray-700">Pending</Text>
            </View>
          </View>
        </View>

        <View className="mt-6 flex-row gap-3">
          <TouchableOpacity
            onPress={handleSave}
            className="mr-2 flex-1 rounded-xl bg-green-700 px-4 py-3"
          >
            <Text className="text-center font-bold text-white">Save Expert</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleReset}
            className="ml-2 flex-1 rounded-xl border border-green-300 bg-white px-4 py-3"
          >
            <Text className="text-center font-bold text-green-700">Reset</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

type LabelProps = {
  text: string;
  required?: boolean;
};

function Label({ text, required }: LabelProps) {
  return (
    <Text className="font-semibold text-gray-700">
      {text}
      {required ? <Text className="text-red-500"> *</Text> : null}
    </Text>
  );
}