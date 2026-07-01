import { Tabs } from "expo-router";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#16a34a",
        tabBarInactiveTintColor: "#6b7280",
        tabBarStyle: {
          height: 55,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="home"
              size={size}
              color={color}
            />
          ),
        }}
      />


      <Tabs.Screen
        name="Schema"
        options={{
          title: "Schemes",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="document-text"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="Chat"
        options={{
          title: "Scan AI",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="line-scan"
              size={34}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Sell"
        options={{
          title: "Sell Crop",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5
              name="rupee-sign"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="mordern_agree"
        options={{
          title: "Learn",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="school"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}