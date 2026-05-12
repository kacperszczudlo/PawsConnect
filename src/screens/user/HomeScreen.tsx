import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  MapPin,
  Search,
  SlidersHorizontal,
  Heart,
  PawPrint,
} from 'lucide-react-native';
import { CATEGORIES } from '../../constants/categories';
import { FilterScreen } from './FilterScreen';
import { useFavoritesInteractionsSlice } from '../../store/useFavoritesStore';
import { Animal, useShelterAnimalsHomeSlice } from '../../store/useShelterStore';
import { ALL_POLAND_CITY_LABEL } from '../../constants/cities';
import { useFilterSelectionSlice } from '../../store/useFilterStore';
import { useAuthStore } from '../../store/useAuthStore';
import { formatAgeBySex } from '../../utils/animalLabels';
import { geocodeCityCenter } from '../../services/cityGeocodeService';
import { formatDistanceKm, haversineKm } from '../../utils/geoDistance';
import { useToast } from '../../context/ToastContext';

interface HomeScreenProps {
  onAnimalPress?: (animal: Animal) => void;
}

function shelterDisplayName(animal: Animal): string {
  const n = animal.shelterName?.trim();
  if (n) {
    return n;
  }
  return 'Schronisko';
}

function locationDetailLine(animal: Animal): string | null {
  const street = animal.shelterAddress?.trim();
  if (street) {
    return street;
  }
  const city = animal.city?.trim();
  if (city) {
    return city;
  }
  return null;
}

function distanceLineText(
  item: {
    distanceKm?: number;
    distanceAnchorLabel: string | null;
    distancePending: boolean;
    distanceUnavailable: boolean;
    distanceNoShelterCity: boolean;
  },
  anchorCoords: { lat: number; lon: number } | null,
): string | null {
  if (!item.distanceAnchorLabel) {
    return null;
  }
  if (item.distanceKm != null && Number.isFinite(item.distanceKm)) {
    return `${formatDistanceKm(item.distanceKm)} od ${item.distanceAnchorLabel}`;
  }
  if (!anchorCoords) {
    return `Ładowanie „${item.distanceAnchorLabel}”…`;
  }
  if (item.distanceNoShelterCity) {
    return 'Brak miejscowości — brak dystansu';
  }
  if (item.distanceUnavailable) {
    return 'Brak dystansu (mapa)';
  }
  if (item.distancePending) {
    return 'Dystans…';
  }
  return null;
}

