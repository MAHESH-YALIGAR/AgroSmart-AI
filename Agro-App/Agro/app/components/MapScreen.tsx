import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
  Linking,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import OsmMap, { FocusPoint, MapPoint } from "./OsmMap";
import axios from "axios";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");
const BACKEND = process.env.EXPO_PUBLIC_BACKEND_API ;

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
  products?: { product?: string; availability?: string }[];
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
}

export default function MapScreen() {
  const router = useRouter();
  
  const [stores, setStores] = useState<Store[]>([]);
  const [storesLoading, setStoresLoading] = useState(true);
  const [storesError, setStoresError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [showStoreDetails, setShowStoreDetails] = useState(false);
  const [focus, setFocus] = useState<FocusPoint | null>(null);

  function hasValidCoordinates(latitude: number, longitude: number) {
    return Number.isFinite(latitude) && Number.isFinite(longitude) &&
      latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180 &&
      !(latitude === 0 && longitude === 0);
  }

  const loadStores = useCallback(async () => {
    setStoresLoading(true);
    setStoresError(null);
    try {
      const pageSize = 100;
      const allStores: Store[] = [];
      let page = 1;
      let total = Number.POSITIVE_INFINITY;

      while (allStores.length < total) {
        const response = await axios.get(`${BACKEND}/api/v1/webrouter/getallmapdata`, {
          params: { page, limit: pageSize },
        });
        const pageStores: Store[] = response.data?.success && Array.isArray(response.data.data)
          ? response.data.data
          : [];

        if (pageStores.length === 0) break;
        allStores.push(...pageStores);
        total = Number(response.data.total ?? allStores.length);
        page += 1;
      }

      setStores(allStores);
      return allStores;
    } catch (err) {
      console.error("Failed to load stores:", err);
      setStoresError("Could not load agro-store locations. Check your connection and try again.");
      return [];
    } finally {
      setStoresLoading(false);
    }
  }, []);

  function selectStore(store: Store) {
    setSelectedStore(store);
    setShowStoreDetails(true);
    if (store.location?.coordinates && store.location.coordinates.length === 2) {
      const latitude = Number(store.location.coordinates[1]);
      const longitude = Number(store.location.coordinates[0]);
      if (hasValidCoordinates(latitude, longitude)) {
        setFocus({ latitude, longitude, key: Date.now() });
      }
    }
  }

  const filteredStores = useMemo(() => {
    const matchingStores = searchQuery.trim()
      ? stores.filter((store) => {
          const lowerQuery = searchQuery.toLowerCase();
          return store.storeName?.toLowerCase().includes(lowerQuery) ||
            store.place?.toLowerCase().includes(lowerQuery);
        })
      : stores;

    return matchingStores.filter((store) => {
      const [longitude, latitude] = store.location?.coordinates ?? [];
      return hasValidCoordinates(Number(latitude), Number(longitude));
    });
  }, [searchQuery, stores]);

  const points: MapPoint[] = useMemo(
    () =>
      filteredStores.map((store) => ({
        id: store._id,
        name: store.storeName,
        latitude: Number(store.location.coordinates[1]),
        longitude: Number(store.location.coordinates[0]),
      })),
    [filteredStores]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadStores();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadStores]);

  const handleBackAction = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <OsmMap
        points={points}
        focusPoint={focus}
        onSelect={(id) => {
          const store = stores.find((x) => x._id === id);
          if (store) selectStore(store);
        }}
        onMapPress={() => setSelectedStore(null)}
      />

      {(storesLoading || storesError || (!storesLoading && filteredStores.length === 0)) && (
        <View style={styles.statusBanner}>
          <Text style={styles.statusText}>
            {storesLoading
              ? "Loading agro-store locations…"
              : storesError
                ? storesError
                : searchQuery.trim()
                  ? "No stores match this search."
                  : stores.length > 0
                    ? "No stores have valid map coordinates yet."
                    : "No agro stores are available yet."}
          </Text>
        </View>
      )}

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

      {selectedStore && (
        <View style={[styles.card, showStoreDetails && detailStyles.expandedCard]}>
          <View style={styles.cardHeader}>
            <Text style={styles.title} numberOfLines={1}>{selectedStore.storeName}</Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Close store details"
              onPress={() => setSelectedStore(null)}
            >
              <MaterialCommunityIcons name="close-circle" size={24} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="map-marker" size={16} color="#4b5563" />
              <Text style={styles.infoText} numberOfLines={2}>
                {[selectedStore.place, selectedStore.taluka, selectedStore.district, selectedStore.state].filter(Boolean).join(", ") || selectedStore.address}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="account" size={16} color="#4b5563" />
              <Text style={styles.infoText}>Owner: {selectedStore.ownerName || "Not provided"}</Text>
            </View>
            {showStoreDetails && (
              <>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="phone" size={16} color="#4b5563" />
                  <Text style={styles.infoText}>Phone: {selectedStore.mobile || "Not provided"}</Text>
                </View>
                {!!selectedStore.email && (
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="email-outline" size={16} color="#4b5563" />
                    <Text style={styles.infoText}>{selectedStore.email}</Text>
                  </View>
                )}
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="map-marker-outline" size={16} color="#4b5563" />
                  <Text style={styles.infoText}>Address: {selectedStore.address || "Not provided"}</Text>
                </View>
                {!!selectedStore.licenseNumber && (
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="card-account-details-outline" size={16} color="#4b5563" />
                    <Text style={styles.infoText}>License: {selectedStore.licenseNumber}</Text>
                  </View>
                )}
                {(selectedStore.openingTime || selectedStore.closingTime) && (
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="clock-outline" size={16} color="#4b5563" />
                    <Text style={styles.infoText}>Hours: {selectedStore.openingTime || "—"} - {selectedStore.closingTime || "—"}</Text>
                  </View>
                )}
                {!!selectedStore.description && <Text style={styles.description}>{selectedStore.description}</Text>}
                {!!selectedStore.products?.length && selectedStore.products.map((product, index) => (
                  <View key={`${selectedStore._id}-product-${index}`} style={styles.infoRow}>
                    <MaterialCommunityIcons name="package-variant-closed" size={16} color="#4b5563" />
                    <Text style={styles.infoText}>
                      {[product.product, product.availability].filter(Boolean).join(" · ")}
                    </Text>
                  </View>
                ))}
              </>
            )}
          </ScrollView>

          <View style={detailStyles.actionRow}>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => setShowStoreDetails((expanded) => !expanded)}
              style={[detailStyles.actionButton, detailStyles.moreButton]}
            >
              <MaterialCommunityIcons name={showStoreDetails ? "chevron-up" : "information-outline"} size={19} color="#ffffff" />
              <Text style={detailStyles.actionText}>{showStoreDetails ? "Less" : "View more"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              disabled={!selectedStore.mobile}
              onPress={() => {
                void Linking.openURL(`tel:${selectedStore.mobile}`).catch(() => Alert.alert("Unable to start a call"));
              }}
              style={[detailStyles.actionButton, detailStyles.callButton, !selectedStore.mobile && detailStyles.disabledButton]}
            >
              <MaterialCommunityIcons name="phone" size={19} color="#ffffff" />
              <Text style={detailStyles.actionText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Open store location in maps"
              onPress={() => {
                const [longitude, latitude] = selectedStore.location?.coordinates ?? [];
                const parsedLatitude = Number(latitude);
                const parsedLongitude = Number(longitude);
                if (!hasValidCoordinates(parsedLatitude, parsedLongitude)) {
                  Alert.alert("Location unavailable", "This store does not have valid map coordinates.");
                  return;
                }

                const encodedName = encodeURIComponent(selectedStore.storeName);
                const mapsUrl = Platform.select({
                  android: `geo:${parsedLatitude},${parsedLongitude}?q=${parsedLatitude},${parsedLongitude}(${encodedName})`,
                  ios: `http://maps.apple.com/?ll=${parsedLatitude},${parsedLongitude}&q=${encodedName}`,
                  default: `https://maps.google.com/?q=${parsedLatitude},${parsedLongitude}`,
                });

                if (mapsUrl) {
                  void Linking.openURL(mapsUrl).catch(() => Alert.alert("Unable to open maps"));
                }
              }}
              style={[detailStyles.actionButton, detailStyles.locationButton]}
            >
              <MaterialCommunityIcons name="map-marker" size={19} color="#ffffff" />
              <Text style={detailStyles.actionText}>Location</Text>
            </TouchableOpacity>
          </View>
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
  markerPin: { width: 46, height: 50, alignItems: "center", justifyContent: "flex-start" },
  markerIcon: { position: "absolute", top: 8 },
  statusBanner: { position: "absolute", top: 78, left: 16, right: 16, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.96)", elevation: 4 },
  statusText: { color: "#374151", fontSize: 13, textAlign: "center" },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
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
  }, searchIcon: { marginRight: 8, }, searchInput: { flex: 1, color: "#1f2937", fontSize: 15, height: "100%", }, card: { position: "absolute", bottom: 24, alignSelf: 'center', width: width - 32, backgroundColor: "white", borderRadius: 20, padding: 16, maxHeight: 280, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8, }, cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, borderBottomWidth: 1, borderBottomColor: "#f3f4f6", paddingBottom: 8, }, title: { fontSize: 18, fontWeight: "700", color: "#1f2937", flex: 1, marginRight: 8, }, scrollContent: { paddingBottom: 8, }, infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 6, }, infoText: { marginLeft: 8, color: "#4b5563", fontSize: 14, }, description: { marginTop: 8, color: "#9ca3af", fontSize: 13, fontStyle: "italic", }, button: { marginTop: 12, backgroundColor: "#16a34a", paddingVertical: 12, borderRadius: 12, flexDirection: "row", justifyContent: "center", alignItems: "center", }, buttonText: { color: "white", marginLeft: 8, fontWeight: "700", fontSize: 15, },
});

const detailStyles = StyleSheet.create({
  expandedCard: { maxHeight: "76%" },
  actionRow: { flexDirection: "row", marginTop: 10 },
  actionButton: { flex: 1, minHeight: 46, borderRadius: 12, alignItems: "center", justifyContent: "center", flexDirection: "row", marginHorizontal: 3 },
  moreButton: { backgroundColor: "#16804a" },
  callButton: { backgroundColor: "#087f8c" },
  locationButton: { backgroundColor: "#dc6b24" },
  disabledButton: { opacity: 0.45 },
  actionText: { color: "white", marginLeft: 5, fontSize: 12, fontWeight: "700" },
});