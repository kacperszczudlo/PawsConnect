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
} from 'react-native';
import { PawPrint, Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react-native';

type RegisterScreenProps = {
  onLoginPress?: () => void;
};

export const RegisterScreen = ({ onLoginPress }: RegisterScreenProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const formAnimation = useState(() => new Animated.Value(0))[0];

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
      <ScrollView contentContainerStyle={styles.scrollContent}>
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

          <View style={styles.inputLabel}>
            <Text style={styles.labelText}>IMIĘ I NAZWISKO</Text>
          </View>
          <View style={styles.inputContainer}>
            <User color="#94a3b8" size={20} />
            <TextInput
              style={styles.input}
              placeholder="Jan Kowalski"
              placeholderTextColor="#94a3b8"
              value={name}
              onChangeText={setName}
            />
          </View>

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

          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Zarejestruj się</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Masz już konto? </Text>
            <TouchableOpacity onPress={onLoginPress}>
              <Text style={styles.linkText}>Zaloguj się</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f97316' },
  scrollContent: { flexGrow: 1 },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 30 },
  logoCircle: {
    width: 80,
    height: 80,
    backgroundColor: '#fff',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
  },
  brandName: { fontSize: 32, fontWeight: '800', color: '#fff', marginTop: 15 },
  subtitle: { color: '#ffedd5', fontSize: 16, marginTop: 5 },
  formCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 30,
    paddingTop: 30,
    paddingBottom: 50,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 25,
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