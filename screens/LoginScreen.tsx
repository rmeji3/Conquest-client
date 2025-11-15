// screens/LoginScreen.tsx
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  ActivityIndicator,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AuthContext from '../AuthContext';
import { loginRequest } from '../api/auth';

type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ResetPassword: undefined;
};

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

// If you want navigation (e.g. "Go to Register"), accept { navigation }
export default function LoginScreen({ navigation }: LoginScreenProps) {
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

      // Persist auth data securely on the device
      await SecureStore.setItemAsync('auth_token', token);
      await SecureStore.setItemAsync(
        'user',
        JSON.stringify(data.user || {})
      );
      if (data.expiresUtc) {
        await SecureStore.setItemAsync('auth_expiresUtc', data.expiresUtc);
      }

      // Flip auth state so App.tsx shows the main tabs instead of Login
      setIsLoggedIn(true);
    } catch (err) {
      console.log('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setErrorMsg(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <Text className="text-3xl font-bold mb-2">Conquest</Text>
      <Text className="text-base mb-4 text-gray-700">Sign in to continue</Text>

      {errorMsg ? <Text className="text-red-600 mb-3">{errorMsg}</Text> : null}

      <TextInput
        className="border border-gray-300 rounded px-3 py-2 mb-3 bg-white"
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        className="border border-gray-300 rounded px-3 py-2 mb-3 bg-white"
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {loading ? (
        <ActivityIndicator className="mt-3" />
      ) : (
        <Button title="Log In" onPress={handleLogin} />
      )}

      {!loading && (
        <>
          <View className="mt-4">
            <Button
              title="Create an account"
              onPress={() => navigation.navigate('Register')}
            />
          </View>

          {/* Forgot password navigation */}
          <View className="mt-2">
            <Button
              title="Forgot password?"
              onPress={() => navigation.navigate('ResetPassword')}
            />
          </View>
        </>
      )}
    </View>
  );
}
