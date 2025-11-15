// screens/ProfileScreen.tsx
import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, TextInput, Image } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import AuthContext from '../AuthContext';
import {changePasswordRequest, User } from '../api/auth';
import { getCurrentUserProfile } from '../api/profile';

// Same password rule as registration:
// - at least 8 characters
// - at least one uppercase letter
// - at least one special character
function isValidPassword(pw: string): boolean {
  if (pw.length < 8) return false;
  const hasUppercase = /[A-Z]/.test(pw);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw);
  return hasUppercase && hasSpecial;
}

export default function ProfileScreen() {
  const { setIsLoggedIn } = useContext(AuthContext);

  const [user, setUser] = useState<User | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileErrorMsg, setProfileErrorMsg] = useState('');

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('');
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');

  // Load user info when screen mounts
  useEffect(() => {
    async function loadUser() {
      try {
        setLoadingProfile(true);
        setProfileErrorMsg('');

        const storedUser = await SecureStore.getItemAsync('user');
        const token = await SecureStore.getItemAsync('auth_token');

        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
          } catch (err) {
            console.log('Error parsing stored user JSON:', err);
          }
        }

        if (token) {
          try {
            const freshUser = await getCurrentUserProfile(token);
            setUser(freshUser);
            await SecureStore.setItemAsync('user', JSON.stringify(freshUser));
          } catch (err) {
            console.log('Failed to refresh user from /me:', err);
          }
        }
      } catch (err) {
        console.log('Error loading profile:', err);
        setProfileErrorMsg('Failed to load profile.');
      } finally {
        setLoadingProfile(false);
      }
    }

    loadUser();
  }, []);

  async function handleLogout() {
    try {
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('user');
      await SecureStore.deleteItemAsync('auth_expiresUtc');
    } catch (err) {
      console.log('Error deleting auth data:', err);
    }
    setIsLoggedIn(false);
  }

  async function handleChangePassword() {
    setPasswordErrorMsg('');
    setPasswordSuccessMsg('');

    if (!currentPassword.trim()) {
      setPasswordErrorMsg('Current password is required.');
      return;
    }

    if (!isValidPassword(newPassword)) {
      setPasswordErrorMsg(
        'New password must be at least 8 characters, include one uppercase letter, and one special character.'
      );
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordErrorMsg('New passwords do not match.');
      return;
    }

    try {
      setChangingPassword(true);

      const token = await SecureStore.getItemAsync('auth_token');
      if (!token) {
        setPasswordErrorMsg('You are not logged in.');
        return;
      }

      await changePasswordRequest(token, currentPassword, newPassword);

      setPasswordSuccessMsg('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      console.log('Change password error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to change password.';
      setPasswordErrorMsg(errorMessage);
    } finally {
      setChangingPassword(false);
    }
  }

  if (loadingProfile) {
    return (
      <View className="flex-1 justify-center items-center px-6 bg-white">
        <ActivityIndicator size="large" />
        <Text className="mt-2 text-gray-700">Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center px-6 bg-white">
        <Text className="text-red-600 mb-3">{profileErrorMsg || 'No user data found.'}</Text>
        <Button title="Log Out" onPress={handleLogout} />
      </View>
    );
  }

  const { displayName, firstName, lastName, email, profileImageUrl } = user as any;

  return (
    <View className="flex-1 px-6 pt-12 bg-white">
      <Text className="text-2xl font-bold mb-6">Profile</Text>

      {/* Profile image container */}
      <View className="items-center mb-6">
        {profileImageUrl ? (
          <Image
            source={{ uri: profileImageUrl }}
            className="w-24 h-24 rounded-full bg-gray-200"
            resizeMode="cover"
          />
        ) : (
          <View className="w-24 h-24 rounded-full bg-gray-200 justify-center items-center">
            <Ionicons name="person" size={50} color="#666" />
          </View>
        )}
      </View>

      <View className="mb-3">
        <Text className="text-sm text-gray-500">Display name:</Text>
        <Text className="text-lg font-medium">{displayName || '(not set)'}</Text>
      </View>

      <View className="mb-3">
        <Text className="text-sm text-gray-500">Full name:</Text>
        <Text className="text-lg font-medium">{(firstName || '') + ' ' + (lastName || '')}</Text>
      </View>

      <View className="mb-3">
        <Text className="text-sm text-gray-500">Email:</Text>
        <Text className="text-lg font-medium">{email}</Text>
      </View>

      {/* CHANGE PASSWORD SECTION */}
      <View className="mb-3 mt-6">
        <Text className="text-lg font-semibold mb-2">Change Password</Text>

        {passwordErrorMsg ? (
          <Text className="text-red-600 mb-2">{passwordErrorMsg}</Text>
        ) : null}

        {passwordSuccessMsg ? (
          <Text className="text-green-600 mb-2">{passwordSuccessMsg}</Text>
        ) : null}

        <TextInput
          className="border border-gray-300 rounded px-3 py-2 mb-2 bg-white"
          placeholder="Current password"
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />

        <TextInput
          className="border border-gray-300 rounded px-3 py-2 mb-2 bg-white"
          placeholder="New password"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />

        <TextInput
          className="border border-gray-300 rounded px-3 py-2 mb-2 bg-white"
          placeholder="Confirm new password"
          secureTextEntry
          value={confirmNewPassword}
          onChangeText={setConfirmNewPassword}
        />

        {changingPassword ? (
          <ActivityIndicator className="mt-2" />
        ) : (
          <Button title="Update Password" onPress={handleChangePassword} />
        )}
      </View>

      <View className="mt-8">
        <Button title="Log Out" onPress={handleLogout} />
      </View>
    </View>
  );
}
