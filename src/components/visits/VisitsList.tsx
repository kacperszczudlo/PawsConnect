import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';
import { PAST_VISITS, VISITS, Visit } from '../../constants/mockData';
import { VisitCard } from './VisitCard';

export type VisitsMode = 'all' | 'upcoming' | 'history';

interface VisitsListProps {
  mode: VisitsMode;
}

export const VisitsList = ({ mode }: VisitsListProps) => {
  const data = useMemo<Visit[]>(() => {
    if (mode === 'upcoming') {
      return VISITS;
    }
    if (mode === 'history') {
      return PAST_VISITS;
    }
    return [...VISITS, ...PAST_VISITS];
  }, [mode]);

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <VisitCard visit={item} mode={mode} />}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={<Text style={styles.empty}>Brak wizyt do wyświetlenia.</Text>}
    />
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 110,
    marginTop: 12,
  },
  empty: {
    textAlign: 'center',
    marginTop: 30,
    color: '#94a3b8',
  },
});
