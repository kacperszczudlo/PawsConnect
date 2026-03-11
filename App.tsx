import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';

export default function App() {
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');

  return (
    <SafeAreaProvider>
      {authScreen === 'login' ? (
        <LoginScreen onRegisterPress={() => setAuthScreen('register')} />
      ) : (
        <RegisterScreen onLoginPress={() => setAuthScreen('login')} />
      )}
    </SafeAreaProvider>
  );
}