import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import axios from "axios";
import { router, Router } from "expo-router";
import { useLocalSearchParams } from "expo-router";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_API;

export default function ResetPassword() {
  const { email } = useLocalSearchParams();

  const [otp, setOtp] = useState("");
  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleResetPassword = async () => {
    if (
      !otp ||
      !password ||
      !confirmPassword
    ) {
      return Alert.alert(
        "Error",
        "Fill all fields"
      );
    }

    if (password !== confirmPassword) {
      return Alert.alert(
        "Error",
        "Passwords do not match"
      );
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${BACKEND_URL}/api/v1/auth/resetpassword`,
        {
          email,
          otp,
          newPassword: password,
        }
      );

      Alert.alert(
        "Success",
        response.data.message
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message ||
        "Reset Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white px-6 justify-center">
      <View className="items-center mb-8">
        <Text className="text-4xl">🔑</Text>

        <Text className="text-3xl font-bold text-green-800 mt-4">
          Reset Password
        </Text>

        <Text className="text-gray-500 text-center mt-2">
          Verify OTP and create new password
        </Text>
      </View>

      <TextInput
        placeholder="Enter OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="numeric"
        maxLength={6}
        className="border border-gray-300 bg-gray-50 rounded-2xl px-4 py-4 mb-4"
      />

      <TextInput
        placeholder="New Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        className="border border-gray-300 bg-gray-50 rounded-2xl px-4 py-4 mb-4"
      />

      <TextInput
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        className="border border-gray-300 bg-gray-50 rounded-2xl px-4 py-4"
      />

      <TouchableOpacity
        onPress={() => {
          handleResetPassword(); // Added parentheses to execute the function
          router.push('/(auth)/login');
        }}
        disabled={loading}
        className="bg-green-700 py-4 rounded-2xl mt-6"
      >

        <Text className="text-white text-center font-bold text-lg">
          {loading
            ? "Updating..."
            : "Reset Password"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}