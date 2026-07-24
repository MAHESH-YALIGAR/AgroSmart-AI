import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
  SafeAreaView,
} from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as Location from "expo-location";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
// Native structural hook to bypass parent prop issues
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");
const BACKEND = process.env.EXPO_PUBLIC_BACKEND_API || "https://ngrok-free.dev";

interface Store {
  _id: string;
  storeName: string;
  ownerName: string;
  mobile: string;
  email: string;
  licenseNumber: string;
  address: string;
  place: string;
  taluka: string;
  district: string;
  state: string;
  openingTime: string;
  closingTime: string;
  description?: string;
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
}

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const nativeNavigation = useNavigation(); // Standalone contextual hook
  
  const [stores, setStores] = useState<Store[]>([]);
  const [filteredStores, setFilteredStores] = useState<Store[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [userLocation, setUserLocation] = useState({
    latitude: 12.9716,
    longitude: 77.5946,
  });

  useEffect(() => {
    async function initializeMap() {
      try {
        await Promise.all([getUserLocation(), loadStores()]);
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setLoading(false);
      }
    }
    initializeMap();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredStores(stores);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = stores.filter(
        (store) =>
          store.storeName?.toLowerCase().includes(lowerQuery) ||
          store.place?.toLowerCase().includes(lowerQuery)
      );
      setFilteredStores(filtered);
    }
  }, [searchQuery, stores]);

  async function getUserLocation() {
    try {
      const storedLat = await AsyncStorage.getItem("latitude");
      const storedLon = await AsyncStorage.getItem("longitude");

      if (storedLat && storedLon) {
        const coords = { latitude: parseFloat(storedLat), longitude: parseFloat(storedLon) };
        setUserLocation(coords);
        centerMap(coords.latitude, coords.longitude);
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      const currentCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      
      setUserLocation(currentCoords);
      centerMap(currentCoords.latitude, currentCoords.longitude);
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  }

  async function loadStores() {
    try {
      const response = await axios.get(`${BACKEND}/api/v1/webrouter/getallmapdata`);
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        setStores(response.data.data);
        setFilteredStores(response.data.data);
      }
    } catch (err) {
      console.error("Failed to load stores:", err);
    }
  }

  function centerMap(latitude: number, longitude: number) {
    if (!latitude || !longitude) return;
    mapRef.current?.animateToRegion({
      latitude,
      longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    }, 600);
  }

  function selectStore(store: Store) {
    setSelectedStore(store);
    if (store.location?.coordinates && store.location.coordinates.length === 2) {
      centerMap(store.location.coordinates[1], store.location.coordinates[0]);
    }
  }

  const handleBackAction = () => {
    // Completely standalone execution block
    if (nativeNavigation && typeof nativeNavigation.goBack === 'function') {
      nativeNavigation.goBack();
    } else {
      console.log("No routing host container matched this view element framework.");
    }
  };

  const handleRecenter = () => {
    centerMap(userLocation.latitude, userLocation.longitude);
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>Loading Map Assets...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        showsUserLocation
        showsMyLocationButton={false}
        provider={PROVIDER_DEFAULT}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        onPress={() => setSelectedStore(null)}
      >
        {filteredStores.map((store) => {
          if (!store.location?.coordinates || store.location.coordinates.length < 2) return null;
          return (
            <Marker
              key={store._id}
              coordinate={{
                latitude: store.location.coordinates[1],
                longitude: store.location.coordinates[0],
              }}
              title={store.storeName}
              onPress={() => selectStore(store)}
            />
          );
        })}
      </MapView>

      <SafeAreaView style={styles.headerContainer}>
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.iconButton} onPress={handleBackAction}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1f2937" />
          </TouchableOpacity>
          
          <View style={styles.searchBarWrapper}>
            <MaterialCommunityIcons name="magnify" size={20} color="#9ca3af" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search store name or area..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
          </View>
        </View>
      </SafeAreaView>

      <TouchableOpacity 
        style={[styles.fabButton, { bottom: selectedStore ? 320 : 24 }]} 
        onPress={handleRecenter}
      >
        <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#16a34a" />
      </TouchableOpacity>

      {selectedStore && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.title} numberOfLines={1}>{selectedStore.storeName}</Text>
            <TouchableOpacity onPress={() => setSelectedStore(null)}>
              <MaterialCommunityIcons name="close-circle" size={24} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="account" size={16} color="#4b5563" />
              <Text style={styles.infoText}>Owner: {selectedStore.ownerName}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="phone" size={16} color="#4b5563" />
              <Text style={styles.infoText}>Mobile: {selectedStore.mobile}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="map-marker" size={16} color="#4b5563" />
              <Text style={styles.infoText} numberOfLines={2}>Address: {selectedStore.address}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="clock-outline" size={16} color="#4b5563" />
              <Text style={styles.infoText}>Timing: {selectedStore.openingTime} - {selectedStore.closingTime}</Text>
            </View>
            <Text style={styles.description}>
              {selectedStore.description || "No additional description provided."}
            </Text>
          </ScrollView>

          <TouchableOpacity style={styles.button}>
            <MaterialCommunityIcons name="store-marker" size={20} color="white" />
            <Text style={styles.buttonText}>View Store Dashboard</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  loadingText: {
    marginTop: 10,
    color: "#4b5563",
    fontSize: 14,
  },
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    backgroundColor: "white",
    height: 46,
    width: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  searchBarWrapper: {
    flex: 1,
    flexDirection: "row", alignItems: "center", backgroundColor: "white", height: 46, borderRadius: 23, marginLeft: 12, paddingHorizontal: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 4,
  }, searchIcon: { marginRight: 8, }, searchInput: { flex: 1, color: "#1f2937", fontSize: 15, height: "100%", }, fabButton: { position: "absolute", right: 16, backgroundColor: "white", height: 50, width: 50, borderRadius: 25, justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 5, }, card: { position: "absolute", bottom: 24, alignSelf: 'center', width: width - 32, backgroundColor: "white", borderRadius: 20, padding: 16, maxHeight: 280, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8, }, cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, borderBottomWidth: 1, borderBottomColor: "#f3f4f6", paddingBottom: 8, }, title: { fontSize: 18, fontWeight: "700", color: "#1f2937", flex: 1, marginRight: 8, }, scrollContent: { paddingBottom: 8, }, infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 6, }, infoText: { marginLeft: 8, color: "#4b5563", fontSize: 14, }, description: { marginTop: 8, color: "#9ca3af", fontSize: 13, fontStyle: "italic", }, button: { marginTop: 12, backgroundColor: "#16a34a", paddingVertical: 12, borderRadius: 12, flexDirection: "row", justifyContent: "center", alignItems: "center", }, buttonText: { color: "white", marginLeft: 8, fontWeight: "700", fontSize: 15, },
});