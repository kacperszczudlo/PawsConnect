import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { PawPrint, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';

type LoginScreenProps = {
  onRegisterPress?: () => void;
  onLoginPress?: () => void;
};

export const LoginScreen = ({
  onRegisterPress,
  onLoginPress,
}: LoginScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    onLoginPress?.();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <PawPrint color="#f97316" size={45} />
        </View>
        <Text style={styles.brandName}>PawsConnect</Text>
        <Text style={styles.subtitle}>Witaj ponownie!</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Zaloguj się</Text>
        <Text style={styles.helperText}>Przycisk logowania tymczasowo pomija autoryzację.</Text>

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

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Zaloguj się</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Nie masz konta? </Text>
          <TouchableOpacity onPress={onRegisterPress}>
            <Text style={styles.linkText}>Zarejestruj się</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f97316' },
  header: { alignItems: 'center', paddingTop: 80, paddingBottom: 40 },
  logoCircle: {
    width: 80,
    height: 80,
    backgroundColor: '#fff',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandName: { fontSize: 32, fontWeight: '800', color: '#fff', marginTop: 15 },
  subtitle: { color: '#ffedd5', marginTop: 8, fontWeight: '500' },
  formCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 30,
    paddingTop: 30,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  helperText: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 13,
    marginBottom: 22,
  },
  inputLabel: { marginBottom: 8, marginLeft: 4 },
  labelText: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 15,
    borderRadius: 16,
    height: 56,
    marginBottom: 20,
  },
  input: { flex: 1, marginLeft: 10, fontSize: 14, color: '#1e293b' },
  loginButton: {
    backgroundColor: '#f97316',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  footerText: { color: '#64748b', fontSize: 13 },
  linkText: { color: '#f97316', fontSize: 13, fontWeight: 'bold' },
});