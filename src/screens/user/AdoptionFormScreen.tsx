import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { ChevronLeft, Send, PawPrint } from 'lucide-react-native';
import { Animal } from '../../store/useShelterStore';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../services/supabase';

const buildShelterSnapshot = (animal: Animal) => ({
  shelter_name: animal.shelterName ?? '',
  shelter_address: animal.shelterAddress ?? animal.city ?? '',
  shelter_phone: animal.shelterPhone ?? '',
  shelter_email: animal.shelterEmail ?? '',
});

interface Props {
  animal: Animal;
  onBack: () => void;
  onSuccess: () => void;
}

export const AdoptionFormScreen = ({ animal, onBack, onSuccess }: Props) => {
  const user = useAuthStore((state) => state.user);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user?.id) {
      Alert.alert('Błąd', 'Musisz być zalogowany, aby wysłać wniosek.');
      return;
    }

    if (!reason.trim()) {
      Alert.alert('Uzupełnij formularz', 'Opisz proszę, dlaczego chcesz adoptować to zwierzę.');
      return;
    }

    setLoading(true);
    const applicantName = user.user_metadata?.full_name || user.email || 'Użytkownik';
    const dateLabel = new Date().toLocaleDateString('pl-PL');
    const { error } = await supabase.from('applications').insert([
      {
        animal_id: animal.id,
        animal_name: animal.name,
        applicant_id: user.id,
        applicant_name: applicantName,
        type: 'Adopcja',
        date: dateLabel,
        status: 'Oczekujące',
        ...buildShelterSnapshot(animal),
      },
    ]);

    setLoading(false);

    if (error) {
      Alert.alert('Błąd', `Nie udało się wysłać wniosku: ${error.message}`);
      return;
    }

    Alert.alert('Sukces', 'Wniosek adopcyjny został wysłany.');
    onSuccess();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ChevronLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wniosek adopcyjny</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.animalSummary}>
          {animal.image ? (
            <Image source={{ uri: animal.image }} style={styles.animalThumb} />
          ) : (
            <View style={[styles.animalThumb, styles.animalThumbPlaceholder]}>
              <PawPrint size={24} color="#94a3b8" />
            </View>
          )}
          <View>
            <Text style={styles.animalName}>{animal.name}</Text>
            <Text style={styles.animalBreed}>{animal.type} • {animal.breed}</Text>
            <Text style={styles.animalMeta}>{animal.shelterName ?? 'Schronisko'}</Text>
            <Text style={styles.animalMeta}>{animal.shelterAddress ?? animal.city ?? 'Brak lokalizacji'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>DLACZEGO CHCESZ ADOPTOWAĆ?</Text>
          <TextInput
            style={[styles.input, { height: 150, textAlignVertical: 'top' }]}
            value={reason}
            onChangeText={setReason}
            multiline
            placeholder="Opisz swoje warunki domowe i doświadczenie..."
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={[styles.infoNote, { borderLeftColor: '#f97316' }]}>
          <Text style={styles.infoText}>
            Po wysłaniu wniosku nasi pracownicy skontaktują się z Tobą w ciągu 3 dni roboczych.
          </Text>
        </View>

        <View style={[styles.infoNote, { borderLeftColor: '#10b981', marginTop: 14 }] }>
          <Text style={styles.infoText}>
            Kontakt do schroniska:
            {'\n'}{animal.shelterPhone ?? 'Brak telefonu'}
            {'\n'}{animal.shelterEmail ?? 'Brak e-maila'}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.submitBtn, { backgroundColor: '#f97316', opacity: loading ? 0.6 : 1 }]} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.submitBtnText}>Wyślij wniosek</Text>
          <Send size={20} color="white" style={{ marginLeft: 10 }} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
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
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 15,
    marginBottom: 30,
    gap: 15,
  },
  animalThumb: { width: 60, height: 60, borderRadius: 14 },
  animalThumbPlaceholder: {
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  animalName: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  animalBreed: { fontSize: 13, color: '#64748b', marginTop: 3 },
  animalMeta: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  section: { marginBottom: 25 },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingTop: 14,
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
  },
  submitBtn: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  submitBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
