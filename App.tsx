import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen } from './src/screens/HomeScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';

export default function App() {
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <SafeAreaProvider>
      {isAuthenticated ? (
        <HomeScreen />
      ) : authScreen === 'login' ? (
        <LoginScreen
          onLoginPress={handleLogin}
          onRegisterPress={() => setAuthScreen('register')}
        />
      ) : (
        <RegisterScreen onLoginPress={() => setAuthScreen('login')} />
      )}
    </SafeAreaProvider>
  );
}