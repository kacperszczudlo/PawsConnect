import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  SafeAreaView
} from 'react-native';
import { ChevronLeft, MapPin } from 'lucide-react-native';
import Slider from '@react-native-community/slider';

interface FilterScreenProps {
  onClose: () => void;
}

export const FilterScreen = ({ onClose }: FilterScreenProps) => {
  const [distance, setDistance] = useState(15);
  const [selectedAge, setSelectedAge] = useState('Wszystkie');
  const [selectedGender, setSelectedGender] = useState('Wszystkie');

  const ageOptions = ['Wszystkie', 'Szczeniak', 'Młody', 'Dorosły', 'Senior'];
  const genderOptions = ['Wszystkie', 'Samiec', 'Samica'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backBtn}>
          <ChevronLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filtrowanie</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Lokalizacja */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lokalizacja</Text>
          <View style={styles.inputWrapper}>
            <MapPin size={20} color="#94a3b8" />
            <TextInput 
              style={styles.input} 
              placeholder="Wpisz miejscowość..." 
              defaultValue="Kraków, Polska" 
            />
          </View>
          
          <View style={styles.sliderHeader}>
            <Text style={styles.label}>Maksymalna odległość</Text>
            <Text style={styles.distanceValue}>{distance} km</Text>
          </View>
          <Slider
            style={{width: '100%', height: 40}}
            minimumValue={1}
            maximumValue={50}
            step={1}
            value={distance}
            onValueChange={setDistance}
            minimumTrackTintColor="#f97316"
            maximumTrackTintColor="#e2e8f0"
            thumbTintColor="#f97316"
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.smallLabel}>1 km</Text>
            <Text style={styles.smallLabel}>50 km</Text>
          </View>
        </View>

        {/* Wiek */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wiek</Text>
          <View style={styles.chipGroup}>
            {ageOptions.map(age => (
              <TouchableOpacity 
                key={age} 
                onPress={() => setSelectedAge(age)}
                style={[styles.chip, selectedAge === age && styles.chipActive]}
              >
                <Text style={[styles.chipText, selectedAge === age && styles.chipTextActive]}>{age}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Płeć */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Płeć</Text>
          <View style={styles.genderGroup}>
            {genderOptions.map(gender => (
              <TouchableOpacity 
                key={gender} 
                onPress={() => setSelectedGender(gender)}
                style={[styles.genderBtn, selectedGender === gender && styles.genderBtnActive]}
              >
                <Text style={[styles.genderBtnText, selectedGender === gender && styles.genderBtnTextActive]}>{gender}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Przyciski na dole */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.clearBtn} onPress={() => {
          setDistance(15);
          setSelectedAge('Wszystkie');
          setSelectedGender('Wszystkie');
        }}>
          <Text style={styles.clearBtnText}>Wyczyść</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.applyBtn} onPress={onClose}>
          <Text style={styles.applyBtnText}>Pokaż wyniki</Text>
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#fff',
  },
  backBtn: { width: 40, height: 40, backgroundColor: '#f8fafc', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 15, color: '#1e293b' },
  content: { padding: 20 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 15 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  input: { flex: 1, marginLeft: 10, fontSize: 14 },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  label: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  distanceValue: { fontSize: 14, fontWeight: 'bold', color: '#f97316' },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -5 },
  smallLabel: { fontSize: 10, color: '#94a3b8', fontWeight: 'bold' },
  chipGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff' },
  chipActive: { backgroundColor: '#f97316', borderColor: '#f97316' },
  chipText: { fontSize: 12, fontWeight: 'bold', color: '#64748b' },
  chipTextActive: { color: '#fff' },
  genderGroup: { flexDirection: 'row', gap: 10 },
  genderBtn: { flex: 1, height: 45, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' },
  genderBtnActive: { backgroundColor: '#f97316', borderColor: '#f97316' },
  genderBtnText: { fontSize: 14, fontWeight: 'bold', color: '#64748b' },
  genderBtnTextActive: { color: '#fff' },
  footer: {
    padding: 20,
    flexDirection: 'row',
    gap: 15,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#fff',
  },
  clearBtn: { flex: 1, height: 56, borderRadius: 16, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
  clearBtnText: { color: '#64748b', fontWeight: 'bold' },
  applyBtn: { flex: 2, height: 56, borderRadius: 16, backgroundColor: '#f97316', justifyContent: 'center', alignItems: 'center' },
  applyBtnText: { color: '#fff', fontWeight: 'bold' }
});
