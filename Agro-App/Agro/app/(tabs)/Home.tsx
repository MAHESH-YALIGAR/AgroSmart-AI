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
                  Check today&apos;s market prices
                </Text>

              </TouchableOpacity>
            </Link>

            {/* Disease Detection */}
            <Link href="/(tabs)/Sell"
              asChild>
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
                  Sale Crop
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
                  Sell crops directly to factories and bulk buyers.
                </Text>

              </TouchableOpacity>
            </Link>
            {/* AI Advisor */}
            <Link href="/components/FindStores" asChild>
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
                  Find Agro Stores
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
                  Find nearby agro product stores
                </Text>
              </TouchableOpacity>
            </Link>

            {/* Government Schemes */}
            <Link href="/components/Applyexpert" asChild>

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
                  Apply expert
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
                  apply with legal document
                </Text>

              </TouchableOpacity>
            </Link>
            {/* Yield Prediction */}

            {/* <MaterialCommunityIcons name="sprout" size={50} color="#16a34a" /> */}
            <Link
              href="/components/FindExpert"
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
                <MaterialCommunityIcons name="account-outline" size={50} color="#16a34a" />
                <Text
                  className="
                text-lg
                font-bold
                mt-3
                text-gray-800
              "
                >
                  Crop Advisor
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
            </Link>
          </ScrollView>

        </View>

      </ScrollView>

      <View className="items-center mt-4">
        <Link href="/components/MapScreen"
          asChild>
          <TouchableOpacity
            activeOpacity={0.8}
            className="w-16 h-16 rounded-full bg-green-600 items-center justify-center shadow-lg shadow-green-200"
          >
            <MaterialCommunityIcons
              name="map-marker-radius"
              size={28}
              color="#ffffff"
            />
          </TouchableOpacity>
        </Link>
      </View>

    </View>
  );
};

export default Home;