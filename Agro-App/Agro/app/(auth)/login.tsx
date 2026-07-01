import React, { useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
// import useRouter from 'expo-router';
import { router } from "expo-router";
import { Alert } from "react-native";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_API;

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [faceImage, setFaceImage] = useState(null);
  const [faceLoading, setFaceLoading] = useState(false);

  const { loadProfile } =
    useContext(UserContext);


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

      console.log(response.data);
      router.replace("/(tabs)/Home");
      Alert.alert(response)
    } catch (error) {
      console.log(error);
      
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
  );
}