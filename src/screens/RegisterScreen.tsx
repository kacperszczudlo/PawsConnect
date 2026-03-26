import React, { useState } from 'react';
import {
  Animated,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { PawPrint, Mail, Lock, Eye, EyeOff, User, Phone, Building2, MapPin } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../services/supabase';
import type { AuthStackParamList } from '../navigation/AuthStack';
import { CityPickerField } from '../components/CityPickerField';

type RoleType = 'user' | 'admin';

type RegisterScreenProps = {
  onLoginPress?: () => void;
};

export const RegisterScreen = ({ onLoginPress }: RegisterScreenProps) => {
  const [roleType, setRoleType] = useState<RoleType>('user');
  const [name, setName] = useState('');
  const [shelterName, setShelterName] = useState('');
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const formAnimation = useState(() => new Animated.Value(0))[0];
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const goToLogin = () => {
    if (onLoginPress) {
      onLoginPress();
      return;
    }
    navigation.navigate('Login');
  };

  const handleRegister = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();
    const normalizedPassword = password.trim();
    const normalizedName = name.trim();
    const normalizedShelterName = shelterName.trim();
    const normalizedCity = city.trim();

    const hasMissingUserFields = roleType === 'user' && !normalizedName;
    const hasMissingAdminFields = roleType === 'admin' && (!normalizedShelterName || !normalizedCity);

    if (!normalizedEmail || !normalizedPassword || !normalizedPhone || hasMissingUserFields || hasMissingAdminFields) {
      Alert.alert('Błąd', 'Proszę wypełnić wszystkie pola');
      return;
    }

    setLoading(true);
    try {
      const metadata = roleType === 'admin'
        ? { role: 'admin', shelter_name: normalizedShelterName, city: normalizedCity, phone: normalizedPhone }
        : { role: 'user', full_name: normalizedName, phone: normalizedPhone };

      const { error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: normalizedPassword,
        options: { data: metadata },
      });

      if (error) {
        Alert.alert('Błąd rejestracji', error.message);
      } else {
        Alert.alert('Sukces', 'Konto zostało utworzone. Sprawdź swoją skrzynkę e-mail, aby potwierdzić rejestrację.');
        goToLogin();
      }
    } catch {
      Alert.alert('Błąd', 'Wystąpił nieoczekiwany problem podczas rejestracji. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    Animated.timing(formAnimation, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [formAnimation]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <PawPrint color="#f97316" size={45} />
          </View>
          <Text style={styles.brandName}>PawsConnect</Text>
          <Text style={styles.subtitle}>Dołącz do nas!</Text>
        </View>

        <Animated.View
          style={[
            styles.formCard,
            {
              opacity: formAnimation,
              transform: [
                {
                  translateY: formAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [18, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.formTitle}>Utwórz konto</Text>

          <View style={styles.roleTabs}>
            <TouchableOpacity
              onPress={() => setRoleType('user')}
              style={[styles.roleTabButton, roleType === 'user' && styles.roleTabButtonActive]}
              activeOpacity={0.9}
            >
              <Text style={[styles.roleTabText, roleType === 'user' && styles.roleTabTextActive]}>Szukam przyjaciela</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setRoleType('admin')}
              style={[styles.roleTabButton, roleType === 'admin' && styles.roleTabButtonActive]}
              activeOpacity={0.9}
            >
              <Text style={[styles.roleTabText, roleType === 'admin' && styles.roleTabTextActive]}>Jestem schroniskiem</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputLabel}>
            <Text style={styles.labelText}>{roleType === 'admin' ? 'NAZWA SCHRONISKA' : 'IMIĘ I NAZWISKO'}</Text>
          </View>
          <View style={styles.inputContainer}>
            {roleType === 'admin' ? <Building2 color="#94a3b8" size={20} /> : <User color="#94a3b8" size={20} />}
            <TextInput
              style={styles.input}
              placeholder={roleType === 'admin' ? 'Schronisko Nadzieja' : 'Jan Kowalski'}
              placeholderTextColor="#94a3b8"
              value={roleType === 'admin' ? shelterName : name}
              onChangeText={roleType === 'admin' ? setShelterName : setName}
            />
          </View>

          {roleType === 'admin' ? (
            <CityPickerField value={city} onChange={setCity} label="MIASTO" />
          ) : null}

          <View style={styles.inputLabel}>
            <Text style={styles.labelText}>ADRES E-MAIL</Text>
          </View>
          <View style={styles.inputContainer}>
            <Mail color="#94a3b8" size={20} />
            <TextInput
              style={styles.input}
              placeholder="jan@kowalski.pl"
              placeholderTextColor="#94a3b8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputLabel}>
            <Text style={styles.labelText}>NUMER TELEFONU</Text>
          </View>
          <View style={styles.inputContainer}>
            <Phone color="#94a3b8" size={20} />
            <TextInput
              style={styles.input}
              placeholder="123 456 789"
              placeholderTextColor="#94a3b8"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputLabel}>
            <Text style={styles.labelText}>HASŁO</Text>
          </View>
          <View style={styles.inputContainer}>
            <Lock color="#94a3b8" size={20} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <EyeOff color="#94a3b8" size={20} />
              ) : (
                <Eye color="#94a3b8" size={20} />
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleRegister} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Zarejestruj się</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Masz już konto? </Text>
            <TouchableOpacity onPress={goToLogin}>
              <Text style={styles.linkText}>Zaloguj się</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { flexGrow: 1, paddingBottom: 60 },
  header: {
    alignItems: 'center',
    paddingTop: 64,
    paddingBottom: 34,
    backgroundColor: '#f97316',
    borderBottomLeftRadius: 48,
    borderBottomRightRadius: 48,
  },
  logoCircle: {
    width: 72,
    height: 72,
    backgroundColor: '#fff',
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
  },
  brandName: { fontSize: 30, fontWeight: '800', color: '#fff', marginTop: 12 },
  subtitle: { color: '#ffedd5', fontSize: 12, marginTop: 4, fontWeight: '600' },
  formCard: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 18,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 30,
    paddingBottom: 36,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 14,
  },
  roleTabs: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
    gap: 8,
    marginBottom: 18,
  },
  roleTabButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  roleTabButtonActive: {
    backgroundColor: '#fff',
  },
  roleTabText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  roleTabTextActive: {
    color: '#1e293b',
  },
  inputLabel: { marginBottom: 6, marginLeft: 4 },
  labelText: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 15,
    borderRadius: 16,
    height: 54,
    marginBottom: 18,
  },
  input: { flex: 1, marginLeft: 10, fontSize: 15, color: '#1e293b' },
  primaryButton: {
    backgroundColor: '#f97316',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    elevation: 4,
  },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 25 },
  footerText: { color: '#64748b', fontSize: 14 },
  linkText: { color: '#f97316', fontSize: 14, fontWeight: 'bold' },
});