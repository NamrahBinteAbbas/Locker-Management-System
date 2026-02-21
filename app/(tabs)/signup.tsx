import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function SignupScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSignup = async () => {
    // 1️⃣ Make POST request to backend
    try {
      const response = await fetch("http://localhost:5001/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      // 2️⃣ Parse JSON response
      const data = await response.json();

      // 3️⃣ Handle response
      if (response.ok) {
        setMessage(data.message); // success
      } else {
        setMessage(data.message || data.error);   // error from backend
      }
    } catch (err) {
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
        <Text style={styles.label}>Email</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="Enter your email"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            placeholderTextColor="#999"
            keyboardType="email-address"
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

        <TouchableOpacity style={styles.signInButton} onPress={handleSignup}>
          <Text style={styles.signInButtonText}>Sign Up</Text>
        </TouchableOpacity>

        {message ? <Text style={styles.message}>{message}</Text> : null}
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
});