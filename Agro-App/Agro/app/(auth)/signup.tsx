import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import axios from "axios";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_API;
console.log("BACKEND_URL", BACKEND_URL);

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [faceImage, setFaceImage] = useState(null);
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);

  const [timer, setTimer] = useState(300);
  const [canResend, setCanResend] = useState(false);

  // Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showOtp && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }

    if (timer === 0) {
      setCanResend(true);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timer, showOtp]);

  // Send OTP
  const handleSendOtp = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${BACKEND_URL}/api/v1/auth/send-otp`,
        {
          email,
          purpose: "signup",
        }
      );

      console.log(response.data);

      Alert.alert("Success", "OTP Sent Successfully");

      setShowOtp(true);
      setTimer(300);
      setCanResend(false);
    } catch (error: any) {
      console.log(error);

      Alert.alert(
        "Error",
        error?.response?.data?.message ||
        "Failed to send OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  //this is for the  get the user images 
  const captureFace = async () => {
    try {
      const permission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Camera permission is required"
        );
        return;
      }

      const result =
        await ImagePicker.launchCameraAsync({
          mediaTypes:
            ImagePicker.MediaTypeOptions.Images,
          quality: 1,
          allowsEditing: true,
        });

      if (!result.canceled) {
        setFaceImage(result.assets[0]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    try {
      setLoading(true);

      const response = await axios.post(
        `${BACKEND_URL}/api/v1/auth/send-otp`,
        {
          email,
          purpose: "signup",
        }
      );

      console.log(response.data);

      Alert.alert("Success", "OTP Resent Successfully");

      setTimer(300);
      setCanResend(false);
    } catch (error: any) {
      console.log(error);

      Alert.alert(
        "Error",
        error?.response?.data?.message ||
        "Failed to resend OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  // Signup
  // const handleSignup = async () => {
  //   if (
  //     !name ||
  //     !email ||
  //     !otp ||
  //     !password ||
  //     !confirmPassword
  //   ) {
  //     Alert.alert(
  //       "Error",
  //       "Please fill all fields"
  //     );
  //     return;
  //   }

  //   if (password !== confirmPassword) {
  //     Alert.alert(
  //       "Error",
  //       "Passwords do not match"
  //     );
  //     return;
  //   }

  //   try {
  //     setLoading(true);

  //     const response = await axios.post(
  //       `${BACKEND_URL}/api/v1/auth/signup`,
  //       {
  //         name,
  //         email,
  //         otp,
  //         password,
  //       }
  //     );

  //     console.log(response.data);

  //     Alert.alert(
  //       "Success",
  //       "Account Created Successfully"
  //     );

  //     router.replace("/login");
  //   } catch (error: any) {
  //     console.log(error);

  //     Alert.alert(
  //       "Error",
  //       error?.response?.data?.message ||
  //       "Signup Failed"
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleSignup = async () => {
    if (
      !name ||
      !email ||
      !otp ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert(
        "Error",
        "Please fill all fields"
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "Error",
        "Passwords do not match"
      );
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("name", name);
      formData.append("email", email);
      formData.append("otp", otp);
      formData.append("password", password);

      // Face image is optional
      if (faceImage) {
        formData.append("faceImage", {
          uri: faceImage.uri,
          type: "image/jpeg",
          name: "face.jpg",
        });
      }

      const response = await axios.post(
        `${BACKEND_URL}/api/v1/auth/signup`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      console.log(
        "Signup Response:",
        response.data
      );

      Alert.alert(
        "Success",
        "Account Created Successfully"
      );

      router.replace("/login");

    } catch (error) {
      console.log(
        "Signup Error:",
        error?.response?.data || error
      );

      Alert.alert(
        "Error",
        error?.response?.data?.message ||
        "Signup Failed"
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <ScrollView className="flex-1 bg-white">
      {/* Image Placeholder */}
      <View className="h-72 bg-green-100 items-center justify-center">
        <Text className="text-lg font-semibold text-green-700">
          Add Your Image Here
        </Text>
      </View>

      {/* Header */}
      <View className="px-6 pt-6">
        <Text className="text-3xl font-bold text-green-900">
          Create Account 🌱
        </Text>

        <Text className="text-gray-500 mt-2">
          Join the Future of Farming
        </Text>
      </View>

      {/* Form */}
      <View className="px-6 mt-6">
        {/* Name */}
        <Text className="mb-2 font-medium text-gray-700">
          Full Name
        </Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Enter your full name"
          className="border border-gray-300 rounded-2xl px-4 py-4 mb-4 bg-gray-50"
        />

        {/* Email */}
        <Text className="mb-2 font-medium text-gray-700">
          Email Address
        </Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          className="border border-gray-300 rounded-2xl px-4 py-4 bg-gray-50"
        />

        {/* Send OTP */}
        {!showOtp && (
          <TouchableOpacity
            onPress={handleSendOtp}
            disabled={loading}
            className="bg-green-600 py-4 rounded-2xl mt-5"
          >
            <Text className="text-white text-center font-bold text-lg">
              {loading ? "Sending..." : "Send OTP"}
            </Text>
          </TouchableOpacity>
        )}
        <Text className="mt-5 mb-2 font-medium text-gray-700">
          Face Login (Optional)
        </Text>

        <TouchableOpacity
          onPress={captureFace}
          className="bg-blue-500 py-4 rounded-2xl"
        >
          <Text className="text-white text-center font-bold">
            Open Camera
          </Text>
        </TouchableOpacity>

        {faceImage && (
          <Text className="text-green-600 mt-2">
            ✓ Face Captured Successfully
          </Text>
        )}
        {/* OTP Section */}
        {showOtp && (
          <>
            <Text className="mt-6 mb-2 font-medium text-gray-700">
              OTP Verification
            </Text>

            <TextInput
              value={otp}
              onChangeText={setOtp}
              placeholder="Enter 6 Digit OTP"
              keyboardType="numeric"
              maxLength={6}
              className="border border-gray-300 rounded-2xl px-4 py-4 bg-gray-50"
            />

            {canResend ? (
              <TouchableOpacity
                onPress={handleResendOtp}
              >
                <Text className="text-green-600 text-right mt-2 font-semibold">
                  Resend OTP
                </Text>
              </TouchableOpacity>
            ) : (
              <Text className="text-gray-500 text-right mt-2">
                Resend OTP in {timer}s
              </Text>
            )}

            {/* Password */}
            <Text className="mt-5 mb-2 font-medium text-gray-700">
              Password
            </Text>

            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Create Password"
              secureTextEntry
              className="border border-gray-300 rounded-2xl px-4 py-4 bg-gray-50"
            />

            {/* Confirm Password */}
            <Text className="mt-5 mb-2 font-medium text-gray-700">
              Confirm Password
            </Text>

            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm Password"
              secureTextEntry
              className="border border-gray-300 rounded-2xl px-4 py-4 bg-gray-50"
            />

            {/* Create Account */}
            <TouchableOpacity
              onPress={handleSignup}
              disabled={loading}
              className="bg-green-700 py-4 rounded-2xl mt-8"
            >
              <Text className="text-white text-center font-bold text-lg">
                {loading
                  ? "Creating..."
                  : "Create Account"}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* Login */}
        <View className="flex-row justify-center mt-8 mb-10">
          <Text className="text-gray-500">
            Already have an account?
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/login")}
          >
            <Text className="text-green-700 font-semibold ml-1">
              Login
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}