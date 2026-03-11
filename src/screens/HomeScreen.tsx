import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {
  MapPin,
  Search,
  SlidersHorizontal,
  Heart,
  PawPrint,
} from 'lucide-react-native';
import { ANIMALS, CATEGORIES, Animal } from '../constants/mockData';
import { FilterScreen } from './FilterScreen';

interface HomeScreenProps {
  onAnimalPress?: (animal: Animal) => void;
}

export const HomeScreen = ({ onAnimalPress }: HomeScreenProps) => {
  const [activeCategory, setActiveCategory] = useState('Wszystkie');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  if (showFilter) {
    return <FilterScreen onClose={() => setShowFilter(false)} />;
  }

  const filteredAnimals = ANIMALS.filter((animal) => {
    const matchesCategory =
      activeCategory === 'Wszystkie' ||
      animal.type ===
        (activeCategory === 'Psy'
          ? 'Pies'
          : activeCategory === 'Koty'
            ? 'Kot'
            : 'Inne');
    const matchesSearch = animal.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const renderAnimalCard = ({ item }: { item: Animal }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => onAnimalPress?.(item)}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.info}>
        <View style={styles.cardHeader}>
          <Text style={styles.name}>{item.name}</Text>
          <TouchableOpacity>
            <Heart
              size={20}
              color={item.liked ? '#f97316' : '#cbd5e1'}
              fill={item.liked ? '#f97316' : 'none'}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.breed}>
          {item.type} • {item.breed}
        </Text>
        <View style={styles.tags}>
          <View style={styles.tagAge}>
            <Text style={styles.tagAgeText}>{item.age}</Text>
          </View>
          <View style={styles.distanceTag}>
            <MapPin size={12} color="#94a3b8" />
            <Text style={styles.tagDistanceText}>{item.distance}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.locLabel}>LOKALIZACJA SCHRONISKA</Text>
          <View style={styles.locRow}>
            <MapPin size={16} color="#f97316" />
            <Text style={styles.locText}>Krakow, PL</Text>
          </View>
        </View>
        <View style={styles.avatarBtn}>
          <PawPrint size={24} color="#f97316" />
        </View>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={20} color="#94a3b8" />
          <TextInput
            placeholder="Szukaj przyjaciela..."
            placeholderTextColor="#94a3b8"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilter(true)}>
          <SlidersHorizontal size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.categoriesWrapper}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setActiveCategory(item)}
              style={[
                styles.catBtn,
                activeCategory === item && styles.catBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.catText,
                  activeCategory === item && styles.catTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoriesContent}
        />
      </View>

      <FlatList
        data={filteredAnimals}
        renderItem={renderAnimalCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Nie znaleziono zwierzaków spełniających kryteria.
          </Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    alignItems: 'center',
  },
  locLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  locRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  locText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    marginLeft: 4,
  },
  avatarBtn: {
    width: 45,
    height: 45,
    backgroundColor: '#fff',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 15,
    height: 50,
    elevation: 2,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14 },
  filterBtn: {
    width: 50,
    height: 50,
    backgroundColor: '#f97316',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesWrapper: { marginBottom: 20 },
  categoriesContent: { paddingHorizontal: 20 },
  catBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  catBtnActive: { backgroundColor: '#f97316', borderColor: '#f97316' },
  catText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  catTextActive: { color: '#fff' },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 12,
    marginBottom: 16,
    elevation: 3,
  },
  image: { width: 110, height: 110, borderRadius: 20 },
  info: { flex: 1, marginLeft: 16, justifyContent: 'center' },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  breed: { fontSize: 12, color: '#64748b', marginTop: 4 },
  tags: { flexDirection: 'row', marginTop: 12, gap: 8 },
  tagAge: {
    backgroundColor: '#fff7ed',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagAgeText: { color: '#f97316', fontSize: 11, fontWeight: 'bold' },
  distanceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagDistanceText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#94a3b8' },
});