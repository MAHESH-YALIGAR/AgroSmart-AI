import React, { createContext, useCallback, useEffect, useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_API || "http://10.84.94.122:9008";

export const UserContext = createContext<any>(null);

export const UserProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [locationAddress, setLocationAddress] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  console.log("user from contex",user)

  const loadProfile = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await axios.get(`${BACKEND_URL}/api/v1/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("responce of the profile",response.data)

      setUser(response.data.user);
    } catch (error: any) {
      console.log("Profile Fetch Error:", error?.response?.data || error.message);
      
      // FIX 1: If backend rejects the token (401/403), auto-wipe it so the app resets
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        await AsyncStorage.removeItem("token");
      }
      setUser(null); 
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const profileTimer = setTimeout(() => {
      void loadProfile();
    }, 0);
    const addressTimer = setTimeout(() => {
      void AsyncStorage.getItem("user_address").then((savedAddress) => {
        if (savedAddress) {
          setLocationAddress((currentAddress) => currentAddress ?? savedAddress);
        }
      }).catch((error) => {
        console.log("Saved location read error:", error);
      });
    }, 0);

    return () => {
      clearTimeout(profileTimer);
      clearTimeout(addressTimer);
    };
  }, [loadProfile]);

  const logout = async () => {
    setLoading(true);
    try {
      await AsyncStorage.removeItem("token");
      setUser(null);
    } catch (error) {
      console.log("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
      
        setUser,
        loading,
        loadProfile,
        locationAddress,
        setLocationAddress,
        locationError,
        setLocationError,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
