import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Heart, Calendar, User } from 'lucide-react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { VisitsScreen } from '../screens/VisitsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { Animal } from '../constants/mockData';

const Tab = createBottomTabNavigator();

interface TabNavigatorProps {
  onAnimalPress: (animal: Animal) => void;
}

export const TabNavigator = ({ onAnimalPress }: TabNavigatorProps) => {
  const renderTabIcon = (
    Icon: typeof Home,
    color: string,
    focused: boolean,
  ) => (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={22} color={color} />
      <View
        style={{
          marginTop: 4,
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: focused ? '#f97316' : 'transparent',
        }}
      />
    </View>
  );

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#f97316',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          height: 78,
          paddingBottom: 12,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
          backgroundColor: '#fff',
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 14,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="Start"
        options={{
          tabBarIcon: ({ color, focused }) => renderTabIcon(Home, color, focused),
        }}
      >
        {() => <HomeScreen onAnimalPress={onAnimalPress} />}
      </Tab.Screen>
      <Tab.Screen
        name="Ulubione"
        options={{
          tabBarIcon: ({ color, focused }) => renderTabIcon(Heart, color, focused),
        }}
      >
        {() => <FavoritesScreen onAnimalPress={onAnimalPress} />}
      </Tab.Screen>
      <Tab.Screen
        name="Wizyty"
        component={VisitsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => renderTabIcon(Calendar, color, focused),
        }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, focused }) => renderTabIcon(User, color, focused),
        }}
      />
    </Tab.Navigator>
  );
};
