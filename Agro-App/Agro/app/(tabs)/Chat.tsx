import React, { useState, useRef, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserContext } from "../context/UserContext";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Animated,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Image,
  Linking,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { speakText, stopSpeech } from "../../services/textToSpeech";
const BACKEND_API = process.env.EXPO_PUBLIC_PYTHON_BACKEND_API || "http://192.168.244.122:8000";
console.log("PYTHON BACKEND API:", BACKEND_API);
const SCREEN_WIDTH = Dimensions.get("window").width;
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.78;

const resolveStructuredReply = (reply: any) => {
  const sourceText =
    typeof reply === "string"
      ? reply
      : reply?.reply || reply?.message || "";

  const parseJson = (value: string) => {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  };

  const parsedReply =
    typeof sourceText === "string" && sourceText.trim().length > 0
      ? parseJson(sourceText.trim())
      : null;

  const payload = parsedReply ?? reply;
  const responseType = payload?.type || "text";
  const responseData = Array.isArray(payload?.data) ? payload.data : [];

  if (responseType === "expert" || responseType === "experts") {
    return {
      kind: "experts" as const,
      text: sourceText || "Here are some agro experts near you.",
      data: responseData,
    };
  }

  if (responseType === "agro_store" || responseType === "stores") {
    return {
      kind: "stores" as const,
      text: sourceText || "Here are some agro stores near you.",
      data: responseData,
    };
  }

  if (payload && typeof payload === "object") {
    if (Array.isArray(payload.experts)) {
      return {
        kind: "experts" as const,
        text: sourceText || "Here are some agro experts near you.",
        data: payload.experts,
      };
    }

    if (Array.isArray(payload.stores)) {
      return {
        kind: "stores" as const,
        text: sourceText || "Here are some agro stores near you.",
        data: payload.stores,
      };
    }

    if (Array.isArray(payload.results)) {
      const experts = payload.results.filter((item: any) => item?.expert || item?.cropSpecialization || item?.experienceYears);
      if (experts.length > 0) {
        return {
          kind: "experts" as const,
          text: sourceText || "Here are some agro experts near you.",
          data: experts,
        };
      }

      const stores = payload.results.filter((item: any) => item?.storeName || item?.ownerName || item?.openingTime || item?.closingTime);
      if (stores.length > 0) {
        return {
          kind: "stores" as const,
          text: sourceText || "Here are some agro stores near you.",
          data: stores,
        };
      }
    }
  }

  const normalizedText = (sourceText || "").toLowerCase();
  if (normalizedText.includes("experts")) {
    return {
      kind: "experts" as const,
      text: sourceText || "Here are some agro experts near you.",
      data: [],
    };
  }

  if (normalizedText.includes("stores")) {
    return {
      kind: "stores" as const,
      text: sourceText || "Here are some agro stores near you.",
      data: [],
    };
  }

  return {
    kind: "text" as const,
    text:
      typeof reply === "string"
        ? reply
        : reply?.reply || reply?.message || "Sorry, I couldn't process that response.",
    data: [],
  };
};

type MessageItem = {
  id: string;
  type: "user" | "assistant";
  text: string;
  kind?: "text" | "experts" | "stores";
  data?: any[];
  imageUri?: string;
};

