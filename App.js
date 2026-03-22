import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  Calendar,
  CalendarCheck,
  Camera,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  EyeOff,
  Heart,
  History,
  Info,
  Lock,
  Mail,
  MapPin,
  PawPrint,
  Phone,
  Search,
  Share2,
  SlidersHorizontal,
  User,
} from 'lucide-react-native';

import { AnimalCard } from './src/components/AnimalCard';
import { BottomTabBar } from './src/components/BottomTabBar';
import { VisitCard } from './src/components/VisitCard';
import { CATEGORIES, INITIAL_ANIMALS, PAST_VISITS, VISITS } from './src/data/mockData';

function parseDistance(distanceLabel) {
  return Number.parseFloat(String(distanceLabel).replace(' km', '').replace(',', '.'));
}

function parseAnimalAgeInMonths(ageLabel) {
  const numericAge = Number.parseInt(ageLabel, 10);

  if (Number.isNaN(numericAge)) {
    return 0;
  }

  if (ageLabel.includes('mies')) {
    return numericAge;
  }

  return numericAge * 12;
}

function matchesCategory(category, animalType) {
  if (category === 'Wszystkie') {
    return true;
  }

  if (category === 'Psy') {
    return animalType === 'Pies';
  }

  if (category === 'Koty') {
    return animalType === 'Kot';
  }

  return animalType === 'Inne';
}

function matchesAge(filterAge, animalAge) {
  if (filterAge === 'Wszystkie') {
    return true;
  }

  const ageInMonths = parseAnimalAgeInMonths(animalAge);

  if (filterAge === 'Szczeniak / Kocię') {
    return ageInMonths <= 12;
  }

  if (filterAge === 'Młody') {
    return ageInMonths > 12 && ageInMonths <= 24;
  }

  if (filterAge === 'Dorosły') {
    return ageInMonths > 24 && ageInMonths <= 84;
  }

  return ageInMonths > 84;
}

function SectionTitle({ title, subtitle }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.screenTitle}>{title}</Text>
      {subtitle ? <Text style={styles.screenSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

function InfoStatCard({ icon, label, value, backgroundColor, iconColor }) {
  return (
    <View style={styles.infoCard}>
      <View style={[styles.infoCardIcon, { backgroundColor }]}>{icon(iconColor)}</View>
      <Text style={styles.infoCardLabel}>{label}</Text>
      <Text style={styles.infoCardValue}>{value}</Text>
    </View>
  );
}

function Chip({ label, active, onPress, fullWidth = false }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        fullWidth ? styles.chipFullWidth : null,
        active ? styles.chipActive : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <Text style={[styles.chipText, active ? styles.chipTextActive : null]}>{label}</Text>
    </Pressable>
  );
}

function InputField({
  label,
  icon,
  value,
  defaultValue,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  rightAction,
}) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        {icon ? <View style={styles.inputLeftIcon}>{icon}</View> : null}
        <TextInput
          value={value}
          defaultValue={defaultValue}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          secureTextEntry={secureTextEntry}
          style={[styles.textInput, icon ? styles.textInputWithLeftIcon : null, rightAction ? styles.textInputWithRightAction : null]}
        />
        {rightAction ? <View style={styles.inputRightAction}>{rightAction}</View> : null}
      </View>
    </View>
  );
}

