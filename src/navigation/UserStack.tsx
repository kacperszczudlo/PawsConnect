import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
import { Animal } from '../store/useShelterStore';
import { SettingsScreen } from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();

interface UserStackProps {
  onAnimalPress: (animal: Animal) => void;
}

export const UserStack = ({ onAnimalPress }: UserStackProps) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UserTabs">
        {() => <TabNavigator onAnimalPress={onAnimalPress} />}
      </Stack.Screen>
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
};
