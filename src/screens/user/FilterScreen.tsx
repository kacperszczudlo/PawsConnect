import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useFilterStore } from '../../store/useFilterStore';
import { CityPickerField } from '../../components/CityPickerField';

interface FilterScreenProps {
  onClose: () => void;
}

export const FilterScreen = ({ onClose }: FilterScreenProps) => {
  const { selectedCity, selectedType, setCity, setType, resetFilters } = useFilterStore();

  const types = ['Pies', 'Kot', 'Inne'];

  const typeSelector = (
    title: string,
    options: string[],
    selected: string | null,
    onSelect: (val: string | null) => void,
  ) => (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 12 }}>{title}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {options.map((opt) => {
          const isSelected = selected === opt;
          return (
            <TouchableOpacity
              key={opt}
              onPress={() => onSelect(selected === opt ? null : opt)}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 20,
                backgroundColor: isSelected ? '#f97316' : '#f1f5f9',
              }}
            >
              <Text style={{ color: isSelected ? 'white' : '#64748b', fontWeight: 'bold' }}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backBtn}>
          <ChevronLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filtry</Text>
        <TouchableOpacity onPress={resetFilters}>
          <Text style={styles.clearTopText}>Wyczyść</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <CityPickerField 
          value={selectedCity ?? ''} 
          onChange={(city) => setCity(city)} 
          label="LOKALIZACJA"
        />
        {typeSelector('GATUNEK', types, selectedType, setType)}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.applyBtn} onPress={onClose}>
          <Text style={styles.applyBtnText}>Zastosuj filtry</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#fff',
  },
  backBtn: { width: 40, height: 40, backgroundColor: '#f8fafc', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  clearTopText: { color: '#f97316', fontWeight: 'bold' },
  content: { padding: 20 },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#fff',
  },
  applyBtn: { width: '100%', height: 56, borderRadius: 16, backgroundColor: '#f97316', justifyContent: 'center', alignItems: 'center' },
  applyBtnText: { color: '#fff', fontWeight: 'bold' }
});
