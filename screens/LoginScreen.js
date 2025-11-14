// screens/LoginScreen.js
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AuthContext from '../AuthContext';
import { loginRequest } from '../api/auth';

// If you want navigation (e.g. "Go to Register"), accept { navigation }
export default function LoginScreen({ navigation }) {
  const { setIsLoggedIn } = useContext(AuthContext);

  // Local state for form fields and UI
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Called when the user taps the "Log In" button
  async function handleLogin() {
    setErrorMsg('');

    // Very basic frontend validation
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Email and password are required.');
      return;
    }

    try {
      setLoading(true);

      // Call backend /api/Auth/login via our API helper
      const data = await loginRequest(email.trim(), password);

      console.log('Login response:', data);

      // Backend returns: { accessToken, expiresUtc, user }
      const token = String(data.accessToken || '');
      if (!token) {
        throw new Error('No authentication token received from server');
      }

      // 2️⃣ Persist auth data securely on the device
      await SecureStore.setItemAsync('auth_token', token);
      await SecureStore.setItemAsync(
        'user',
        JSON.stringify(data.user || {})
      );
      if (data.expiresUtc) {
        await SecureStore.setItemAsync('auth_expiresUtc', data.expiresUtc);
      }

      // 3️⃣ Flip auth state so App.js shows the main tabs instead of Login
      setIsLoggedIn(true);
    } catch (err) {
      console.log('Login error:', err);
      setErrorMsg(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Conquest</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>

      {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 12 }} />
      ) : (
        <Button title="Log In" onPress={handleLogin} />
      )}

      {/* Simple button to go to Register screen */}
      {!loading && (
        <View style={{ marginTop: 16 }}>
          <Button
            title="Create an account"
            onPress={() => navigation.navigate('Register')}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  error: {
    color: 'red',
    marginBottom: 12,
  },
});
