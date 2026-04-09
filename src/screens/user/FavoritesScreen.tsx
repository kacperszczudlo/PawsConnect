import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { MapPin, Heart } from 'lucide-react-native';
import { useShelterStore } from '../../store/useShelterStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import { formatAgeBySex } from '../../utils/animalLabels';

const DEFAULT_ANIMAL_IMAGE =
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80';

export const FavoritesScreen = () => {
  const { user } = useAuthStore();
  const { animals, fetchAnimals } = useShelterStore();
  const [loading, setLoading] = useState(true);
  const favorites = useFavoritesStore((state) => state.favorites);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const fetchFavorites = useFavoritesStore((state) => state.fetchFavorites);

  const handleToggleFavorite = async (animalId: string) => {
    const ok = await toggleFavorite(user?.id, animalId);
    if (!ok) {
      Alert.alert('Błąd', 'Nie udało się zapisać ulubionego. Sprawdź uprawnienia w bazie (RLS).');
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchAnimals();
      if (user?.id) {
        await fetchFavorites(user.id);
      }
      setLoading(false);
    };

    void load();
  }, [fetchAnimals, fetchFavorites, user?.id]);

  const favoriteAnimals = animals.filter((animal) => favorites.includes(animal.id));

  const renderAnimalCard = ({ item }: any) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.9}>
      <Image source={{ uri: item.image || DEFAULT_ANIMAL_IMAGE }} style={styles.image} />
      <View style={styles.info}>
        <View style={styles.cardHeader}>
          <Text style={styles.name}>{item.name}</Text>
          <TouchableOpacity
            onPress={() => void handleToggleFavorite(item.id)}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <Heart
              size={20}
              color={favorites.includes(item.id) ? '#f97316' : '#cbd5e1'}
              fill={favorites.includes(item.id) ? '#f97316' : 'none'}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.breed}>
          {item.type} • {item.breed}
        </Text>
        <View style={styles.tags}>
          <View style={styles.tagAge}>
            <Text style={styles.tagAgeText}>{formatAgeBySex(item.age, item.sex ?? item.gender)}</Text>
          </View>
          <View style={styles.distanceTag}>
            <MapPin size={12} color="#94a3b8" />
            <Text style={styles.tagDistanceText}>{item.distance ?? 'Schronisko'}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#f97316" />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ulubione</Text>
        <Text style={styles.subtitle}>Zwierzęta, które skradły Twoje serce</Text>
      </View>

      <FlatList
        data={favoriteAnimals}
        keyExtractor={(item) => item.id}
        renderItem={renderAnimalCard}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Brak ulubionych zwierząt</Text>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: 60,
  },
  header: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1e293b',
  },
  subtitle: {
    color: '#64748b',
    marginTop: 4,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  breed: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 8,
  },
  tags: {
    flexDirection: 'row',
    gap: 6,
  },
  tagAge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagAgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400e',
  },
  distanceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagDistanceText: {
    fontSize: 11,
    color: '#64748b',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#94a3b8',
  },
});
