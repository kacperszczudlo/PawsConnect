import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronRight, Calendar, Clock3, Heart, History } from 'lucide-react-native';
import { ProfileSection } from '../../types/profile';

interface MenuItem {
  key: Exclude<ProfileSection, 'overview' | 'edit'>;
  title: string;
  subtitle: string;
  icon: 'calendar' | 'clock' | 'heart' | 'history';
}

const MENU_ITEMS: MenuItem[] = [
  {
    key: 'myVisits',
    title: 'Moje wizyty',
    subtitle: 'Wszystkie zarezerwowane spotkania',
    icon: 'calendar',
  },
  {
    key: 'upcoming',
    title: 'Nadchodzące wizyty',
    subtitle: 'Najbliższe potwierdzone terminy',
    icon: 'clock',
  },
  {
    key: 'favorites',
    title: 'Ulubione',
    subtitle: 'Zapisane profile zwierząt',
    icon: 'heart',
  },
  {
    key: 'history',
    title: 'Historia',
    subtitle: 'Zakończone wizyty i spotkania',
    icon: 'history',
  },
];

interface ProfileMenuListProps {
  onSelect: (section: MenuItem['key']) => void;
}

export const ProfileMenuList = ({ onSelect }: ProfileMenuListProps) => {
  const renderIcon = (type: MenuItem['icon']) => {
    if (type === 'calendar') {
      return <Calendar size={18} color="#f97316" />;
    }
    if (type === 'clock') {
      return <Clock3 size={18} color="#3b82f6" />;
    }
    if (type === 'heart') {
      return <Heart size={18} color="#ef4444" />;
    }

    return <History size={18} color="#64748b" />;
  };

  return (
    <View style={styles.container}>
      {MENU_ITEMS.map((item) => (
        <TouchableOpacity
          key={item.key}
          style={styles.row}
          onPress={() => onSelect(item.key)}
          activeOpacity={0.8}
        >
          <View style={styles.iconWrap}>{renderIcon(item.icon)}</View>
          <View style={styles.textWrap}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
          <ChevronRight size={18} color="#94a3b8" />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff7ed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    color: '#1e293b',
    fontWeight: '800',
    fontSize: 14,
  },
  subtitle: {
    color: '#64748b',
    marginTop: 2,
    fontSize: 12,
  },
});
