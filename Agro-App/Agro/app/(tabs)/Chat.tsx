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
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
const BACKEND_API = process.env.EXPO_PUBLIC_PYTHON_BACKEND_API || "http://192.168.244.122:8000";
console.log("PYTHON BACKEND API:", BACKEND_API);
const SCREEN_WIDTH = Dimensions.get("window").width;
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.78;

type MessageItem = {
  id: string;
  type: "user" | "assistant";
  text: string;
};

const ChatScreen = () => {
  const [message, setMessage] = useState("");
  const [chats] = useState<any[]>([]); // recent chat history items
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userid, setUserid] = useState<string | null>(null);

  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

  const { user } = useContext(UserContext);


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
    Animated.timing(slideAnim, {
      toValue: sidebarOpen ? 0 : -SIDEBAR_WIDTH,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [sidebarOpen, slideAnim]);

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const pushMessage = (text: string, type: "user" | "assistant") => {
    const newMessage = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      text,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleSend = async () => {
    console.log("Send button clicked");

    const trimmed = message.trim();

    if (!trimmed) return;

    console.log("BACKEND_API =", BACKEND_API);
    console.log("userid =", userid);
    console.log("message =", trimmed);

    pushMessage(trimmed, "user");
    setMessage("");

    const latitude = await AsyncStorage.getItem("latitude");
    const longitude = await AsyncStorage.getItem("longitude");

    console.log("Latitude:", latitude);
    console.log("Longitude:", longitude);
    try {
      const payload = {
        userId: userid || "guest",
        prompt: trimmed,
        latitude: Number(latitude ?? 0),
        longitude: Number(longitude ?? 0),
      };
      console.log("payload", payload);

      console.log("Sending payload:", payload);

      const response = await axios.post(`${BACKEND_API}/chat`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("AI Response:", response.data);

      const replyText =
        response?.data?.reply ||
        response?.data?.message ||
        "Sorry, I couldn't process that response.";

      pushMessage(replyText, "assistant");
    } catch (error: any) {
      console.log("FULL ERROR");
      console.log(error?.message);
      console.log(error?.response?.status);
      console.log(error?.response?.data);

      const errorText =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Sorry, I couldn't reach the assistant right now.";

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

  const renderMessageItem = useCallback(({ item }: { item: MessageItem }) => (
    <View
      className={
        item.type === "user"
          ? "self-end bg-green-600 p-4 rounded-3xl mb-3 max-w-[80%]"
          : "self-start bg-gray-100 p-4 rounded-3xl mb-3 max-w-[80%]"
      }
    >
      <Text className={item.type === "user" ? "text-white" : "text-gray-900"}>
        {item.text}
      </Text>
    </View>
  ), []);

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

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <TouchableOpacity className="mr-4">
                <Ionicons name="images" size={26} color="#16A34A" />
              </TouchableOpacity>
              <TouchableOpacity className="mr-4">
                <Ionicons name="camera" size={26} color="#16A34A" />
              </TouchableOpacity>
              <TouchableOpacity>
                <MaterialIcons name="translate" size={26} color="#16A34A" />
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center">
              <TouchableOpacity className="mr-3">
                <MaterialIcons name="keyboard-voice" size={28} color="#16A34A" />
              </TouchableOpacity>
              <TouchableOpacity
                className={
                  message.trim()
                    ? "bg-green-600 px-5 py-3 rounded-2xl"
                    : "bg-green-300 px-5 py-3 rounded-2xl"
                }
                onPress={handleSend}
                disabled={!message.trim()}
              >
                <Text className="text-white font-semibold">Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

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