import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { UserProvider } from ".//context/UserContext"
import { SafeAreaView } from "react-native-safe-area-context";
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Hide the splash screen once the app is mounted/ready
    SplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <UserProvider>
        <Stack screenOptions={{ headerShown: false }} >
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </UserProvider>
    </SafeAreaView>
  );
}
