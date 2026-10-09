import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import {
  Animated,
  Modal,
  Pressable,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Alert } from "react-native";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_API;
type FaceLoginResult = "success" | "mismatch" | "error";

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [faceImage, setFaceImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [faceLoading, setFaceLoading] = useState(false);
  const [faceResult, setFaceResult] = useState<FaceLoginResult | null>(null);
  const [faceResultMessage, setFaceResultMessage] = useState("");
  const [resultScale] = useState(() => new Animated.Value(0.82));
  const [resultOpacity] = useState(() => new Animated.Value(0));

  const { loadProfile } =
    useContext(UserContext);

  const showFaceResult = (result: FaceLoginResult, message: string) => {
    setFaceResult(result);
    setFaceResultMessage(message);
    resultScale.setValue(0.82);
    resultOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(resultScale, {
        toValue: 1,
        damping: 13,
        stiffness: 170,
        useNativeDriver: true,
      }),
      Animated.timing(resultOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  };


  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(
        "Error",
        "Please fill all fields"
      );
      return;
    }

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/auth/Login`,
        {
          email,
          password,
        }
      );
      await AsyncStorage.setItem(
        "token",
        response.data.token
      );
      await loadProfile();

      Alert.alert("Success", "Login Successful");

      router.replace("/(tabs)/Home");
    } catch (error) {
      Alert.alert(
        "Error",
        error?.response?.data?.message ||
        "Login Failed"
      );
    }
  };



  // this for the handle facelogin 
  const handleFaceLogin = async () => {
    try {
      if (!faceImage) {
        Alert.alert(
          "Error",
          "Please capture your face first"
        );
        return;
      }

      setFaceLoading(true);

      const formData = new FormData();

      formData.append("faceImage", {
        uri: faceImage.uri,
        type: "image/jpeg",
        name: "face.jpg",
      });

      const response = await axios.post(
        `${BACKEND_URL}/api/v1/auth/face-login`,
        formData
      );

      if (response.data?.success !== true) {
        showFaceResult(
          "mismatch",
          response.data?.message || "Sorry, we couldn't match this face. Please try again."
        );
        return;
      }

      await AsyncStorage.setItem("token", response.data.token);
  await loadProfile();
      showFaceResult(
        "success",
        `Face matched successfully${response.data.user?.name ? `, ${response.data.user.name}` : ""}. You're signed in and ready to continue.`
      );
    } catch (error) {
      const status = error instanceof AxiosError ? error.response?.status : undefined;
      const message = status === 401
        ? "Sorry, we couldn't match this face. Please try again or sign in with your password."
        : "We couldn't verify your face right now. Please try again.";
      showFaceResult(status === 401 ? "mismatch" : "error", message);
    } finally {
      setFaceLoading(false);
    }
  };


  //this is for the take the user photo from  the camera 
  const openFaceCamera = async () => {
    try {
      const permission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow camera access"
        );
        return;
      }

      const result =
        await ImagePicker.launchCameraAsync({
          cameraType:
            ImagePicker.CameraType.front,
          allowsEditing: true,
          quality: 1,
        });

      if (!result.canceled) {
        setFaceImage(result.assets[0]);

        console.log(
          "Face Image:",
          result.assets[0]
        );
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
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
          Welcome Back 👋
        </Text>

        <Text className="text-gray-500 mt-2">
          Login to AgroSmart AI
        </Text>
      </View>

      {/* Form */}
      <View className="px-6 mt-8">

        {/* Email */}
        <Text className="text-gray-700 font-medium mb-2">
          Email Address
        </Text>

        <TextInput
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          className="border border-gray-300 rounded-2xl px-4 py-4 bg-gray-50"
        />

        {/* Password */}
        <Text className="text-gray-700 font-medium mt-5 mb-2">
          Password
        </Text>

        <View className="border border-gray-300 rounded-2xl bg-gray-50 flex-row items-center px-4">
          <TextInput
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry={!showPassword}
            className="flex-1 py-4"
          />

          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text className="text-green-700 font-semibold">
              {showPassword ? "Hide" : "Show"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Forgot Password */}
        <TouchableOpacity onPress={() => { router.push("/forgot-password") }}>
          <Text className="text-green-700 text-right mt-3 font-medium">
            Forgot Password?
          </Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity className="bg-green-700 py-4 rounded-2xl mt-8" onPress={() => {
          handleLogin()
        }}>
          <Text className="text-white text-center font-bold text-lg">
            Login
          </Text>
        </TouchableOpacity>
        <View className="mt-8">

          <Text className="text-center text-gray-500 mb-4">
            OR
          </Text>

          <TouchableOpacity
            onPress={openFaceCamera}
            className="bg-blue-600 py-4 rounded-2xl"
          >
            <Text className="text-white text-center font-bold">
              Capture Face
            </Text>
          </TouchableOpacity>

          {faceImage && (
            <Text className="text-green-600 text-center mt-2">
              Face Captured Successfully
            </Text>
          )}

          <TouchableOpacity
            onPress={handleFaceLogin}
            disabled={faceLoading}
            className="bg-green-700 py-4 rounded-2xl mt-4"
          >
            <Text className="text-white text-center font-bold">
              {faceLoading
                ? "Checking..."
                : "Login With Face"}
            </Text>
          </TouchableOpacity>

        </View>
        {/* Divider */}
        <View className="flex-row items-center my-8">
          <View className="flex-1 h-[1px] bg-gray-300" />
          <Text className="mx-3 text-gray-500">OR</Text>
          <View className="flex-1 h-[1px] bg-gray-300" />
        </View>

        {/* Register */}
        <View className="flex-row justify-center mb-10">
          <Text className="text-gray-500">
            {"Don't have an account?"}
          </Text>

          <TouchableOpacity onPress={() => router.push("/signup")}>
            <Text className="text-green-700 font-semibold ml-1">
              Register
            </Text>
          </TouchableOpacity>
        </View>

      </View>

    </ScrollView>
    <Modal
      transparent
      visible={faceResult !== null}
      animationType="fade"
      onRequestClose={() => setFaceResult(null)}
    >
      <View className="flex-1 items-center justify-center bg-black/60 px-6">
        <Animated.View
          style={{ opacity: resultOpacity, transform: [{ scale: resultScale }] }}
          className="w-full max-w-sm items-center rounded-[28px] bg-white px-7 pb-7 pt-8"
        >
          <View
            className="mb-5 h-24 w-24 items-center justify-center rounded-full"
            style={{
              backgroundColor: faceResult === "success"
                ? "#DCFCE7"
                : faceResult === "mismatch"
                  ? "#FFE4E6"
                  : "#FEF3C7",
            }}
          >
            <MaterialCommunityIcons
              name={faceResult === "success"
                ? "emoticon-happy-outline"
                : faceResult === "mismatch"
                  ? "emoticon-sad-outline"
                  : "face-recognition"}
              size={54}
              color={faceResult === "success"
                ? "#15803D"
                : faceResult === "mismatch"
                  ? "#E11D48"
                  : "#B45309"}
            />
          </View>
          <Text className="text-center text-2xl font-bold text-gray-900">
            {faceResult === "success"
              ? "Welcome back!"
              : faceResult === "mismatch"
                ? "Face not matched"
                : "Couldn't verify your face"}
          </Text>
          <Text className="mt-3 text-center text-base leading-6 text-gray-600">
            {faceResultMessage}
          </Text>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => {
              const isSuccess = faceResult === "success";
              setFaceResult(null);
              if (isSuccess) {
                router.replace("/(tabs)/Home");
              } else {
                void openFaceCamera();
              }
            }}
            className={`mt-7 w-full rounded-2xl py-4 ${faceResult === "success" ? "bg-green-700" : "bg-rose-600"}`}
          >
            <Text className="text-center text-base font-bold text-white">
              {faceResult === "success" ? "Continue to AgroSmart" : "Try another photo"}
            </Text>
          </TouchableOpacity>
          {faceResult !== "success" && (
            <Pressable onPress={() => setFaceResult(null)} className="mt-4 px-4 py-2">
              <Text className="font-semibold text-gray-500">Use password instead</Text>
            </Pressable>
          )}
        </Animated.View>
      </View>
    </Modal>
    </>
  );
}