import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
  Image,
  Alert,
  TextInput,
} from "react-native";
import axios from "axios";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown";

import { locationData } from "../data/locationData";

const BACKEND = process.env.EXPO_PUBLIC_BACKEND_API || "";
const FEEDBACK_BACKEND =
  process.env.EXPO_PUBLIC_PYTHON_BACKEND_API || BACKEND || "";

interface ExpertFeedback {
  id: string;
  adviceId: string;
  expertId?: string;
  userId?: string;
  rating: number;
  comment: string;
}

interface Expert {
  _id?: string;
  photo?: string | null;
  name: string;
  crop: string;
  experience: number;
  phone: string;
  email: string;
  state: string;
  district: string;
  taluka: string;
  place: string;
  description: string;
  adviceId?: string;
  isActive?: boolean;
  location: {
    coordinates: [number, number];
  };
  feedbacks?: ExpertFeedback[];
}

type DropdownOption = {
  label: string;
  value: string;
};

export default function FindExpert() {
  const [stateValue, setStateValue] = useState("");
  const [districtValue, setDistrictValue] = useState("");
  const [talukaValue, setTalukaValue] = useState("");
  const [placeValue, setPlaceValue] = useState("");

  const [loading, setLoading] = useState(false);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [feedbackDrafts, setFeedbackDrafts] = useState<
    Record<string, { rating: number; comment: string }>
  >({});
  const currentUserId = "USER_123";
  const [expandedFeedback, setExpandedFeedback] = useState<
    Record<string, boolean>
  >({});

  const states = locationData.states;

  const stateOptions = useMemo<DropdownOption[]>(() => {
    return states.map((name) => ({ label: name, value: name }));
  }, [states]);

  const filteredDistricts = useMemo<DropdownOption[]>(() => {
    if (stateValue !== "Karnataka") return [];
    return Object.keys(locationData.karnataka).map((name) => ({
      label: name,
      value: name,
    }));
  }, [stateValue]);

  const filteredTalukas = useMemo<DropdownOption[]>(() => {
    if (!districtValue || stateValue !== "Karnataka") return [];

    const districtData = locationData.karnataka[
      districtValue as keyof typeof locationData.karnataka
    ];

    return (districtData ?? []).map((name) => ({ label: name, value: name }));
  }, [districtValue, stateValue]);

  const filteredPlaces = useMemo<DropdownOption[]>(() => {
    if (!talukaValue || stateValue !== "Karnataka") return [];
    return [{ label: talukaValue, value: talukaValue }];
  }, [talukaValue, stateValue]);

  const loadExpertFeedbacks = async (expertList: Expert[]) => {
    if (!FEEDBACK_BACKEND) {
      return expertList.map((expert) => ({
        ...expert,
        feedbacks: Array.isArray(expert.feedbacks) ? expert.feedbacks : [],
      }));
    }

    const baseUrl = FEEDBACK_BACKEND.replace(/\/$/, "");

    const enrichedExperts = await Promise.all(
      expertList.map(async (expert, index) => {
        const expertId = expert._id || expert.email || `expert-${index}`;

        try {
          const response = await axios.get(
            `${baseUrl}/expert-feedbacks/${encodeURIComponent(expertId)}`
          );

          return {
            ...expert,
            adviceId:
              expert.adviceId ||
              `ADVICE_${String(expertId).replace(/[^a-zA-Z0-9]/g, "").toUpperCase()}_${index + 1}`,
            feedbacks: response.data?.data || [],
          };
        } catch (error) {
          return {
            ...expert,
            adviceId:
              expert.adviceId ||
              `ADVICE_${String(expertId).replace(/[^a-zA-Z0-9]/g, "").toUpperCase()}_${index + 1}`,
            feedbacks: [],
          };
        }
      })
    );

    return enrichedExperts;
  };

  const searchExperts = async () => {
    if (!stateValue) {
      Alert.alert("Please select at least a state.");
      return;
    }

    try {
      setLoading(true);

      const payload: Record<string, string> = {
        state: stateValue,
      };

      if (districtValue) payload.district = districtValue;
      if (talukaValue) payload.taluka = talukaValue;
      if (placeValue) payload.place = placeValue;

      const res = await axios.post(`${BACKEND}/api/v1/addtional/get`, payload);

      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];

      const activeExperts = data.filter((expert: Expert) => expert.isActive !== false);

      const mappedExperts = activeExperts.map((expert: Expert, index: number) => {
        const expertId = expert._id || expert.email || `expert-${index}`;

        return {
          ...expert,
          adviceId:
            expert.adviceId ||
            `ADVICE_${String(expertId).replace(/[^a-zA-Z0-9]/g, "").toUpperCase()}_${index + 1}`,
          feedbacks: Array.isArray(expert.feedbacks) ? expert.feedbacks : [],
        };
      });

      const expertsWithFeedback = await loadExpertFeedbacks(mappedExperts);
      setExperts(expertsWithFeedback);
    } catch (err) {
      Alert.alert("Unable to fetch experts.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const getExpertKey = (item: Expert, index: number) => item._id ?? `expert-${index}`;

  const getRatingSummary = (feedbacks: ExpertFeedback[] = []) => {
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
      const rating = Math.min(Math.max(item.rating, 1), 5);
      totalValue += rating;
      distribution[rating as keyof typeof distribution] += 1;
    });

    return {
      average: totalValue / feedbacks.length,
      totalRatings: feedbacks.length,
      distribution,
    };
  };

  const getAverageRating = (feedbacks: ExpertFeedback[] = []) => {
    return getRatingSummary(feedbacks).average;
  };

  const updateFeedbackDraft = (
    key: string,
    field: "rating" | "comment",
    value: number | string
  ) => {
    setFeedbackDrafts((prev) => ({
      ...prev,
      [key]: {
        rating: prev[key]?.rating ?? 0,
        comment: prev[key]?.comment ?? "",
        [field]: value,
      },
    }));
  };

  const submitFeedback = async (item: Expert, index: number) => {
    const key = getExpertKey(item, index);
    const currentDraft = feedbackDrafts[key] ?? { rating: 0, comment: "" };

    if (currentDraft.rating === 0) {
      Alert.alert("Please select a rating before submitting feedback.");
      return;
    }

    const payload = {
      userId: currentUserId,
      expertId: item._id || key,
      adviceId: item.adviceId || key,
      rating: currentDraft.rating,
      feedbackText: currentDraft.comment.trim() || "No additional comments.",
    };

    try {
      if (!FEEDBACK_BACKEND) {
        throw new Error("Python backend URL is not configured.");
      }

      const response = await axios.post(
        `${FEEDBACK_BACKEND.replace(/\/$/, "")}/expert-feedback`,
        payload
      );

      const newFeedback: ExpertFeedback = {
        id: response.data?.data?._id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        adviceId: payload.adviceId,
        expertId: payload.expertId,
        userId: payload.userId,
        rating: payload.rating,
        comment: payload.feedbackText,
      };

      setExperts((prev) =>
        prev.map((expert, expertIndex) => {
          const expertKey = getExpertKey(expert, expertIndex);

          if (expertKey !== key) return expert;

          const existingFeedbacks = Array.isArray(expert.feedbacks)
            ? expert.feedbacks
            : [];

          return {
            ...expert,
            feedbacks: [...existingFeedbacks, newFeedback],
          };
        })
      );

      setFeedbackDrafts((prev) => ({
        ...prev,
        [key]: { rating: 0, comment: "" },
      }));

      setExpandedFeedback((prev) => ({
        ...prev,
        [key]: false,
      }));

      Alert.alert("Feedback submitted", "Your feedback was sent successfully.");
    } catch (error) {
      console.log("Feedback submit error:", error);
      Alert.alert(
        "Unable to submit feedback",
        "Please check the Python backend connection or try again later."
      );
    }
  };

  const callExpert = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const smsExpert = (phone: string) => {
    Linking.openURL(`sms:${phone}`);
  };

  const openMap = (
    latitude: number,
    longitude: number
  ) => {
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    );
  };

  return (
    <View className="flex-1 bg-green-50">

      <View className="bg-green-700 p-5">

        <Text className="text-white text-2xl font-bold">
          Find Agriculture Experts
        </Text>

        <Text className="text-green-100 mt-1">
          Search nearby agriculture experts
        </Text>

      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* STATE */}

        <Text className="font-semibold mb-1">
          State
        </Text>

        <Dropdown
          data={stateOptions}
          labelField="label"
          valueField="value"
          placeholder="Select state"
          value={stateValue}
          search
          searchPlaceholder="Search state"
          maxHeight={220}
          onChange={(item) => {
            setStateValue(item.value);
            setDistrictValue("");
            setTalukaValue("");
            setPlaceValue("");
          }}
          style={{
            borderWidth: 1,
            borderColor: "#d1fae5",
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 12,
            backgroundColor: "white",
          }}
          placeholderStyle={{ color: "#6b7280" }}
          selectedTextStyle={{ color: "#065f46", fontWeight: "600" }}
          itemTextStyle={{ color: "#111827" }}
          containerStyle={{ marginTop: 4 }}
        />

        {/* DISTRICT */}

        <Text className="font-semibold mt-5 mb-1">
          District
        </Text>

        <Dropdown
          data={filteredDistricts}
          labelField="label"
          valueField="value"
          placeholder="Select district"
          value={districtValue}
          search
          searchPlaceholder="Search district"
          maxHeight={220}
          onChange={(item) => {
            setDistrictValue(item.value);
            setTalukaValue("");
            setPlaceValue("");
          }}
          style={{
            borderWidth: 1,
            borderColor: "#d1fae5",
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 12,
            backgroundColor: "white",
          }}
          placeholderStyle={{ color: "#6b7280" }}
          selectedTextStyle={{ color: "#065f46", fontWeight: "600" }}
          itemTextStyle={{ color: "#111827" }}
          containerStyle={{ marginTop: 4 }}
        />

        {/* TALUKA */}

        <Text className="font-semibold mt-5 mb-1">
          Taluka
        </Text>

        <Dropdown
          data={filteredTalukas}
          labelField="label"
          valueField="value"
          placeholder="Select taluka"
          value={talukaValue}
          search
          searchPlaceholder="Search taluka"
          maxHeight={220}
          onChange={(item) => {
            setTalukaValue(item.value);
            setPlaceValue("");
          }}
          style={{
            borderWidth: 1,
            borderColor: "#d1fae5",
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 12,
            backgroundColor: "white",
          }}
          placeholderStyle={{ color: "#6b7280" }}
          selectedTextStyle={{ color: "#065f46", fontWeight: "600" }}
          itemTextStyle={{ color: "#111827" }}
          containerStyle={{ marginTop: 4 }}
        />

        {/* PLACE */}

        <Text className="font-semibold mt-5 mb-1">
          Place
        </Text>

        <Dropdown
          data={filteredPlaces}
          labelField="label"
          valueField="value"
          placeholder="Select place"
          value={placeValue}
          search
          searchPlaceholder="Search place"
          maxHeight={220}
          onChange={(item) => setPlaceValue(item.value)}
          style={{
            borderWidth: 1,
            borderColor: "#d1fae5",
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 12,
            backgroundColor: "white",
          }}
          placeholderStyle={{ color: "#6b7280" }}
          selectedTextStyle={{ color: "#065f46", fontWeight: "600" }}
          itemTextStyle={{ color: "#111827" }}
          containerStyle={{ marginTop: 4 }}
        />

        <TouchableOpacity
          onPress={searchExperts}
          className="bg-green-700 mt-6 rounded-xl py-4 items-center"
        >
          <Text className="text-white font-bold text-lg">
            Search Expert
          </Text>
        </TouchableOpacity>

        {loading && (
          <ActivityIndicator
            size="large"
            color="green"
            className="mt-8"
          />
        )}

        {/* PART 2 STARTS HERE */}
                {!loading && experts.length === 0 && (
          <View className="mt-10 items-center">
            <MaterialCommunityIcons
              name="account-search"
              size={70}
              color="green"
            />
            <Text className="text-gray-500 mt-3 text-base">
              No Experts Found
            </Text>
          </View>
        )}

        {!loading && experts.length > 0 && (
          <View className="mt-6">
            {experts.map((item, index) => (
              <View
                key={item._id ?? index.toString()}
                className="bg-white rounded-2xl p-4 mb-4 shadow"
              >
                {/* Profile */}

                <View className="flex-row">
                  {item.photo ? (
                    <Image
                      source={{ uri: item.photo }}
                      className="w-20 h-20 rounded-full"
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name="account-circle"
                      size={80}
                      color="green"
                    />
                  )}

                  <View className="ml-4 flex-1">
                    <Text className="text-xl font-bold">{item.name}</Text>

                    <Text className="text-green-700 mt-1">
                      🌾 {item.crop}
                    </Text>

                    <Text className="text-gray-600">
                      ⭐ {item.experience} Years Experience
                    </Text>
                  </View>
                </View>

                {/* Contact */}

                <View className="mt-4">
                  <Text className="text-gray-700">📞 {item.phone}</Text>

                  <Text className="text-gray-700 mt-1">📧 {item.email}</Text>
                </View>

                {/* Location */}

                <View className="mt-4">
                  <Text className="font-semibold">Location</Text>

                  <Text className="text-gray-600 mt-1">
                    {item.place}, {item.taluka}, {item.district}, {item.state}
                  </Text>
                </View>

                {/* Description */}

                <View className="mt-4">
                  <Text className="font-semibold">Description</Text>

                  <Text className="text-gray-600 mt-1">{item.description}</Text>

                  <Text className="text-xs text-green-700 mt-2 font-semibold">
                    Advice ID: {item.adviceId || "Not assigned"}
                  </Text>
                </View>

                <View className="mt-4 border border-green-100 bg-green-50 rounded-xl p-3">
                  <View className="flex-row items-center justify-between">
                    <Text className="font-semibold text-green-800">Feedback</Text>

                    <TouchableOpacity
                      onPress={() => {
                        const key = getExpertKey(item, index);
                        setExpandedFeedback((prev) => ({
                          ...prev,
                          [key]: !prev[key],
                        }));
                      }}
                      className="bg-green-700 px-3 py-1.5 rounded-full"
                    >
                      <Text className="text-white text-xs font-semibold">
                        {expandedFeedback[getExpertKey(item, index)] ? "Hide" : "Rate Expert"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {(() => {
                    const ratingSummary = getRatingSummary(item.feedbacks || []);
                    const averageRating = ratingSummary.average;

                    return (
                      <>
                        <View className="mt-2 flex-row items-center justify-between">
                          <View className="flex-row items-center">
                            {Array.from({ length: 5 }, (_, starIndex) => {
                              const starValue = starIndex + 1;

                              return (
                                <MaterialCommunityIcons
                                  key={starIndex}
                                  name={
                                    averageRating >= starValue ? "star" : "star-outline"
                                  }
                                  size={18}
                                  color={averageRating >= starValue ? "#f59e0b" : "#9ca3af"}
                                />
                              );
                            })}

                            <Text className="ml-2 text-sm font-semibold text-gray-700">
                              {ratingSummary.totalRatings > 0
                                ? `${averageRating.toFixed(1)} / 5`
                                : "No ratings yet"}
                            </Text>
                          </View>

                          <Text className="text-xs text-gray-600">
                            {ratingSummary.totalRatings > 0
                              ? `${ratingSummary.totalRatings} review${ratingSummary.totalRatings > 1 ? "s" : ""}`
                              : "0 reviews"}
                          </Text>
                        </View>

                        {ratingSummary.totalRatings > 0 && (
                          <View className="mt-3">
                            {Array.from({ length: 5 }, (_, starIndex) => {
                              const starValue = 5 - starIndex;
                              const count = ratingSummary.distribution[starValue as keyof typeof ratingSummary.distribution];
                              const percentage = (count / ratingSummary.totalRatings) * 100;

                              return (
                                <View key={starValue} className="flex-row items-center mt-1">
                                  <Text className="w-9 text-xs text-gray-600">{starValue}★</Text>
                                  <View className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                                    <View
                                      className="h-full rounded-full bg-green-500"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </View>
                                  <Text className="ml-2 w-8 text-right text-xs text-gray-600">
                                    {count}
                                  </Text>
                                </View>
                              );
                            })}
                          </View>
                        )}
                      </>
                    );
                  })()}

                  {item.feedbacks && item.feedbacks.length > 0 && (
                    <View className="mt-3">
                      <Text className="text-xs font-semibold text-gray-700">
                        Recent feedback
                      </Text>

                      {item.feedbacks.slice(-2).map((feedback, feedbackIndex) => (
                        <View
                          key={`${feedback.id || feedback.adviceId || "feedback"}-${feedbackIndex}`}
                          className="mt-2 rounded-lg border border-green-100 bg-white p-2"
                        >
                          <View className="flex-row items-center">
                            {Array.from({ length: 5 }, (_, starIndex) => (
                              <MaterialCommunityIcons
                                key={starIndex}
                                name={
                                  feedback.rating > starIndex ? "star" : "star-outline"
                                }
                                size={14}
                                color={
                                  feedback.rating > starIndex ? "#f59e0b" : "#9ca3af"
                                }
                              />
                            ))}
                          </View>

                          <Text className="text-xs text-gray-600 mt-1">
                            {feedback.comment}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {expandedFeedback[getExpertKey(item, index)] && (
                    <View className="mt-3">
                      <Text className="text-sm font-medium text-gray-700">
                        Your rating
                      </Text>

                      <View className="flex-row mt-2">
                        {Array.from({ length: 5 }, (_, starIndex) => {
                          const starValue = starIndex + 1;
                          const draftRating =
                            feedbackDrafts[getExpertKey(item, index)]?.rating ?? 0;

                          return (
                            <TouchableOpacity
                              key={starValue}
                              onPress={() =>
                                updateFeedbackDraft(
                                  getExpertKey(item, index),
                                  "rating",
                                  starValue
                                )
                              }
                              className="mr-1"
                            >
                              <MaterialCommunityIcons
                                name={draftRating >= starValue ? "star" : "star-outline"}
                                size={26}
                                color={draftRating >= starValue ? "#f59e0b" : "#9ca3af"}
                              />
                            </TouchableOpacity>
                          );
                        })}
                      </View>

                      <TextInput
                        className="mt-3 border border-green-200 rounded-xl px-3 py-2 text-gray-700 bg-white"
                        multiline
                        numberOfLines={4}
                        placeholder="Write your feedback here..."
                        placeholderTextColor="#6b7280"
                        value={feedbackDrafts[getExpertKey(item, index)]?.comment ?? ""}
                        onChangeText={(text) =>
                          updateFeedbackDraft(getExpertKey(item, index), "comment", text)
                        }
                      />

                      <TouchableOpacity
                        onPress={() => submitFeedback(item, index)}
                        className="mt-3 bg-green-700 py-3 rounded-xl items-center"
                      >
                        <Text className="text-white font-semibold">Submit Feedback</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Buttons */}

                <View className="flex-row justify-between mt-6">
                  <TouchableOpacity
                    onPress={() => callExpert(item.phone)}
                    className="flex-1 bg-green-700 py-3 rounded-xl mr-2 items-center"
                  >
                    <MaterialCommunityIcons
                      name="phone"
                      color="white"
                      size={22}
                    />

                    <Text className="text-white mt-1 font-semibold">Call</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => smsExpert(item.phone)}
                    className="flex-1 bg-blue-600 py-3 rounded-xl mx-2 items-center"
                  >
                    <MaterialCommunityIcons
                      name="message"
                      color="white"
                      size={22}
                    />

                    <Text className="text-white mt-1 font-semibold">Message</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() =>
                      openMap(
                        item.location.coordinates[1],
                        item.location.coordinates[0]
                      )
                    }
                    className="flex-1 bg-orange-500 py-3 rounded-xl ml-2 items-center"
                  >
                    <MaterialCommunityIcons
                      name="map-marker"
                      color="white"
                      size={22}
                    />

                    <Text className="text-white mt-1 font-semibold">Map</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

    </View>
  );
}