export default function App() {
  const [animals, setAnimals] = useState(INITIAL_ANIMALS);
  const [activeCategory, setActiveCategory] = useState('Wszystkie');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [selectedAnimalId, setSelectedAnimalId] = useState(null);
  const [formType, setFormType] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [visitsSubTab, setVisitsSubTab] = useState('nadchodzace');
  const [rescheduleVisitId, setRescheduleVisitId] = useState(null);
  const [profileSubView, setProfileSubView] = useState(null);
  const [filterAge, setFilterAge] = useState('Wszystkie');
  const [filterGender, setFilterGender] = useState('Wszystkie');
  const [filterDistance, setFilterDistance] = useState(15);
  const [filterBreed, setFilterBreed] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const selectedAnimal = animals.find((animal) => animal.id === selectedAnimalId) ?? null;
  const currentVisits = visitsSubTab === 'nadchodzace' ? VISITS : PAST_VISITS;
  const currentVisit = VISITS.find((visit) => visit.id === rescheduleVisitId) ?? null;
  const favoriteAnimals = animals.filter((animal) => animal.liked);

  const filteredAnimals = animals.filter((animal) => {
    const matchesSearchQuery = animal.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
    const matchesSelectedCategory = matchesCategory(activeCategory, animal.type);
    const matchesSelectedGender = filterGender === 'Wszystkie' || animal.gender === filterGender;
    const matchesSelectedDistance = parseDistance(animal.distance) <= filterDistance;
    const matchesSelectedBreed =
      filterBreed.trim().length === 0 || animal.breed.toLowerCase().includes(filterBreed.trim().toLowerCase());

    return (
      matchesSearchQuery &&
      matchesSelectedCategory &&
      matchesSelectedGender &&
      matchesSelectedDistance &&
      matchesSelectedBreed &&
      matchesAge(filterAge, animal.age)
    );
  });

  function resetSubViews() {
    setSelectedAnimalId(null);
    setFormType(null);
    setIsFilterOpen(false);
    setRescheduleVisitId(null);
    setProfileSubView(null);
  }

  function openTab(tabName) {
    setActiveTab(tabName);
    resetSubViews();
  }

  function toggleLike(animalId) {
    setAnimals((currentAnimals) =>
      currentAnimals.map((animal) =>
        animal.id === animalId ? { ...animal, liked: !animal.liked } : animal,
      ),
    );
  }

  function submitAuth() {
    setIsAuthenticated(true);
    setActiveTab('home');
    resetSubViews();
  }

  function submitAnimalForm() {
    Alert.alert(
      formType === 'adopcja' ? 'Wniosek wysłany' : 'Spacer zarezerwowany',
      formType === 'adopcja'
        ? 'Twoje zgłoszenie zostało zapisane w aplikacji demonstracyjnej.'
        : 'Rezerwacja spaceru została zapisana w aplikacji demonstracyjnej.',
    );
    setFormType(null);
    setSelectedAnimalId(null);
    setActiveTab('visits');
  }

  function saveRescheduledVisit() {
    Alert.alert('Termin zapisany', 'Zmiana została zapisana w demonstracyjnej wersji aplikacji.');
    setRescheduleVisitId(null);
  }

  function renderFeed() {
    return (
      <View style={styles.screen}>
        <View style={styles.feedHeader}>
          <View>
            <Text style={styles.locationLabel}>Twoja lokalizacja</Text>
            <View style={styles.locationRow}>
              <MapPin color="#f97316" size={16} strokeWidth={2.25} />
              <Text style={styles.locationValue}>Kraków, Polska</Text>
            </View>
          </View>

          <Pressable onPress={() => openTab('profile')} style={({ pressed }) => [styles.pawButton, pressed && styles.pressed]}>
            <PawPrint color="#f97316" size={26} strokeWidth={2.25} />
          </Pressable>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Search color="#94a3b8" size={18} strokeWidth={2.25} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Szukaj zwierzaka..."
              placeholderTextColor="#94a3b8"
              style={styles.searchInput}
            />
          </View>

          <Pressable onPress={() => setIsFilterOpen(true)} style={({ pressed }) => [styles.filterButton, pressed && styles.pressed]}>
            <SlidersHorizontal color="#ffffff" size={20} strokeWidth={2.25} />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
          style={styles.categoryScroller}
        >
          {CATEGORIES.map((category) => (
            <Chip
              key={category}
              label={category}
              active={activeCategory === category}
              onPress={() => setActiveCategory(category)}
            />
          ))}
        </ScrollView>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {filteredAnimals.length > 0 ? (
            filteredAnimals.map((animal) => (
              <AnimalCard
                key={animal.id}
                animal={animal}
                onPress={() => setSelectedAnimalId(animal.id)}
                onToggleLike={() => toggleLike(animal.id)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <PawPrint color="#cbd5e1" size={42} strokeWidth={2.25} />
              <Text style={styles.emptyStateTitle}>Brak wyników</Text>
              <Text style={styles.emptyStateSubtitle}>Spróbuj zmienić wyszukiwanie albo filtry.</Text>
            </View>
          )}
        </ScrollView>

        <BottomTabBar activeTab={activeTab} onChange={openTab} hasVisitBadge />
      </View>
    );
  }

  function renderDetails() {
    if (!selectedAnimal) {
      return renderFeed();
    }

    return (
      <View style={styles.screen}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailsScrollContent}>
          <View style={styles.detailsHero}>
            <Image source={{ uri: selectedAnimal.image }} style={styles.detailsImage} />
            <View style={styles.overlayTopBar}>
              <Pressable onPress={() => setSelectedAnimalId(null)} style={({ pressed }) => [styles.overlayButton, pressed && styles.pressed]}>
                <ChevronLeft color="#0f172a" size={22} strokeWidth={2.25} />
              </Pressable>
              <Pressable style={({ pressed }) => [styles.overlayButton, pressed && styles.pressed]}>
                <Share2 color="#0f172a" size={18} strokeWidth={2.25} />
              </Pressable>
            </View>
          </View>

          <View style={styles.detailsSheet}>
            <View style={styles.detailsHeaderRow}>
              <View style={styles.detailsHeaderTextWrap}>
                <Text style={styles.detailsName}>{selectedAnimal.name}</Text>
                <Text style={styles.detailsSubtitle}>{selectedAnimal.type} • {selectedAnimal.breed}</Text>
              </View>
              <Pressable onPress={() => toggleLike(selectedAnimal.id)} style={({ pressed }) => [styles.favoriteCircle, pressed && styles.pressed]}>
                <Heart
                  color="#f97316"
                  fill={selectedAnimal.liked ? '#f97316' : 'transparent'}
                  size={22}
                  strokeWidth={2.25}
                />
              </Pressable>
            </View>

            <View style={styles.locationInfoRow}>
              <MapPin color="#f97316" size={16} strokeWidth={2.25} />
              <Text style={styles.locationInfoText}>Schronisko Psi Los • {selectedAnimal.distance}</Text>
            </View>

            <View style={styles.infoCardRow}>
              <InfoStatCard
                label="Płeć"
                value={selectedAnimal.gender}
                backgroundColor="#eff6ff"
                iconColor="#2563eb"
                icon={(color) => <Info color={color} size={16} strokeWidth={2.25} />}
              />
              <InfoStatCard
                label="Wiek"
                value={selectedAnimal.age}
                backgroundColor="#fff7ed"
                iconColor="#f97316"
                icon={(color) => <Clock color={color} size={16} strokeWidth={2.25} />}
              />
              <InfoStatCard
                label="Waga"
                value={selectedAnimal.weight}
                backgroundColor="#ecfdf5"
                iconColor="#10b981"
                icon={(color) => <PawPrint color={color} size={16} strokeWidth={2.25} />}
              />
            </View>

            <View style={styles.aboutSection}>
              <Text style={styles.aboutTitle}>O mnie</Text>
              <Text style={styles.aboutText}>{selectedAnimal.description}</Text>
            </View>

            <View style={styles.aboutSection}>
              <Text style={styles.aboutTitle}>Szczegóły</Text>
              <Text style={styles.detailLine}>Kolor: {selectedAnimal.color}</Text>
              <Text style={styles.detailLine}>Typ: {selectedAnimal.type}</Text>
              <Text style={styles.detailLine}>Rasa: {selectedAnimal.breed}</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomActionBar}>
          <Pressable onPress={() => setFormType('spacer')} style={({ pressed }) => [styles.secondaryActionButton, pressed && styles.pressed]}>
            <Calendar color="#ea580c" size={18} strokeWidth={2.25} />
            <Text style={styles.secondaryActionText}>Spacer</Text>
          </Pressable>
          <Pressable onPress={() => setFormType('adopcja')} style={({ pressed }) => [styles.primaryActionButton, pressed && styles.pressed]}>
            <PawPrint color="#ffffff" size={18} strokeWidth={2.25} />
            <Text style={styles.primaryActionText}>Adoptuj</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  function renderForm() {
    if (!selectedAnimal) {
      return renderFeed();
    }

    const isAdoption = formType === 'adopcja';

    return (
      <View style={styles.screen}>
        <View style={styles.stickyHeader}>
          <Pressable onPress={() => setFormType(null)} style={({ pressed }) => [styles.roundedBackButton, pressed && styles.pressed]}>
            <ChevronLeft color="#0f172a" size={22} strokeWidth={2.25} />
          </Pressable>
          <Text style={styles.stickyHeaderTitle}>{isAdoption ? 'Wniosek adopcyjny' : 'Rezerwacja spaceru'}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.formScrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.summaryCard}>
            <Image source={{ uri: selectedAnimal.image }} style={styles.summaryImage} />
            <View>
              <Text style={styles.summaryName}>{selectedAnimal.name}</Text>
              <Text style={styles.summaryMeta}>{selectedAnimal.type} • {selectedAnimal.breed}</Text>
            </View>
          </View>

          <InputField label="Imię i nazwisko" placeholder="np. Jan Kowalski" />
          <InputField label="Numer telefonu" placeholder="np. 123 456 789" />

          {isAdoption ? (
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Dlaczego chcesz zaadoptować?</Text>
              <TextInput
                multiline
                textAlignVertical="top"
                placeholder="Napisz kilka słów o sobie..."
                placeholderTextColor="#94a3b8"
                style={[styles.textInput, styles.textArea]}
              />
            </View>
          ) : (
            <View style={styles.twoColumnRow}>
              <View style={styles.columnFlex}>
                <InputField label="Data" placeholder="15.03.2026" />
              </View>
              <View style={styles.columnFlex}>
                <InputField label="Godzina" placeholder="14:00" />
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.bottomActionBarSingle}>
          <Pressable onPress={submitAnimalForm} style={({ pressed }) => [styles.fullPrimaryButton, pressed && styles.pressed]}>
            <Text style={styles.fullPrimaryButtonText}>{isAdoption ? 'Wyślij wniosek' : 'Zarezerwuj spacer'}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  function renderFilters() {
    return (
      <View style={styles.screen}>
        <View style={styles.stickyHeader}>
          <Pressable onPress={() => setIsFilterOpen(false)} style={({ pressed }) => [styles.roundedBackButton, pressed && styles.pressed]}>
            <ChevronLeft color="#0f172a" size={22} strokeWidth={2.25} />
          </Pressable>
          <Text style={styles.stickyHeaderTitle}>Filtrowanie</Text>
        </View>

        <ScrollView contentContainerStyle={styles.formScrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.fieldBlock}>
            <Text style={styles.filterSectionTitle}>Lokalizacja</Text>
            <InputField
              label="Miejscowość"
              defaultValue="Kraków, Polska"
              placeholder="Wpisz miejscowość"
              icon={<MapPin color="#94a3b8" size={18} strokeWidth={2.25} />}
            />

            <View style={styles.sliderHeader}>
              <Text style={styles.sliderLabel}>Maksymalna odległość</Text>
              <Text style={styles.sliderValue}>{filterDistance} km</Text>
            </View>
            <Slider
              minimumValue={1}
              maximumValue={50}
              step={1}
              value={filterDistance}
              onValueChange={setFilterDistance}
              minimumTrackTintColor="#f97316"
              maximumTrackTintColor="#cbd5e1"
              thumbTintColor="#f97316"
            />
            <View style={styles.sliderScale}>
              <Text style={styles.sliderScaleText}>1 km</Text>
              <Text style={styles.sliderScaleText}>50 km</Text>
            </View>
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.filterSectionTitle}>Rasa</Text>
            <TextInput
              value={filterBreed}
              onChangeText={setFilterBreed}
              placeholder="np. Kundelek, Owczarek, Brytyjski"
              placeholderTextColor="#94a3b8"
              style={styles.textInput}
            />
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.filterSectionTitle}>Wiek</Text>
            <View style={styles.wrapRow}>
              {['Wszystkie', 'Szczeniak / Kocię', 'Młody', 'Dorosły', 'Senior'].map((age) => (
                <Chip key={age} label={age} active={filterAge === age} onPress={() => setFilterAge(age)} />
              ))}
            </View>
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.filterSectionTitle}>Płeć</Text>
            <View style={styles.twoColumnRow}>
              {['Wszystkie', 'Samiec', 'Samica'].map((gender) => (
                <Chip
                  key={gender}
                  label={gender}
                  active={filterGender === gender}
                  onPress={() => setFilterGender(gender)}
                  fullWidth
                />
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomActionBar}>
          <Pressable
            onPress={() => {
              setFilterAge('Wszystkie');
              setFilterGender('Wszystkie');
              setFilterDistance(15);
              setFilterBreed('');
            }}
            style={({ pressed }) => [styles.secondaryActionButton, pressed && styles.pressed]}
          >
            <Text style={styles.secondaryActionText}>Wyczyść</Text>
          </Pressable>
          <Pressable onPress={() => setIsFilterOpen(false)} style={({ pressed }) => [styles.primaryActionButton, pressed && styles.pressed]}>
            <Text style={styles.primaryActionText}>Pokaż wyniki</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  function renderRescheduleForm() {
    return (
      <View style={styles.screen}>
        <View style={styles.stickyHeader}>
          <Pressable onPress={() => setRescheduleVisitId(null)} style={({ pressed }) => [styles.roundedBackButton, pressed && styles.pressed]}>
            <ChevronLeft color="#0f172a" size={22} strokeWidth={2.25} />
          </Pressable>
          <Text style={styles.stickyHeaderTitle}>Zmień termin</Text>
        </View>

        <ScrollView contentContainerStyle={styles.formScrollContent} showsVerticalScrollIndicator={false}>
          {currentVisit ? (
            <View style={styles.summaryCard}>
              <Image source={{ uri: currentVisit.animalImage }} style={styles.summaryImage} />
              <View style={styles.summaryContentFlex}>
                <Text style={styles.summaryName}>{currentVisit.type} z {currentVisit.animalName}</Text>
                <Text style={styles.summaryMeta}>Aktualnie: {currentVisit.date}, {currentVisit.time}</Text>
              </View>
            </View>
          ) : null}

          <View style={styles.twoColumnRow}>
            <View style={styles.columnFlex}>
              <InputField label="Nowa data" placeholder="20.03.2026" />
            </View>
            <View style={styles.columnFlex}>
              <InputField label="Nowa godzina" placeholder="15:30" />
            </View>
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Powód zmiany</Text>
            <TextInput
              multiline
              textAlignVertical="top"
              placeholder="Krótka informacja dla schroniska..."
              placeholderTextColor="#94a3b8"
              style={[styles.textInput, styles.textArea]}
            />
          </View>
        </ScrollView>

        <View style={styles.bottomActionBarSingle}>
          <Pressable onPress={saveRescheduledVisit} style={({ pressed }) => [styles.fullPrimaryButton, pressed && styles.pressed]}>
            <Text style={styles.fullPrimaryButtonText}>Zapisz nowy termin</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  function renderVisits() {
    if (rescheduleVisitId) {
      return renderRescheduleForm();
    }

    return (
      <View style={styles.screen}>
        <View style={styles.panelHeader}>
          <SectionTitle title="Twoje wizyty" subtitle="Zarządzaj swoimi spacerami i adopcjami." />

          <View style={styles.segmentedControl}>
            <Pressable
              onPress={() => setVisitsSubTab('nadchodzace')}
              style={({ pressed }) => [
                styles.segment,
                visitsSubTab === 'nadchodzace' ? styles.segmentActive : null,
                pressed ? styles.pressed : null,
              ]}
            >
              <Text style={[styles.segmentText, visitsSubTab === 'nadchodzace' ? styles.segmentTextActive : null]}>Nadchodzące (2)</Text>
            </Pressable>
            <Pressable
              onPress={() => setVisitsSubTab('historia')}
              style={({ pressed }) => [
                styles.segment,
                visitsSubTab === 'historia' ? styles.segmentActive : null,
                pressed ? styles.pressed : null,
              ]}
            >
              <Text style={[styles.segmentText, visitsSubTab === 'historia' ? styles.segmentTextActive : null]}>Historia</Text>
            </Pressable>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {currentVisits.length > 0 ? (
            currentVisits.map((visit) => (
              <VisitCard
                key={visit.id}
                visit={visit}
                showActions={visitsSubTab === 'nadchodzace'}
                onReschedule={() => setRescheduleVisitId(visit.id)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <CalendarCheck color="#cbd5e1" size={42} strokeWidth={2.25} />
              <Text style={styles.emptyStateTitle}>Brak wizyt</Text>
              <Text style={styles.emptyStateSubtitle}>Nie masz jeszcze zapisanych wydarzeń w tej sekcji.</Text>
            </View>
          )}
        </ScrollView>

        <BottomTabBar activeTab={activeTab} onChange={openTab} hasVisitBadge />
      </View>
    );
  }

  function renderFavorites() {
    return (
      <View style={styles.screen}>
        <View style={styles.panelHeader}>
          <SectionTitle title="Ulubione" subtitle="Zwierzaki, które skradły Twoje serce." />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {favoriteAnimals.length > 0 ? (
            favoriteAnimals.map((animal) => (
              <AnimalCard
                key={animal.id}
                animal={animal}
                onPress={() => setSelectedAnimalId(animal.id)}
                onToggleLike={() => toggleLike(animal.id)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <PawPrint color="#cbd5e1" size={42} strokeWidth={2.25} />
              <Text style={styles.emptyStateTitle}>Brak ulubionych</Text>
              <Text style={styles.emptyStateSubtitle}>Kliknij serce przy zwierzaku, aby dodać go do tej listy.</Text>
            </View>
          )}
        </ScrollView>

        <BottomTabBar activeTab={activeTab} onChange={openTab} hasVisitBadge />
      </View>
    );
  }

  function renderPersonalData() {
    return (
      <View style={styles.screen}>
        <View style={styles.stickyHeader}>
          <Pressable onPress={() => setProfileSubView(null)} style={({ pressed }) => [styles.roundedBackButton, pressed && styles.pressed]}>
            <ChevronLeft color="#0f172a" size={22} strokeWidth={2.25} />
          </Pressable>
          <Text style={styles.stickyHeaderTitle}>Dane osobowe</Text>
        </View>

        <ScrollView contentContainerStyle={styles.formScrollContent} showsVerticalScrollIndicator={false}>
          <InputField label="Imię i nazwisko" defaultValue="Kacper Szczudło" placeholder="Imię i nazwisko" />
          <InputField label="Adres e-mail" defaultValue="kacper@student.pl" placeholder="Adres e-mail" />
          <InputField label="Numer telefonu" defaultValue="+48 123 456 789" placeholder="Numer telefonu" />
          <InputField label="Miasto" defaultValue="Kraków" placeholder="Miasto" />
        </ScrollView>

        <View style={styles.bottomActionBarSingle}>
          <Pressable onPress={() => setProfileSubView(null)} style={({ pressed }) => [styles.fullPrimaryButton, pressed && styles.pressed]}>
            <Text style={styles.fullPrimaryButtonText}>Zapisz zmiany</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  function renderProfile() {
    if (profileSubView === 'dane_osobowe') {
      return renderPersonalData();
    }

    return (
      <View style={styles.screen}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.profileScrollContent}>
          <View style={styles.profileHero}>
            <Text style={styles.profileHeroTitle}>Twój Profil</Text>

            <View style={styles.profileCenterBlock}>
              <View style={styles.avatarWrap}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' }}
                  style={styles.avatar}
                />
                <Pressable style={({ pressed }) => [styles.cameraBadge, pressed && styles.pressed]}>
                  <Camera color="#ffffff" size={16} strokeWidth={2.25} />
                </Pressable>
              </View>

              <Text style={styles.profileName}>Kacper Szczudło</Text>
              <Text style={styles.profileRole}>Wolontariusz PawsConnect</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Spacery</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>1</Text>
              <Text style={styles.statLabel}>Adopcje</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>45h</Text>
              <Text style={styles.statLabel}>Pomocy</Text>
            </View>
          </View>

          <View style={styles.menuCard}>
            <Pressable onPress={() => setProfileSubView('dane_osobowe')} style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconCircle, { backgroundColor: '#fff7ed' }]}>
                  <User color="#f97316" size={18} strokeWidth={2.25} />
                </View>
                <Text style={styles.menuItemText}>Dane osobowe</Text>
              </View>
              <ChevronRight color="#cbd5e1" size={20} strokeWidth={2.25} />
            </Pressable>

            <Pressable style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed, styles.menuItemWithoutBorder]}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconCircle, { backgroundColor: '#eff6ff' }]}>
                  <History color="#2563eb" size={18} strokeWidth={2.25} />
                </View>
                <Text style={styles.menuItemText}>Historia wolontariatu</Text>
              </View>
              <ChevronRight color="#cbd5e1" size={20} strokeWidth={2.25} />
            </Pressable>
          </View>

          <Pressable
            onPress={() => {
              setIsAuthenticated(false);
              setAuthMode('login');
            }}
            style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}
          >
            <Text style={styles.logoutText}>Wyloguj się</Text>
          </Pressable>
        </ScrollView>

        <BottomTabBar activeTab={activeTab} onChange={openTab} hasVisitBadge />
      </View>
    );
  }

  function renderAuth() {
    const isLogin = authMode === 'login';

    return (
      <View style={styles.authScreen}>
        <View style={styles.authBackground} />
        <View style={styles.authGlowLarge} />
        <View style={styles.authGlowSmall} />

        <ScrollView contentContainerStyle={styles.authScrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.authBrandBlock}>
            <View style={styles.authLogoCircle}>
              <PawPrint color="#f97316" size={38} strokeWidth={2.25} />
            </View>
            <Text style={styles.authBrandTitle}>PawsConnect</Text>
            <Text style={styles.authBrandSubtitle}>{isLogin ? 'Witaj ponownie!' : 'Dołącz do nas!'}</Text>
          </View>

          <View style={styles.authCard}>
            <Text style={styles.authCardTitle}>{isLogin ? 'Zaloguj się' : 'Utwórz konto'}</Text>

            {!isLogin ? (
              <InputField
                label="Imię i nazwisko"
                value={authForm.name}
                onChangeText={(value) => setAuthForm((current) => ({ ...current, name: value }))}
                placeholder="Jan Kowalski"
                icon={<User color="#94a3b8" size={18} strokeWidth={2.25} />}
              />
            ) : null}

            <InputField
              label="Adres e-mail"
              value={authForm.email}
              onChangeText={(value) => setAuthForm((current) => ({ ...current, email: value }))}
              placeholder="jan@kowalski.pl"
              icon={<Mail color="#94a3b8" size={18} strokeWidth={2.25} />}
            />

            {!isLogin ? (
              <InputField
                label="Numer telefonu"
                value={authForm.phone}
                onChangeText={(value) => setAuthForm((current) => ({ ...current, phone: value }))}
                placeholder="123 456 789"
                icon={<Phone color="#94a3b8" size={18} strokeWidth={2.25} />}
              />
            ) : null}

            <InputField
              label="Hasło"
              value={authForm.password}
              onChangeText={(value) => setAuthForm((current) => ({ ...current, password: value }))}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              icon={<Lock color="#94a3b8" size={18} strokeWidth={2.25} />}
              rightAction={
                <Pressable onPress={() => setShowPassword((current) => !current)} hitSlop={8}>
                  {showPassword ? (
                    <EyeOff color="#94a3b8" size={18} strokeWidth={2.25} />
                  ) : (
                    <Eye color="#94a3b8" size={18} strokeWidth={2.25} />
                  )}
                </Pressable>
              }
            />

            {isLogin ? <Text style={styles.forgotPasswordText}>Zapomniałeś hasła?</Text> : null}

            <Pressable onPress={submitAuth} style={({ pressed }) => [styles.fullPrimaryButton, pressed && styles.pressed, styles.authPrimaryButton]}>
              <Text style={styles.fullPrimaryButtonText}>{isLogin ? 'Zaloguj się' : 'Zarejestruj się'}</Text>
            </Pressable>

            <View style={styles.authSwitcherRow}>
              <Text style={styles.authSwitcherLabel}>{isLogin ? 'Nie masz konta?' : 'Masz już konto?'}</Text>
              <Pressable onPress={() => setAuthMode(isLogin ? 'register' : 'login')}>
                <Text style={styles.authSwitcherAction}>{isLogin ? 'Zarejestruj się' : 'Zaloguj się'}</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  function renderAuthenticatedApp() {
    if (isFilterOpen) {
      return renderFilters();
    }

    if (selectedAnimalId) {
      return formType ? renderForm() : renderDetails();
    }

    if (activeTab === 'home') {
      return renderFeed();
    }

    if (activeTab === 'favorites') {
      return renderFavorites();
    }

    if (activeTab === 'visits') {
      return renderVisits();
    }

    if (activeTab === 'profile') {
      return renderProfile();
    }

    return renderFeed();
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style={isAuthenticated ? 'dark' : 'light'} />
        {isAuthenticated ? renderAuthenticatedApp() : renderAuth()}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  screen: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  sectionHeader: {
    gap: 4,
  },
  screenTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0f172a',
  },
  screenSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 10,
  },
  locationLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  pawButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffedd5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  searchBox: {
    flex: 1,
    minHeight: 52,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
  filterButton: {
    width: 52,
    height: 52,
    borderRadius: 20,
    backgroundColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#f97316',
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  categoryScroller: {
    maxHeight: 56,
  },
  categoryList: {
    paddingHorizontal: 24,
    paddingVertical: 6,
    gap: 10,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chipFullWidth: {
    flex: 1,
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748b',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 14,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    minHeight: 240,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#334155',
  },
  emptyStateSubtitle: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 21,
    color: '#64748b',
  },
  detailsScrollContent: {
    paddingBottom: 130,
  },
  detailsHero: {
    position: 'relative',
    height: 320,
  },
  detailsImage: {
    width: '100%',
    height: '100%',
  },
  overlayTopBar: {
    position: 'absolute',
    top: 16,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  overlayButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.86)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsSheet: {
    marginTop: -28,
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 20,
  },
  detailsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  detailsHeaderTextWrap: {
    flex: 1,
  },
  detailsName: {
    fontSize: 34,
    fontWeight: '800',
    color: '#0f172a',
  },
  detailsSubtitle: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },
  favoriteCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationInfoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  infoCardRow: {
    flexDirection: 'row',
    gap: 10,
  },
  infoCard: {
    flex: 1,
    borderRadius: 22,
    padding: 14,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoCardIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  infoCardLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  infoCardValue: {
    marginTop: 6,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
  },
  aboutSection: {
    gap: 10,
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  aboutText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#475569',
  },
  detailLine: {
    fontSize: 15,
    color: '#475569',
  },
  bottomActionBar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 18,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  bottomActionBarSingle: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 18,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  secondaryActionButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: '#ffedd5',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  secondaryActionText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ea580c',
  },
  primaryActionButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryActionText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  stickyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  roundedBackButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickyHeaderTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },
  formScrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    gap: 16,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryImage: {
    width: 56,
    height: 56,
    borderRadius: 16,
  },
  summaryContentFlex: {
    flex: 1,
  },
  summaryName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  summaryMeta: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
  },
  fieldBlock: {
    gap: 8,
  },
  fieldLabel: {
    marginLeft: 4,
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputLeftIcon: {
    position: 'absolute',
    left: 16,
    top: 17,
    zIndex: 1,
  },
  inputRightAction: {
    position: 'absolute',
    right: 16,
    top: 17,
    zIndex: 1,
  },
  textInput: {
    minHeight: 54,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '500',
    color: '#334155',
  },
  textInputWithLeftIcon: {
    paddingLeft: 46,
  },
  textInputWithRightAction: {
    paddingRight: 48,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 16,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  columnFlex: {
    flex: 1,
  },
  fullPrimaryButton: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullPrimaryButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  filterSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sliderValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#f97316',
  },
  sliderScale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderScaleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
  },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  panelHeader: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 18,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  segmentedControl: {
    marginTop: 18,
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    padding: 4,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  segmentActive: {
    backgroundColor: '#ffffff',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748b',
  },
  segmentTextActive: {
    color: '#0f172a',
  },
  profileScrollContent: {
    paddingBottom: 24,
    flexGrow: 1,
  },
  profileHero: {
    backgroundColor: '#f97316',
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 34,
    borderBottomLeftRadius: 42,
    borderBottomRightRadius: 42,
  },
  profileHeroTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#ffffff',
  },
  profileCenterBlock: {
    marginTop: 24,
    alignItems: 'center',
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  cameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#ea580c',
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
  },
  profileRole: {
    marginTop: 4,
    fontSize: 14,
    color: '#fed7aa',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    marginTop: -18,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 18,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#f97316',
  },
  statLabel: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  menuCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginHorizontal: 24,
    marginTop: 24,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuItemPressed: {
    backgroundColor: '#f8fafc',
  },
  menuItemWithoutBorder: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#334155',
  },
  logoutButton: {
    marginTop: 16,
    marginHorizontal: 24,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#fecaca',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ef4444',
  },
  authScreen: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  authBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 320,
    backgroundColor: '#f97316',
    borderBottomLeftRadius: 64,
    borderBottomRightRadius: 64,
  },
  authGlowLarge: {
    position: 'absolute',
    top: 48,
    left: 28,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  authGlowSmall: {
    position: 'absolute',
    top: 92,
    right: 34,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  authScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
  },
  authBrandBlock: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 28,
  },
  authLogoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  authBrandTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#ffffff',
  },
  authBrandSubtitle: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: '600',
    color: '#ffedd5',
  },
  authCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 32,
    padding: 24,
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
    elevation: 4,
  },
  authCardTitle: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 20,
  },
  forgotPasswordText: {
    alignSelf: 'flex-end',
    marginBottom: 16,
    fontSize: 12,
    fontWeight: '800',
    color: '#ea580c',
  },
  authPrimaryButton: {
    marginTop: 8,
  },
  authSwitcherRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
  },
  authSwitcherLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  authSwitcherAction: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ea580c',
  },
  pressed: {
    opacity: 0.82,
  },
});
