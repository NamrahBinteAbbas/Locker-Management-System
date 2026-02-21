import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:5001/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Login successful!");
        setToken(data.token);
        
        // Save token to AsyncStorage
        await AsyncStorage.setItem("token", data.token);
        
        console.log("JWT TOKEN:", data.token);
        
        // Redirect to dashboard
        setTimeout(() => {
          router.replace("./lockers");
        }, 500);
        
      } else {
        setMessage(data.error || data.message);
      }
    } catch (err) {
      console.error("Login error:", err);
      setMessage("Network error");
    }
  };

  return (
    <View style={styles.container}>
      {/* IBA Logo Header */}
      <View style={styles.header}>
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoText}>IBA</Text>
        </View>
        <Text style={styles.title}>Locker Management System</Text>
        <Text style={styles.subtitle}>Institute of Business Administration, Karachi</Text>
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        <Text style={styles.label}>ERP ID</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="Enter your ERP ID"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            placeholderTextColor="#999"
            autoCapitalize="none"
          />
        </View>

        <Text style={styles.label}>Password</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            placeholderTextColor="#999"
          />
        </View>

        <TouchableOpacity style={styles.signInButton} onPress={handleLogin}>
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>

        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Please use your Wi-Fi credentials to login</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 30,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#8B1538',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 22,
    fontStyle: 'italic',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  formContainer: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  inputWrapper: {
    borderWidth: 2,
    borderColor: '#8B1538',
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  input: {
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  signInButton: {
    backgroundColor: '#8B1538',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  message: {
    marginTop: 15,
    textAlign: 'center',
    color: '#8B1538',
    fontSize: 14,
  },
  footer: {
    marginTop: 30,
    backgroundColor: '#FFF5F5',
    padding: 15,
    borderRadius: 8,
  },
  footerText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 13,
  },
});