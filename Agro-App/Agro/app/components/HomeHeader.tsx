import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  MaterialIcons,
  Ionicons,
} from "@expo/vector-icons";
import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";

const BACKEND = process.env.EXPO_PUBLIC_BACKEND_API || "";

type ApiRecord = Record<string, unknown> & {
  _id?: string;
  createdAt?: string;
};

type NotificationItem = {
  id: string;
  title: string;
  detail: string;
  createdAt: string;
};

type RecentNotifications = {
  schemes: NotificationItem[];
  experts: NotificationItem[];
  stores: NotificationItem[];
  failedSources: number;
};

const unwrapRecords = (value: unknown): ApiRecord[] => {
  if (Array.isArray(value)) return value as ApiRecord[];
  if (!value || typeof value !== "object") return [];

  const response = value as Record<string, unknown>;
  for (const key of ["data", "schemas", "experts", "stores"]) {
    if (Array.isArray(response[key])) return response[key] as ApiRecord[];
  }

  return [];
};

const readText = (record: ApiRecord, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
};

const toRecentItems = (
  records: ApiRecord[],
  category: string,
  titleKeys: string[],
  detailKeys: string[],
  cutoff: number,
  now: number
): NotificationItem[] => {
  return records.flatMap((record, index) => {
    const createdAt = typeof record.createdAt === "string" ? record.createdAt : "";
    const createdAtTime = Date.parse(createdAt);
    if (!Number.isFinite(createdAtTime) || createdAtTime < cutoff || createdAtTime > now) {
      return [];
    }

    return [{
      id: typeof record._id === "string" ? record._id : `${category}-${createdAt}-${index}`,
      title: readText(record, titleKeys) || `New ${category.toLowerCase()}`,
      detail: readText(record, detailKeys) || "Recently added",
      createdAt,
    }];
  });
};

const fetchRecentNotifications = async (): Promise<RecentNotifications> => {
  const results = await Promise.allSettled([
    axios.get(`${BACKEND}/api/v1/addtional/getallexpert`),
    axios.post(`${BACKEND}/api/v1/addtional/get`, {}),
    axios.post(`${BACKEND}/api/v1/addtional/stores`, {}),
  ]);

  const now = Date.now();
  const cutoff = now - 48 * 60 * 60 * 1000;
  const [schemesResult, expertsResult, storesResult] = results;
  const getData = (result: (typeof results)[number]) =>
    result.status === "fulfilled" ? result.value.data : [];

  return {
    schemes: toRecentItems(
      unwrapRecords(getData(schemesResult)),
      "Scheme",
      ["schemeName"],
      ["schemeType", "shortDescription"],
      cutoff,
      now
    ),
    experts: toRecentItems(
      unwrapRecords(getData(expertsResult)),
      "Expert",
      ["name"],
      ["crop", "district", "state"],
      cutoff,
      now
    ),
    stores: toRecentItems(
      unwrapRecords(getData(storesResult)),
      "Store",
      ["storeName"],
      ["district", "state"],
      cutoff,
      now
    ),
    failedSources: results.filter((result) => result.status === "rejected").length,
  };
};

const formatCreatedAt = (createdAt: string) =>
  new Date(createdAt).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export default function HomeHeader({
  user,
  locationAddress,
  locationError,
  onPress,
}: any) {
  const [notifications, setNotifications] = useState<RecentNotifications>({
    schemes: [],
    experts: [],
    stores: [],
    failedSources: 0,
  });
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const [isNotificationModalVisible, setIsNotificationModalVisible] = useState(false);

  const loadNotifications = useCallback(async () => {
    setIsLoadingNotifications(true);
    try {
      setNotifications(await fetchRecentNotifications());
    } catch (error) {
      console.error("Unable to load recent notifications", error);
      setNotifications({
        schemes: [],
        experts: [],
        stores: [],
        failedSources: 3,
      });
    } finally {
      setIsLoadingNotifications(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetchRecentNotifications()
      .then((recentNotifications) => {
        if (isMounted) setNotifications(recentNotifications);
      })
      .catch((error) => {
        console.error("Unable to load recent notifications", error);
        if (isMounted) {
          setNotifications({
            schemes: [],
            experts: [],
            stores: [],
            failedSources: 3,
          });
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingNotifications(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const notificationCount =
    notifications.schemes.length + notifications.experts.length + notifications.stores.length;
  const sections = [
    { title: "Government schemes", items: notifications.schemes },
    { title: "Agriculture experts", items: notifications.experts },
    { title: "Agro stores", items: notifications.stores },
  ];

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
              {locationAddress || locationError || "Fetching location..."}
            </Text>
          </View>
        </View>
      </View>

      <View className="relative">
        <TouchableOpacity
          onPress={() => {
            setIsNotificationModalVisible(true);
            void loadNotifications();
          }}
          accessibilityRole="button"
          accessibilityLabel={`${notificationCount} recent notifications`}
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
        <View className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-600 border-2 border-white items-center justify-center">
          <Text className="text-white text-[10px] font-bold">
            {notificationCount > 99 ? "99+" : notificationCount}
          </Text>
        </View>
      </View>

      <Modal
        visible={isNotificationModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsNotificationModalVisible(false)}
      >
        <View className="flex-1 justify-end">
          <Pressable
            className="absolute inset-0 bg-black/40"
            onPress={() => setIsNotificationModalVisible(false)}
            accessibilityLabel="Close notifications"
          />
          <View className="bg-white rounded-t-3xl px-5 pt-5" style={{ maxHeight: "82%" }}>
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-xl font-bold text-gray-900">Recent activity</Text>
                <Text className="text-sm text-gray-500 mt-1">Added in the last 48 hours</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsNotificationModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Close notifications"
                className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
              >
                <MaterialIcons name="close" size={22} color="#111827" />
              </TouchableOpacity>
            </View>

            {isLoadingNotifications ? (
              <View className="py-10 items-center">
                <ActivityIndicator size="large" color="#15803d" />
                <Text className="text-gray-500 mt-3">Loading recent activity...</Text>
              </View>
            ) : notifications.failedSources === 3 ? (
              <Text className="text-center text-gray-600 py-10">
                Unable to load recent activity. Try again by reopening notifications.
              </Text>
            ) : (
              <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
                {notifications.failedSources > 0 && (
                  <Text className="text-amber-700 text-sm mb-3">
                    Some activity sources could not be loaded.
                  </Text>
                )}
                {notificationCount === 0 ? (
                  <Text className="text-center text-gray-500 py-10">
                    No schemes, experts, or stores were added in the last 48 hours.
                  </Text>
                ) : (
                  sections.map((section) => (
                    section.items.length > 0 && (
                      <View key={section.title} className="mb-5">
                        <Text className="text-sm font-bold text-green-800 mb-2">
                          {section.title} ({section.items.length})
                        </Text>
                        {section.items.map((item) => (
                          <View key={item.id} className="border-t border-gray-100 py-3">
                            <Text className="font-semibold text-gray-900" numberOfLines={1}>
                              {item.title}
                            </Text>
                            <Text className="text-sm text-gray-600 mt-1" numberOfLines={2}>
                              {item.detail}
                            </Text>
                            <Text className="text-xs text-gray-400 mt-1">
                              {formatCreatedAt(item.createdAt)}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )
                  ))
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
