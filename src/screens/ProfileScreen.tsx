import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Image, ScrollView } from 'react-native';
import { Camera, ChevronLeft, LogOut, Settings } from 'lucide-react-native';
import { EditProfileForm } from '../components/profile/EditProfileForm';
import { FavoriteAnimalsList } from '../components/profile/FavoriteAnimalsList';
import { ProfileMenuList } from '../components/profile/ProfileMenuList';
import { VisitsList } from '../components/visits/VisitsList';
import { useProfile } from '../hooks/useProfile';
import { ProfileSection, UserProfile } from '../types/profile';

const SECTION_TITLE_MAP: Record<ProfileSection, string> = {
  overview: 'Profil',
  edit: 'Edycja danych',
  myVisits: 'Moje wizyty',
  upcoming: 'Nadchodzące wizyty',
  favorites: 'Ulubione',
  history: 'Historia',
};

export const ProfileScreen = () => {
  const { profile, isLoading, isSaving, error, loadProfile, saveProfile } = useProfile();
  const [section, setSection] = useState<ProfileSection>('overview');
  const [draft, setDraft] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (profile) {
      setDraft(profile);
    }
  }, [profile]);

  const canGoBack = section !== 'overview';

  const handleGoBack = useCallback(() => {
    setSection('overview');
  }, []);

  const handleChangeDraft = useCallback(
    <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
      setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
    },
    [],
  );

  const handleSaveProfile = useCallback(async () => {
    if (!draft) {
      return;
    }

    const success = await saveProfile(draft);
    if (success) {
      setSection('overview');
    }
  }, [draft, saveProfile]);

  const sectionTitle = useMemo(() => SECTION_TITLE_MAP[section], [section]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.containerCentered}>
        <Text style={styles.loadingText}>Ładowanie profilu...</Text>
      </SafeAreaView>
    );
  }

  if (!profile || !draft) {
    return (
      <SafeAreaView style={styles.containerCentered}>
        <Text style={styles.errorText}>{error ?? 'Brak danych profilu.'}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={loadProfile}>
          <Text style={styles.retryBtnText}>Spróbuj ponownie</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {section === 'overview' ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.hero}>
            <View style={styles.heroTopRow}>
              <Text style={styles.heroTitle}>Twój Profil</Text>
              <TouchableOpacity style={styles.settingsBtn} onPress={() => setSection('edit')}>
                <Settings size={18} color="#f97316" />
              </TouchableOpacity>
            </View>

            <View style={styles.avatarWrap}>
              <View style={styles.avatarRing}>
                <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
              </View>
              <TouchableOpacity style={styles.cameraBtn}>
                <Camera size={14} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={styles.heroName}>{profile.fullName}</Text>
            <Text style={styles.heroSubtitle}>Wolontariusz PawsConnect</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>SPACERY</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>1</Text>
              <Text style={styles.statLabel}>ADOPCJE</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>45h</Text>
              <Text style={styles.statLabel}>POMOCY</Text>
            </View>
          </View>

          <ProfileMenuList onSelect={setSection} />

          <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.9}>
            <LogOut size={18} color="#ef4444" />
            <Text style={styles.logoutText}>Wyloguj się</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <View style={styles.subSectionContainer}>
          <View style={styles.header}>
            {canGoBack ? (
              <TouchableOpacity style={styles.backBtn} onPress={handleGoBack}>
                <ChevronLeft size={20} color="#1e293b" />
              </TouchableOpacity>
            ) : (
              <View style={styles.backBtnPlaceholder} />
            )}

            <Text style={styles.title}>{sectionTitle}</Text>
            <View style={styles.backBtnPlaceholder} />
          </View>

          {error ? <Text style={styles.errorInline}>{error}</Text> : null}

          {section === 'edit' ? (
            <EditProfileForm
              profile={draft}
              isSaving={isSaving}
              onChange={handleChangeDraft}
              onSave={handleSaveProfile}
              onCancel={handleGoBack}
            />
          ) : null}

          {section === 'myVisits' ? <VisitsList mode="all" /> : null}
          {section === 'upcoming' ? <VisitsList mode="upcoming" /> : null}
          {section === 'history' ? <VisitsList mode="history" /> : null}
          {section === 'favorites' ? <FavoriteAnimalsList /> : null}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  hero: {
    backgroundColor: '#f97316',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 30,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    alignItems: 'center',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '800',
  },
  heroTopRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingsBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrap: {
    marginTop: 18,
    position: 'relative',
  },
  avatarRing: {
    width: 98,
    height: 98,
    borderRadius: 49,
    backgroundColor: '#fff',
    padding: 4,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
  },
  cameraBtn: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ea580c',
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    color: '#fed7aa',
    marginTop: 4,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginTop: -18,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    color: '#f97316',
    fontWeight: '800',
    fontSize: 22,
  },
  statLabel: {
    marginTop: 2,
    color: '#64748b',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  logoutBtn: {
    marginTop: 16,
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutText: {
    color: '#ef4444',
    fontWeight: '800',
  },
  subSectionContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  containerCentered: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  backBtnPlaceholder: {
    width: 40,
    height: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
  },
  loadingText: {
    color: '#64748b',
    fontSize: 14,
  },
  errorText: {
    color: '#b91c1c',
    marginBottom: 10,
  },
  errorInline: {
    color: '#b91c1c',
    marginBottom: 8,
  },
  retryBtn: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  retryBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
});
