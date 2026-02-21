import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface LockerDetails {
  _id: string;
  number: string;
  location: string;
  occupied: boolean;
  availableForSharing: boolean;
  maxOccupants: number;
  currentOccupants: number;
  occupants: any[];
}

export default function LockerDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [locker, setLocker] = useState<LockerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [putForSharing, setPutForSharing] = useState(false); // ✅ NEW

  useEffect(() => {
    fetchLockerDetails();
  }, []);

  const fetchLockerDetails = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`http://localhost:5001/lockers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      const lockerData = data.find((l: any) => l._id === id);

      if (lockerData) {
        setLocker(lockerData);
      } else {
        Alert.alert("Error", "Locker not found");
      }
    } catch (err) {
      Alert.alert("Error", "Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleBookLocker = async () => {
    setBooking(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch("http://localhost:5001/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          lockerId: id,
          putForSharing: putForSharing, // ✅ Send the toggle value
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Locker booked successfully!");
        router.push("/lockers");
      } else {
        Alert.alert("Error", data.message);
      }
    } catch (err) {
      Alert.alert("Error", "Network error");
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B1538" />
      </View>
    );
  }

  if (!locker) {
    return (
      <View style={styles.container}>
        <Text>Locker not found</Text>
      </View>
    );
  }

  const canBook = !locker.occupied || (locker.availableForSharing && locker.currentOccupants < locker.maxOccupants);
  const isFirstOccupant = !locker.occupied; // ✅ Check if this is the first booking

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.lockerNumber}>{locker.number}</Text>
        <Text style={styles.location}>{locker.location}</Text>
      </View>

      <View style={styles.detailsCard}>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Status:</Text>
          <Text style={[styles.value, { color: locker.occupied ? (locker.availableForSharing ? "#FF9800" : "#9E9E9E") : "#4CAF50" }]}>
            {locker.occupied ? (locker.availableForSharing ? "Available for Sharing" : "Occupied") : "Available"}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Occupancy:</Text>
          <Text style={styles.value}>{locker.currentOccupants} / {locker.maxOccupants}</Text>
        </View>

        {locker.occupants && locker.occupants.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Occupants:</Text>
            {locker.occupants.map((occupant, index) => (
              <Text key={index} style={styles.occupantName}>• {occupant.username || occupant}</Text>
            ))}
          </View>
        )}
      </View>

      {canBook && (
        <View style={styles.bookingSection}>
          {/* ✅ Show toggle only if first occupant */}
          {isFirstOccupant && (
            <View style={styles.sharingToggle}>
              <Text style={styles.toggleLabel}>Make available for sharing?</Text>
              <Switch
                value={putForSharing}
                onValueChange={setPutForSharing}
                trackColor={{ false: "#ccc", true: "#8B1538" }}
                thumbColor={putForSharing ? "#fff" : "#f4f3f4"}
              />
            </View>
          )}

          <TouchableOpacity
            style={[styles.bookButton, booking && styles.bookButtonDisabled]}
            onPress={handleBookLocker}
            disabled={booking}
          >
            {booking ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.bookButtonText}>
                {locker.availableForSharing ? "Join Locker" : "Book Locker"}
              </Text>
            )}
          </TouchableOpacity>

          {putForSharing && isFirstOccupant && (
            <Text style={styles.sharingNote}>
              ℹ️ Other students will be able to join and share this locker with you
            </Text>
          )}
        </View>
      )}

      {!canBook && locker.occupied && (
        <View style={styles.unavailableCard}>
          <Text style={styles.unavailableText}>This locker is fully occupied</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: "#8B1538",
    padding: 30,
    paddingTop: 60,
  },
  lockerNumber: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
  },
  location: {
    fontSize: 16,
    color: "#fff",
    marginTop: 5,
  },
  detailsCard: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  label: {
    fontSize: 16,
    color: "#666",
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  occupantName: {
    fontSize: 14,
    color: "#666",
    marginVertical: 5,
  },
  bookingSection: {
    margin: 20,
  },
  sharingToggle: {
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  toggleLabel: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  bookButton: {
    backgroundColor: "#8B1538",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  bookButtonDisabled: {
    backgroundColor: "#ccc",
  },
  bookButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  sharingNote: {
    fontSize: 13,
    color: "#666",
    marginTop: 10,
    textAlign: "center",
    fontStyle: "italic",
  },
  unavailableCard: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  unavailableText: {
    fontSize: 16,
    color: "#9E9E9E",
  },
});