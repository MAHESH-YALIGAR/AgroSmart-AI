import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import axios from "axios";
import { router } from "expo-router";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_API;

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!email.trim()) {
      return Alert.alert("Error", "Enter your email");
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${BACKEND_URL}/api/v1/auth/send-otp`,
        {
          email,
          purpose: "forgot-password",
        }
      );

      Alert.alert(
        "Success",
        response.data.message || "OTP Sent"
      );

      router.push({
        pathname: "/reset-password",
        params: { email },
      });
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message ||
          "Failed to send OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white px-6 justify-center">
      <View className="items-center mb-10">
        <Text className="text-4xl">🔐</Text>

        <Text className="text-3xl font-bold text-green-800 mt-4">
          Forgot Password
        </Text>

        <Text className="text-gray-500 text-center mt-2">
          Enter your email and we'll send an OTP
        </Text>
      </View>

      <TextInput
        placeholder="Enter Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        className="border border-gray-300 bg-gray-50 rounded-2xl px-4 py-4"
      />

      <TouchableOpacity
        onPress={handleSendOtp}
        disabled={loading}
        className="bg-green-600 py-4 rounded-2xl mt-6"
      >
        <Text className="text-white text-center font-bold text-lg">
          {loading ? "Sending..." : "Send OTP"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}