const ChatScreen = () => {
  const [message, setMessage] = useState("");
  const [chats] = useState<any[]>([]); // recent chat history items
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userid, setUserid] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [selectedExpertDetail, setSelectedExpertDetail] = useState<any | null>(null);
  const [expertFeedbackDrafts, setExpertFeedbackDrafts] = useState<
    Record<string, { rating: number; comment: string }>
  >({});
  const activeSpeechMessageIdRef = useRef<string | null>(null);

  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

  const { user } = useContext(UserContext);

  const languages = ["Kannada", "English", "Hindi", "Tamil", "Telugu", "Malayalam", "Marathi"];

  const handleAssistantSpeech = useCallback((messageId: string, text: string) => {
    if (!text || !text.trim()) {
      return;
    }

    const isCurrentSpeech = activeSpeechMessageIdRef.current === messageId;

    if (isCurrentSpeech) {
      stopSpeech();
      activeSpeechMessageIdRef.current = null;
      return;
    }

    stopSpeech();
    activeSpeechMessageIdRef.current = messageId;

    speakText(text, selectedLanguage, {
      onError: (message) => {
        Alert.alert("Text-to-Speech", message);
        activeSpeechMessageIdRef.current = null;
      },
      onDone: () => {
        activeSpeechMessageIdRef.current = null;
      },
      onStopped: () => {
        activeSpeechMessageIdRef.current = null;
      },
    });
  }, [selectedLanguage]);

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
    setLanguageModalVisible(false);
  };
  useEffect(() => {
    if (user?._id) {
      setUserid(user._id);
    }
    // console.log("langitude", user.longitude, "latitude", user.latitude)

    const BACKEND_API = process.env.EXPO_PUBLIC_PYTHON_BACKEND_API;
    console.log("PYTHON BACKEND API:", BACKEND_API);
  }, [user?._id]);
  useEffect(() => {
    const checkAllStorageKeys = async () => {
      try {
        // 1. Fetch every single key present in AsyncStorage
        const allKeys = await AsyncStorage.getAllKeys();
        console.log("📂 All active AsyncStorage keys found:", allKeys);

        // 2. Fetch all key-value pairings to see their actual text values
        const allPairs = await AsyncStorage.multiGet(allKeys);
        console.log("📋 Stored Data Entries:", allPairs);
      } catch (error) {
        console.log("❌ Error reading storage keys:", error);
      }
    };

    checkAllStorageKeys();
  }, []);
  useEffect(() => {
    const expertId = selectedExpertDetail?._id || selectedExpertDetail?.email;

    if (!expertId) {
      return;
    }

    const fetchExpertFeedbacks = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_API.replace(/\/$/, "")}/expert-feedbacks/${encodeURIComponent(expertId)}`
        );

        const feedbacks = response?.data?.data || [];

        setSelectedExpertDetail((prev: any) => {
          if (!prev) {
            return prev;
          }

          return {
            ...prev,
            feedbacks,
          };
        });
      } catch (error) {
        console.log("Unable to load expert feedback in chat modal:", error);
      }
    };

    fetchExpertFeedbacks();
  }, [selectedExpertDetail?._id, selectedExpertDetail?.email]);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: sidebarOpen ? 0 : -SIDEBAR_WIDTH,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [sidebarOpen, slideAnim]);

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const pushMessage = (
    text: string,
    type: "user" | "assistant",
    options?: { kind?: MessageItem["kind"]; data?: any[]; imageUri?: string }
  ) => {
    const newMessage = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      text,
      kind: options?.kind ?? "text",
      data: options?.data,
      imageUri: options?.imageUri,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handlePickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Photo access needed", "Please allow access to your photos to attach an image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setSelectedImage(result.assets[0].uri);
    }
  }, []);

  const handleTakePhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Camera access needed", "Please allow camera access to take a photo.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setSelectedImage(result.assets[0].uri);
    }
  }, []);

 const handleSend = async () => {
  console.log("Send button clicked");

  const trimmed = message.trim();
  const hasAttachment = Boolean(selectedImage);

  // If there's no text and no image, do nothing
  if (!trimmed && !hasAttachment) return;

  // Fallback text if user only sends a photo without a message prompt
  const promptText = trimmed || "explane about this disease impact and  reson and  solution .";

  console.log("BACKEND_API =", BACKEND_API);
  console.log("userid =", userid);
  console.log("message =", promptText);

  // 1. Instantly display user's message/photo in the chat interface
  pushMessage(promptText, "user", { imageUri: selectedImage ?? undefined });
  
  // Store a reference to the image before clearing state
  const imageToUpload = selectedImage;

  // Clear input fields immediately for an optimal user experience
  setMessage("");
  setSelectedImage(null);

  // 2. Fetch current user location coordinates
  const latitude = await AsyncStorage.getItem("latitude");
  const longitude = await AsyncStorage.getItem("longitude");

  console.log("Latitude:", latitude);
  console.log("Longitude:", longitude);

  try {
    // 3. Construct a structural data object matching your backend ChatRequest schema
    const chatMetadata = {
      userId: userid || "guest",
      prompt: promptText, // Use promptText to ensure something is always sent
      language: selectedLanguage || "English",
      latitude: Number(latitude ?? 0),
      longitude: Number(longitude ?? 0),
    };

    // 4. Initialize FormData payload (required for multi-part binary streaming)
    const formData = new FormData();
    
    // Add structural fields under the "payload" key as a serialized string
    formData.append("payload", JSON.stringify(chatMetadata));

    // 5. Append the native file parameters if an image was picked
    if (imageToUpload) {
      const filename = imageToUpload.split("/").pop() || "upload.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const fileType = match ? `image/${match[1]}` : "image/jpeg";

      // @ts-ignore (Suppresses React Native FormData type differences)
      formData.append("photo", {
        uri: imageToUpload,
        name: filename,
        type: fileType,
      });
    }

    console.log("Sending Form Data payload metadata:", chatMetadata);

    // 6. Post multipart/form-data request using Axios
    const response = await axios.post(`${BACKEND_API}/chat`, formData, {
      headers: {
        // Do NOT manually define boundary here; Axios appends native ones securely
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("AI Response:", response.data);

    const responsePayload = response?.data;
    const structuredReply = resolveStructuredReply(responsePayload);

    pushMessage(structuredReply.text, "assistant", {
      kind: structuredReply.kind,
      data: structuredReply.data,
    });

  } catch (error: any) {
    console.log("FULL ERROR");
    console.log(error?.message);
    console.log(error?.response?.status);
    console.log("Error Payload Data:", JSON.stringify(error?.response?.data));

    // CRASH FIX: Guard against structured objects by extracting or stringifying details safely
    let errorText = "Sorry, I couldn't reach the assistant right now.";
    
    if (error?.response?.data?.detail) {
      const detail = error.response.data.detail;
      // If the backend returns an error list/object, convert it to a string so it won't crash React
      errorText = typeof detail === "object" ? JSON.stringify(detail) : String(detail);
    } else if (error?.response?.data?.message) {
      errorText = String(error.response.data.message);
    }

    pushMessage(errorText, "assistant");
  }
};

  const renderChatItem = useCallback(({ item }: { item: any }) => (
    <TouchableOpacity
      className="bg-green-50 rounded-2xl p-4 mb-3"
      onPress={closeSidebar}
    >
      <Text className="text-sm font-semibold text-gray-800">{item.title}</Text>
      {item.subtitle ? (
        <Text className="text-xs text-gray-500 mt-1">{item.subtitle}</Text>
      ) : null}
    </TouchableOpacity>
  ), [closeSidebar]);

  const openGoogleMaps = useCallback((latitude?: number | string, longitude?: number | string) => {
    const parsedLatitude = Number(latitude);
    const parsedLongitude = Number(longitude);

    if (!Number.isFinite(parsedLatitude) || !Number.isFinite(parsedLongitude)) {
      return;
    }

    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${parsedLatitude},${parsedLongitude}`
    );
  }, []);

  const openPhoneDialer = useCallback((phoneNumber?: string) => {
    if (!phoneNumber) {
      return;
    }

    Linking.openURL(`tel:${phoneNumber}`);
  }, []);

  const getExpertFeedbackSummary = (feedbacks: any[] = []) => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    if (!feedbacks.length) {
      return {
        average: 0,
        totalRatings: 0,
        distribution,
      };
    }

    let totalValue = 0;

    feedbacks.forEach((item) => {
      const rating = Math.min(Math.max(Number(item?.rating ?? 0), 1), 5);
      totalValue += rating;
      distribution[rating as keyof typeof distribution] += 1;
    });

    return {
      average: totalValue / feedbacks.length,
      totalRatings: feedbacks.length,
      distribution,
    };
  };

  const updateExpertFeedbackDraft = (expertKey: string, field: "rating" | "comment", value: number | string) => {
    setExpertFeedbackDrafts((prev) => ({
      ...prev,
      [expertKey]: {
        rating: prev[expertKey]?.rating ?? 0,
        comment: prev[expertKey]?.comment ?? "",
        [field]: value,
      },
    }));
  };

  const selectedExpertDetailKey = selectedExpertDetail
    ? selectedExpertDetail._id || selectedExpertDetail.email || selectedExpertDetail.name || "expert-detail"
    : "expert-detail";
  const selectedExpertDraft = expertFeedbackDrafts[selectedExpertDetailKey] || { rating: 0, comment: "" };
  const selectedExpertFeedbackSummary = getExpertFeedbackSummary(selectedExpertDetail?.feedbacks || []);

  const submitExpertFeedback = async (expert: any) => {
    const expertKey = expert?._id || expert?.email || expert?.name || "expert-detail";
    const draft = expertFeedbackDrafts[expertKey] || { rating: 0, comment: "" };

    if (draft.rating === 0) {
      Alert.alert("Please select a rating before submitting feedback.");
      return;
    }

    const payload = {
      userId: userid || "USER_123",
      expertId: expert?._id || expert?.email || expertKey,
      adviceId: expert?.adviceId || `ADVICE_${String(expertKey).replace(/[^a-zA-Z0-9]/g, "").toUpperCase()}_1`,
      rating: draft.rating,
      feedbackText: draft.comment.trim() || "No additional comments.",
    };

    try {
      const response = await axios.post(
        `${BACKEND_API.replace(/\/$/, "")}/expert-feedback`,
        payload
      );

      const newFeedback = {
        id: response?.data?.data?._id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        adviceId: payload.adviceId,
        expertId: payload.expertId,
        userId: payload.userId,
        rating: payload.rating,
        comment: payload.feedbackText,
      };

      setSelectedExpertDetail((prev: any) => ({
        ...prev,
        feedbacks: [...(prev?.feedbacks || []), newFeedback],
      }));

      setExpertFeedbackDrafts((prev) => ({
        ...prev,
        [expertKey]: { rating: 0, comment: "" },
      }));

      Alert.alert("Feedback submitted", "Your feedback was sent successfully.");
    } catch (error: any) {
      console.log("Expert feedback submit error:", error);
      Alert.alert(
        "Unable to submit feedback",
        "Please check the Python backend connection or try again later."
      );
    }
  };

  const renderMessageItem = useCallback(({ item }: { item: MessageItem }) => {
    const getCoordinates = (entry: any) => {
      const location = entry?.location;

      if (Array.isArray(location?.coordinates) && location.coordinates.length >= 2) {
        return {
          latitude: location.coordinates[1],
          longitude: location.coordinates[0],
        };
      }

      if (location && typeof location === "object") {
        return {
          latitude: location?.latitude ?? location?.lat ?? entry?.latitude ?? entry?.lat,
          longitude: location?.longitude ?? location?.lng ?? entry?.longitude ?? entry?.lng,
        };
      }

      return {
        latitude: entry?.latitude ?? entry?.lat,
        longitude: entry?.longitude ?? entry?.lng,
      };
    };
    const isAssistantStructured =
      item.type === "assistant" && item.kind !== "text" && Array.isArray(item.data) && item.data.length > 0;

    return (
      <View
        className={
          item.type === "user"
            ? "self-end bg-green-600 p-4 rounded-3xl mb-3 max-w-[80%]"
            : isAssistantStructured
            ? "self-start bg-transparent rounded-3xl mb-3 w-[92%]"
            : "self-start bg-gray-100 p-4 rounded-3xl mb-3 max-w-[80%]"
        }
      >
        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} className="w-56 h-56 rounded-2xl mb-3" resizeMode="cover" />
        ) : null}

        {item.type === "user" ? (
          <Text className="text-white text-base">{item.text}</Text>
        ) : null}

        {item.type === "assistant" && item.kind === "text" ? (
          <View className="flex-row items-center">
            <Text className="text-gray-900">{item.text}</Text>
            <TouchableOpacity
              className="ml-3 p-2 rounded-full bg-green-100"
              onPress={() => handleAssistantSpeech(item.id, item.text)}
              activeOpacity={0.8}
            >
              <Ionicons name="volume-high-outline" size={18} color="#16A34A" />
            </TouchableOpacity>
          </View>
        ) : null}

        {isAssistantStructured ? (
          <View className="w-full">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-gray-900 font-semibold">{item.text}</Text>
              <TouchableOpacity
                className="ml-3 p-2 rounded-full bg-green-100"
                onPress={() => handleAssistantSpeech(item.id, item.text)}
                activeOpacity={0.8}
              >
                <Ionicons name="volume-high-outline" size={18} color="#16A34A" />
              </TouchableOpacity>
            </View>
            {(item.data || []).map((entry: any, index: number) => {
              if (item.kind === "experts") {
                const expert = entry;
                const expertPhoto = expert?.photo || expert?.image || expert?.imageUrl || expert?.photoUrl;
                const expertName = expert?.name || expert?.expertName || expert?.fullName || "Agro Expert";
                const specialization = expert?.cropSpecialization || expert?.specialization || expert?.crop || "Agriculture";
                const experience = expert?.experienceYears || expert?.experience || expert?.yearsOfExperience || "—";
                const phoneNumber = expert?.phoneNumber || expert?.phone || expert?.contactNumber || expert?.mobile || "—";
                const address = expert?.address || [expert?.state, expert?.district, expert?.taluka, expert?.place].filter(Boolean).join(", ") || "—";
                const distance = expert?.distance || expert?.distanceKm || expert?.distanceFromUser || "—";
                const { latitude, longitude } = getCoordinates(expert);

                return (
                  <TouchableOpacity
                    key={`${item.id}-expert-${index}`}
                    className="bg-white rounded-2xl border border-gray-200 p-4 mb-3"
                    activeOpacity={0.9}
                    onPress={() => setSelectedExpertDetail(expert)}
                  >
                    <View className="flex-row items-start">
                      {expertPhoto ? (
                        <Image source={{ uri: expertPhoto }} className="w-16 h-16 rounded-full mr-3" />
                      ) : (
                        <View className="w-16 h-16 rounded-full bg-green-100 items-center justify-center mr-3">
                          <Ionicons name="person" size={24} color="#16A34A" />
                        </View>
                      )}
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-gray-900">{expertName}</Text>
                        <Text className="text-sm text-green-700 mt-1">{specialization}</Text>
                        <Text className="text-sm text-gray-600 mt-1">Experience: {experience} years</Text>
                      </View>
                    </View>

                    <View className="mt-3 space-y-1">
                      <Text className="text-sm text-gray-700">📞 {phoneNumber}</Text>
                      <Text className="text-sm text-gray-700">📍 {address}</Text>
                      <Text className="text-sm text-gray-700">🧭 Distance: {distance}</Text>
                    </View>

                    <View className="flex-row mt-4">
                      <TouchableOpacity
                        className="flex-1 bg-blue-600 rounded-xl py-2.5 mr-2"
                        onPress={() => setSelectedExpertDetail(expert)}
                      >
                        <Text className="text-white text-center font-semibold">View Details</Text>
                      </TouchableOpacity>
                    </View>

                    <View className="flex-row mt-2">
                      <TouchableOpacity
                        className="flex-1 bg-green-600 rounded-xl py-2.5 mr-2"
                        onPress={() => openGoogleMaps(latitude, longitude)}
                      >
                        <Text className="text-white text-center font-semibold">📍 View Location</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="flex-1 bg-gray-900 rounded-xl py-2.5 ml-2"
                        onPress={() => openPhoneDialer(phoneNumber)}
                      >
                        <Text className="text-white text-center font-semibold">📞 Call</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              }

              const store = entry;
              const storeLogo = store?.logo || store?.storeLogo || store?.image || store?.imageUrl;
              const storeName = store?.storeName || store?.name || store?.shopName || "Agro Store";
              const ownerName = store?.ownerName || store?.owner || store?.owner_name || "—";
              const phoneNumber = store?.phoneNumber || store?.phone || store?.contactNumber || store?.mobile || "—";
              const address = store?.address || [store?.state, store?.district, store?.taluka, store?.place].filter(Boolean).join(", ") || "—";
              const openingTime = store?.openingTime || store?.openTime || "—";
              const closingTime = store?.closingTime || store?.closeTime || "—";
              const distance = store?.distance || store?.distanceKm || store?.distanceFromUser || "—";
              const { latitude, longitude } = getCoordinates(store);

              return (
                <View key={`${item.id}-store-${index}`} className="bg-white rounded-2xl border border-gray-200 p-4 mb-3">
                  <View className="flex-row items-start">
                    {storeLogo ? (
                      <Image source={{ uri: storeLogo }} className="w-16 h-16 rounded-xl mr-3" />
                    ) : (
                      <View className="w-16 h-16 rounded-xl bg-amber-100 items-center justify-center mr-3">
                        <Ionicons name="storefront" size={24} color="#D97706" />
                      </View>
                    )}
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900">{storeName}</Text>
                      <Text className="text-sm text-gray-600 mt-1">Owner: {ownerName}</Text>
                    </View>
                  </View>

                  <View className="mt-3 space-y-1">
                    <Text className="text-sm text-gray-700">📞 {phoneNumber}</Text>
                    <Text className="text-sm text-gray-700">📍 {address}</Text>
                    <Text className="text-sm text-gray-700">🕒 {openingTime} - {closingTime}</Text>
                    <Text className="text-sm text-gray-700">🧭 Distance: {distance}</Text>
                  </View>

                  <View className="flex-row mt-4">
                    <TouchableOpacity
                      className="flex-1 bg-green-600 rounded-xl py-2.5 mr-2"
                      onPress={() => openGoogleMaps(latitude, longitude)}
                    >
                      <Text className="text-white text-center font-semibold">📍 View Location</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 bg-gray-900 rounded-xl py-2.5 ml-2"
                      onPress={() => openPhoneDialer(phoneNumber)}
                    >
                      <Text className="text-white text-center font-semibold">📞 Call</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}
      </View>
    );
  }, [handleAssistantSpeech, openGoogleMaps, openPhoneDialer]);

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 pt-6 pb-4 border-b border-gray-200 bg-white flex-row items-center">
        <TouchableOpacity onPress={openSidebar} className="mr-3">
          <Ionicons name="menu" size={28} color="#16A34A" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-2xl font-bold text-gray-900">AI Farming Assistant</Text>
          <Text className="text-sm text-gray-500 mt-1">
            Ask questions about your crops and farm conditions.
          </Text>
        </View>
      </View>

      {/* Main chat area */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View className="flex-1 px-4 pt-4">
          <View className="flex-1 rounded-3xl bg-gray-50 p-4 mb-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-base font-semibold text-gray-900">Conversation</Text>
              <TouchableOpacity
                className="bg-green-600 px-4 py-2 rounded-2xl"
                onPress={() => setMessages([])}
              >
                <Text className="text-white font-semibold">New Chat</Text>
              </TouchableOpacity>
            </View>

            {messages.length > 0 ? (
              <FlatList
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderMessageItem}
                contentContainerStyle={{ paddingBottom: 16 }}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View className="rounded-3xl bg-white p-5 border border-dashed border-gray-200">
                <Text className="text-sm text-gray-500">
                  Your messages will appear here once you start chatting.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Input + icons row - stays above keyboard because of KeyboardAvoidingView */}
        <View className="px-4 pb-6">
          <View className="bg-gray-100 rounded-3xl px-4 py-3 mb-3">
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Ask anything about your crop..."
              placeholderTextColor="#6B7280"
              className="text-base text-gray-900"
              multiline
            />
          </View>

          {selectedImage ? (
            <View className="mb-3 rounded-2xl border border-green-200 bg-green-50 p-2">
              <View className="relative">
                <Image source={{ uri: selectedImage }} className="w-full h-40 rounded-xl" resizeMode="cover" />
                <TouchableOpacity
                  className="absolute top-2 right-2 bg-black/60 rounded-full w-8 h-8 items-center justify-center"
                  onPress={() => setSelectedImage(null)}
                >
                  <Ionicons name="close" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <TouchableOpacity className="mr-4" onPress={handlePickImage} activeOpacity={0.8}>
                <Ionicons name="images" size={26} color="#16A34A" />
              </TouchableOpacity>
              <TouchableOpacity className="mr-4" onPress={handleTakePhoto} activeOpacity={0.8}>
                <Ionicons name="camera" size={26} color="#16A34A" />
              </TouchableOpacity>
              <TouchableOpacity className="mr-4" activeOpacity={0.8} onPress={() => setLanguageModalVisible(true)}>
                <MaterialIcons name="translate" size={26} color="#16A34A" />
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.8}>
                <MaterialIcons name="keyboard-voice" size={28} color="#16A34A" />
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center">
              <TouchableOpacity
                className={
                  message.trim() || selectedImage
                    ? "bg-green-600 px-5 py-3 rounded-2xl"
                    : "bg-green-300 px-5 py-3 rounded-2xl"
                }
                onPress={handleSend}
                disabled={!message.trim() && !selectedImage}
              >
                <Text className="text-white font-semibold">Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={languageModalVisible}
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <Pressable className="flex-1 bg-black/35 items-center justify-center px-5" onPress={() => setLanguageModalVisible(false)}>
          <Pressable className="w-full rounded-3xl bg-white p-5" onPress={() => {}}>
            <Text className="text-lg font-bold text-gray-900 mb-4">Select Language</Text>

            {languages.map((lang) => (
              <TouchableOpacity
                key={lang}
                className={[
                  "flex-row items-center justify-between rounded-2xl border px-4 py-3 mb-2",
                  selectedLanguage === lang ? "border-green-600 bg-green-50" : "border-gray-200 bg-white",
                ].join(" ")}
                onPress={() => handleLanguageSelect(lang)}
              >
                <Text className={selectedLanguage === lang ? "text-green-700 font-semibold" : "text-gray-800"}>
                  {lang}
                </Text>
                {selectedLanguage === lang ? (
                  <MaterialIcons name="check" size={20} color="#16A34A" />
                ) : null}
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={Boolean(selectedExpertDetail)}
        onRequestClose={() => setSelectedExpertDetail(null)}
      >
        <View className="flex-1 bg-black/40 justify-center px-4">
          <View className="bg-white rounded-3xl max-h-[85%] p-4">
            {selectedExpertDetail ? (
              <>
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-xl font-bold text-gray-900">Expert Details</Text>
                  <TouchableOpacity onPress={() => setSelectedExpertDetail(null)}>
                    <Ionicons name="close" size={24} color="#374151" />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <View className="items-center mb-4">
                    {selectedExpertDetail?.photo || selectedExpertDetail?.image || selectedExpertDetail?.imageUrl ? (
                      <Image
                        source={{ uri: selectedExpertDetail.photo || selectedExpertDetail.image || selectedExpertDetail.imageUrl }}
                        className="w-24 h-24 rounded-full"
                      />
                    ) : (
                      <View className="w-24 h-24 rounded-full bg-green-100 items-center justify-center">
                        <Ionicons name="person" size={36} color="#16A34A" />
                      </View>
                    )}
                  </View>

                  <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
                    {selectedExpertDetail?.name || selectedExpertDetail?.expertName || "Agro Expert"}
                  </Text>

                  <Text className="text-base text-green-700 text-center mb-3">
                    {selectedExpertDetail?.cropSpecialization || selectedExpertDetail?.specialization || selectedExpertDetail?.crop || "Agriculture"}
                  </Text>

                  <View className="bg-gray-50 rounded-2xl p-3 mb-4">
                    <Text className="text-sm text-gray-700">📞 {selectedExpertDetail?.phoneNumber || selectedExpertDetail?.phone || selectedExpertDetail?.contactNumber || selectedExpertDetail?.mobile || "—"}</Text>
                    <Text className="text-sm text-gray-700 mt-1">📍 {selectedExpertDetail?.address || [selectedExpertDetail?.state, selectedExpertDetail?.district, selectedExpertDetail?.taluka, selectedExpertDetail?.place].filter(Boolean).join(", ") || "—"}</Text>
                    <Text className="text-sm text-gray-700 mt-1">🧭 Distance: {selectedExpertDetail?.distance || selectedExpertDetail?.distanceKm || selectedExpertDetail?.distanceFromUser || "—"}</Text>
                    <Text className="text-sm text-gray-700 mt-1">⭐ Experience: {selectedExpertDetail?.experienceYears || selectedExpertDetail?.experience || selectedExpertDetail?.yearsOfExperience || "—"} years</Text>
                  </View>

                  <View className="mb-4">
                    <Text className="text-base font-semibold text-gray-900 mb-2">Feedback Summary</Text>

                    <View className="bg-green-50 rounded-2xl p-3">
                      <Text className="text-sm text-gray-700">
                        {selectedExpertFeedbackSummary.totalRatings > 0
                          ? `${selectedExpertFeedbackSummary.average.toFixed(1)} / 5 average rating from ${selectedExpertFeedbackSummary.totalRatings} review(s)`
                          : "No ratings yet for this expert."}
                      </Text>
                    </View>

                    {selectedExpertFeedbackSummary.totalRatings > 0 ? (
                      <View className="mt-3">
                        {Array.from({ length: 5 }, (_, starIndex) => {
                          const starValue = 5 - starIndex;
                          const count = selectedExpertFeedbackSummary.distribution[starValue as keyof typeof selectedExpertFeedbackSummary.distribution];
                          const percentage = (count / selectedExpertFeedbackSummary.totalRatings) * 100;

                          return (
                            <View key={starValue} className="flex-row items-center mt-1">
                              <Text className="w-9 text-xs text-gray-600">{starValue}★</Text>
                              <View className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                                <View className="h-full rounded-full bg-green-500" style={{ width: `${percentage}%` }} />
                              </View>
                              <Text className="ml-2 w-8 text-right text-xs text-gray-600">{count}</Text>
                            </View>
                          );
                        })}
                      </View>
                    ) : null}
                  </View>

                  <View className="mb-4">
                    <Text className="text-base font-semibold text-gray-900 mb-2">Recent Feedback</Text>

                    {(selectedExpertDetail?.feedbacks || []).length > 0 ? (
                      (selectedExpertDetail.feedbacks || []).slice(-3).map((feedback: any, feedbackIndex: number) => (
                        <View key={`${feedback.id || feedback.adviceId || "feedback"}-${feedbackIndex}`} className="bg-gray-50 rounded-2xl p-3 mb-2">
                          <View className="flex-row items-center mb-1">
                            {Array.from({ length: 5 }, (_, starIndex) => (
                              <Ionicons
                                key={starIndex}
                                name={feedback.rating > starIndex ? "star" : "star-outline"}
                                size={16}
                                color={feedback.rating > starIndex ? "#F59E0B" : "#9CA3AF"}
                              />
                            ))}
                          </View>
                          <Text className="text-sm text-gray-700">{feedback.comment || feedback.feedbackText || "No comments."}</Text>
                        </View>
                      ))
                    ) : (
                      <Text className="text-sm text-gray-500">No feedback available yet.</Text>
                    )}
                  </View>

                  <View className="mb-4">
                    <Text className="text-base font-semibold text-gray-900 mb-2">Rate This Expert</Text>

                    <View className="flex-row mb-3">
                      {Array.from({ length: 5 }, (_, starIndex) => {
                        const starValue = starIndex + 1;
                        return (
                          <TouchableOpacity
                            key={starValue}
                            onPress={() => updateExpertFeedbackDraft(selectedExpertDetailKey, "rating", starValue)}
                            className="mr-1"
                          >
                            <Ionicons
                              name={selectedExpertDraft.rating >= starValue ? "star" : "star-outline"}
                              size={28}
                              color={selectedExpertDraft.rating >= starValue ? "#F59E0B" : "#9CA3AF"}
                            />
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    <TextInput
                      className="border border-gray-300 rounded-2xl px-3 py-3 text-gray-800 mb-3"
                      multiline
                      numberOfLines={4}
                      placeholder="Write your feedback here..."
                      value={selectedExpertDraft.comment}
                      onChangeText={(text) => updateExpertFeedbackDraft(selectedExpertDetailKey, "comment", text)}
                    />

                    <TouchableOpacity
                      className="bg-green-600 rounded-2xl py-3"
                      onPress={() => submitExpertFeedback(selectedExpertDetail)}
                    >
                      <Text className="text-white text-center font-semibold">Submit Feedback</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </>
            ) : null}
          </View>
        </View>
      </Modal>

      {/* Left sidebar - chat history */}
      <Modal
        visible={sidebarOpen}
        transparent
        animationType="none"
        onRequestClose={closeSidebar}
      >
        <View className="flex-1 flex-row">
          <Animated.View
            style={{
              width: SIDEBAR_WIDTH,
              transform: [{ translateX: slideAnim }],
            }}
            className="bg-white h-full pt-12 px-4"
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-gray-900">Chat History</Text>
              <TouchableOpacity onPress={closeSidebar}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="bg-green-600 rounded-2xl py-3 mb-4 items-center"
              onPress={() => {
                setMessages([]);
                closeSidebar();
              }}
            >
              <Text className="text-white font-semibold">+ New Chat</Text>
            </TouchableOpacity>

            {chats.length > 0 ? (
              <FlatList
                data={chats}
                keyExtractor={(item) => item.id}
                renderItem={renderChatItem}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View className="rounded-2xl bg-gray-50 p-4 border border-dashed border-gray-200">
                <Text className="text-sm text-gray-500">
                  No recent chats yet. Start a new conversation.
                </Text>
              </View>
            )}
          </Animated.View>

          {/* Tap outside to close */}
          <Pressable className="flex-1 bg-black/40" onPress={closeSidebar} />
        </View>
      </Modal>
    </View>
  );
};

export default ChatScreen;