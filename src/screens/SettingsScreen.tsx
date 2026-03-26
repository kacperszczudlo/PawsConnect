import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import {
  ChevronLeft,
  Camera,
  Lock,
  Mail,
  User,
  MapPin,
  Phone,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { CityPickerField } from '../components/CityPickerField';

const InputGroup = ({ icon, value, onChange, placeholder, secure = false }: any) => (
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'white',
      borderRadius: 12,
      paddingHorizontal: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: '#e2e8f0',
    }}
  >
    {icon}
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      secureTextEntry={secure}
      placeholderTextColor="#94a3b8"
      style={{
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 12,
        fontSize: 15,
        color: '#1e293b',
      }}
    />
  </View>
);

export const SettingsScreen = ({ navigation }: any) => {
  const { user, setUser, role } = useAuthStore();
  const isShelter = role === 'admin';

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(
    isShelter ? user?.user_metadata?.shelter_name : user?.user_metadata?.full_name || '',
  );
  const [city, setCity] = useState(user?.user_metadata?.city || 'Cała Polska');
  const [phone, setPhone] = useState(user?.user_metadata?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [avatar, setAvatar] = useState(user?.user_metadata?.avatar_url || null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const ensurePasswordChangeAllowed = async () => {
    if (!newPassword) {
      return true;
    }

    if (newPassword.length < 6) {
      Alert.alert('Błąd', 'Nowe hasło musi mieć co najmniej 6 znaków.');
      return false;
    }

    if (!currentPassword) {
      Alert.alert('Błąd', 'Podaj obecne hasło, aby ustawić nowe.');
      return false;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: user?.email || email,
      password: currentPassword,
    });

    if (error) {
      Alert.alert('Błąd', 'Obecne hasło jest niepoprawne.');
      return false;
    }

    return true;
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const canChangePassword = await ensurePasswordChangeAllowed();
      if (!canChangePassword) {
        setLoading(false);
        return;
      }

      const updates: any = {
        data: {
          [isShelter ? 'shelter_name' : 'full_name']: name,
          city,
          phone,
          avatar_url: avatar,
        },
      };

      if (newPassword) {
        updates.password = newPassword;
      }

      if (email !== user?.email) {
        updates.email = email;
      }

      const { data, error } = await supabase.auth.updateUser(updates);
      if (error) throw error;

      setUser(data.user);
      Alert.alert('Sukces', 'Dane profilowe zostały zaktualizowane.');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Błąd', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: 60, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            paddingHorizontal: 24,
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 32,
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              width: 40,
              height: 40,
              backgroundColor: 'white',
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              elevation: 2,
            }}
          >
            <ChevronLeft size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 22,
              fontWeight: '800',
              color: '#1e293b',
              marginLeft: 16,
            }}
          >
            {isShelter ? 'Ustawienia schroniska' : 'Ustawienia konta'}
          </Text>
        </View>

        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <TouchableOpacity onPress={pickImage} style={{ position: 'relative' }}>
            <View
              style={{
                width: 110,
                height: 110,
                borderRadius: 55,
                backgroundColor: '#e2e8f0',
                borderWidth: 4,
                borderColor: 'white',
                elevation: 4,
                overflow: 'hidden',
              }}
            >
              <Image
                source={{
                  uri:
                    avatar ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=250&q=80',
                }}
                style={{ width: '100%', height: '100%', borderRadius: 55 }}
              />
            </View>
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: isShelter ? '#10b981' : '#f97316',
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 3,
                borderColor: 'white',
              }}
            >
              <Camera size={16} color="white" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: 24, gap: 20 }}>
          <View>
            <Text
              style={{
                fontSize: 13,
                fontWeight: 'bold',
                color: '#64748b',
                marginBottom: 12,
                marginLeft: 4,
              }}
            >
              DANE PODSTAWOWE
            </Text>

            <InputGroup
              icon={<User size={18} color="#64748b" style={{ marginRight: 8 }} />}
              value={name}
              onChange={setName}
              placeholder={isShelter ? 'Nazwa schroniska' : 'Imię i nazwisko'}
            />

            <CityPickerField value={city} onChange={setCity} label="Miasto" />

            <InputGroup
              icon={<Phone size={18} color="#64748b" style={{ marginRight: 8 }} />}
              value={phone}
              onChange={setPhone}
              placeholder="Telefon"
            />
          </View>

          <View>
            <Text
              style={{
                fontSize: 13,
                fontWeight: 'bold',
                color: '#64748b',
                marginBottom: 12,
                marginLeft: 4,
              }}
            >
              BEZPIECZEŃSTWO
            </Text>

            <InputGroup
              icon={<Mail size={18} color="#64748b" style={{ marginRight: 8 }} />}
              value={email}
              onChange={setEmail}
              placeholder="Email"
            />

            <InputGroup
              icon={<Lock size={18} color="#64748b" style={{ marginRight: 8 }} />}
              value={currentPassword}
              onChange={setCurrentPassword}
              placeholder="Obecne hasło (wymagane przy zmianie)"
              secure={true}
            />

            <InputGroup
              icon={<Lock size={18} color="#64748b" style={{ marginRight: 8 }} />}
              value={newPassword}
              onChange={setNewPassword}
              placeholder="Nowe hasło (opcjonalne)"
              secure={true}
            />
          </View>

          <TouchableOpacity
            onPress={handleUpdateProfile}
            disabled={loading}
            style={{
              backgroundColor: isShelter ? '#10b981' : '#f97316',
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: 'center',
              marginTop: 12,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>
                ZAPISZ ZMIANY
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};
