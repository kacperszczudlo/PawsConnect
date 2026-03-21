import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TabNavigator } from './src/navigation/TabNavigator';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { DetailsScreen } from './src/screens/DetailsScreen';
import { Animal } from './src/constants/mockData';
import { FavoritesProvider } from './src/context/FavoritesContext';

export default function App() {
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <SafeAreaProvider>
      {!isAuthenticated ? (
        authScreen === 'login' ? (
          <LoginScreen
            onLoginPress={handleLogin}
            onRegisterPress={() => setAuthScreen('register')}
          />
        ) : (
          <RegisterScreen onLoginPress={() => setAuthScreen('login')} />
        )
      ) : (
        <FavoritesProvider>
          {selectedAnimal ? (
            <DetailsScreen animal={selectedAnimal} onBack={() => setSelectedAnimal(null)} />
          ) : (
            <NavigationContainer>
              <TabNavigator onAnimalPress={setSelectedAnimal} />
            </NavigationContainer>
          )}
        </FavoritesProvider>
      )}
    </SafeAreaProvider>
  );
}