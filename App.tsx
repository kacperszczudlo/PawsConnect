import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AdminStack } from './src/navigation/AdminStack';
import AuthStack from './src/navigation/AuthStack';
import { DetailsScreen } from './src/screens/user/DetailsScreen';
import { UserStack } from './src/navigation/UserStack';

import { Animal } from './src/store/useShelterStore';
import { clearSupabaseAuthSession, supabase } from './src/services/supabase';
import { useAuthStore } from './src/store/useAuthStore';
import { ToastProvider } from './src/context/ToastContext';
import { NetworkProvider } from './src/context/NetworkContext';

export default function App() {
  const { session, setSession, setUser, isLoading, setLoading, role } =
    useAuthStore();

  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      setLoading(true);

      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!isMounted) {
          return;
        }

        if (error) {
          await clearSupabaseAuthSession();
          if (isMounted) {
            setSession(null);
            setUser(null);
          }
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
      } catch {
        if (isMounted) {
          await clearSupabaseAuthSession();
          setSession(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
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
      <ToastProvider>
        <NetworkProvider>
          <NavigationContainer>
            {session?.user ? (
              role === 'admin' ? (
                <AdminStack />
              ) : selectedAnimal ? (
                <DetailsScreen
                  animal={selectedAnimal}
                  onBack={() => setSelectedAnimal(null)}
                />
              ) : (
                <UserStack onAnimalPress={setSelectedAnimal} />
              )
            ) : (
              <AuthStack />
            )}
          </NavigationContainer>
        </NetworkProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}
