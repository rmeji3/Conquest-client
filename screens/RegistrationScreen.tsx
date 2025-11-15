// screens/RegistrationScreen.tsx
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
import { registerRequest } from '../api/auth';

type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ResetPassword: undefined;
};

type RegistrationScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

interface RegistrationScreenProps {
  navigation: RegistrationScreenNavigationProp;
}

// Helper: validate password against your rules
function isValidPassword(pw: string): boolean {
  if (pw.length < 8) return false;

  const hasUppercase = /[A-Z]/.test(pw);
  const hasSpecial = /[!@#$%^&*()\-_=+{}:;'",\.\?/`~]/.test(pw);

  return hasUppercase && hasSpecial;
}

export default function RegistrationScreen({ navigation }: RegistrationScreenProps) {
  const { setIsLoggedIn } = useContext(AuthContext);

  // Form fields
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleRegister() {
    setErrorMsg('');

    // Basic email validation (simple rule: must contain '@')
    if (!email.includes('@')) {
      setErrorMsg('Email must contain @ symbol.');
      return;
    }

    if (!userName.trim()) {
      setErrorMsg('Username is required.');
      return;
    }

    // Password validation based on your rules
    if (!isValidPassword(password)) {
      setErrorMsg(
        'Password must be at least 8 characters, include one uppercase letter, and one special character.'
      );
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg('First name and last name are required.');
      return;
    }

    try {
      setLoading(true);

      // Call backend /api/Auth/register
      const data = await registerRequest({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        userName: userName.trim(),
      });

      // data = { accessToken, expiresUtc, user }
      const token = String(data.accessToken || '');
      if (!token) {
        throw new Error('No authentication token received from server.');
      }

      // Save auth data
      await SecureStore.setItemAsync('auth_token', token);
      await SecureStore.setItemAsync(
        'user',
        JSON.stringify(data.user || {})
      );
      if (data.expiresUtc) {
        await SecureStore.setItemAsync('auth_expiresUtc', data.expiresUtc);
      }

      // User is now registered + logged in → go to main app
      setIsLoggedIn(true);

    } 
    
    // If username already exists or email is taken, the backend should send an error
    catch (err) {
        console.log('Registration error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Registration failed';
        setErrorMsg(errorMessage); // show backend message
    }
    finally {
        setLoading(false);
    }
  }

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <Text className="text-2xl font-bold mb-4">Create an account</Text>

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
        placeholder="Username"
        autoCapitalize="none"
        value={userName}
        onChangeText={setUserName}
      />

      <TextInput
        className="border border-gray-300 rounded px-3 py-2 mb-3 bg-white"
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        className="border border-gray-300 rounded px-3 py-2 mb-3 bg-white"
        placeholder="First name"
        value={firstName}
        onChangeText={setFirstName}
      />

      <TextInput
        className="border border-gray-300 rounded px-3 py-2 mb-3 bg-white"
        placeholder="Last name"
        value={lastName}
        onChangeText={setLastName}
      />

      {loading ? (
        <ActivityIndicator className="mt-3" />
      ) : (
        <Button title="Register" onPress={handleRegister} />
      )}

      {!loading && (
        <View className="mt-4">
          <Button
            title="Already have an account? Log in"
            onPress={() => navigation.navigate('Login')}
          />
        </View>
      )}
    </View>
  );
}
