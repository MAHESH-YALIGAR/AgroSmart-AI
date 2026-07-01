import {
  View,
  Text,
} from "react-native";

export default function ProfilePanel({
  user,
}: any) {

  console.log("this from the profile page user data",user)
  return (
    <View
      className="
      absolute
      top-20
      left-0
      w-72
      bg-white
      p-5
      rounded-r-3xl
      shadow-lg
      z-50
    "
    >

      <View className="items-center">

        <View className="w-20 h-20 rounded-full bg-green-600 items-center justify-center">
          <Text className="text-white text-3xl font-bold">
            {user?.name
              ?.charAt(0)
              .toUpperCase()}
          </Text>
        </View>

        <Text className="text-xl font-bold mt-3">
          {user?.name}
        </Text>

        <Text>
          {user?.email}
        </Text>

      </View>

      <View className="mt-8">
        <Text className="py-3">
          ✏️ Edit Profile
        </Text>

        <Text className="py-3">
          🔒 Change Password
        </Text>

        <Text className="py-3 text-red-500">
          🚪 Logout
        </Text>
      </View>

    </View>
  );
}