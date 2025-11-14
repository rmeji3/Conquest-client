import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AuthContext from '../AuthContext';
import { loginRequest } from '../api/auth';

export default function LoginScreen() {
  const { setIsLoggedIn } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleLogin() {
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Email and password are required.');
      return;
    }

    try {
      setLoading(true);

      // Call backend here
      const data = await loginRequest(email.trim(), password);

      // Expecting: data.token and data.user
      await SecureStore.setItemAsync('auth_token', data.token);
      // store user JSON
      await SecureStore.setItemAsync('user', JSON.stringify(data.user));

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
