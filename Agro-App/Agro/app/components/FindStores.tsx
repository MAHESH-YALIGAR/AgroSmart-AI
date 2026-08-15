import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
  Image,
  Alert,
} from "react-native";
import axios from "axios";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown";

import { locationData } from "../data/locationData";

const BACKEND = process.env.EXPO_PUBLIC_BACKEND_API || "";

interface StoreProduct {
  product?: string;
  availability?: string;
}

interface Store {
  _id?: string;
  logo?: string | null;
  storeName: string;
  ownerName: string;
  mobile: string;
  email: string;
  licenseNumber: string;
  state: string;
  district: string;
  taluka: string;
  place: string;
  address: string;
  location?: {
    coordinates?: [number, number];
  };
  openingTime?: string;
  closingTime?: string;
  description?: string;
  products?: StoreProduct[];
}

type DropdownOption = {
  label: string;
  value: string;
};

export default function FindStores() {
  const [stateValue, setStateValue] = useState("");
  const [districtValue, setDistrictValue] = useState("");
  const [talukaValue, setTalukaValue] = useState("");
  const [placeValue, setPlaceValue] = useState("");

  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);

  const states = locationData.states;

  const stateOptions = useMemo<DropdownOption[]>(() => {
    return states.map((name) => ({ label: name, value: name }));
  }, [states]);

  const filteredDistricts = useMemo<DropdownOption[]>(() => {
    if (stateValue !== "Karnataka") return [];
    return Object.keys(locationData.karnataka).map((name) => ({
      label: name,
      value: name,
    }));
  }, [stateValue]);

  const filteredTalukas = useMemo<DropdownOption[]>(() => {
    if (!districtValue || stateValue !== "Karnataka") return [];

    const districtData = locationData.karnataka[
      districtValue as keyof typeof locationData.karnataka
    ];

    return (districtData ?? []).map((name) => ({ label: name, value: name }));
  }, [districtValue, stateValue]);

  const filteredPlaces = useMemo<DropdownOption[]>(() => {
    if (!talukaValue || stateValue !== "Karnataka") return [];
    return [{ label: talukaValue, value: talukaValue }];
  }, [talukaValue, stateValue]);

  const searchStores = async () => {
    if (!stateValue) {
      Alert.alert("Please select at least a state.");
      return;
    }

    try {
      setLoading(true);

      const payload: Record<string, string> = {
        state: stateValue,
      };

      if (districtValue) payload.district = districtValue;
      if (talukaValue) payload.taluka = talukaValue;
      if (placeValue) payload.place = placeValue;

      const res = await axios.post(`${BACKEND}/api/v1/addtional/stores`, payload);

      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.data || res.data?.stores || [];

      setStores(data);
    } catch (err) {
      Alert.alert("Unable to fetch stores.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const callStore = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const smsStore = (phone: string) => {
    Linking.openURL(`sms:${phone}`);
  };

  const openStoreMap = (store: Store) => {
    const longitude = store.location?.coordinates?.[0];
    const latitude = store.location?.coordinates?.[1];

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      Alert.alert("Location is not available for this store.");
      return;
    }

    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    );
  };

  return (
    <View className="flex-1 bg-green-50">
      <View className="bg-green-700 p-5">
        <Text className="text-white text-2xl font-bold">Find Agro Stores</Text>
        <Text className="text-green-100 mt-1">
          Search nearby agricultural stores by location
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="font-semibold mb-1">State</Text>
        <Dropdown
          data={stateOptions}
          labelField="label"
          valueField="value"
          placeholder="Select state"
          value={stateValue}
          search
          searchPlaceholder="Search state"
          maxHeight={220}
          onChange={(item) => {
            setStateValue(item.value);
            setDistrictValue("");
            setTalukaValue("");
            setPlaceValue("");
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
          containerStyle={{ marginTop: 4 }}
        />

        <Text className="font-semibold mt-5 mb-1">District</Text>
        <Dropdown
          data={filteredDistricts}
          labelField="label"
          valueField="value"
          placeholder="Select district"
          value={districtValue}
          search
          searchPlaceholder="Search district"
          maxHeight={220}
          onChange={(item) => {
            setDistrictValue(item.value);
            setTalukaValue("");
            setPlaceValue("");
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
          containerStyle={{ marginTop: 4 }}
        />

        <Text className="font-semibold mt-5 mb-1">Taluka</Text>
        <Dropdown
          data={filteredTalukas}
          labelField="label"
          valueField="value"
          placeholder="Select taluka"
          value={talukaValue}
          search
          searchPlaceholder="Search taluka"
          maxHeight={220}
          onChange={(item) => {
            setTalukaValue(item.value);
            setPlaceValue("");
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
          containerStyle={{ marginTop: 4 }}
        />

        <Text className="font-semibold mt-5 mb-1">Place</Text>
        <Dropdown
          data={filteredPlaces}
          labelField="label"
          valueField="value"
          placeholder="Select place"
          value={placeValue}
          search
          searchPlaceholder="Search place"
          maxHeight={220}
          onChange={(item) => setPlaceValue(item.value)}
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
          containerStyle={{ marginTop: 4 }}
        />

        <TouchableOpacity
          onPress={searchStores}
          className="bg-green-700 mt-6 rounded-xl py-4 items-center"
        >
          <Text className="text-white font-bold text-lg">Search Stores</Text>
        </TouchableOpacity>

        {loading && (
          <ActivityIndicator size="large" color="green" className="mt-8" />
        )}

        {!loading && stores.length === 0 && (
          <View className="mt-10 items-center">
            <MaterialCommunityIcons
              name="store-search"
              size={70}
              color="green"
            />
            <Text className="text-gray-500 mt-3 text-base">No Stores Found</Text>
          </View>
        )}

        {!loading && stores.length > 0 && (
          <View className="mt-6">
            {stores.map((item, index) => (
              <View
                key={item._id ?? index.toString()}
                className="bg-white rounded-2xl p-4 mb-4 shadow"
              >
                <View className="flex-row">
                  {item.logo ? (
                    <Image
                      source={{ uri: item.logo }}
                      className="w-20 h-20 rounded-full"
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name="store"
                      size={72}
                      color="green"
                    />
                  )}

                  <View className="ml-4 flex-1">
                    <Text className="text-xl font-bold">{item.storeName}</Text>
                    <Text className="text-green-700 mt-1">
                      👤 {item.ownerName}
                    </Text>
                    <Text className="text-gray-600">
                      🏷️ {item.licenseNumber}
                    </Text>
                  </View>
                </View>

                <View className="mt-4">
                  <Text className="text-gray-700">📞 {item.mobile}</Text>
                  <Text className="text-gray-700 mt-1">📧 {item.email}</Text>
                </View>

                <View className="mt-4">
                  <Text className="font-semibold">Location</Text>
                  <Text className="text-gray-600 mt-1">
                    {item.place}, {item.taluka}, {item.district}, {item.state}
                  </Text>
                  <Text className="text-gray-600 mt-1">{item.address}</Text>
                </View>

                <View className="mt-4">
                  <Text className="font-semibold">Working Hours</Text>
                  <Text className="text-gray-600 mt-1">
                    {item.openingTime} - {item.closingTime}
                  </Text>
                </View>

                <View className="mt-4">
                  <Text className="font-semibold">Description</Text>
                  <Text className="text-gray-600 mt-1">
                    {item.description || "No description available."}
                  </Text>
                </View>

                <View className="mt-4">
                  <Text className="font-semibold">Products</Text>
                  <Text className="text-gray-600 mt-1">
                    {(item.products?.length ?? 0) > 0
                      ? `${item.products?.length} product(s) listed`
                      : "No products listed yet"}
                  </Text>
                </View>

                <View className="flex-row justify-between mt-6">
                  <TouchableOpacity
                    onPress={() => callStore(item.mobile)}
                    className="flex-1 bg-green-700 py-3 rounded-xl mr-2 items-center"
                  >
                    <MaterialCommunityIcons
                      name="phone"
                      color="white"
                      size={22}
                    />
                    <Text className="text-white mt-1 font-semibold">Call</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => smsStore(item.mobile)}
                    className="flex-1 bg-blue-600 py-3 rounded-xl mx-2 items-center"
                  >
                    <MaterialCommunityIcons
                      name="message"
                      color="white"
                      size={22}
                    />
                    <Text className="text-white mt-1 font-semibold">Message</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => openStoreMap(item)}
                    className="flex-1 bg-orange-500 py-3 rounded-xl ml-2 items-center"
                  >
                    <MaterialCommunityIcons
                      name="map-marker"
                      color="white"
                      size={22}
                    />
                    <Text className="text-white mt-1 font-semibold">Map</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}