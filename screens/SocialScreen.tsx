import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, ListRenderItem } from 'react-native';
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
    <View className="px-4 py-4 border-b border-gray-200">
      <Text className="text-lg font-semibold mb-1">
        {item.firstName && item.lastName 
          ? `${item.firstName} ${item.lastName}` 
          : item.firstName || item.lastName || item.userName || 'Unknown'}
      </Text>
      {item.userName && <Text className="text-sm text-gray-500">@{item.userName}</Text>}
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center p-5 bg-white">
        <ActivityIndicator size="large" />
        <Text className="mt-3 text-base text-gray-600">Loading friends...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-5 bg-white">
        <Text className="text-base text-red-600 text-center">{error}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={friends}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        renderItem={renderFriend}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center p-10">
            <Text className="text-base text-gray-400">No friends yet</Text>
          </View>
        }
        contentContainerStyle={friends.length === 0 ? { flex: 1 } : undefined}
      />
    </View>
  );
}
