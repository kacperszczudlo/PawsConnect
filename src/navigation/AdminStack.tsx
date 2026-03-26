import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AdminTabNavigator } from './AdminTabNavigator';
import { AddAnimalScreen } from '../screens/admin/AddAnimalScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export const AdminStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Główny widok z zakładkami na dole */}
      <Stack.Screen name="AdminTabs" component={AdminTabNavigator} />
      
      {/* Ekran dodawania zwierzaka jako okienko (modal) */}
      <Stack.Screen 
        name="AddAnimal" 
        component={AddAnimalScreen} 
        options={{ presentation: 'modal' }} 
      />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
};
