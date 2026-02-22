import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Locker {
  _id: string;
  number: string;
  location: string;
  maxOccupants: number;
  currentOccupants: number;
  status: "Available" | "Occupied" | "Available for Sharing";
}

export default function DashboardScreen() {
  const [lockers, setLockers] = useState<Locker[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchLockers();
  }, []);

  const fetchLockers = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "Please login first");
        return;
      }

      const response = await fetch("http://localhost:5001/lockers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setLockers(data);
      } else {
        Alert.alert("Error", data.message);
      }
    } catch (err) {
      Alert.alert("Error", "Network error");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Locker["status"]) => {
    switch (status) {
      case "Available":
        return "#4CAF50";
      case "Available for Sharing":
        return "#FF9800";
      case "Occupied":
      default:
        return "#9E9E9E";
    }
  };

  const renderLocker = ({ item }: { item: Locker }) => (
    <TouchableOpacity
      style={[styles.lockerCard, { backgroundColor: getStatusColor(item.status) }]}
      onPress={() => router.push(`/booking/${item._id}` as any)}
    >
      <Text style={styles.lockerNumber}>{item.number}</Text>
      <Text style={styles.lockerLocation}>{item.location}</Text>
      <Text style={styles.lockerStatus}>{item.status}</Text>
      <TouchableOpacity
        style={styles.viewButton}
        onPress={() => router.push(`/booking/${item._id}` as any)}
      >
        <Text style={styles.viewButtonText}>View Details</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B1538" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Locker Dashboard</Text>
            <Text style={styles.subtitle}>Select a locker to view details</Text>
          </View>
          <TouchableOpacity
            style={styles.myLockerButton}
            onPress={() => router.push("/mylockers")}
          >
            <Text style={styles.myLockerButtonText}>My Locker</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: "#4CAF50" }]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: "#FF9800" }]} />
          <Text style={styles.legendText}>For Sharing</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: "#9E9E9E" }]} />
          <Text style={styles.legendText}>Occupied</Text>
        </View>
      </View>

      <FlatList
        data={lockers}
        renderItem={renderLocker}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#8B1538",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    fontSize: 14,
    color: "#fff",
    marginTop: 5,
  },
  myLockerButton: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  myLockerButtonText: {
    color: "#8B1538",
    fontWeight: "600",
    fontSize: 13,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 15,
    backgroundColor: "#f5f5f5",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: "#333",
  },
  gridContainer: {
    padding: 10,
  },
  lockerCard: {
    flex: 1,
    margin: 8,
    padding: 15,
    borderRadius: 12,
    minHeight: 150,
    justifyContent: "space-between",
  },
  lockerNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  lockerLocation: {
    fontSize: 12,
    color: "#fff",
    marginTop: 5,
  },
  lockerStatus: {
    fontSize: 11,
    color: "#fff",
    marginTop: 10,
    fontWeight: "600",
  },
  viewButton: {
    backgroundColor: "rgba(255,255,255,0.3)",
    padding: 8,
    borderRadius: 6,
    marginTop: 10,
    alignItems: "center",
  },
  viewButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});