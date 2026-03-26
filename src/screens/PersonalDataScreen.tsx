import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../services/supabase';

export const PersonalDataScreen = () => {
  const navigation = useNavigation<any>();
  const { user, role, setUser } = useAuthStore();
  const isShelter = role === 'admin';

  const [name, setName] = useState(
    isShelter ? user?.user_metadata?.shelter_name ?? '' : user?.user_metadata?.full_name ?? '',
  );
  const [city, setCity] = useState(user?.user_metadata?.city || '');
  const [phone, setPhone] = useState(user?.user_metadata?.phone || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);

    const updates = isShelter
      ? { shelter_name: name.trim(), city: city.trim(), phone: phone.trim() }
      : { full_name: name.trim(), city: city.trim(), phone: phone.trim() };

    const { data, error } = await supabase.auth.updateUser({ data: updates });

    setLoading(false);

    if (error) {
      Alert.alert('Błąd', error.message);
      return;
    }

    setUser(data.user);
    Alert.alert('Sukces', 'Dane zostały zaktualizowane.');
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc', paddingTop: 48, paddingHorizontal: 24 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 32 }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ padding: 8, backgroundColor: 'white', borderRadius: 20 }}
        >
          <ChevronLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginLeft: 16 }}>
          Edycja profilu
        </Text>
      </View>

      <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>
        {isShelter ? 'Nazwa Schroniska' : 'Imię i nazwisko'}
      </Text>
      <TextInput
        value={name}
        onChangeText={setName}
        style={{ backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0' }}
      />

      <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>
        Miasto
      </Text>
      <TextInput
        value={city}
        onChangeText={setCity}
        style={{ backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0' }}
      />

      <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>
        Telefon
      </Text>
      <TextInput
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={{ backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 32, borderWidth: 1, borderColor: '#e2e8f0' }}
      />

      <TouchableOpacity
        onPress={handleSave}
        disabled={loading}
        style={{ width: '100%', backgroundColor: isShelter ? '#10b981' : '#f97316', paddingVertical: 16, borderRadius: 16, alignItems: 'center' }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
          {loading ? 'Zapisywanie...' : 'Zapisz zmiany'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
