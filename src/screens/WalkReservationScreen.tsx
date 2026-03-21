import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { ChevronLeft, Send } from 'lucide-react-native';
import { Animal } from '../constants/mockData';

interface Props {
  animal: Animal;
  onBack: () => void;
  onSuccess: () => void;
}

export const WalkReservationScreen = ({ animal, onBack, onSuccess }: Props) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const handleDateChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 8);

    if (digitsOnly.length <= 2) {
      setDate(digitsOnly);
      return;
    }

    if (digitsOnly.length <= 4) {
      setDate(`${digitsOnly.slice(0, 2)}.${digitsOnly.slice(2)}`);
      return;
    }

    setDate(
      `${digitsOnly.slice(0, 2)}.${digitsOnly.slice(2, 4)}.${digitsOnly.slice(4)}`,
    );
  };

  const handleTimeChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 4);

    if (digitsOnly.length <= 2) {
      setTime(digitsOnly);
      return;
    }

    setTime(`${digitsOnly.slice(0, 2)}:${digitsOnly.slice(2)}`);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ChevronLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rezerwacja spaceru</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.animalSummary}>
          <Image source={{ uri: animal.image }} style={styles.animalThumb} />
          <View>
            <Text style={styles.animalName}>{animal.name}</Text>
            <Text style={styles.animalBreed}>{animal.type} • {animal.breed}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>DATA SPACERU</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={handleDateChange}
            placeholder="DD.MM.RRRR"
            placeholderTextColor="#94a3b8"
            keyboardType="numeric"
          />
          <Text style={styles.label}>GODZINA</Text>
          <TextInput
            style={styles.input}
            value={time}
            onChangeText={handleTimeChange}
            placeholder="GG:MM"
            placeholderTextColor="#94a3b8"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.infoNote}>
          <Text style={styles.infoText}>Spacer trwa zazwyczaj 60 minut. Prosimy o punktualność.</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitBtn} onPress={onSuccess}>
          <Text style={styles.submitBtnText}>Zarezerwuj spacer</Text>
          <Send size={20} color="white" style={{ marginLeft: 10 }} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 15, color: '#1e293b' },
  content: { padding: 20, paddingBottom: 40 },
  animalSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 30,
    gap: 15,
  },
  animalThumb: { width: 60, height: 60, borderRadius: 14 },
  animalName: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  animalBreed: { fontSize: 13, color: '#64748b', marginTop: 3 },
  section: { marginBottom: 25 },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 52,
    fontSize: 15,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoNote: {
    backgroundColor: '#fff7ed',
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#f97316',
  },
  infoText: { color: '#c2410c', fontSize: 13, lineHeight: 20 },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#fff',
  },
  submitBtn: {
    height: 56,
    backgroundColor: '#f97316',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#f97316',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  submitBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
