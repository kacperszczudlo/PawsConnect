import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { FavoriteAnimalsList } from '../components/profile/FavoriteAnimalsList';
import { Animal } from '../constants/mockData';

interface FavoritesScreenProps {
  onAnimalPress?: (animal: Animal) => void;
}

export const FavoritesScreen = ({ onAnimalPress }: FavoritesScreenProps) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.title}>Ulubione</Text>
        <Text style={styles.subtitle}>Zwierzaki, które skradły Twoje serce.</Text>
      </View>
      <View style={styles.listWrap}>
        <FavoriteAnimalsList onAnimalPress={onAnimalPress} />
      </View>
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
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  listWrap: {
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1e293b',
  },
  subtitle: {
    color: '#64748b',
    marginTop: 4,
    fontWeight: '500',
  },
});
