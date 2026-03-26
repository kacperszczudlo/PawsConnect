import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PawPrint, ClipboardList, User } from 'lucide-react-native';
import { View, Text } from 'react-native';

import { AdminAnimalsScreen } from '../screens/admin/AdminAnimalsScreen';
import { AdminApplicationsScreen } from '../screens/admin/AdminApplicationsScreen';
import { ProfileScreen } from '../screens';
import { useShelterStore } from '../store/useShelterStore';

const Tab = createBottomTabNavigator();

export const AdminTabNavigator = () => {
  const { applications } = useShelterStore();
  const pendingCount = applications.filter(a => a.status === 'Oczekujące').length;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#94a3b8',
      }}
    >
      <Tab.Screen 
        name="Animals" 
        component={AdminAnimalsScreen} 
        options={{
          tabBarLabel: 'Zwierzęta',
          tabBarIcon: ({ color, size }) => <PawPrint color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="Applications" 
        component={AdminApplicationsScreen} 
        options={{
          tabBarLabel: 'Wnioski',
          tabBarIcon: ({ color, size }) => (
            <View>
              <ClipboardList color={color} size={size} />
              {pendingCount > 0 && (
                <View style={{ position: 'absolute', top: -4, right: -8, width: 16, height: 16, borderRadius: 8, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'white' }}>
                  <Text style={{ fontSize: 8, fontWeight: 'bold', color: 'white' }}>{pendingCount}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};
