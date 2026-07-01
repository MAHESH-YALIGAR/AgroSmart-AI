import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import axios from "axios";
import { Dropdown } from "react-native-element-dropdown";

import { locationData } from "../data/locationData";
import { cropData } from "../data/cropData";

const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_API;

export default function CropPriceFinder() {
  const [stateName, setStateName] =
    useState("");

  const [district, setDistrict] =
    useState("");

  const [taluk, setTaluk] =
    useState("");

  const [crop, setCrop] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState<any[]>([]);

  // States

  const stateOptions =
    locationData.states.map((state) => ({
      label: state,
      value: state,
    }));

  // Districts

  const districtOptions =
    stateName === "Karnataka"
      ? Object.keys(
        locationData.karnataka
      ).map((item) => ({
        label: item,
        value: item,
      }))
      : [];

  // Taluks

  const talukOptions =
    district &&
      locationData.karnataka[
      district as keyof typeof locationData.karnataka
      ]
      ? locationData.karnataka[
        district as keyof typeof locationData.karnataka
      ].map((item) => ({
        label: item,
        value: item,
      }))
      : [];

  // Crops

  const cropOptions =
    cropData.map((item) => ({
      label: item,
      value: item,
    }));

  const getPrices = async () => {
    try {
      setLoading(true);

      const response =
        await axios.post(
          `${BACKEND_URL}/api/v1/weather/market-price`,
          {
            state: stateName,
            district,
            market:`${taluk} APMC`,
            commodity: crop,
          }
        );
      // const response =
      //   await axios.post(
      //     `${BACKEND_URL}/api/v1/weather/market-price`,
      //     {
      //       state: "Gujarat",
      //       district: "Rajkot",
      //       market: "Jasdan APMC",
      //       commodity: "Wheat",
      //     }
      //   );
      setResult(response.data.data);
      console.log(result)
    } catch (error: any) {
      console.log(
        error?.response?.data ||
        error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const renderResultItem = (item: any, index: number) => (
    <View
      key={`${item.market}-${index}`}
      className="mb-5 bg-white p-5 rounded-3xl"
    >
      <Text className="text-2xl font-bold">
        🌱 {item.commodity}
      </Text>

      <Text className="text-gray-500 mt-1">
        {item.market}, {item.district}, {item.state}
      </Text>

      <Text className="text-gray-500 mt-1">
        Variety: {item.variety} | Grade: {item.grade}
      </Text>

      <View className="flex-row justify-between mt-5">
        <View>
          <Text className="text-gray-400">Min</Text>
          <Text className="text-xl font-bold">₹{item.min_price}</Text>
        </View>

        <View>
          <Text className="text-gray-400">Modal</Text>
          <Text className="text-xl font-bold text-green-600">
            ₹{item.modal_price}
          </Text>
        </View>

        <View>
          <Text className="text-gray-400">Max</Text>
          <Text className="text-xl font-bold">₹{item.max_price}</Text>
        </View>
      </View>

      <Text className="text-gray-400 mt-4">
        Arrival Date: {item.arrival_date}
      </Text>
    </View>
  );

  return (
    <ScrollView
      className="flex-1 bg-[#F5F7FA]"
      showsVerticalScrollIndicator={false}
    >
      <View className="p-5">

        <Text className="text-3xl font-bold text-gray-800">
          🌾 Market Prices
        </Text>

        <Text className="text-gray-500 mt-1">
          Find latest mandi prices
        </Text>

        <View
          className="
            bg-white
            mt-5
            rounded-3xl
            p-5
          "
        >

          {/* STATE */}

          <Text className="font-semibold mb-2">
            State
          </Text>

          <Dropdown
            style={styles.dropdown}
            data={stateOptions}
            search
            labelField="label"
            valueField="value"
            placeholder="Search State"
            searchPlaceholder="Type State..."
            value={stateName}
            onChange={(item) => {
              setStateName(item.value);
              setDistrict("");
              setTaluk("");
            }}
          />

          {/* DISTRICT */}

          <Text className="font-semibold mt-4 mb-2">
            District
          </Text>

          <Dropdown
            style={styles.dropdown}
            data={districtOptions}
            search
            labelField="label"
            valueField="value"
            placeholder="Search District"
            searchPlaceholder="Type District..."
            value={district}
            onChange={(item) => {
              setDistrict(item.value);
              setTaluk("");
            }}
          />

          {/* TALUK */}

          <Text className="font-semibold mt-4 mb-2">
            Taluk
          </Text>

          <Dropdown
            style={styles.dropdown}
            data={talukOptions}
            search
            labelField="label"
            valueField="value"
            placeholder="Search Taluk"
            searchPlaceholder="Type Taluk..."
            value={taluk}
            onChange={(item) =>
              setTaluk(item.value)
            }
          />

          {/* CROP */}

          <Text className="font-semibold mt-4 mb-2">
            Crop
          </Text>

          <Dropdown
            style={styles.dropdown}
            data={cropOptions}
            search
            labelField="label"
            valueField="value"
            placeholder="Search Crop"
            searchPlaceholder="Type Crop..."
            value={crop}
            onChange={(item) =>
              setCrop(item.value)
            }
          />

          <TouchableOpacity
            onPress={getPrices}
            className="
              bg-green-600
              mt-6
              py-4
              rounded-2xl
            "
          >
            <Text
              className="
                text-center
                text-white
                text-lg
                font-bold
              "
            >
              Get Market Price
            </Text>
          </TouchableOpacity>

        </View>

        {loading && (
          <ActivityIndicator
            size="large"
            className="mt-6"
          />
        )}

        {result.length > 0 && (
          <View className="mt-5">
            {result.map((item, index) => renderResultItem(item, index))}
          </View>
        )}

      </View>
    </ScrollView>
  );
}

const styles = {
  dropdown: {
    height: 55,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingHorizontal: 15,
    backgroundColor: "#FFFFFF",
  },
};