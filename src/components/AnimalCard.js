import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Heart, MapPin } from 'lucide-react-native';

export function AnimalCard({ animal, onPress, onToggleLike }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <Image source={{ uri: animal.image }} style={styles.image} />
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.name}>{animal.name}</Text>
          <Pressable onPress={onToggleLike} hitSlop={8} style={styles.likeButton}>
            <Heart
              color={animal.liked ? '#f97316' : '#cbd5e1'}
              fill={animal.liked ? '#f97316' : 'transparent'}
              size={20}
              strokeWidth={2.25}
            />
          </Pressable>
        </View>
        <Text style={styles.subtitle}>{animal.type} • {animal.breed}</Text>
        <View style={styles.badgesRow}>
          <View style={[styles.badge, styles.ageBadge]}>
            <Text style={[styles.badgeText, styles.ageBadgeText]}>{animal.age}</Text>
          </View>
          <View style={styles.badge}>
            <MapPin color="#94a3b8" size={12} strokeWidth={2.25} />
            <Text style={styles.badgeText}>{animal.distance}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOpacity: 0.04,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
  image: {
    width: 96,
    height: 96,
    borderRadius: 20,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  likeButton: {
    padding: 4,
    marginRight: -4,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 10,
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  ageBadge: {
    backgroundColor: '#fff7ed',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  ageBadgeText: {
    color: '#ea580c',
  },
});