import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Heart, Calendar, User } from 'lucide-react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { Animal } from '../constants/mockData';

const FavoritesScreen = () => <HomeScreen />;
const VisitsScreen = () => <HomeScreen />;
const ProfileScreen = () => <HomeScreen />;

const Tab = createBottomTabNavigator();

interface TabNavigatorProps {
  onAnimalPress: (animal: Animal) => void;
}

export const TabNavigator = ({ onAnimalPress }: TabNavigatorProps) => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#f97316',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          height: 70,
          paddingBottom: 10,
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="Start"
        options={{
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      >
        {() => <HomeScreen onAnimalPress={onAnimalPress} />}
      </Tab.Screen>
      <Tab.Screen
        name="Ulubione"
        component={FavoritesScreen}
        options={{
          tabBarIcon: ({ color }) => <Heart size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Wizyty"
        component={VisitsScreen}
        options={{
          tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};
