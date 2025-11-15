// screens/ResetPasswordScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { resetPasswordRequest } from '../api/auth';

type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ResetPassword: undefined;
};

type ResetPasswordScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ResetPassword'>;

interface ResetPasswordScreenProps {
  navigation: ResetPasswordScreenNavigationProp;
}

// Same password rule as registration:
// - at least 8 characters
// - at least one uppercase letter
// - at least one special character
function isValidPassword(pw: string): boolean {
  if (pw.length < 8) return false;
  const hasUppercase = /[A-Z]/.test(pw);
  const hasSpecial = /[!@#$%^&*()\-_=+{}:;'",\.\?/`~]/.test(pw);
  return hasUppercase && hasSpecial;
}

export default function ResetPasswordScreen({ navigation }: ResetPasswordScreenProps) {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  async function handleResetPassword() {
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.includes('@')) {
      setErrorMsg('Email must contain @ symbol.');
      return;
    }

    if (!token.trim()) {
      setErrorMsg('Reset token is required.');
      return;
    }

    if (!isValidPassword(newPassword)) {
      setErrorMsg(
        'Password must be at least 8 characters, include one uppercase letter, and one special character.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);

      await resetPasswordRequest({
        email: email.trim(),
        token: token.trim(),
        newPassword,
      });

      setSuccessMsg('Password has been reset successfully. You can now log in.');
      // Optionally, navigate back after a short delay:
      // setTimeout(() => navigation.navigate('Login'), 1000);
    } catch (err) {
      console.log('Reset password error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Password reset failed. Please try again.';
      setErrorMsg(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>
        Enter your email, reset token, and new password.
      </Text>

      {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}
      {successMsg ? <Text style={styles.success}>{successMsg}</Text> : null}

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
        placeholder="Reset token"
        autoCapitalize="none"
        value={token}
        onChangeText={setToken}
      />

      <TextInput
        style={styles.input}
        placeholder="New password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm new password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 12 }} />
      ) : (
        <Button title="Reset Password" onPress={handleResetPassword} />
      )}

      {!loading && (
        <View style={{ marginTop: 16 }}>
          <Button
            title="Back to Login"
            onPress={() => navigation.navigate('Login')}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  error: { color: 'red', marginBottom: 12 },
  success: { color: 'green', marginBottom: 12 },
});
