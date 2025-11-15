// screens/ResetPasswordScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator } from 'react-native';
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
    <View className="flex-1 justify-center px-6 bg-white">
      <Text className="text-2xl font-bold mb-2">Reset Password</Text>
      <Text className="text-sm mb-4 text-gray-700">Enter your email, reset token, and new password.</Text>

      {errorMsg ? <Text className="text-red-600 mb-3">{errorMsg}</Text> : null}
      {successMsg ? <Text className="text-green-600 mb-3">{successMsg}</Text> : null}

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
        placeholder="Reset token"
        autoCapitalize="none"
        value={token}
        onChangeText={setToken}
      />

      <TextInput
        className="border border-gray-300 rounded px-3 py-2 mb-3 bg-white"
        placeholder="New password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />

      <TextInput
        className="border border-gray-300 rounded px-3 py-2 mb-3 bg-white"
        placeholder="Confirm new password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      {loading ? (
        <ActivityIndicator className="mt-3" />
      ) : (
        <Button title="Reset Password" onPress={handleResetPassword} />
      )}

      {!loading && (
        <View className="mt-4">
          <Button
            title="Back to Login"
            onPress={() => navigation.navigate('Login')}
          />
        </View>
      )}
    </View>
  );
}
