import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { MapPin, Mail, Phone, LogOut, Settings, Home, User } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/useAuthStore';

export const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { user, role, signOut } = useAuthStore();

  const isShelter = role === 'admin';

  const displayName = isShelter
    ? user?.user_metadata?.shelter_name || 'Nieznane schronisko'
    : user?.user_metadata?.full_name || 'Nieznany użytkownik';

  const city = user?.user_metadata?.city || 'Nie podano miasta';
  const phone = user?.user_metadata?.phone || 'Brak telefonu';
  const email = user?.email || 'Brak maila';
  const avatarUrl = user?.user_metadata?.avatar_url?.trim() || '';

  const badgeText = isShelter ? 'Konto Schroniska' : 'Wolontariusz';
  const badgeColor = isShelter ? '#10b981' : '#f97316';
  const headerColor = isShelter ? '#1e293b' : '#f97316';

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View
        style={{
          backgroundColor: headerColor,
          paddingHorizontal: 24,
          paddingTop: 64,
          paddingBottom: 40,
          borderBottomLeftRadius: 40,
          borderBottomRightRadius: 40,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: '800', color: 'white' }}>
            {isShelter ? 'Panel Pracownika' : 'Twój Profil'}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            style={{
              width: 40,
              height: 40,
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.2)',
            }}
          >
            <Settings size={20} color="white" />
          </TouchableOpacity>
        </View>

        <View style={{ alignItems: 'center' }}>
          <View
            style={{
              width: 96,
              height: 96,
              backgroundColor: 'white',
              borderRadius: 48,
              padding: 4,
              marginBottom: 16,
            }}
          >
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                resizeMode="cover"
                style={{ width: '100%', height: '100%', borderRadius: 48 }}
              />
            ) : (
              <View
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 48,
                  backgroundColor: 'white',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isShelter ? <Home size={38} color="#94a3b8" /> : <User size={38} color="#94a3b8" />}
              </View>
            )}
          </View>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>{displayName}</Text>

          <View
            style={{
              backgroundColor: badgeColor,
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 16,
              marginTop: 8,
            }}
          >
            <Text
              style={{
                color: 'white',
                fontSize: 12,
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              {badgeText}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1, paddingHorizontal: 24, paddingTop: 32 }}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: 24,
            padding: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 1,
            elevation: 1,
            borderWidth: 1,
            borderColor: '#f1f5f9',
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: 'bold',
              color: '#94a3b8',
              textTransform: 'uppercase',
              marginLeft: 4,
              marginBottom: 6,
            }}
          >
            {isShelter ? 'Lokalizacja' : 'Twoje Miasto'}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <MapPin size={16} color="#94a3b8" />
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginLeft: 8 }}>
              {city}
            </Text>
          </View>

          <Text
            style={{
              fontSize: 10,
              fontWeight: 'bold',
              color: '#94a3b8',
              textTransform: 'uppercase',
              marginLeft: 4,
              marginBottom: 6,
            }}
          >
            {isShelter ? 'Służbowy adres e-mail' : 'Adres e-mail'}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Mail size={16} color="#94a3b8" />
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginLeft: 8 }}>
              {email}
            </Text>
          </View>

          <Text
            style={{
              fontSize: 10,
              fontWeight: 'bold',
              color: '#94a3b8',
              textTransform: 'uppercase',
              marginLeft: 4,
              marginBottom: 6,
            }}
          >
            Telefon kontaktowy
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Phone size={16} color="#94a3b8" />
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginLeft: 8 }}>
              {phone}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={async () => {
            await signOut();
          }}
          style={{
            width: '100%',
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: '#fee2e2',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 1,
            elevation: 1,
          }}
        >
          <LogOut size={20} color="#ef4444" />
          <Text style={{ fontWeight: 'bold', color: '#ef4444', fontSize: 14, marginLeft: 8 }}>
            Wyloguj się z systemu
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};
