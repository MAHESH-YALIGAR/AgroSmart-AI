import React, {
  useContext,
  useState,
} from "react";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";

import {
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import { Link } from "expo-router";

import Wether from "../components/wether";
import HomeHeader from "../components/HomeHeader";
import ProfilePanel from "../components/ProfilePanel";

import {
  UserContext,
} from "../context/UserContext";

const Home = () => {
  const [showProfile, setShowProfile] =
    useState(false);

  const { user } =
    useContext(UserContext);

    // console.log("this is  from the user data in home.tsx ",user._id)

  return (
    <View className="flex-1 bg-gray-100">

      {/* Header */}
      <HomeHeader
        user={user}
        onPress={() =>
          setShowProfile(
            !showProfile
          )
        }
      />

      {/* Profile Panel */}
      {showProfile && (
        <ProfilePanel
          user={user}
        />
      )}

      <ScrollView
        showsVerticalScrollIndicator={
          true
        }
      >

        {/* Weather Section */}
        <Wether />

        {/* Services Section */}

        <View className="px-4 mt-5">

          <Text
            className="
            text-2xl
            font-bold
            text-gray-800
            mb-4
          "
          >
            Smart Farming Services
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
          >

            {/* Crop Prices */}

            <Link
              href="/components/CropPriceFinder"
              asChild
            >
              <TouchableOpacity
                className="
                bg-white
                w-40
                h-40
                rounded-3xl
                mr-4
                items-center
                justify-center
                shadow-sm
              "
              >
                <MaterialCommunityIcons
                  name="cash-multiple"
                  size={50}
                  color="#16a34a"
                />

                <Text
                  className="
                  text-lg
                  font-bold
                  mt-3
                  text-gray-800
                "
                >
                  Crop Prices
                </Text>

                <Text
                  className="
                  text-xs
                  text-gray-500
                  text-center
                  mt-1
                  px-3
                "
                >
                  Check today's market prices
                </Text>

              </TouchableOpacity>
            </Link>

            {/* Disease Detection */}

            <TouchableOpacity
              className="
              bg-white
              w-40
              h-40
              rounded-3xl
              mr-4
              items-center
              justify-center
              shadow-sm
            "
            >
              <MaterialCommunityIcons
                name="leaf"
                size={50}
                color="#16a34a"
              />

              <Text
                className="
                text-lg
                font-bold
                mt-3
                text-gray-800
              "
              >
                Disease Scan
              </Text>

              <Text
                className="
                text-xs
                text-gray-500
                text-center
                mt-1
                px-3
              "
              >
                Detect crop diseases
              </Text>

            </TouchableOpacity>

            {/* AI Advisor */}

            <TouchableOpacity
              className="
              bg-white
              w-40
              h-40
              rounded-3xl
              mr-4
              items-center
              justify-center
              shadow-sm
            "
            >
              <MaterialCommunityIcons
                name="robot"
                size={50}
                color="#16a34a"
              />

              <Text
                className="
                text-lg
                font-bold
                mt-3
                text-gray-800
              "
              >
                AI Advisor
              </Text>

              <Text
                className="
                text-xs
                text-gray-500
                text-center
                mt-1
                px-3
              "
              >
                Smart farming assistant
              </Text>

            </TouchableOpacity>

            {/* Government Schemes */}

            <TouchableOpacity
              className="
              bg-white
              w-40
              h-40
              rounded-3xl
              mr-4
              items-center
              justify-center
              shadow-sm
            "
            >
              <MaterialCommunityIcons
                name="bank"
                size={50}
                color="#16a34a"
              />

              <Text
                className="
                text-lg
                font-bold
                mt-3
                text-gray-800
              "
              >
                Schemes
              </Text>

              <Text
                className="
                text-xs
                text-gray-500
                text-center
                mt-1
                px-3
              "
              >
                Government support
              </Text>

            </TouchableOpacity>

            {/* Yield Prediction */}

            <TouchableOpacity
              className="
              bg-white
              w-40
              h-40
              rounded-3xl
              mr-4
              items-center
              justify-center
              shadow-sm
            "
            >
              <MaterialCommunityIcons
                name="chart-line"
                size={50}
                color="#16a34a"
              />

              <Text
                className="
                text-lg
                font-bold
                mt-3
                text-gray-800
              "
              >
                Yield
              </Text>

              <Text
                className="
                text-xs
                text-gray-500
                text-center
                mt-1
                px-3
              "
              >
                Predict crop yield
              </Text>

            </TouchableOpacity>

          </ScrollView>

        </View>

      </ScrollView>

    </View>
  );
};

export default Home;