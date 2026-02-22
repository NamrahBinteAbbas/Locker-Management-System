import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
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

export default function MyLockerScreen() {
  const router = useRouter();
  const [locker, setLocker] = useState<LockerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [releasing, setReleasing] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    fetchMyLocker();
  }, []);

  const fetchMyLocker = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch("http://localhost:5001/mylockers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setLocker(data);
      } else {
        setLocker(null);
      }
    } catch (err) {
      Alert.alert("Error", "Network error");
    } finally {
      setLoading(false);
    }
  };
  const handleRelease = async () => {
    const confirmed = window.confirm("Are you sure you want to release this locker?");
    if (!confirmed) return;

    setReleasing(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5001/mylockers/${locker?._id}/release`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Locker released successfully");
        router.push("/lockers");
      } else {
        Alert.alert("Error", data.message);
      }
    } catch (err) {
      Alert.alert("Error", "Network error");
    } finally {
      setReleasing(false);
    }
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5001/mylockers/${locker?._id}/share`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Locker is now available for sharing");
        fetchMyLocker();
      } else {
        Alert.alert("Error", data.message);
      }
    } catch (err) {
      Alert.alert("Error", "Network error");
    } finally {
      setSharing(false);
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
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>You don't have a locker yet</Text>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => router.push("/lockers")}
        >
          <Text style={styles.browseButtonText}>Browse Lockers</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isSharing = locker.currentOccupants > 1;
  const canShare =
    locker.currentOccupants === 1 && !locker.availableForSharing;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.lockerNumber}>{locker.number}</Text>
        <Text style={styles.location}>{locker.location}</Text>
      </View>

      <View style={styles.detailsCard}>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Status:</Text>
          <Text
            style={[
              styles.value,
              {
                color: locker.availableForSharing
                  ? "#FF9800"
                  : isSharing
                  ? "#2196F3"
                  : "#4CAF50",
              },
            ]}
          >
            {locker.availableForSharing
              ? "Listed for Sharing"
              : isSharing
              ? "Shared"
              : "Solo"}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Occupancy:</Text>
          <Text style={styles.value}>
            {locker.currentOccupants} / {locker.maxOccupants}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Location:</Text>
          <Text style={styles.value}>{locker.location}</Text>
        </View>
      </View>

      <View style={styles.actionsCard}>
        {canShare && (
          <TouchableOpacity
            style={[styles.shareButton, sharing && styles.buttonDisabled]}
            onPress={handleShare}
            disabled={sharing}
          >
            {sharing ? (
              <ActivityIndicator color="#8B1538" />
            ) : (
              <Text style={styles.shareButtonText}>Put Up for Sharing</Text>
            )}
          </TouchableOpacity>
        )}

        {locker.availableForSharing && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              ℹ️ Your locker is currently listed for sharing
            </Text>
          </View>
        )}

        {isSharing && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              ℹ️ You are sharing this locker with someone
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.releaseButton, releasing && styles.buttonDisabled]}
          onPress={handleRelease}
          disabled={releasing}
        >
          {releasing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.releaseButtonText}>Release Locker</Text>
          )}
        </TouchableOpacity>
      </View>
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 20,
  },
  browseButton: {
    backgroundColor: "#8B1538",
    padding: 15,
    borderRadius: 12,
    paddingHorizontal: 30,
  },
  browseButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
  actionsCard: {
    margin: 20,
    gap: 12,
  },
  shareButton: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#8B1538",
  },
  shareButtonText: {
    color: "#8B1538",
    fontSize: 16,
    fontWeight: "600",
  },
  releaseButton: {
    backgroundColor: "#8B1538",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  releaseButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  infoBox: {
    backgroundColor: "#FFF8E1",
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  infoText: {
    fontSize: 14,
    color: "#666",
  },
});