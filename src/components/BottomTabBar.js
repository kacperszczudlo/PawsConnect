import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Calendar, Heart, Home, User } from 'lucide-react-native';

const TABS = [
  { key: 'home', label: 'Start', Icon: Home },
  { key: 'favorites', label: 'Ulubione', Icon: Heart },
  { key: 'visits', label: 'Wizyty', Icon: Calendar },
  { key: 'profile', label: 'Profil', Icon: User },
];

export function BottomTabBar({ activeTab, onChange, hasVisitBadge = false }) {
  return (
    <View style={styles.wrapper}>
      {TABS.map(({ key, label, Icon }) => {
        const active = key === activeTab;

        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            style={({ pressed }) => [styles.tabButton, pressed && styles.tabButtonPressed]}
          >
            <View style={styles.iconHolder}>
              <Icon color={active ? '#f97316' : '#94a3b8'} size={22} strokeWidth={2.25} />
              {key === 'visits' && hasVisitBadge ? <View style={styles.badge} /> : null}
              {active ? <View style={styles.dot} /> : null}
            </View>
            <Text style={[styles.label, active ? styles.labelActive : null]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 14,
    paddingBottom: 18,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 56,
  },
  tabButtonPressed: {
    opacity: 0.7,
  },
  iconHolder: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#f97316',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  label: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
  },
  labelActive: {
    color: '#f97316',
  },
});