import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { PawPrint, Calendar, Home, Check, X } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../services/supabase';
import { useShelterApplicationsAdminSlice, type AppStatus } from '../../store/useShelterStore';
import { useAuthStore } from '../../store/useAuthStore';
import { canShelterManageApplication } from '../../utils/shelterAnimalOwnership';
import { useToast } from '../../context/ToastContext';
import type { Application } from '../../domain/shelter';

const formatSubmittedDateOnly = (iso?: string) => {
  if (!iso) {
    return '';
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return '';
  }
  return d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const scheduleSubtitle = (app: Application): string => {
  if (app.type === 'Spacer') {
    return app.date || '—';
  }
  if (app.status === 'Zaakceptowane' && app.date?.trim()) {
    return app.date.trim();
  }
  const d = formatSubmittedDateOnly(app.createdAt);
  return d ? `Złożono: ${d}` : 'Wniosek adopcyjny';
};

const mergeDateTime = (date: string, time: string) => {
  const d = date.trim();
  const t = time.trim();
  if (!d) {
    return null;
  }
  if (!t) {
    return d;
  }
  return `${d} ${t}`;
};

export const AdminApplicationsScreen = () => {
  const user = useAuthStore((state) => state.user);
  const { applications, fetchApplications, updateApplicationStatus } = useShelterApplicationsAdminSlice();
  const { showToast } = useToast();

  const [adoptionModalApp, setAdoptionModalApp] = useState<Application | null>(null);
  const [adoptionDate, setAdoptionDate] = useState('');
  const [adoptionTime, setAdoptionTime] = useState('');

  const runUpdateStatus = useCallback(
    async (applicationId: string, status: AppStatus, options?: { meetingDate?: string | null }) => {
      const result = await updateApplicationStatus(applicationId, status, options);
      if (result.ok) {
        if (status === 'Zaakceptowane') {
          showToast({ type: 'success', message: 'Wniosek został zaakceptowany.' });
        } else if (status === 'Odrzucone') {
          showToast({ type: 'info', message: 'Wniosek został anulowany / odrzucony.' });
        }
        return true;
      }

      if (result.reason === 'conflict') {
        showToast({
          type: 'error',
          title: 'Termin zajęty',
          message: `Inny zaakceptowany spacer (${result.conflict.applicantName}) jest już zaplanowany na ${result.conflict.date}. Pies nie może być na dwóch spacerach jednocześnie.`,
          duration: 6000,
        });
        return false;
      }

      if (result.reason === 'unauthorized' || result.reason === 'not_found') {
        showToast({
          type: 'error',
          title: 'Brak uprawnień',
          message: 'Nie masz uprawnień do aktualizacji tego wniosku.',
        });
        return false;
      }

      showToast({
        type: 'error',
        title: 'Błąd',
        message: result.message ?? 'Nie udało się zaktualizować wniosku.',
      });
      return false;
    },
    [showToast, updateApplicationStatus],
  );

  const myApplications = useMemo(
    () => applications.filter((app) => canShelterManageApplication(app, user)),
    [applications, user],
  );

  useEffect(() => {
    void fetchApplications();
  }, [fetchApplications]);

  useFocusEffect(
    useCallback(() => {
      void fetchApplications();
    }, [fetchApplications]),
  );

  useEffect(() => {
    const channel = supabase
      .channel('admin-applications-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, () => {
        void fetchApplications();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [fetchApplications]);

  const openAdoptionAcceptModal = (app: Application) => {
    setAdoptionDate('');
    setAdoptionTime('');
    setAdoptionModalApp(app);
  };

  const closeAdoptionModal = () => {
    setAdoptionModalApp(null);
  };

  const handleAdoptionAcceptWithoutDate = async () => {
    if (!adoptionModalApp) {
      return;
    }
    const ok = await runUpdateStatus(adoptionModalApp.id, 'Zaakceptowane', { meetingDate: null });
    if (ok) {
      closeAdoptionModal();
    }
  };

  const handleAdoptionAcceptWithDate = async () => {
    if (!adoptionModalApp) {
      return;
    }
    const combined = mergeDateTime(adoptionDate, adoptionTime);
    if (!combined) {
      showToast({ type: 'info', title: 'Data', message: 'Podaj datę spotkania (DD.MM.RRRR).' });
      return;
    }
    const dateOk = /^\d{2}\.\d{2}\.\d{4}$/.test(adoptionDate.trim());
    if (!dateOk) {
      showToast({ type: 'info', title: 'Data', message: 'Użyj formatu DD.MM.RRRR.' });
      return;
    }
    if (adoptionTime.trim() && !/^\d{2}:\d{2}$/.test(adoptionTime.trim())) {
      showToast({ type: 'info', title: 'Godzina', message: 'Użyj formatu GG:MM.' });
      return;
    }
    const ok = await runUpdateStatus(adoptionModalApp.id, 'Zaakceptowane', { meetingDate: combined });
    if (ok) {
      closeAdoptionModal();
    }
  };

  const confirmCancelAccepted = (app: Application) => {
    Alert.alert(
      'Anulować wniosek?',
      'Zmienimy status na „Odrzucone” (np. pomyłka lub rezygnacja).',
      [
        { text: 'Zostaw', style: 'cancel' },
        {
          text: 'Anuluj wniosek',
          style: 'destructive',
          onPress: () => {
            void runUpdateStatus(app.id, 'Odrzucone');
          },
        },
      ],
    );
  };

  const handleDateDigits = (value: string, setter: (v: string) => void) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 8);
    if (digitsOnly.length <= 2) {
      setter(digitsOnly);
      return;
    }
    if (digitsOnly.length <= 4) {
      setter(`${digitsOnly.slice(0, 2)}.${digitsOnly.slice(2)}`);
      return;
    }
    setter(`${digitsOnly.slice(0, 2)}.${digitsOnly.slice(2, 4)}.${digitsOnly.slice(4)}`);
  };

  const handleTimeDigits = (value: string, setter: (v: string) => void) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 4);
    if (digitsOnly.length <= 2) {
      setter(digitsOnly);
      return;
    }
    setter(`${digitsOnly.slice(0, 2)}:${digitsOnly.slice(2)}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc', paddingTop: 64 }}>
      <Modal visible={adoptionModalApp != null} transparent animationType="fade" onRequestClose={closeAdoptionModal}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(15,23,42,0.45)', padding: 24 }}
        >
          <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#1e293b' }}>Akceptacja adopcji</Text>
            <Text style={{ fontSize: 14, color: '#64748b', marginTop: 8, lineHeight: 20 }}>
              Możesz od razu wpisać termin spotkania — pojawi się u użytkownika w aplikacji. Bez terminu: ustalicie go
              telefonicznie.
            </Text>
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#94a3b8', marginTop: 16 }}>DATA (DD.MM.RRRR)</Text>
            <TextInput
              value={adoptionDate}
              onChangeText={(v) => handleDateDigits(v, setAdoptionDate)}
              placeholder="DD.MM.RRRR"
              keyboardType="numeric"
              style={{
                marginTop: 6,
                borderWidth: 1,
                borderColor: '#e2e8f0',
                borderRadius: 12,
                paddingHorizontal: 14,
                height: 48,
                fontSize: 16,
              }}
            />
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#94a3b8', marginTop: 12 }}>GODZINA (opcjonalnie)</Text>
            <TextInput
              value={adoptionTime}
              onChangeText={(v) => handleTimeDigits(v, setAdoptionTime)}
              placeholder="GG:MM"
              keyboardType="numeric"
              style={{
                marginTop: 6,
                borderWidth: 1,
                borderColor: '#e2e8f0',
                borderRadius: 12,
                paddingHorizontal: 14,
                height: 48,
                fontSize: 16,
              }}
            />
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 20 }}>
              <TouchableOpacity
                onPress={closeAdoptionModal}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#e2e8f0',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontWeight: '700', color: '#475569' }}>Zamknij</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  void handleAdoptionAcceptWithoutDate();
                }}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: '#f1f5f9',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontWeight: '700', color: '#334155' }}>Akceptuj bez terminu</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => {
                void handleAdoptionAcceptWithDate();
              }}
              style={{
                marginTop: 10,
                paddingVertical: 14,
                borderRadius: 12,
                backgroundColor: '#10b981',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontWeight: '800', color: '#fff' }}>Akceptuj z terminem</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: '800', color: '#1e293b' }}>Wnioski</Text>
        <Text style={{ fontSize: 14, fontWeight: '500', color: '#64748b', marginTop: 4 }}>
          Zarządzaj adopcjami i spacerami.
        </Text>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 24 }} contentContainerStyle={{ paddingBottom: 24 }}>
        {myApplications.map((app) => (
          <View
            key={app.id}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 24,
              padding: 16,
              marginBottom: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 1,
              elevation: 1,
              borderWidth: 1,
              borderColor: '#f1f5f9',
            }}
          >
            <View
              style={{
                marginBottom: 16,
                paddingBottom: 12,
                borderBottomWidth: 1,
                borderBottomColor: '#f8fafc',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0 }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 10,
                      flexShrink: 0,
                      backgroundColor: app.type === 'Adopcja' ? '#fff7ed' : '#eff6ff',
                    }}
                  >
                    {app.type === 'Adopcja' ? <Home size={16} color="#f97316" /> : <Calendar size={16} color="#3b82f6" />}
                  </View>
                  <Text
                    style={{ fontSize: 15, fontWeight: '800', color: '#1e293b', flexShrink: 1 }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {app.type}
                  </Text>
                </View>
                <View
                  style={{
                    flexShrink: 0,
                    paddingHorizontal: 8,
                    paddingVertical: 5,
                    borderRadius: 8,
                    backgroundColor:
                      app.status === 'Zaakceptowane' ? '#ecfdf5' : app.status === 'Odrzucone' ? '#fef2f2' : '#f1f5f9',
                    maxWidth: '48%',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 9,
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      letterSpacing: 0.2,
                      color:
                        app.status === 'Zaakceptowane' ? '#059669' : app.status === 'Odrzucone' ? '#dc2626' : '#64748b',
                    }}
                    numberOfLines={2}
                  >
                    {app.status}
                  </Text>
                </View>
              </View>
              <Text
                style={{
                  marginTop: 8,
                  marginLeft: 42,
                  fontSize: 11,
                  fontWeight: '600',
                  color: '#64748b',
                  lineHeight: 15,
                }}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {app.type === 'Adopcja' && app.status === 'Zaakceptowane' && app.date?.trim()
                  ? `Termin: ${scheduleSubtitle(app)}`
                  : scheduleSubtitle(app)}
              </Text>
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 12, color: '#64748b', fontWeight: '500', marginBottom: 8 }}>Zgłaszający</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {app.applicantAvatarUrl ? (
                  <Image
                    source={{ uri: app.applicantAvatarUrl }}
                    style={{ width: 48, height: 48, borderRadius: 14, marginRight: 12, backgroundColor: '#f1f5f9' }}
                  />
                ) : (
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      marginRight: 12,
                      backgroundColor: '#e2e8f0',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PawPrint size={22} color="#94a3b8" />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#1e293b' }}>{app.applicantName}</Text>
                  {app.applicantCity ? (
                    <Text style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Miasto: {app.applicantCity}</Text>
                  ) : null}
                </View>
              </View>

              {app.applicantPhone ? (
                <TouchableOpacity
                  onPress={() => {
                    void Linking.openURL(`tel:${app.applicantPhone!.replace(/\s/g, '')}`);
                  }}
                  style={{ marginTop: 10 }}
                >
                  <Text style={{ fontSize: 13, color: '#2563eb', fontWeight: '600' }}>Tel. {app.applicantPhone}</Text>
                </TouchableOpacity>
              ) : (
                <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 10 }}>Brak numeru w profilu wnioskującego</Text>
              )}

              {app.applicantEmail ? (
                <TouchableOpacity
                  onPress={() => {
                    void Linking.openURL(`mailto:${app.applicantEmail}`);
                  }}
                  style={{ marginTop: 6 }}
                >
                  <Text style={{ fontSize: 13, color: '#2563eb', fontWeight: '600' }}>{app.applicantEmail}</Text>
                </TouchableOpacity>
              ) : (
                <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>Brak adresu e-mail w profilu</Text>
              )}

              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14 }}>
                <PawPrint size={14} color="#94a3b8" />
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#475569', marginLeft: 6 }}>
                  Dotyczy: <Text style={{ fontWeight: 'bold', color: '#1e293b' }}>{app.animalName}</Text>
                </Text>
              </View>

              {app.type === 'Adopcja' && app.applicantMessage ? (
                <View
                  style={{
                    marginTop: 14,
                    padding: 12,
                    backgroundColor: '#fffbeb',
                    borderRadius: 12,
                    borderLeftWidth: 3,
                    borderLeftColor: '#f59e0b',
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#92400e', marginBottom: 6 }}>
                    WIADOMOŚĆ OD WNIOSKUJĄCEGO
                  </Text>
                  <Text style={{ fontSize: 14, color: '#78350f', lineHeight: 20 }}>{app.applicantMessage}</Text>
                </View>
              ) : null}

              {app.type === 'Adopcja' && !app.applicantMessage ? (
                <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 10, fontStyle: 'italic' }}>
                  Brak treści opisu w rekordzie wniosku (starsze zgłoszenia).
                </Text>
              ) : null}
            </View>

            {app.status === 'Oczekujące' && (
              <View
                style={{
                  flexDirection: 'row',
                  gap: 8,
                  marginTop: 8,
                  paddingTop: 16,
                  borderTopWidth: 1,
                  borderTopColor: '#f8fafc',
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    void runUpdateStatus(app.id, 'Odrzucone');
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: '#fef2f2',
                    borderWidth: 1,
                    borderColor: '#fee2e2',
                    paddingVertical: 12,
                    borderRadius: 12,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                  }}
                >
                  <X size={16} color="#ef4444" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#dc2626', fontWeight: 'bold', fontSize: 14 }}>Odrzuć</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    if (app.type === 'Adopcja') {
                      openAdoptionAcceptModal(app);
                    } else {
                      void runUpdateStatus(app.id, 'Zaakceptowane');
                    }
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: '#10b981',
                    paddingVertical: 12,
                    borderRadius: 12,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 1,
                    elevation: 1,
                  }}
                >
                  <Check size={16} color="white" style={{ marginRight: 8 }} />
                  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>Akceptuj</Text>
                </TouchableOpacity>
              </View>
            )}

            {app.status === 'Zaakceptowane' && (
              <View style={{ marginTop: 8, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f8fafc' }}>
                <TouchableOpacity
                  onPress={() => confirmCancelAccepted(app)}
                  style={{
                    paddingVertical: 12,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#fecaca',
                    backgroundColor: '#fff1f2',
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                  }}
                >
                  <X size={16} color="#dc2626" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#b91c1c', fontWeight: 'bold', fontSize: 14 }}>Anuluj wniosek</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};
