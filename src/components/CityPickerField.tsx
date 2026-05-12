import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  TextInput,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';
import { MapPin, Navigation2, X } from 'lucide-react-native';
import { ALL_POLAND_CITY_LABEL } from '../constants/cities';
import {
  reverseGeocodeLocality,
  searchPolishPlaces,
  type CitySearchResult,
} from '../services/cityGeocodeService';
import type { CityRefCoords } from '../store/useFilterStore';
import { friendlyErrorMessage } from '../utils/networkErrors';

interface CityPickerFieldProps {
  value: string;
  onChange: (city: string, ref?: CityRefCoords | null) => void;
  label?: string;
}

const SEARCH_DEBOUNCE_MS = 380;

export const CityPickerField = ({ value, onChange, label = 'MIASTO' }: CityPickerFieldProps) => {
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CitySearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetModalSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
  }, []);

  const handleSelectCity = useCallback(
    (city: string, ref?: CityRefCoords | null) => {
      onChange(city, ref);
      setVisible(false);
      resetModalSearch();
    },
    [onChange, resetModalSearch],
  );

  const closeModal = useCallback(() => {
    setVisible(false);
    resetModalSearch();
  }, [resetModalSearch]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    const ctrl = new AbortController();
    const t = setTimeout(() => {
      setLoading(true);
      setError(null);
      searchPolishPlaces(q, ctrl.signal)
        .then((rows) => {
          setResults(rows);
        })
        .catch((err: unknown) => {
          if ((err as { name?: string })?.name === 'AbortError') {
            return;
          }
          setResults([]);
          setError(friendlyErrorMessage(err, 'Nie udało się pobrać listy miejsc.'));
        })
        .finally(() => {
          if (!ctrl.signal.aborted) {
            setLoading(false);
          }
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query, visible]);

  const useMyLocation = useCallback(async () => {
    setLocating(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) {
        Alert.alert(
          'Brak zgody',
          'Aby ustawić miasto z GPS, włącz uprawnienie do lokalizacji w ustawieniach telefonu.',
        );
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const name = await reverseGeocodeLocality(pos.coords.latitude, pos.coords.longitude);
      if (name) {
        handleSelectCity(name, {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
      } else {
        setError('Nie znaleziono miejscowości dla tej lokalizacji.');
      }
    } catch (err: unknown) {
      setError(friendlyErrorMessage(err, 'Nie udało się odczytać lokalizacji.'));
    } finally {
      setLocating(false);
    }
  }, [handleSelectCity]);

  const renderItem = ({ item }: { item: CitySearchResult }) => (
    <TouchableOpacity
      onPress={() =>
        handleSelectCity(
          item.name,
          item.lat != null && item.lon != null ? { lat: item.lat, lon: item.lon } : undefined,
        )
      }
      style={[styles.cityItem, value === item.name && styles.cityItemActive]}
      activeOpacity={0.6}
    >
      <View style={styles.cityItemTextBlock}>
        <Text style={[styles.cityItemText, value === item.name && styles.cityItemTextActive]}>
          {item.name}
        </Text>
        {item.subtitle ? (
          <Text style={styles.cityItemSubtitle} numberOfLines={1}>
            {item.subtitle}
          </Text>
        ) : null}
      </View>
      {value === item.name ? <View style={styles.checkmark} /> : null}
    </TouchableOpacity>
  );

  const listHeader = (
    <View>
      <View style={styles.searchRow}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Szukaj miejscowości…"
          placeholderTextColor="#94a3b8"
          style={styles.searchInput}
          autoCorrect={false}
          autoCapitalize="words"
          returnKeyType="search"
        />
      </View>

      <TouchableOpacity
        style={styles.locationRow}
        onPress={useMyLocation}
        disabled={locating}
        activeOpacity={0.7}
      >
        <Navigation2 color="#f97316" size={20} />
        <Text style={styles.locationRowText}>
          {locating ? 'Pobieranie lokalizacji…' : 'Użyj mojej lokalizacji (GPS)'}
        </Text>
        {locating ? <ActivityIndicator size="small" color="#f97316" style={{ marginLeft: 8 }} /> : null}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handleSelectCity(ALL_POLAND_CITY_LABEL, null)}
        style={[styles.cityItem, value === ALL_POLAND_CITY_LABEL && styles.cityItemActive]}
        activeOpacity={0.6}
      >
        <Text
          style={[styles.cityItemText, value === ALL_POLAND_CITY_LABEL && styles.cityItemTextActive]}
        >
          {ALL_POLAND_CITY_LABEL}
        </Text>
        {value === ALL_POLAND_CITY_LABEL ? <View style={styles.checkmark} /> : null}
      </TouchableOpacity>

      {loading ? (
        <View style={styles.inlineLoading}>
          <ActivityIndicator size="small" color="#64748b" />
        </View>
      ) : null}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {!loading && query.trim().length >= 2 && results.length === 0 && !error ? (
        <Text style={styles.hintText}>Brak wyników — spróbuj innej pisowni.</Text>
      ) : null}

      {query.trim().length > 0 && query.trim().length < 2 ? (
        <Text style={styles.hintText}>Wpisz co najmniej 2 znaki, aby wyszukać.</Text>
      ) : null}
    </View>
  );

  return (
    <>
      <View style={styles.wrapper}>
        {label ? (
          <View style={styles.inputLabel}>
            <Text style={styles.labelText}>{label}</Text>
          </View>
        ) : null}
        <TouchableOpacity
          onPress={() => setVisible(true)}
          style={styles.inputContainer}
          activeOpacity={0.7}
        >
          <MapPin color="#94a3b8" size={20} />
          <Text style={[styles.input, !value && styles.placeholder]}>
            {value || 'Wybierz miasto'}
          </Text>
          <View style={styles.chevron}>
            <Text style={styles.chevronText}>▼</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={closeModal}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Wybierz miasto</Text>
              <TouchableOpacity onPress={closeModal}>
                <X size={24} color="#1e293b" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              ListHeaderComponent={listHeader}
              style={styles.cityList}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.listContent}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 18,
  },
  inputLabel: {
    marginBottom: 6,
    marginLeft: 4,
  },
  labelText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#94a3b8',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 15,
    borderRadius: 16,
    height: 54,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '500',
  },
  placeholder: {
    color: '#94a3b8',
  },
  chevron: {
    marginLeft: 8,
  },
  chevronText: {
    color: '#94a3b8',
    fontSize: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    height: Dimensions.get('window').height * 0.75,
    width: Dimensions.get('window').width - 32,
    paddingTop: 0,
    overflow: 'hidden',
    flexDirection: 'column',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    flexShrink: 0,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  cityList: {
    flex: 1,
    minHeight: 0,
  },
  listContent: {
    paddingBottom: 24,
  },
  searchRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff7ed',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ffedd5',
  },
  locationRowText: {
    marginLeft: 10,
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#9a3412',
  },
  inlineLoading: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  errorText: {
    marginHorizontal: 16,
    marginBottom: 8,
    color: '#b91c1c',
    fontSize: 13,
  },
  hintText: {
    marginHorizontal: 16,
    marginBottom: 8,
    color: '#64748b',
    fontSize: 13,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  cityItemActive: {
    backgroundColor: '#f0f4ff',
  },
  cityItemTextBlock: {
    flex: 1,
    marginRight: 8,
  },
  cityItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b',
  },
  cityItemTextActive: {
    color: '#1e293b',
    fontWeight: '700',
  },
  cityItemSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#94a3b8',
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f97316',
    marginLeft: 12,
  },
});
