import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { UserProfile } from '../../types/profile';

interface EditProfileFormProps {
  profile: UserProfile;
  isSaving: boolean;
  onChange: <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => void;
  onSave: () => void;
  onCancel: () => void;
}

const FIELD_CONFIG: Array<{ key: keyof UserProfile; label: string }> = [
  { key: 'fullName', label: 'IMIĘ I NAZWISKO' },
  { key: 'email', label: 'E-MAIL' },
  { key: 'phone', label: 'TELEFON' },
  { key: 'city', label: 'MIASTO' },
];

export const EditProfileForm = ({
  profile,
  isSaving,
  onChange,
  onSave,
  onCancel,
}: EditProfileFormProps) => {
  return (
    <View style={styles.container}>
      {FIELD_CONFIG.map((field) => (
        <View key={field.key} style={styles.fieldWrap}>
          <Text style={styles.label}>{field.label}</Text>
          <TextInput
            style={styles.input}
            value={String(profile[field.key])}
            onChangeText={(value) => onChange(field.key, value)}
            autoCapitalize={field.key === 'email' ? 'none' : 'words'}
            keyboardType={field.key === 'phone' ? 'phone-pad' : 'default'}
            editable={!isSaving}
          />
        </View>
      ))}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={onCancel} disabled={isSaving}>
          <Text style={styles.secondaryBtnText}>Anuluj</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryBtn} onPress={onSave} disabled={isSaving}>
          <Text style={styles.primaryBtnText}>{isSaving ? 'Zapisywanie...' : 'Zapisz'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 18,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  fieldWrap: {
    marginBottom: 14,
  },
  label: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: 0.8,
  },
  input: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    color: '#1e293b',
    backgroundColor: '#f8fafc',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  secondaryBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#64748b',
    fontWeight: '700',
  },
  primaryBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#f97316',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#f97316',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 2,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
});
