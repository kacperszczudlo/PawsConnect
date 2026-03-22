import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { UserProfile } from '../../types/profile';

interface ProfileHeaderCardProps {
  profile: UserProfile;
  onEditPress: () => void;
}

export const ProfileHeaderCard = React.memo(
  ({ profile, onEditPress }: ProfileHeaderCardProps) => {
    return (
      <View style={styles.card}>
        <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
        <View style={styles.content}>
          <Text style={styles.name}>{profile.fullName}</Text>
          <Text style={styles.meta}>{profile.email}</Text>
          <Text style={styles.meta}>{profile.city}</Text>
        </View>

        <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
          <Text style={styles.editButtonText}>Edytuj</Text>
        </TouchableOpacity>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    elevation: 2,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 18,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  meta: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#fff7ed',
  },
  editButtonText: {
    color: '#f97316',
    fontWeight: '700',
    fontSize: 12,
  },
});
