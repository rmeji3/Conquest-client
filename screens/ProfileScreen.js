import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AuthContext from '../AuthContext';

export default function ProfileScreen() {
  const { setIsLoggedIn } = useContext(AuthContext);

  async function handleLogout() {
    try {
      await SecureStore.deleteItemAsync('auth_token');
    } catch (err) {
      console.log('Error deleting auth token', err);
    }
    setIsLoggedIn(false);
  }

  return (
    <View style={styles.container}>
      <Text>Profile Screen</Text>
      <Button title="Log Out" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
