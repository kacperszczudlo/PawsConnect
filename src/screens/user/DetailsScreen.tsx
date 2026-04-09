import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ChevronLeft, 
  Heart, 
  Share2, 
  MapPin, 
  Info, 
  Clock, 
  CalendarCheck,
  PawPrint,
} from 'lucide-react-native';
import { Animal } from '../../store/useShelterStore';
import { WalkReservationScreen } from './WalkReservationScreen';
import { AdoptionFormScreen } from './AdoptionFormScreen';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../services/supabase';
import { formatAgeBySex } from '../../utils/animalLabels';

interface DetailsScreenProps {
  animal: Animal;
  onBack: () => void;
}

export const DetailsScreen = ({ animal, onBack }: DetailsScreenProps) => {
  const [subScreen, setSubScreen] = useState<'walk' | 'adopt' | null>(null);
  const [currentAnimal, setCurrentAnimal] = useState(animal);
  const user = useAuthStore((state) => state.user);
  const favorites = useFavoritesStore((state) => state.favorites);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const fetchFavorites = useFavoritesStore((state) => state.fetchFavorites);

  useEffect(() => {
    setCurrentAnimal(animal);
  }, [animal]);

  useEffect(() => {
    let active = true;

    const loadAnimal = async () => {
      try {
        const { data } = await supabase
          .from('animals')
          .select('id,name,city,shelter_name,shelter_address,shelter_phone,shelter_email,type,breed,age,description,image,sex,weight,color')
          .eq('id', animal.id)
          .maybeSingle();

        if (active && data) {
          setCurrentAnimal({
            id: String(data.id),
            name: data.name ?? animal.name,
            city: data.city ?? animal.city,
            shelterName: data.shelter_name ?? animal.shelterName,
            shelterAddress: data.shelter_address ?? animal.shelterAddress,
            shelterPhone: data.shelter_phone ?? animal.shelterPhone,
            shelterEmail: data.shelter_email ?? animal.shelterEmail,
            type: data.type ?? animal.type,
            breed: data.breed ?? animal.breed,
            age: data.age ?? animal.age,
            description: data.description ?? animal.description,
            image: data.image ?? animal.image,
            sex: data.sex ?? animal.sex,
            liked: animal.liked,
            gender: animal.gender,
            weight: data.weight ?? animal.weight,
            color: data.color ?? animal.color,
          });
        }
      } catch {
        if (active) {
          setCurrentAnimal((prev) => ({ ...prev }));
        }
      }
    };

    void loadAnimal();

    return () => {
      active = false;
    };
  }, [animal]);

  const handleToggleFavorite = async () => {
    const ok = await toggleFavorite(user?.id, animal.id);
    if (!ok) {
      Alert.alert('Błąd', 'Nie udało się zapisać ulubionego. Sprawdź uprawnienia w bazie (RLS).');
    }
  };

  const formattedAge = formatAgeBySex(currentAnimal.age, currentAnimal.sex ?? currentAnimal.gender);

  const locationText = currentAnimal.shelterName && currentAnimal.shelterAddress
    ? `${currentAnimal.shelterName} • ${currentAnimal.shelterAddress}`
    : currentAnimal.shelterName || (currentAnimal.city ? `Schronisko • ${currentAnimal.city}` : 'Schronisko');

  useEffect(() => {
    if (user?.id) {
      void fetchFavorites(user.id);
    }
  }, [fetchFavorites, user?.id]);

  if (subScreen === 'walk') {
    return <WalkReservationScreen animal={animal} onBack={() => setSubScreen(null)} onSuccess={() => setSubScreen(null)} />;
  }
  if (subScreen === 'adopt') {
    return <AdoptionFormScreen animal={animal} onBack={() => setSubScreen(null)} onSuccess={() => setSubScreen(null)} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {currentAnimal.image ? (
          <Image source={{ uri: currentAnimal.image }} style={styles.mainImage} />
        ) : (
          <View style={styles.mainImagePlaceholder}>
            <PawPrint size={44} color="#94a3b8" />
          </View>
        )}
        <SafeAreaView style={styles.headerButtons}>
          <TouchableOpacity style={styles.iconBtn} onPress={onBack}>
            <ChevronLeft size={24} color="#1e293b" />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity style={styles.iconBtn}>
              <Share2 size={20} color="#1e293b" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => void handleToggleFavorite()}>
              <Heart
                size={20}
                color={favorites.includes(animal.id) ? '#f97316' : '#1e293b'}
                fill={favorites.includes(animal.id) ? '#f97316' : 'none'}
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.name}>{currentAnimal.name}</Text>
            <View style={styles.genderTag}>
              <Text style={styles.genderText}>{currentAnimal.sex ?? currentAnimal.gender ?? 'Nieznana płeć'}</Text>
            </View>
          </View>
          
          <View style={styles.locationRow}>
            <MapPin size={16} color="#94a3b8" />
            <Text style={styles.locationText}>{locationText}</Text>
          </View>

          <View style={styles.contactCard}>
            <Text style={styles.sectionTitle}>Kontakt i miejsce odbioru</Text>
            <Text style={styles.contactText}>Telefon: {currentAnimal.shelterPhone ?? 'Brak danych'}</Text>
            <Text style={styles.contactText}>E-mail: {currentAnimal.shelterEmail ?? 'Brak danych'}</Text>
            <Text style={styles.contactText}>
              Adres: {currentAnimal.shelterAddress ?? currentAnimal.city ?? 'Brak danych'}
            </Text>
            <Text style={styles.contactHint}>
              Skontaktuj się przed przyjazdem, żeby potwierdzić godzinę wizyty lub odbioru.
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Wiek</Text>
              <Text style={styles.statValue}>{formattedAge}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Waga</Text>
              <Text style={styles.statValue}>{animal.weight ?? 'Brak danych'}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Kolor</Text>
              <Text style={styles.statValue}>{animal.color ?? 'Brak danych'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>O mnie</Text>
          <Text style={styles.description}>{currentAnimal.description ?? 'Opis zostanie uzupełniony wkrótce.'}</Text>

          <View style={styles.infoBox}>
            <Info size={20} color="#f97316" />
            <Text style={styles.infoBoxText}>
              Wymaga doświadczonego opiekuna i dużej dawki ruchu.
            </Text>
          </View>
        </View>
      </ScrollView>

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
  container: { flex: 1, backgroundColor: '#f8fafc' },
  imageContainer: { height: 320, position: 'relative' },
  mainImage: { width: '100%', height: '100%' },
  mainImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
    backgroundColor: '#f8fafc', 
    marginTop: -30, 
    borderTopLeftRadius: 35, 
    borderTopRightRadius: 35, 
    paddingHorizontal: 24,
    paddingTop: 22,
  },
  infoCard: {
    paddingBottom: 112,
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingTop: 14,
  },
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
  contactCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 16,
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  contactText: { color: '#334155', marginTop: 6, fontSize: 14 },
  contactHint: { color: '#64748b', marginTop: 10, fontSize: 13, lineHeight: 18 },
  footer: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    backgroundColor: '#fff', 
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 22,
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
