import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AdminStack } from './src/navigation/AdminStack';
import AuthStack from './src/navigation/AuthStack';
import { DetailsScreen } from './src/screens/user/DetailsScreen';
import { UserStack } from './src/navigation/UserStack';

import { Animal } from './src/store/useShelterStore';
import { supabase } from './src/services/supabase';
import { useAuthStore } from './src/store/useAuthStore';

export default function App() {
  const { session, setSession, setUser, isLoading, setLoading, role } = useAuthStore();
  
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);


  useEffect(() => {
    setLoading(true);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setLoading, setSession, setUser]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {session?.user ? (
          role === 'admin' ? (
            <AdminStack />
          ) : (
            selectedAnimal ? (
              <DetailsScreen animal={selectedAnimal} onBack={() => setSelectedAnimal(null)} />
            ) : (
              <UserStack onAnimalPress={setSelectedAnimal} />
            )
          )
        ) : (
          <AuthStack />
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}