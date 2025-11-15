import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Pressable,
  Image,
  ImageSourcePropType,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';

type SpotCategory = 'burger' | 'noodles' | 'food' | 'sports';

interface Spot {
  id: string;
  name: string;
  category: SpotCategory;
  latitude: number;
  longitude: number;
  rating: number;
  reviewCount: number;
}

// 👇 adjust "../assets/..." if HomeScreen is in a different folder depth
const ICONS: Record<SpotCategory | 'default', ImageSourcePropType> = {
  burger: require('../assets/icons/foods/burger.png'),
  noodles: require('../assets/icons/foods/noodles.png'),
  food: require('../assets/icons/foods/default.png'),
  sports: require('../assets/icons/sports/default.png'),
  default: require('../assets/icons/foods/default.png'),
};

const HomeScreen: React.FC = () => {
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | SpotCategory>('all');

  // 🔐 Get user location once on mount
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Location permission was denied.');
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = loc.coords;

        setUserLocation({ latitude, longitude });

        const initialRegion: Region = {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setMapRegion(initialRegion);

        // 🧪 Dummy spots based on initial location (created ONCE)
        const dummySpots: Spot[] = [
          {
            id: '1',
            name: 'Burger Palace',
            category: 'burger',
            latitude: latitude + 0.002,
            longitude: longitude + 0.002,
            rating: 4.8,
            reviewCount: 212,
          },
          {
            id: '2',
            name: 'Noodle House',
            category: 'noodles',
            latitude: latitude - 0.0015,
            longitude: longitude - 0.001,
            rating: 4.6,
            reviewCount: 154,
          },
          {
            id: '3',
            name: 'Asian Eats',
            category: 'food',
            latitude: latitude + 0.001,
            longitude: longitude - 0.001,
            rating: 4.5,
            reviewCount: 98,
          },
          {
            id: '4',
            name: 'Downtown Sports Arena',
            category: 'sports',
            latitude: latitude - 0.002,
            longitude: longitude + 0.0015,
            rating: 4.7,
            reviewCount: 321,
          },
        ];

        setSpots(dummySpots);
      } catch (err) {
        console.log('Error getting location:', err);
        setErrorMsg('Something went wrong getting your location.');
      }
    })();
  }, []);

  const filteredSpots = useMemo(() => {
    if (activeCategory === 'all') return spots;
    return spots.filter((s) => s.category === activeCategory);
  }, [spots, activeCategory]);

  if (!mapRegion) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>
          {errorMsg || 'Getting your location...'}
        </Text>
      </View>
    );
  }

  const handleRecenter = () => {
    if (!userLocation) return;
    setMapRegion((prev) => {
      const deltaLat = prev?.latitudeDelta ?? 0.01;
      const deltaLon = prev?.longitudeDelta ?? 0.01;
      return {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: deltaLat,
        longitudeDelta: deltaLon,
      };
    });
  };

  const renderCategoryChip = (
    label: string,
    value: 'all' | SpotCategory
  ) => {
    const isActive = activeCategory === value;
    return (
      <Pressable
        key={value}
        style={[styles.chipButton, isActive && styles.chipButtonActive]}
        onPress={() => setActiveCategory(value)}
      >
        <Text
          style={[styles.chipButtonText, isActive && styles.chipButtonTextActive]}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* 🔝 Top overlay (title + recenter) */}
      <View style={styles.topBar}>
        <Text style={styles.titleText}>Conquest</Text>
        <Pressable style={styles.recenterButton} onPress={handleRecenter}>
          <Text style={styles.recenterText}>Center on me</Text>
        </Pressable>
      </View>

      {/* 🔽 Category filter row */}
      <View style={styles.categoryBar}>
        {renderCategoryChip('All', 'all')}
        {renderCategoryChip('Food', 'food')}
        {renderCategoryChip('Burger', 'burger')}
        {renderCategoryChip('Noodles', 'noodles')}
        {renderCategoryChip('Sports', 'sports')}
      </View>

      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={mapRegion}
        region={mapRegion}
        onRegionChangeComplete={setMapRegion}
        showsUserLocation
      >
        {filteredSpots.map((spot) => (
          <Marker
            key={spot.id}
            coordinate={{
              latitude: spot.latitude,
              longitude: spot.longitude,
            }}
            title={spot.name}
            description={spot.category}
            onPress={() => setSelectedSpot(spot)}
          >
            <Image
              source={ICONS[spot.category] ?? ICONS.default}
              style={styles.markerIcon}
              resizeMode="contain"
            />
          </Marker>
        ))}
      </MapView>

      {/* 🧾 Bottom preview card */}
      {selectedSpot && (
        <View style={styles.bottomCardContainer}>
          <View style={styles.bottomCard}>
            <Text style={styles.spotName}>{selectedSpot.name}</Text>

            <View style={styles.row}>
              <Text style={styles.spotCategoryText}>
                {selectedSpot.category.toUpperCase()}
              </Text>
              <Text style={styles.ratingText}>
                ⭐ {selectedSpot.rating.toFixed(1)} ·{' '}
                {selectedSpot.reviewCount} reviews
              </Text>
            </View>

            <View style={[styles.row, { marginTop: 8 }]}>
              <Text style={styles.distanceText}>~ 0.3 mi away</Text>
            </View>

            <View style={[styles.row, { marginTop: 12 }]}>
              <Pressable
                style={styles.primaryButton}
                onPress={() => {
                  console.log('View details for', selectedSpot.name);
                  // later: navigate to SpotDetails screen
                }}
              >
                <Text style={styles.primaryButtonText}>View Details</Text>
              </Pressable>

              <Pressable
                style={styles.secondaryButton}
                onPress={() => {
                  console.log('Save spot', selectedSpot.name);
                  // later: call backend to save/favorite
                }}
              >
                <Text style={styles.secondaryButtonText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { marginTop: 12, fontSize: 16 },

  topBar: {
    position: 'absolute',
    top: 40,
    left: 16,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  recenterButton: {
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#4b5563',
  },
  recenterText: { color: '#e5e7eb', fontSize: 12 },

  categoryBar: {
    position: 'absolute',
    top: 80,
    left: 8,
    right: 8,
    zIndex: 10,
    flexDirection: 'row',
    paddingHorizontal: 4,
    gap: 6,
  },
  chipButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#111827cc',
    borderWidth: 1,
    borderColor: '#4b5563',
  },
  chipButtonActive: {
    backgroundColor: '#22c55e',
    borderColor: '#16a34a',
  },
  chipButtonText: {
    color: '#e5e7eb',
    fontSize: 12,
  },
  chipButtonTextActive: {
    color: '#022c22',
    fontWeight: '600',
  },

  markerIcon: {
    width: 36,
    height: 36,
  },

  bottomCardContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
  },
  bottomCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  spotName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  spotCategoryText: {
    color: '#9ca3af',
    fontSize: 13,
  },
  ratingText: {
    color: '#fbbf24',
    fontSize: 13,
  },
  distanceText: {
    color: '#9ca3af',
    fontSize: 13,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#22c55e',
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: 'center',
    marginRight: 8,
  },
  primaryButtonText: {
    color: '#022c22',
    fontWeight: '600',
    fontSize: 14,
  },
  secondaryButton: {
    width: 80,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#4b5563',
    alignItems: 'center',
    paddingVertical: 8,
  },
  secondaryButtonText: {
    color: '#e5e7eb',
    fontSize: 13,
  },
});

export default HomeScreen;
