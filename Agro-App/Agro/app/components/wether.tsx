import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import axios from "axios";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_API;

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const COLORS = {
  gradientStart: "#0A2E2A",
  gradientMid: "#0F4C42",
  gradientEnd: "#1C7A66",
  gold: "#F2B544",
  glass: "rgba(255,255,255,0.10)",
  glassBorder: "rgba(255,255,255,0.18)",
  textPrimary: "#FFFFFF",
  textSecondary: "rgba(255,255,255,0.68)",
  textTertiary: "rgba(255,255,255,0.48)",
};

const SEVERITY = {
  high: { border: "#FF6B5C", chip: "rgba(255,107,92,0.16)", solid: "#E5453A" },
  medium: { border: "#F2B544", chip: "rgba(242,181,68,0.16)", solid: "#D89A2A" },
  low: { border: "#5ED9A8", chip: "rgba(94,217,168,0.16)", solid: "#3FA980" },
};

function getSeverity(risk?: string) {
  const r = (risk || "").toLowerCase();
  if (r === "high" || r === "severe") return SEVERITY.high;
  if (r === "medium" || r === "moderate") return SEVERITY.medium;
  return SEVERITY.low;
}

// ---------------------------------------------------------------------------
// WMO weather_code -> icon + label
// ---------------------------------------------------------------------------
function getConditionInfo(code?: number) {
  if (code === undefined) return { label: "—", icon: "help-circle-outline" as const, lib: "ion" as const };
  if (code === 0) return { label: "Clear Sky", icon: "sunny-outline" as const, lib: "ion" as const };
  if ([1, 2, 3].includes(code)) return { label: "Partly Cloudy", icon: "partly-sunny-outline" as const, lib: "ion" as const };
  if ([45, 48].includes(code)) return { label: "Foggy", icon: "weather-fog" as const, lib: "mci" as const };
  if ([51, 53, 55, 56, 57].includes(code)) return { label: "Drizzle", icon: "rainy-outline" as const, lib: "ion" as const };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { label: "Rain", icon: "rainy-outline" as const, lib: "ion" as const };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: "Snow", icon: "snow-outline" as const, lib: "ion" as const };
  if ([95, 96, 99].includes(code)) return { label: "Thunderstorm", icon: "thunderstorm-outline" as const, lib: "ion" as const };
  return { label: "Cloudy", icon: "cloud-outline" as const, lib: "ion" as const };
}

function ConditionIcon({ code, size = 30, color = "#fff" }: { code?: number; size?: number; color?: string }) {
  const c = getConditionInfo(code);
  if (c.lib === "mci") {
    return <MaterialCommunityIcons name={c.icon as any} size={size} color={color} />;
  }
  return <Ionicons name={c.icon as any} size={size} color={color} />;
}

