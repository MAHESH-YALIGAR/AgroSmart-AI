import React, { createContext, useEffect, useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_API || "http://10.84.94.122:9008";

export const UserContext = createContext<any>(null);

export const UserProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);
  console.log("user from contex",user)

  const loadProfile = async () => {
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
  };

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
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
