// screens/RegistrationScreen.tsx
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
    <View style={styles.container}>
      <Text style={styles.title}>Create an account</Text>

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
        placeholder="Username"
        autoCapitalize="none"
        value={userName}
        onChangeText={setUserName}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        style={styles.input}
        placeholder="First name"
        value={firstName}
        onChangeText={setFirstName}
      />

      <TextInput
        style={styles.input}
        placeholder="Last name"
        value={lastName}
        onChangeText={setLastName}
      />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 12 }} />
      ) : (
        <Button title="Register" onPress={handleRegister} />
      )}

      {!loading && (
        <View style={{ marginTop: 16 }}>
          <Button
            title="Already have an account? Log in"
            onPress={() => navigation.navigate('Login')}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  error: { color: 'red', marginBottom: 12 },
});
