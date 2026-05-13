import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AdminTabNavigator } from './AdminTabNavigator';
import { AddAnimalScreen } from '../screens/admin/AddAnimalScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import type { Animal } from '../store/useShelterStore';

export type AdminStackParamList = {
  AdminTabs: undefined;
  AddAnimal: { animal?: Animal } | undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<AdminStackParamList>();

export const AdminStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminTabs" component={AdminTabNavigator} />
      <Stack.Screen
        name="AddAnimal"
        component={AddAnimalScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
};