export const HomeScreen = ({ onAnimalPress }: HomeScreenProps) => {
  const { showToast } = useToast();
  const { animals, fetchAnimals, isLoading } = useShelterAnimalsHomeSlice();
  const { selectedCity, selectedCityRef, selectedType } = useFilterSelectionSlice();
  const [anchorCoords, setAnchorCoords] = useState<{ lat: number; lon: number } | null>(null);
  const animalCityCacheRef = useRef<Map<string, { lat: number; lon: number } | null>>(new Map());
  const [animalCityGeo, setAnimalCityGeo] = useState<Record<string, { lat: number; lon: number } | null>>({});
  const lastAnchorKeyRef = useRef<string>('');
  const user = useAuthStore((state) => state.user);
  const profileCityRaw = user?.user_metadata?.city?.trim();
  const profileCityValid = Boolean(profileCityRaw && profileCityRaw !== ALL_POLAND_CITY_LABEL);
  const [activeCategory, setActiveCategory] = useState('Wszystkie');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const { favorites, toggleFavorite, fetchFavorites } = useFavoritesInteractionsSlice();

  const handleToggleFavorite = useCallback(
    async (animalId: string) => {
      const ok = await toggleFavorite(user?.id, animalId);
      if (!ok) {
        showToast({
          type: 'error',
          title: 'Błąd',
          message: 'Nie udało się zapisać w ulubionych. Sprawdź połączenie z internetem i spróbuj ponownie.',
        });
      }
    },
    [showToast, toggleFavorite, user?.id],
  );

  useEffect(() => {
    fetchAnimals();
  }, [fetchAnimals]);

  useFocusEffect(
    useCallback(() => {
      void fetchAnimals();
    }, [fetchAnimals]),
  );

  useEffect(() => {
    if (user?.id) {
      fetchFavorites(user.id);
    }
  }, [fetchFavorites, user?.id]);

  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        void fetchFavorites(user.id);
      }
    }, [fetchFavorites, user?.id]),
  );

  useEffect(() => {
    if (profileCityValid && profileCityRaw) {
      const ac = new AbortController();
      void geocodeCityCenter(profileCityRaw, ac.signal).then((c) => {
        if (!ac.signal.aborted) {
          setAnchorCoords(c);
        }
      });
      return () => ac.abort();
    }
    if (selectedCity === ALL_POLAND_CITY_LABEL) {
      setAnchorCoords(null);
      return;
    }
    if (selectedCityRef) {
      setAnchorCoords(selectedCityRef);
      return;
    }
    const ac = new AbortController();
    void geocodeCityCenter(selectedCity, ac.signal).then((c) => {
      if (!ac.signal.aborted) {
        setAnchorCoords(c);
      }
    });
    return () => ac.abort();
  }, [profileCityRaw, profileCityValid, selectedCity, selectedCityRef]);

  useEffect(() => {
    const key = anchorCoords ? `${anchorCoords.lat.toFixed(5)},${anchorCoords.lon.toFixed(5)}` : '';
    if (key !== lastAnchorKeyRef.current) {
      lastAnchorKeyRef.current = key;
      animalCityCacheRef.current = new Map();
      setAnimalCityGeo({});
    }
    if (!anchorCoords) {
      return;
    }

    const labels = [
      ...new Set(
        animals.map((a) => a.city?.trim()).filter((c): c is string => Boolean(c && c.length >= 2)),
      ),
    ];
    const ac = new AbortController();

    void (async () => {
      for (const label of labels) {
        if (ac.signal.aborted) {
          return;
        }
        if (animalCityCacheRef.current.has(label)) {
          continue;
        }
        let resolved: { lat: number; lon: number } | null = null;
        try {
          resolved = await geocodeCityCenter(label, ac.signal);
        } catch {
          resolved = null;
        }
        if (ac.signal.aborted) {
          return;
        }
        animalCityCacheRef.current.set(label, resolved);
        setAnimalCityGeo(Object.fromEntries(animalCityCacheRef.current));
      }
    })();

    return () => ac.abort();
  }, [animals, anchorCoords]);

  const filteredAnimals = useMemo(
    () =>
      animals.filter((animal) => {
        const matchesCity = selectedCity === ALL_POLAND_CITY_LABEL || animal.city === selectedCity;
        const matchesType = !selectedType || animal.type === selectedType;
        const matchesCategory =
          activeCategory === 'Wszystkie' ||
          animal.type ===
            (activeCategory === 'Psy'
              ? 'Pies'
              : activeCategory === 'Koty'
                ? 'Kot'
                : 'Inne');
        const matchesSearch = animal.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCity && matchesType && matchesCategory && matchesSearch;
      }),
    [animals, selectedCity, selectedType, activeCategory, searchQuery],
  );

  const distanceAnchorLabel = useMemo(() => {
    if (profileCityValid && profileCityRaw) {
      return profileCityRaw;
    }
    if (selectedCity !== ALL_POLAND_CITY_LABEL) {
      return selectedCity;
    }
    return null;
  }, [profileCityRaw, profileCityValid, selectedCity]);

  const listRows = useMemo(() => {
    const base = (animal: Animal) => ({
      animal,
      distanceKm: undefined as number | undefined,
      distanceAnchorLabel,
      distancePending: false as boolean,
      distanceUnavailable: false as boolean,
      distanceNoShelterCity: false as boolean,
    });

    if (!anchorCoords || !distanceAnchorLabel) {
      return filteredAnimals.map((animal) => base(animal));
    }

    const rows = filteredAnimals.map((animal) => {
      const city = animal.city?.trim();
      if (!city) {
        return { ...base(animal), distanceNoShelterCity: true };
      }
      if (!(city in animalCityGeo)) {
        return { ...base(animal), distancePending: true };
      }
      const g = animalCityGeo[city];
      if (!g) {
        return { ...base(animal), distanceUnavailable: true };
      }
      return {
        animal,
        distanceKm: haversineKm(anchorCoords.lat, anchorCoords.lon, g.lat, g.lon),
        distanceAnchorLabel,
        distancePending: false,
        distanceUnavailable: false,
        distanceNoShelterCity: false,
      };
    });

    return [...rows].sort((a, b) => {
      if (a.distanceKm == null && b.distanceKm == null) {
        return 0;
      }
      if (a.distanceKm == null) {
        return 1;
      }
      if (b.distanceKm == null) {
        return -1;
      }
      return a.distanceKm - b.distanceKm;
    });
  }, [filteredAnimals, anchorCoords, animalCityGeo, distanceAnchorLabel]);

  const renderAnimalCard = useCallback(
    ({
      item,
    }: {
      item: {
        animal: Animal;
        distanceKm?: number;
        distanceAnchorLabel: string | null;
        distancePending: boolean;
        distanceUnavailable: boolean;
        distanceNoShelterCity: boolean;
      };
    }) => {
      const addressLine = locationDetailLine(item.animal);
      const distanceLine = distanceLineText(item, anchorCoords);
      return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => onAnimalPress?.(item.animal)}
      >
        {item.animal.image ? (
          <Image source={{ uri: item.animal.image }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <PawPrint size={28} color="#94a3b8" />
          </View>
        )}
        <View style={styles.info}>
          <View style={styles.cardHeader}>
            <Text style={styles.name} numberOfLines={2}>
              {item.animal.name}
            </Text>
            <TouchableOpacity
              onPress={(event) => {
                event.stopPropagation();
                void handleToggleFavorite(item.animal.id);
              }}
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
              style={styles.favoriteBtn}
            >
              <Heart
                size={20}
                color={favorites.includes(item.animal.id) ? '#f97316' : '#cbd5e1'}
                fill={favorites.includes(item.animal.id) ? '#f97316' : 'none'}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.breed}>
            {item.animal.type} • {item.animal.breed}
          </Text>
          <View style={styles.tags}>
            <View style={styles.tagAge}>
              <Text style={styles.tagAgeText}>
                {formatAgeBySex(item.animal.age, item.animal.sex ?? item.animal.gender)}
              </Text>
            </View>
            <View style={styles.tagShelter}>
              <MapPin size={12} color="#94a3b8" />
              <Text style={styles.tagShelterText} numberOfLines={2}>
                {shelterDisplayName(item.animal)}
              </Text>
            </View>
          </View>
          {addressLine ? (
            <Text style={styles.locDetail} numberOfLines={2}>
              {addressLine}
            </Text>
          ) : null}
          {distanceLine ? (
            <Text style={styles.locDetailDistance} numberOfLines={2}>
              {distanceLine}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>
      );
    },
    [anchorCoords, favorites, handleToggleFavorite, onAnimalPress],
  );

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heroPanel}>
        <View style={styles.header}>
          <View style={styles.headerLocBlock}>
            <Text style={styles.locLabel}>FILTR LISTY</Text>
            <View style={styles.locRow}>
              <MapPin size={16} color="#f97316" />
              <Text style={styles.locText} numberOfLines={1}>
                {selectedCity}
              </Text>
            </View>
            <Text style={[styles.locLabel, styles.locLabelSecond]}>DYSTANSE OD (PROFIL)</Text>
            <View style={styles.locRow}>
              <MapPin size={16} color="#64748b" />
              <Text style={styles.locSubText} numberOfLines={2}>
                {profileCityValid && profileCityRaw
                  ? profileCityRaw
                  : user
                    ? 'Ustaw miasto w Ustawieniach konta'
                    : 'Zaloguj się i ustaw miasto w profilu'}
              </Text>
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
        data={listRows}
        renderItem={renderAnimalCard}
        keyExtractor={(item) => item.animal.id}
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
    alignItems: 'flex-start',
  },
  locLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.8,
  },
  headerLocBlock: { flex: 1, marginRight: 12 },
  locRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  locLabelSecond: { marginTop: 10 },
  locText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
    marginLeft: 4,
    flex: 1,
  },
  locSubText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    marginLeft: 4,
    flex: 1,
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
  imagePlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 18,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, marginLeft: 16, justifyContent: 'center' },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  favoriteBtn: { flexShrink: 0, marginTop: 2 },
  name: { fontSize: 20, fontWeight: '800', color: '#1e293b', flex: 1, marginRight: 8 },
  breed: { fontSize: 12, color: '#64748b', marginTop: 4 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, gap: 8, alignItems: 'flex-start' },
  tagAge: {
    backgroundColor: '#fff7ed',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagAgeText: { color: '#f97316', fontSize: 11, fontWeight: 'bold' },
  tagShelter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
    maxWidth: '100%',
  },
  tagShelterText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 4,
    flexShrink: 1,
  },
  locDetail: {
    marginTop: 6,
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
    lineHeight: 15,
  },
  locDetailDistance: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: '800',
    color: '#ea580c',
    lineHeight: 15,
  },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#94a3b8' },
});