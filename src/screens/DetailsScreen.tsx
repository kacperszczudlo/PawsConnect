import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import { 
  ChevronLeft, 
  Heart, 
  Share2, 
  MapPin, 
  Info, 
  Clock, 
  CalendarCheck 
} from 'lucide-react-native';
import { Animal } from '../constants/mockData';
import { WalkReservationScreen } from './WalkReservationScreen';
import { AdoptionFormScreen } from './AdoptionFormScreen';

interface DetailsScreenProps {
  animal: Animal;
  onBack: () => void;
}

export const DetailsScreen = ({ animal, onBack }: DetailsScreenProps) => {
  const [subScreen, setSubScreen] = useState<'walk' | 'adopt' | null>(null);

  if (subScreen === 'walk') {
    return <WalkReservationScreen animal={animal} onBack={() => setSubScreen(null)} onSuccess={() => setSubScreen(null)} />;
  }
  if (subScreen === 'adopt') {
    return <AdoptionFormScreen animal={animal} onBack={() => setSubScreen(null)} onSuccess={() => setSubScreen(null)} />;
  }

  return (
    <View style={styles.container}>
      {/* Zdjęcie z przyciskami na górze */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: animal.image }} style={styles.mainImage} />
        <SafeAreaView style={styles.headerButtons}>
          <TouchableOpacity style={styles.iconBtn} onPress={onBack}>
            <ChevronLeft size={24} color="#1e293b" />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity style={styles.iconBtn}>
              <Share2 size={20} color="#1e293b" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Heart size={20} color={animal.liked ? "#f97316" : "#1e293b"} fill={animal.liked ? "#f97316" : "none"} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.name}>{animal.name}</Text>
            <View style={styles.genderTag}>
              <Text style={styles.genderText}>{animal.gender}</Text>
            </View>
          </View>
          
          <View style={styles.locationRow}>
            <MapPin size={16} color="#94a3b8" />
            <Text style={styles.locationText}>Schronisko "Psi Los", Kraków</Text>
          </View>

          {/* Statystyki: Wiek, Waga, Kolor */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Wiek</Text>
              <Text style={styles.statValue}>{animal.age}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Waga</Text>
              <Text style={styles.statValue}>{animal.weight}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Kolor</Text>
              <Text style={styles.statValue}>{animal.color}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>O mnie</Text>
          <Text style={styles.description}>{animal.description}</Text>

          {/* Szybkie info */}
          <View style={styles.infoBox}>
            <Info size={20} color="#f97316" />
            <Text style={styles.infoBoxText}>
              Wymaga doświadczonego opiekuna i dużej dawki ruchu.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Dolny panel z przyciskami akcji */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.walkBtn} onPress={() => setSubScreen('walk')}>
          <Clock size={20} color="#f97316" />
          <Text style={styles.walkBtnText}>Umów spacer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.adoptBtn} onPress={() => setSubScreen('adopt')}>
          <CalendarCheck size={20} color="white" />
          <Text style={styles.adoptBtnText}>Adoptuj</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  imageContainer: { height: 400, position: 'relative' },
  mainImage: { width: '100%', height: '100%' },
  headerButtons: { 
    position: 'absolute', 
    top: 20, 
    left: 20, 
    right: 20, 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  iconBtn: { 
    width: 44, 
    height: 44, 
    backgroundColor: 'rgba(255,255,255,0.9)', 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  content: { 
    flex: 1, 
    backgroundColor: '#fff', 
    marginTop: -30, 
    borderTopLeftRadius: 35, 
    borderTopRightRadius: 35, 
    padding: 25 
  },
  infoCard: { paddingBottom: 100 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 28, fontWeight: 'bold', color: '#1e293b' },
  genderTag: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  genderText: { color: '#64748b', fontWeight: 'bold', fontSize: 12 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  locationText: { color: '#94a3b8', marginLeft: 5, fontSize: 14 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 25 },
  statItem: { backgroundColor: '#fff7ed', padding: 15, borderRadius: 20, width: '30%', alignItems: 'center' },
  statLabel: { color: '#f97316', fontSize: 12, marginBottom: 4 },
  statValue: { fontWeight: 'bold', color: '#1e293b' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 25 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 12 },
  description: { color: '#64748b', lineHeight: 22, fontSize: 15 },
  infoBox: { 
    flexDirection: 'row', 
    backgroundColor: '#fff7ed', 
    padding: 15, 
    borderRadius: 15, 
    marginTop: 25, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffedd5'
  },
  infoBoxText: { color: '#c2410c', fontSize: 13, marginLeft: 10, flex: 1, fontWeight: '500' },
  footer: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    backgroundColor: '#fff', 
    padding: 20, 
    flexDirection: 'row', 
    gap: 15,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9'
  },
  walkBtn: { 
    flex: 1, 
    height: 56, 
    borderRadius: 16, 
    borderWidth: 2, 
    borderColor: '#f97316', 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 8 
  },
  walkBtnText: { color: '#f97316', fontWeight: 'bold', fontSize: 16 },
  adoptBtn: { 
    flex: 1, 
    height: 56, 
    backgroundColor: '#f97316', 
    borderRadius: 16, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 8,
    elevation: 4
  },
  adoptBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
