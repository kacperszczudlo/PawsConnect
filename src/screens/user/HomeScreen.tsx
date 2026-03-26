import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  MapPin,
  Search,
  SlidersHorizontal,
  Heart,
  PawPrint,
} from 'lucide-react-native';
import { CATEGORIES } from '../../constants/categories';
import { FilterScreen } from './FilterScreen';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import { Animal, useShelterStore } from '../../store/useShelterStore';
import { useFilterStore } from '../../store/useFilterStore';
import { useAuthStore } from '../../store/useAuthStore';
import { formatAgeBySex } from '../../utils/animalLabels';

interface HomeScreenProps {
  onAnimalPress?: (animal: Animal) => void;
}

export const HomeScreen = ({ onAnimalPress }: HomeScreenProps) => {
  const { animals, fetchAnimals, isLoading } = useShelterStore();
  const { selectedCity, selectedType } = useFilterStore();
  const user = useAuthStore((state) => state.user);
  const [activeCategory, setActiveCategory] = useState('Wszystkie');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const isFavorite = useFavoritesStore((state) => state.isFavorite);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const fetchFavorites = useFavoritesStore((state) => state.fetchFavorites);

  const handleToggleFavorite = async (animalId: string) => {
    const ok = await toggleFavorite(user?.id, animalId);
    if (!ok) {
      Alert.alert('Błąd', 'Nie udało się zapisać ulubionego. Sprawdź uprawnienia w bazie (RLS).');
    }
  };

  useEffect(() => {
    fetchAnimals();
  }, [fetchAnimals]);

  useEffect(() => {
    if (user?.id) {
      fetchFavorites(user.id);
    }
  }, [fetchFavorites, user?.id]);

  if (showFilter) {
    return <FilterScreen onClose={() => setShowFilter(false)} />;
  }

  if (isLoading && animals.length === 0) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  const filteredAnimals = animals.filter((animal) => {
    const matchesCity = selectedCity === 'Cała Polska' || animal.city === selectedCity;
    const matchesType = !selectedType || animal.type === selectedType;
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

    return matchesCity && matchesType && matchesCategory && matchesSearch;
  });

  const renderAnimalCard = ({ item }: { item: Animal }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => onAnimalPress?.(item)}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.info}>
        <View style={styles.cardHeader}>
          <Text style={styles.name}>{item.name}</Text>
          <TouchableOpacity
            onPress={() => void handleToggleFavorite(item.id)}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <Heart
              size={20}
              color={isFavorite(item.id) ? '#f97316' : '#cbd5e1'}
              fill={isFavorite(item.id) ? '#f97316' : 'none'}
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heroPanel}>
        <View style={styles.header}>
          <View>
            <Text style={styles.locLabel}>TWOJA LOKALIZACJA</Text>
            <View style={styles.locRow}>
              <MapPin size={16} color="#f97316" />
              <Text style={styles.locText}>{selectedCity}</Text>
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
              placeholder="Szukaj zwierzaka..."
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  container: { flex: 1, backgroundColor: '#f8fafc' },
  heroPanel: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 10,
    alignItems: 'center',
  },
  locLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.8,
  },
  locRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  locText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
    marginLeft: 4,
  },
  avatarBtn: {
    width: 42,
    height: 42,
    backgroundColor: '#ffedd5',
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fed7aa',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 4,
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
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 1,
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
  categoriesWrapper: { marginTop: 16, marginBottom: 14 },
  categoriesContent: { paddingHorizontal: 24 },
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
  listContent: { paddingHorizontal: 24, paddingTop: 2, paddingBottom: 110 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  image: { width: 96, height: 96, borderRadius: 18 },
  info: { flex: 1, marginLeft: 16, justifyContent: 'center' },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
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