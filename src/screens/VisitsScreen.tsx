import React, { useCallback, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { VisitsList, VisitsMode } from '../components/visits/VisitsList';

const TABS: Array<{ key: VisitsMode; label: string }> = [
  { key: 'upcoming', label: 'Nadchodzące' },
  { key: 'history', label: 'Historia' },
];

export const VisitsScreen = () => {
  const [mode, setMode] = useState<VisitsMode>('upcoming');

  const handleModeChange = useCallback((nextMode: VisitsMode) => {
    setMode(nextMode);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.title}>Twoje wizyty</Text>
        <Text style={styles.subtitle}>Zarządzaj swoimi spacerami i adopcjami</Text>

        <View style={styles.tabsShell}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => handleModeChange(tab.key)}
              style={[styles.tabButton, mode === tab.key && styles.tabButtonActive]}
              activeOpacity={0.9}
            >
              <Text style={[styles.tabLabel, mode === tab.key && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <VisitsList mode={mode} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  hero: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
  },
  subtitle: {
    color: '#64748b',
    marginTop: 4,
    fontWeight: '500',
  },
  tabsShell: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 5,
    gap: 8,
    marginTop: 18,
  },
  tabButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tabButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  tabLabel: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '700',
  },
  tabLabelActive: {
    color: '#1e293b',
  },
});