function formatTime(iso?: string) {
  if (!iso) return "--:--";
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function windDirLabel(deg?: number) {
  if (deg === undefined) return "--";
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

// ---------------------------------------------------------------------------
// Stat tile — bigger, clearer
// ---------------------------------------------------------------------------
function StatTile({ icon, lib = "feather", value, label }: any) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.glass,
        borderColor: COLORS.glassBorder,
        borderWidth: 1,
        borderRadius: 20,
        paddingVertical: 18,
        alignItems: "center",
        marginHorizontal: 5,
      }}
    >
      {lib === "feather" ? (
        <Feather name={icon} size={22} color={COLORS.gold} />
      ) : (
        <Ionicons name={icon} size={22} color={COLORS.gold} />
      )}
      <Text style={{ color: COLORS.textPrimary, fontSize: 19, fontWeight: "800", marginTop: 8 }}>{value}</Text>
      <Text style={{ color: COLORS.textTertiary, fontSize: 11, marginTop: 3, letterSpacing: 0.5, fontWeight: "600" }}>
        {label}
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Single alert card — one alert, with its risk badge and recommendation list
// (previously this was wrongly split into multiple fake "alerts")
// ---------------------------------------------------------------------------
function AlertCard({ title, risk, recommendations }: { title: string; risk?: string; recommendations: string[] }) {
  const sev = getSeverity(risk);
  return (
    <View
      style={{
        backgroundColor: sev.chip,
        borderColor: sev.border,
        borderWidth: 1.5,
        borderRadius: 20,
        padding: 16,
        marginTop: 18,
      }}
    >
      {/* Header: icon + title + risk badge */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            backgroundColor: sev.solid,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 10,
          }}
        >
          <Ionicons name="warning" size={19} color="#fff" />
        </View>
        <Text style={{ color: COLORS.textPrimary, fontWeight: "800", fontSize: 16, flex: 1 }} numberOfLines={2}>
          {title}
        </Text>
        {risk && (
          <View
            style={{
              backgroundColor: sev.solid,
              borderRadius: 8,
              paddingHorizontal: 8,
              paddingVertical: 4,
              marginLeft: 8,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 }}>
              {risk.toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      {/* Recommendation list */}
      {recommendations.length > 0 && (
        <View style={{ marginTop: 12 }}>
          {recommendations.map((item, idx) => (
            <View key={idx} style={{ flexDirection: "row", alignItems: "flex-start", marginTop: idx === 0 ? 0 : 8 }}>
              <Ionicons name="checkmark-circle" size={15} color={sev.border} style={{ marginTop: 1, marginRight: 8 }} />
              <Text style={{ color: COLORS.textSecondary, fontSize: 13.5, lineHeight: 19, flex: 1 }}>{item}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function Weather() {
  const [address, setAddress] = useState<any>(null);
  const [weather, setWeather] = useState<any>(null);
  const [alert, setAlert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    getLocation();

  }, []);

  useEffect(() => {
    if (weather && address) {
      getWeatherAlert();
    }
  }, [weather, address]);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setErrorMsg("Location permission denied");
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const latitude = currentLocation.coords.latitude;
      const longitude = currentLocation.coords.longitude;
      await AsyncStorage.setItem(
        "latitude",
        latitude.toString()
      );

      await AsyncStorage.setItem(
        "longitude",
        longitude.toString()
      );


      await getWeather(latitude, longitude);

      const addressData = await Location.reverseGeocodeAsync({ latitude, longitude });
      setAddress(addressData[0]);
      const selectedAddress = addressData[0];

      // Extract just the city string
      const cityName = selectedAddress.city;

      // Save the raw string directly (no JSON.stringify needed)
      await AsyncStorage.setItem('user_address', cityName);

      console.log('✅ Address saved to storage:', cityName);

    } catch (error) {
      console.log(error);
      setErrorMsg("Couldn't fetch your location");
    } finally {
      setLoading(false);
    }
  };

  const getWeather = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure&hourly=precipitation_probability&daily=sunrise,sunset&timezone=auto`
      );
      const data = await response.json();

      setWeather({
        ...data.current,
        rainProbability: data.hourly?.precipitation_probability?.[0] || 0,
        sunrise: data.daily?.sunrise?.[0],
        sunset: data.daily?.sunset?.[0],
      });

      return data;
    } catch (error) {
      console.log(error);
    }
  };

  const getWeatherAlert = async () => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/v1/weather/alert`, {
        temperature: weather.temperature_2m,
        humidity: weather.relative_humidity_2m,
        rainProbability: weather.rainProbability,
        windSpeed: weather.wind_speed_10m,
        weatherCode: weather.weather_code,
        location: address?.city,
      });

      setAlert(response.data.data);
    } catch (error: any) {
      console.log(error?.response?.data || error.message);
    }
  };

  return (
    <View
      style={{
        margin: 14,
        borderRadius: 32,
        shadowColor: "#0F4C42",
        shadowOpacity: 0.3,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
        elevation: 8,
      }}
    >
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientMid, COLORS.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 32, padding: 24, overflow: "hidden" }}
      >
        {/* Decorative oversized icon, bleeding off the corner */}
        <View style={{ position: "absolute", top: -24, right: -24, opacity: 0.08 }}>
          <ConditionIcon code={weather?.weather_code} size={180} color="#FFFFFF" />
        </View>

        {loading ? (
          <View style={{ paddingVertical: 40, alignItems: "center" }}>
            <ActivityIndicator color="#fff" size="large" />
          </View>
        ) : errorMsg ? (
          <Text style={{ color: COLORS.textPrimary, textAlign: "center", paddingVertical: 24, fontSize: 15 }}>
            {errorMsg}
          </Text>
        ) : (
          <>
            {/* Top label row */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ color: COLORS.textSecondary, fontSize: 13, letterSpacing: 1.4, fontWeight: "800" }}>
                TODAY'S WEATHER
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="location-sharp" size={13} color={COLORS.textTertiary} />
                <Text style={{ color: COLORS.textTertiary, fontSize: 13, marginLeft: 4 }}>
                  {address?.city || "Locating..."}
                  {address?.region ? `, ${address.region}` : ""}
                </Text>
              </View>
            </View>

            {/* Hero temperature — bigger icon badge + bigger number */}
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 18 }}>
              <View
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: 22,
                  backgroundColor: COLORS.glass,
                  borderColor: COLORS.glassBorder,
                  borderWidth: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 16,
                }}
              >
                <ConditionIcon code={weather?.weather_code} size={40} />
              </View>
              <View>
                <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                  <Text style={{ color: COLORS.textPrimary, fontSize: 68, fontWeight: "800", lineHeight: 72 }}>
                    {weather?.temperature_2m !== undefined ? Math.round(weather.temperature_2m) : "--"}
                  </Text>
                  <Text style={{ color: COLORS.textSecondary, fontSize: 26, fontWeight: "600", marginTop: 10 }}>°C</Text>
                </View>
                <Text style={{ color: COLORS.textSecondary, fontSize: 14, marginTop: -2 }}>
                  {getConditionInfo(weather?.weather_code).label} · Feels like{" "}
                  {weather?.apparent_temperature !== undefined ? Math.round(weather.apparent_temperature) : "--"}°
                </Text>
              </View>
            </View>

            {/* Single, correctly-modeled alert: one title, one risk, list of actions */}
            {alert?.alert && (
              <AlertCard
                title={alert.alert}
                risk={alert.risk}
                recommendations={alert.recommendation || []}
              />
            )}

            {/* Stat tiles — bigger, 3 across */}
            <View style={{ flexDirection: "row", marginTop: 20, marginHorizontal: -5 }}>
              <StatTile icon="droplet" value={`${weather?.relative_humidity_2m ?? "--"}%`} label="HUMIDITY" />
              <StatTile icon="cloud-rain" value={`${weather?.rainProbability ?? "--"}%`} label="RAIN CHANCE" />
              <StatTile
                icon="wind"
                value={`${weather?.wind_speed_10m ?? "--"}`}
                label={`KM/H ${windDirLabel(weather?.wind_direction_10m)}`}
              />
            </View>

            {/* Sunrise / sunset footer — bigger, clearer */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 18,
                paddingTop: 16,
                borderTopWidth: 1,
                borderTopColor: COLORS.glassBorder,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 10,
                    backgroundColor: COLORS.glass,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 8,
                  }}
                >
                  <Feather name="sunrise" size={15} color={COLORS.gold} />
                </View>
                <View>
                  <Text style={{ color: COLORS.textTertiary, fontSize: 10, fontWeight: "600", letterSpacing: 0.4 }}>
                    SUNRISE
                  </Text>
                  <Text style={{ color: COLORS.textPrimary, fontSize: 14, fontWeight: "700" }}>
                    {formatTime(weather?.sunrise)}
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 10,
                    backgroundColor: COLORS.glass,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 8,
                  }}
                >
                  <Feather name="sunset" size={15} color={COLORS.gold} />
                </View>
                <View>
                  <Text style={{ color: COLORS.textTertiary, fontSize: 10, fontWeight: "600", letterSpacing: 0.4 }}>
                    SUNSET
                  </Text>
                  <Text style={{ color: COLORS.textPrimary, fontSize: 14, fontWeight: "700" }}>
                    {formatTime(weather?.sunset)}
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}
      </LinearGradient>
    </View>
  );
}