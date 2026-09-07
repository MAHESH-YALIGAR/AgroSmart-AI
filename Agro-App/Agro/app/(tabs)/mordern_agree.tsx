
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type Category = {
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  route: string;
  color: string;
};

export default function LearnScreen() {
  const router = useRouter();

  const categories: Category[] = [
    {
      title: "Crop Farming",
      icon: "sprout",
      route: "/learn/crop-farming",
      color: "#DCFCE7",
    },
    {
      title: "Dairy Farming",
      icon: "cow",
      route: "/learn/dairy-farming",
      color: "#DBEAFE",
    },
    {
      title: "Fisheries",
      icon: "fish",
      route: "/learn/fisheries",
      color: "#E0F2FE",
    },
    {
      title: "Beekeeping",
      icon: "bee",
      route: "/learn/beekeeping",
      color: "#FEF3C7",
    },
    {
      title: "Organic Farming",
      icon: "leaf",
      route: "/learn/organic-farming",
      color: "#DCFCE7",
    },
    {
      title: "Modern Technology",
      icon: "tractor",
      route: "/learn/modern-technology",
      color: "#EDE9FE",
    },
    {
      title: "Agro Products",
      icon: "factory",
      route: "/learn/agro-products",
      color: "#FFEDD5",
    },
    {
      title: "Business & Market",
      icon: "chart-line",
      route: "/learn/business-market",
      color: "#FCE7F3",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* HEADER */}
      <View className="bg-green-800 px-5 pt-4 pb-6">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-green-700">
              <MaterialCommunityIcons
                name="sprout"
                size={28}
                color="white"
              />
            </View>

            <View className="ml-3">
              <Text className="text-xl font-bold text-white">
                AgroSmart AI
              </Text>

              <Text className="text-xs text-green-200">
                Smart Farming • Better Tomorrow
              </Text>
            </View>
          </View>

          <TouchableOpacity>
            <MaterialCommunityIcons
              name="bell-outline"
              size={26}
              color="white"
            />
          </TouchableOpacity>
        </View>

        {/* HERO */}
        <View className="mt-6 rounded-3xl bg-green-700 p-5">
          <MaterialCommunityIcons
            name="sprout"
            size={45}
            color="#BBF7D0"
          />

          <Text className="mt-3 text-2xl font-bold text-white">
            Learn & Grow
          </Text>

          <Text className="mt-2 text-sm leading-5 text-green-100">
            Discover modern agriculture, farming technologies, dairy,
            fisheries, organic farming and new business opportunities.
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 px-5"
      >
        {/* SEARCH */}
        <View className="mt-5 flex-row items-center rounded-2xl bg-white px-4 py-3 shadow-sm">
          <MaterialCommunityIcons
            name="magnify"
            size={22}
            color="#6B7280"
          />

          <TextInput
            placeholder="Search topics (dairy farming, fisheries...)"
            placeholderTextColor="#9CA3AF"
            className="ml-3 flex-1 text-base text-gray-800"
          />
        </View>

        {/* TITLE */}
        <Text className="mt-6 text-xl font-bold text-gray-800">
          Explore Learning Categories
        </Text>

        <Text className="mt-1 text-sm text-gray-500">
          Learn new farming skills and technologies
        </Text>

        {/* CATEGORY GRID */}
        <View className="mt-5 flex-row flex-wrap justify-between">
          {categories.map((category) => (
            <TouchableOpacity
              key={category.title}
              onPress={() => router.push(category.route as any)}
              className="mb-4 w-[48%] rounded-3xl p-5"
              style={{
                backgroundColor: category.color,
              }}
            >
              <View className="h-14 w-14 items-center justify-center rounded-full bg-white">
                <MaterialCommunityIcons
                  name={category.icon}
                  size={30}
                  color="#15803D"
                />
              </View>

              <Text className="mt-4 text-base font-bold text-gray-800">
                {category.title}
              </Text>

              <View className="mt-3 flex-row items-center">
                <Text className="text-xs text-gray-600">
                  Explore topics
                </Text>

                <MaterialCommunityIcons
                  name="arrow-right"
                  size={16}
                  color="#374151"
                  style={{ marginLeft: 4 }}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* FEATURED SECTION */}
        <Text className="mt-4 text-xl font-bold text-gray-800">
          Featured Learning
        </Text>

        <TouchableOpacity
          onPress={() => router.push("/learn/modern-technology" as any)}
          className="mb-10 mt-4 rounded-3xl bg-green-700 p-5"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-lg font-bold text-white">
                Modern Agriculture Technology
              </Text>

              <Text className="mt-2 text-sm leading-5 text-green-100">
                Discover smart farming, IoT, automation, modern machines and
                new agricultural technologies.
              </Text>

              <View className="mt-4 flex-row items-center">
                <Text className="font-semibold text-white">
                  Start Learning
                </Text>

                <MaterialCommunityIcons
                  name="arrow-right"
                  size={20}
                  color="white"
                  style={{ marginLeft: 6 }}
                />
              </View>
            </View>

            <MaterialCommunityIcons
              name="tractor"
              size={60}
              color="#BBF7D0"
            />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

