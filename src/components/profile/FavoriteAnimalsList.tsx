import React, { useMemo } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ANIMALS, Animal } from '../../constants/mockData';
import { useFavorites } from '../../context/FavoritesContext';

interface FavoriteAnimalsListProps {
  onAnimalPress?: (animal: Animal) => void;
}

export const FavoriteAnimalsList = ({ onAnimalPress }: FavoriteAnimalsListProps) => {
  const { favoriteIds } = useFavorites();

  const favorites = useMemo(
    () => ANIMALS.filter((animal) => favoriteIds.includes(animal.id)),
    [favoriteIds],
  );

  return (
    <FlatList
      data={favorites}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.9}
          onPress={() => onAnimalPress?.(item)}
        >
          <Image source={{ uri: item.image }} style={styles.image} />
          <View style={styles.info}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>
              {item.type} • {item.breed}
            </Text>
            <Text style={styles.meta}>{item.age}</Text>
          </View>
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <Text style={styles.empty}>Brak ulubionych zwierząt.</Text>
      }
    />
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  image: {
    width: 96,
    height: 96,
    borderRadius: 18,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    color: '#1e293b',
    fontWeight: '800',
    fontSize: 20,
  },
  meta: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  empty: {
    textAlign: 'center',
    color: '#94a3b8',
    marginTop: 40,
    fontWeight: '600',
  },
});
