import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Alert, Image, Pressable, ScrollView, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const BACKEND = process.env.EXPO_PUBLIC_BACKEND_API || "";
type ListingStatus = "active" | "sold" | "paused";

type Listing = {
  _id: string;
  imageUri?: string;
  cropName: string;
  cropVariety?: string;
  quantity: number;
  quantityUnit: string;
  expectedPrice: number;
  readyDate: string;
  farmerName: string;
  description?: string;
  latitude: number;
  longitude: number;
  status?: ListingStatus;
  isActive?: boolean;
};

const tabs: { label: string; value: ListingStatus }[] = [
  { label: "Active", value: "active" },
  { label: "Sold", value: "sold" },
  { label: "Paused", value: "paused" },
];

const formatPrice = (price: number) => `Rs ${Number(price || 0).toLocaleString("en-IN")}`;
const formatDate = (date: string) => new Date(date).toLocaleDateString();

export default function MyCropListings({ onCreate }: { onCreate: () => void }) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedTab, setSelectedTab] = useState<ListingStatus>("active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadListings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("Please log in to view your crop listings.");
      const response = await axios.get(`${BACKEND}/api/v1/sellcroprouter/my-listings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setListings(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || requestError.message || "Unable to load your listings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  const updateStatus = async (listing: Listing, status: ListingStatus) => {
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.patch(
        `${BACKEND}/api/v1/sellcroprouter/${listing._id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await loadListings();
    } catch (requestError: any) {
      Alert.alert("Unable to update", requestError?.response?.data?.message || "Please try again.");
    }
  };

  const confirmDelete = (listing: Listing) => {
    Alert.alert(
      "Delete listing?",
      `Are you sure you want to delete your ${listing.cropName} listing? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              await axios.delete(`${BACKEND}/api/v1/sellcroprouter/${listing._id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              await loadListings();
            } catch (requestError: any) {
              Alert.alert("Unable to delete", requestError?.response?.data?.message || "Please try again.");
            }
          },
        },
      ]
    );
  };

  const visibleListings = listings.filter((listing) => (listing.status || (listing.isActive ? "active" : "paused")) === selectedTab);

  return (
    <ScrollView className="flex-1 bg-green-50" contentContainerStyle={{ padding: 16, paddingBottom: 36 }}>
      <View className="mb-5 rounded-3xl bg-green-800 p-5">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-extrabold text-white">My Crop Listings</Text>
            <Text className="mt-1 text-sm text-green-100">Manage crops you have posted for sale.</Text>
          </View>
          <Pressable onPress={onCreate} className="rounded-xl bg-white px-3 py-2">
            <Text className="font-bold text-green-800">+ New</Text>
          </Pressable>
        </View>
      </View>

      <View className="mb-4 flex-row rounded-2xl bg-white p-1">
        {tabs.map((tab) => (
          <Pressable
            key={tab.value}
            onPress={() => setSelectedTab(tab.value)}
            className={`flex-1 rounded-xl px-2 py-3 ${selectedTab === tab.value ? "bg-green-700" : "bg-white"}`}
          >
            <Text className={`text-center text-sm font-bold ${selectedTab === tab.value ? "text-white" : "text-gray-500"}`}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? <Text className="py-10 text-center text-gray-500">Loading your listings...</Text> : null}
      {!loading && error ? <Text className="rounded-2xl bg-red-50 p-4 text-red-700">{error}</Text> : null}
      {!loading && !error && visibleListings.length === 0 ? (
        <View className="items-center rounded-2xl border border-dashed border-green-300 bg-white p-8">
          <MaterialCommunityIcons name="sprout-outline" size={44} color="#15803d" />
          <Text className="mt-3 text-center font-semibold text-gray-700">No {selectedTab} listings</Text>
          <Pressable onPress={onCreate} className="mt-4 rounded-xl bg-green-700 px-5 py-3">
            <Text className="font-bold text-white">Sell a Crop</Text>
          </Pressable>
        </View>
      ) : null}

      {visibleListings.map((listing) => (
        <View key={listing._id} className="mb-4 overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm">
          {listing.imageUri ? <Image source={{ uri: listing.imageUri }} className="h-40 w-full" resizeMode="cover" /> : null}
          <View className="p-4">
            <View className="flex-row items-start justify-between">
              <View className="flex-1">
                <Text className="text-xl font-bold capitalize text-gray-900">{listing.cropName}</Text>
                <Text className="mt-1 text-sm text-green-700">{listing.cropVariety || "Standard variety"}</Text>
              </View>
              <Text className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold capitalize text-green-700">{listing.status || "active"}</Text>
            </View>
            <View className="mt-4 flex-row flex-wrap gap-x-5 gap-y-2">
              <Text className="text-sm text-gray-600">{listing.quantity} {listing.quantityUnit}</Text>
              <Text className="text-sm font-bold text-green-700">{formatPrice(listing.expectedPrice)}</Text>
              <Text className="text-sm text-gray-600">Ready {formatDate(listing.readyDate)}</Text>
            </View>
            {listing.description ? <Text className="mt-3 text-sm leading-5 text-gray-600">{listing.description}</Text> : null}
            <View className="mt-4 flex-row gap-2">
              {selectedTab === "active" ? (
                <Pressable onPress={() => updateStatus(listing, "sold")} className="flex-1 flex-row items-center justify-center rounded-xl border border-green-700 px-3 py-3">
                  <MaterialCommunityIcons name="check-circle-outline" size={18} color="#15803d" />
                  <Text className="ml-2 font-bold text-green-700">Mark Sold</Text>
                </Pressable>
              ) : null}
              {selectedTab === "sold" ? (
                <Pressable onPress={() => updateStatus(listing, "active")} className="flex-1 flex-row items-center justify-center rounded-xl bg-green-700 px-3 py-3">
                  <MaterialCommunityIcons name="backup-restore" size={18} color="#fff" />
                  <Text className="ml-2 font-bold text-white">Mark Active</Text>
                </Pressable>
              ) : null}
              {selectedTab === "paused" ? (
                <Pressable onPress={() => updateStatus(listing, "active")} className="flex-1 flex-row items-center justify-center rounded-xl bg-green-700 px-3 py-3">
                  <MaterialCommunityIcons name="play-circle-outline" size={18} color="#fff" />
                  <Text className="ml-2 font-bold text-white">Resume Listing</Text>
                </Pressable>
              ) : null}
              {selectedTab !== "sold" ? (
                <Pressable onPress={() => router.push({ pathname: "/edit-crop", params: { id: listing._id } })} className="flex-1 flex-row items-center justify-center rounded-xl bg-green-700 px-3 py-3">
                  <MaterialCommunityIcons name="pencil-outline" size={18} color="#fff" />
                  <Text className="ml-2 font-bold text-white">Edit</Text>
                </Pressable>
              ) : null}
              {selectedTab === "active" ? (
                <Pressable onPress={() => updateStatus(listing, "paused")} className="rounded-xl border border-gray-300 px-3 py-3">
                  <MaterialCommunityIcons name="pause" size={18} color="#4b5563" />
                </Pressable>
              ) : null}
              <Pressable onPress={() => confirmDelete(listing)} className="rounded-xl border border-red-300 px-3 py-3">
                <MaterialCommunityIcons name="trash-can-outline" size={18} color="#dc2626" />
              </Pressable>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
