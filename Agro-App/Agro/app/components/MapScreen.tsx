import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedStore, setSelectedStore] = useState(null);

  const [userLocation, setUserLocation] = useState({
    latitude: 12.9716,
    longitude: 77.5946,
  });

  useEffect(() => {
    getLocation();
    loadStores();
  }, []);

  async function getLocation() {
    const { status } =
      await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") return;

    const location =
      await Location.getCurrentPositionAsync({});

    setUserLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
  }

  async function loadStores() {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/v1/getmapdat`
      );

      const data = await response.json();

      setStores(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  function selectStore(store) {
    setSelectedStore(store);

    mapRef.current?.animateToRegion({
      latitude: store.location.coordinates[1],
      longitude: store.location.coordinates[0],
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    });
  }

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        showsUserLocation
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.4,
          longitudeDelta: 0.4,
        }}
      >
        {stores.map((store) => (
          <Marker
            key={store._id}
            coordinate={{
              latitude: store.location.coordinates[1],
              longitude: store.location.coordinates[0],
            }}
            title={store.storeName}
            description={store.address}
            onPress={() => selectStore(store)}
          />
        ))}
      </MapView>

      {selectedStore && (
        <View style={styles.card}>
          <ScrollView>
            <Text style={styles.title}>
              {selectedStore.storeName}
            </Text>

            <Text>Owner : {selectedStore.ownerName}</Text>

            <Text>Mobile : {selectedStore.mobile}</Text>

            <Text>Email : {selectedStore.email}</Text>

            <Text>
              License : {selectedStore.licenseNumber}
            </Text>

            <Text>
              Address : {selectedStore.address}
            </Text>

            <Text>
              Place : {selectedStore.place}
            </Text>

            <Text>
              Taluka : {selectedStore.taluka}
            </Text>

            <Text>
              District : {selectedStore.district}
            </Text>

            <Text>
              State : {selectedStore.state}
            </Text>

            <Text>
              Opening : {selectedStore.openingTime}
            </Text>

            <Text>
              Closing : {selectedStore.closingTime}
            </Text>

            <Text>
              {selectedStore.description || "No description"}
            </Text>

            <TouchableOpacity style={styles.button}>
              <MaterialCommunityIcons
                name="store-marker"
                size={22}
                color="white"
              />

              <Text style={styles.buttonText}>
                View Store
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    position: "absolute",
    bottom: 20,
    left: 15,
    right: 15,
    backgroundColor: "white",
    borderRadius: 18,
    padding: 18,
    maxHeight: 280,
    elevation: 6,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },

  button: {
    marginTop: 15,
    backgroundColor: "#16a34a",
    padding: 12,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    marginLeft: 8,
    fontWeight: "700",
  },
});