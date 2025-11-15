import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, ListRenderItem } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { getFriends, Friend } from '../api/friends';

export default function SocialScreen() {
  const isFocused = useIsFocused();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadFriends = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      setError('');

      const token = await SecureStore.getItemAsync('auth_token');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const data = await getFriends(token);
      setFriends(data.friendsList || []);
    } catch (err) {
      console.log('Error fetching friends:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load friends';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load friends when tab is focused
  useEffect(() => {
    if (isFocused) {
      loadFriends();
    }
  }, [isFocused]);

  const onRefresh = () => {
    setRefreshing(true);
    loadFriends(true);
  };

  const renderFriend: ListRenderItem<Friend> = ({ item }) => (
    <View style={styles.friendItem}>
      <Text style={styles.friendName}>
        {item.firstName && item.lastName 
          ? `${item.firstName} ${item.lastName}` 
          : item.firstName || item.lastName || item.userName || 'Unknown'}
      </Text>
      {item.userName && <Text style={styles.friendUsername}>@{item.userName}</Text>}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading friends...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={friends}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        renderItem={renderFriend}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No friends yet</Text>
          </View>
        }
        contentContainerStyle={friends.length === 0 ? styles.emptyList : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  friendItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  friendName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  friendUsername: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  emptyList: {
    flex: 1,
  },
});
