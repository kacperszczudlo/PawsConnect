import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { MapPin, X } from 'lucide-react-native';
import { POLISH_CITIES } from '../constants/cities';

interface CityPickerFieldProps {
  value: string;
  onChange: (city: string) => void;
  label?: string;
}

export const CityPickerField = ({ value, onChange, label = 'MIASTO' }: CityPickerFieldProps) => {
  const [visible, setVisible] = useState(false);

  const handleSelectCity = (city: string) => {
    onChange(city);
    setVisible(false);
  };

  return (
    <>
      <View style={styles.wrapper}>
        {label && (
          <View style={styles.inputLabel}>
            <Text style={styles.labelText}>{label}</Text>
          </View>
        )}
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

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Wybierz miasto</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <X size={24} color="#1e293b" />
              </TouchableOpacity>
            </View>

            {/* City List */}
            <ScrollView style={styles.cityList} showsVerticalScrollIndicator={true}>
              {POLISH_CITIES.map((city) => (
                <TouchableOpacity
                  key={city}
                  onPress={() => handleSelectCity(city)}
                  style={[
                    styles.cityItem,
                    value === city && styles.cityItemActive,
                  ]}
                  activeOpacity={0.6}
                >
                  <Text style={[styles.cityItemText, value === city && styles.cityItemTextActive]}>
                    {city}
                  </Text>
                  {value === city && <View style={styles.checkmark} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
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
  cityItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b',
    flex: 1,
  },
  cityItemTextActive: {
    color: '#1e293b',
    fontWeight: '700',
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f97316',
    marginLeft: 12,
  },
});
