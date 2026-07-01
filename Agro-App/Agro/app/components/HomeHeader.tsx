import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import {
  MaterialIcons,
  Ionicons,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  useEffect,
  useState,
} from "react";

export default function HomeHeader({
  user,
  onPress,
}: any) {
  // 1. Keep state as a string or null
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    getAddress();
  }, []);

  const getAddress = async () => {
    try {
      const savedAddress = await AsyncStorage.getItem("user_address");
      
      if (savedAddress) {
        // 2. Set the raw string directly (No JSON.parse needed)
        setAddress(savedAddress);
      }
    } catch (error) {
      console.log("❌ Error reading address:", error);
    }
  };

  return (
    <View
      className="
      bg-white
      mx-4
      mt-4
      p-4
      rounded-3xl
      shadow-sm
      flex-row
      justify-between
      items-center
    "
    >
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={onPress}
          className="
          w-14
          h-14
          rounded-full
          bg-green-600
          items-center
          justify-center
        "
        >
          <Text className="text-white text-2xl font-bold">
            {user?.name?.charAt(0)?.toUpperCase()}
          </Text>
        </TouchableOpacity>

        <View className="ml-3">
          <Text className="text-gray-500 text-sm">
            Good Morning 👋
          </Text>

          <Text className="text-xl font-bold text-gray-800">
            {user?.name}
          </Text>

          <View className="flex-row items-center mt-1">
            <Ionicons
              name="location"
              size={14}
              color="#16a34a"
            />

            {/* 3. Render the string variable directly */}
            <Text className="text-gray-500 text-xs ml-1">
              {address ? address : "Fetching location..."}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        className="
        w-12
        h-12
        rounded-full
        bg-gray-100
        items-center
        justify-center
      "
      >
        <MaterialIcons
          name="notifications-none"
          size={26}
          color="#111827"
        />
      </TouchableOpacity>
    </View>
  );
}
