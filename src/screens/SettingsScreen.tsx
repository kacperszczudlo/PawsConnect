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
  Home,
  MapPin,
  Phone,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { CityPickerField } from '../components/CityPickerField';
import { syncProfileEverywhere } from '../services/profileSyncService';
import { uploadAvatarImage } from '../services/imageService';
import { isValidPhone, isValidPostalCode, normalizePhone, normalizePostalCode } from '../utils/validation';

const InputGroup = ({ icon, value, onChange, placeholder, secure = false, editable = true }: any) => (
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
      editable={editable}
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
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [name, setName] = useState(
    isShelter ? user?.user_metadata?.shelter_name : user?.user_metadata?.full_name || '',
  );
  const [city, setCity] = useState(user?.user_metadata?.city || 'Cała Polska');
  const [phone, setPhone] = useState(user?.user_metadata?.phone || '');
  const [shelterStreet, setShelterStreet] = useState(user?.user_metadata?.shelter_street || '');
  const [shelterPostalCode, setShelterPostalCode] = useState(user?.user_metadata?.shelter_postal_code || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [avatar, setAvatar] = useState(user?.user_metadata?.avatar_url || null);
  const [avatarAsset, setAvatarAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: false,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setAvatarAsset(asset);
      setAvatar(asset.uri);
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
      const normalizedPhone = normalizePhone(phone);
      const normalizedPostalCode = normalizePostalCode(shelterPostalCode);

      if (!isValidPhone(normalizedPhone)) {
        Alert.alert('Błąd', 'Podaj poprawny numer telefonu (np. 123 456 789 lub +48 123 456 789).');
        setLoading(false);
        return;
      }

      if (isShelter && !isValidPostalCode(normalizedPostalCode)) {
        Alert.alert('Błąd', 'Podaj poprawny kod pocztowy w formacie 00-000.');
        setLoading(false);
        return;
      }

      const canChangePassword = await ensurePasswordChangeAllowed();
      if (!canChangePassword) {
        setLoading(false);
        return;
      }

      let finalAvatarUrl = avatar || '';

      if (avatarAsset) {
        setAvatarUploading(true);
        try {
          const uploadedUrl = await uploadAvatarImage(avatarAsset, user?.id || 'unknown');
          if (!uploadedUrl) {
            Alert.alert('Błąd', 'Nie udało się wgrać awatara. Spróbuj ponownie.');
            setLoading(false);
            setAvatarUploading(false);
            return;
          }
          finalAvatarUrl = uploadedUrl;
        } catch (error) {
          Alert.alert('Błąd', 'Błąd podczas wgrywania awatara.');
          setLoading(false);
          setAvatarUploading(false);
          return;
        } finally {
          setAvatarUploading(false);
        }
      }

      const nextEmail = user?.email || email.trim();
      const updatedUser = await syncProfileEverywhere({
        role: isShelter ? 'admin' : 'user',
        user: user!,
        fullName: name,
        city,
        phone: normalizedPhone,
        email: nextEmail,
        avatarUrl: finalAvatarUrl,
        shelterStreet,
        shelterPostalCode: normalizedPostalCode,
        newPassword: newPassword || undefined,
      });

      setUser(updatedUser);
      setAvatarAsset(null);
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
              {avatar ? (
                <Image source={{ uri: avatar }} style={{ width: '100%', height: '100%', borderRadius: 55 }} />
              ) : (
                <View
                  style={{
                    width: '100%',
                    height: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'white',
                  }}
                >
                  {isShelter ? <Home size={34} color="#94a3b8" /> : <User size={34} color="#94a3b8" />}
                </View>
              )}
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

            {isShelter ? (
              <>
                <InputGroup
                  icon={<MapPin size={18} color="#64748b" style={{ marginRight: 8 }} />}
                  value={shelterStreet}
                  onChange={setShelterStreet}
                  placeholder="Ulica testowa 1"
                />

                <InputGroup
                  icon={<MapPin size={18} color="#64748b" style={{ marginRight: 8 }} />}
                  value={shelterPostalCode}
                  onChange={setShelterPostalCode}
                  placeholder="00-000"
                />
              </>
            ) : null}

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

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#f1f5f9',
                borderRadius: 12,
                paddingHorizontal: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: '#e2e8f0',
                opacity: 0.9,
              }}
            >
              <Mail size={18} color="#94a3b8" style={{ marginRight: 8 }} />
              <View style={{ flex: 1, paddingVertical: 12 }}>
                <Text style={{ fontSize: 11, color: '#94a3b8', fontWeight: '700', marginBottom: 2 }}>
                  E-mail konta (nieedytowalny)
                </Text>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{ fontSize: 15, color: '#475569', fontWeight: '600' }}
                >
                  {email || 'Brak adresu e-mail'}
                </Text>
              </View>
            </View>

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
