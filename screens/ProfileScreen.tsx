// screens/ProfileScreen.tsx
import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, TextInput, Image } from 'react-native';
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
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          {profileErrorMsg || 'No user data found.'}
        </Text>
        <Button title="Log Out" onPress={handleLogout} />
      </View>
    );
  }

  const { displayName, firstName, lastName, email, profileImageUrl } = user as any;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      {/* Profile image container */}
      <View style={styles.profileImageContainer}>
        {profileImageUrl ? (
          <Image
            source={{ uri: profileImageUrl }}
            style={styles.profileImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.profileIconCircle}>
            <Ionicons name="person" size={50} color="#666" />
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Display name:</Text>
        <Text style={styles.value}>{displayName || '(not set)'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Full name:</Text>
        <Text style={styles.value}>
          {(firstName || '') + ' ' + (lastName || '')}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{email}</Text>
      </View>

      {/* CHANGE PASSWORD SECTION */}
      <View style={[styles.section, { marginTop: 24 }]}>
        <Text style={styles.subTitle}>Change Password</Text>

        {passwordErrorMsg ? (
          <Text style={styles.errorText}>{passwordErrorMsg}</Text>
        ) : null}

        {passwordSuccessMsg ? (
          <Text style={styles.successText}>{passwordSuccessMsg}</Text>
        ) : null}

        <TextInput
          style={styles.input}
          placeholder="Current password"
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
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
          value={confirmNewPassword}
          onChangeText={setConfirmNewPassword}
        />

        {changingPassword ? (
          <ActivityIndicator style={{ marginTop: 8 }} />
        ) : (
          <Button title="Update Password" onPress={handleChangePassword} />
        )}
      </View>

      <View style={{ marginTop: 32 }}>
        <Button title="Log Out" onPress={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 48,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 24,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
  },
  subTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  section: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#555',
  },
  value: {
    fontSize: 18,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
  },
  successText: {
    color: 'green',
    marginBottom: 8,
  },
});
