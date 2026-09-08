import React, { useEffect, useState } from "react";
import axios from "axios";
import { Alert, Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const BACKEND = process.env.EXPO_PUBLIC_BACKEND_API || "";
type Unit = "kg" | "quintal" | "ton";

type EditForm = {
  imageUri: string;
  cropName: string;
  cropVariety: string;
  quantity: string;
  quantityUnit: Unit;
  expectedPrice: string;
  readyDate: string;
  farmerName: string;
  mobileNumber: string;
  email: string;
  description: string;
  latitude: number;
  longitude: number;
};

const emptyForm: EditForm = {
  imageUri: "",
  cropName: "",
  cropVariety: "",
  quantity: "",
  quantityUnit: "kg",
  expectedPrice: "",
  readyDate: "",
  farmerName: "",
  mobileNumber: "",
  email: "",
  description: "",
  latitude: 0,
  longitude: 0,
};

export default function EditCropScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [form, setForm] = useState<EditForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadListing = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const response = await axios.get(`${BACKEND}/api/v1/sellcroprouter/my-listings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const listing = response.data?.data?.find((item: any) => item._id === id);
        if (!listing) throw new Error("Crop listing not found.");
        setForm({
          imageUri: listing.imageUri || "",
          cropName: listing.cropName || "",
          cropVariety: listing.cropVariety || "",
          quantity: String(listing.quantity || ""),
          quantityUnit: listing.quantityUnit || "kg",
          expectedPrice: String(listing.expectedPrice || ""),
          readyDate: String(listing.readyDate || "").slice(0, 10),
          farmerName: listing.farmerName || "",
          mobileNumber: listing.mobileNumber || "",
          email: listing.email || "",
          description: listing.description || "",
          latitude: Number(listing.latitude || 0),
          longitude: Number(listing.longitude || 0),
        });
      } catch (error: any) {
        Alert.alert("Unable to load listing", error?.response?.data?.message || error.message);
        router.back();
      } finally {
        setLoading(false);
      }
    };
    loadListing();
  }, [id]);

  const updateField = <K extends keyof EditForm>(field: K, value: EditForm[K]) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });
    const asset = result.canceled ? undefined : result.assets?.[0];
    if (asset?.uri) {
      updateField("imageUri", asset.base64 ? `data:${asset.mimeType || "image/jpeg"};base64,${asset.base64}` : asset.uri);
    }
  };

  const saveListing = async () => {
    if (!form.cropName.trim() || Number(form.quantity) <= 0 || Number(form.expectedPrice) <= 0 || !form.readyDate || !form.farmerName.trim()) {
      Alert.alert("Incomplete details", "Please complete the crop name, quantity, price, date, and farmer name.");
      return;
    }
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.put(
        `${BACKEND}/api/v1/sellcroprouter/${id}`,
        {
          ...form,
          cropName: form.cropName.trim(),
          cropVariety: form.cropVariety.trim(),
          quantity: Number(form.quantity),
          expectedPrice: Number(form.expectedPrice),
          farmerName: form.farmerName.trim(),
          mobileNumber: form.mobileNumber.trim(),
          email: form.email.trim(),
          description: form.description.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert("Listing updated", "Your crop listing was updated successfully.", [{ text: "OK", onPress: () => router.back() }]);
    } catch (error: any) {
      Alert.alert("Unable to update", error?.response?.data?.message || "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <View className="flex-1 items-center justify-center bg-green-50"><Text className="text-gray-500">Loading listing...</Text></View>;

  return (
    <ScrollView className="flex-1 bg-green-50" contentContainerStyle={{ padding: 16, paddingBottom: 36 }}>
      <View className="mb-5 flex-row items-center">
        <Pressable onPress={() => router.back()} className="mr-3 rounded-xl bg-white p-2"><MaterialCommunityIcons name="arrow-left" size={22} color="#166534" /></Pressable>
        <Text className="text-2xl font-extrabold text-green-800">Edit Crop Listing</Text>
      </View>

      <View className="rounded-3xl border border-green-100 bg-white p-4">
        <Pressable onPress={pickImage} className="mb-5 overflow-hidden rounded-2xl bg-green-50">
          {form.imageUri ? <Image source={{ uri: form.imageUri }} className="h-48 w-full" resizeMode="cover" /> : <View className="h-32 items-center justify-center"><MaterialCommunityIcons name="image-plus" size={34} color="#15803d" /><Text className="mt-2 text-green-700">Choose crop image</Text></View>}
        </Pressable>

        <Text className="mb-2 font-semibold text-gray-700">Crop Name</Text>
        <TextInput value={form.cropName} onChangeText={(value) => updateField("cropName", value)} className="mb-4 rounded-xl border border-green-200 px-4 py-3 text-gray-800" />
        <Text className="mb-2 font-semibold text-gray-700">Crop Variety</Text>
        <TextInput value={form.cropVariety} onChangeText={(value) => updateField("cropVariety", value)} className="mb-4 rounded-xl border border-green-200 px-4 py-3 text-gray-800" />

        <View className="flex-row gap-3">
          <View className="flex-1"><Text className="mb-2 font-semibold text-gray-700">Quantity</Text><TextInput value={form.quantity} onChangeText={(value) => updateField("quantity", value.replace(/[^0-9.]/g, ""))} keyboardType="numeric" className="rounded-xl border border-green-200 px-4 py-3 text-gray-800" /></View>
          <View className="flex-1"><Text className="mb-2 font-semibold text-gray-700">Unit</Text><View className="flex-row gap-1">{(["kg", "quintal", "ton"] as Unit[]).map((unit) => <Pressable key={unit} onPress={() => updateField("quantityUnit", unit)} className={`flex-1 rounded-xl px-2 py-3 ${form.quantityUnit === unit ? "bg-green-700" : "bg-green-50"}`}><Text className={`text-center text-xs font-bold ${form.quantityUnit === unit ? "text-white" : "text-green-700"}`}>{unit}</Text></Pressable>)}</View></View>
        </View>

        <Text className="mb-2 mt-4 font-semibold text-gray-700">Expected Price</Text>
        <TextInput value={form.expectedPrice} onChangeText={(value) => updateField("expectedPrice", value.replace(/[^0-9.]/g, ""))} keyboardType="numeric" className="mb-4 rounded-xl border border-green-200 px-4 py-3 text-gray-800" />
        <Text className="mb-2 font-semibold text-gray-700">Ready Date</Text>
        <TextInput value={form.readyDate} onChangeText={(value) => updateField("readyDate", value)} placeholder="YYYY-MM-DD" className="mb-4 rounded-xl border border-green-200 px-4 py-3 text-gray-800" />
        <Text className="mb-2 font-semibold text-gray-700">Farmer Name</Text>
        <TextInput value={form.farmerName} onChangeText={(value) => updateField("farmerName", value)} className="mb-4 rounded-xl border border-green-200 px-4 py-3 text-gray-800" />
        <Text className="mb-2 font-semibold text-gray-700">Mobile Number</Text>
        <TextInput value={form.mobileNumber} onChangeText={(value) => updateField("mobileNumber", value)} keyboardType="phone-pad" className="mb-4 rounded-xl border border-green-200 px-4 py-3 text-gray-800" />
        <Text className="mb-2 font-semibold text-gray-700">Email</Text>
        <TextInput value={form.email} onChangeText={(value) => updateField("email", value)} keyboardType="email-address" className="mb-4 rounded-xl border border-green-200 px-4 py-3 text-gray-800" />
        <Text className="mb-2 font-semibold text-gray-700">Description</Text>
        <TextInput value={form.description} onChangeText={(value) => updateField("description", value)} multiline numberOfLines={4} textAlignVertical="top" className="mb-5 min-h-[110px] rounded-xl border border-green-200 px-4 py-3 text-gray-800" />

        <Pressable onPress={saveListing} disabled={saving} className="rounded-xl bg-green-700 px-4 py-4">
          <Text className="text-center font-bold text-white">{saving ? "Updating..." : "Update Listing"}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
