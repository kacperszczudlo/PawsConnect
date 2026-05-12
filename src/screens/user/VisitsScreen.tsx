import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Calendar, Clock, CheckCircle2, XCircle, Timer } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { applicationsRepository, animalsRepository } from '../../repositories';
import type { ShelterAnimalLink } from '../../domain/shelter';

interface UserApplication {
  id: string;
  animal_id: string;
  type: string;
  animal_name: string;
  date: string;
  status: 'Oczekujące' | 'Zaakceptowane' | 'Odrzucone';
  created_at: string;
  shelter_name?: string;
  shelter_address?: string;
  shelter_phone?: string;
  shelter_email?: string;
}

export const VisitsScreen = () => {
  const { user } = useAuthStore();
  const [visits, setVisits] = useState<UserApplication[]>([]);
  const [animalsById, setAnimalsById] = useState<Record<string, ShelterAnimalLink>>({});
  const [mode, setMode] = useState<'upcoming' | 'history'>('upcoming');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserVisits = async () => {
    if (!user) {
      setVisits([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const data = await applicationsRepository.listRowsByApplicantId(user.id);
      setVisits(data);

      const animalIds = Array.from(
        new Set(
          data
            .map((item: { animal_id?: string | null }) => item.animal_id)
            .filter((id): id is string => Boolean(id))
            .map((id) => String(id)),
        ),
      );
      if (animalIds.length > 0) {
        const map = await animalsRepository.fetchShelterLinksByIds(animalIds);
        setAnimalsById(map);
      } else {
        setAnimalsById({});
      }
    } catch {
      setVisits([]);
      setAnimalsById({});
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    void fetchUserVisits();
  }, [user?.id]);

  useFocusEffect(
    React.useCallback(() => {
      void fetchUserVisits();
    }, [user?.id]),
  );

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const channel = supabase
      .channel(`user-applications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'applications',
          filter: `applicant_id=eq.${user.id}`,
        },
        () => {
          void fetchUserVisits();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    void fetchUserVisits();
  };

  const parseVisitDate = (dateValue: string) => {
    const normalized = dateValue.trim();

    // Format: DD.MM.RRRR HH:MM or DD.MM.RRRR
    const match = normalized.match(/^(\d{2})\.(\d{2})\.(\d{4})(?:\s+(\d{2}):(\d{2}))?$/);
    if (match) {
      const day = Number(match[1]);
      const month = Number(match[2]) - 1;
      const year = Number(match[3]);
      const hours = match[4] ? Number(match[4]) : 0;
      const minutes = match[5] ? Number(match[5]) : 0;
      return new Date(year, month, day, hours, minutes, 0, 0);
    }

    const fallback = new Date(normalized);
    if (!Number.isNaN(fallback.getTime())) {
      return fallback;
    }

    return null;
  };

  const filteredVisits = visits.filter((visit) => {
    const isAdoption = visit.type === 'Adopcja';

    if (isAdoption) {
      if (visit.status === 'Odrzucone') {
        return mode === 'history';
      }
      if (visit.status === 'Oczekujące') {
        return mode === 'upcoming';
      }
      // Zaakceptowane: historia dopiero po minionym terminie spotkania (jeśli schronisko go ustawiło).
      const event = parseVisitDate(visit.date?.trim() ?? '');
      if (!event) {
        return mode === 'upcoming';
      }
      const now = new Date();
      if (mode === 'upcoming') {
        return event.getTime() >= now.getTime();
      }
      return event.getTime() < now.getTime();
    }

    const visitDate = parseVisitDate(visit.date);
    const now = new Date();

    if (visit.status === 'Odrzucone') {
      return mode === 'history';
    }

    if (!visitDate) {
      return mode === 'upcoming';
    }

    if (mode === 'upcoming') {
      return visitDate.getTime() >= now.getTime();
    }

    return visitDate.getTime() < now.getTime();
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Zaakceptowane':
        return { color: '#10b981', bg: '#ecfdf5', icon: <CheckCircle2 size={16} color="#10b981" /> };
      case 'Odrzucone':
        return { color: '#ef4444', bg: '#fef2f2', icon: <XCircle size={16} color="#ef4444" /> };
      default:
        return { color: '#f59e0b', bg: '#fffbeb', icon: <Timer size={16} color="#f59e0b" /> };
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc', paddingTop: 60 }}>
      <View style={{ paddingHorizontal: 24, marginBottom: 20 }}>
        <Text style={{ fontSize: 26, fontWeight: '800', color: '#1e293b' }}>Twoje wizyty</Text>
        <Text style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>Śledź status swoich spacerów i adopcji</Text>
        <View style={{ flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 14, padding: 4, gap: 8, marginTop: 16 }}>
          <TouchableOpacity
            onPress={() => setMode('upcoming')}
            style={{
              flex: 1,
              minHeight: 40,
              borderRadius: 10,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: mode === 'upcoming' ? '#ffffff' : 'transparent',
            }}
          >
            <Text style={{ color: mode === 'upcoming' ? '#1e293b' : '#64748b', fontWeight: '700', fontSize: 13 }}>
              Nadchodzące
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMode('history')}
            style={{
              flex: 1,
              minHeight: 40,
              borderRadius: 10,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: mode === 'history' ? '#ffffff' : 'transparent',
            }}
          >
            <Text style={{ color: mode === 'history' ? '#1e293b' : '#64748b', fontWeight: '700', fontSize: 13 }}>
              Historia
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredVisits.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 100 }}>
            <Calendar size={48} color="#cbd5e1" />
            <Text style={{ marginTop: 16, color: '#94a3b8', fontSize: 16, fontWeight: '500' }}>
              {mode === 'upcoming' ? 'Brak nadchodzących wizyt' : 'Brak historii wizyt'}
            </Text>
          </View>
        ) : (
          filteredVisits.map((visit) => {
            const style = getStatusStyle(visit.status);
            const linkedAnimal = animalsById[visit.animal_id];
            const shelterName = visit.shelter_name ?? linkedAnimal?.shelterName ?? linkedAnimal?.city;
            const shelterAddress = visit.shelter_address ?? linkedAnimal?.shelterAddress ?? linkedAnimal?.city;
            const shelterPhone = visit.shelter_phone ?? linkedAnimal?.shelterPhone;
            const shelterEmail = visit.shelter_email ?? linkedAnimal?.shelterEmail;
            return (
              <View
                key={visit.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 20,
                  padding: 18,
                  marginBottom: 16,
                  elevation: 2,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 3,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 10 }}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1e293b' }}>
                      {visit.type}: {visit.animal_name}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 6 }}>
                      {visit.type === 'Adopcja' && visit.status === 'Odrzucone' ? (
                        <Text style={{ color: '#64748b', fontSize: 13, lineHeight: 20 }}>
                          Wniosek odrzucony lub anulowany.
                        </Text>
                      ) : visit.type === 'Adopcja' && visit.status === 'Oczekujące' ? (
                        <Text style={{ color: '#64748b', fontSize: 13, lineHeight: 20 }}>
                          Kontakt ze schroniskiem w ciągu 3 dni roboczych.
                        </Text>
                      ) : visit.type === 'Adopcja' && visit.status === 'Zaakceptowane' && !visit.date?.trim() ? (
                        <Text style={{ color: '#64748b', fontSize: 13, lineHeight: 20 }}>
                          Zaakceptowano. Termin spotkania — ustal ze schroniskiem (kontakt poniżej).
                        </Text>
                      ) : (
                        <>
                          <Clock size={14} color="#64748b" style={{ marginTop: 2 }} />
                          <Text style={{ marginLeft: 6, color: '#64748b', fontSize: 13, flex: 1, lineHeight: 20 }}>
                            {visit.type === 'Adopcja' && visit.status === 'Zaakceptowane' && visit.date?.trim()
                              ? visit.date.trim()
                              : visit.type === 'Adopcja'
                                ? visit.date?.trim() || '—'
                                : visit.date}
                          </Text>
                        </>
                      )}
                    </View>
                  </View>
                  <View
                    style={{
                      flexShrink: 0,
                      alignSelf: 'flex-start',
                      backgroundColor: style.bg,
                      paddingHorizontal: 8,
                      paddingVertical: 6,
                      borderRadius: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      maxWidth: '46%',
                    }}
                  >
                    {style.icon}
                    <Text
                      style={{ marginLeft: 4, color: style.color, fontSize: 10, fontWeight: '700' }}
                      numberOfLines={2}
                    >
                      {visit.status}
                    </Text>
                  </View>
                </View>

                {visit.status === 'Zaakceptowane' && (
                  <View
                    style={{
                      marginTop: 10,
                      padding: 12,
                      backgroundColor: '#f0f9ff',
                      borderRadius: 12,
                      borderLeftWidth: 4,
                      borderLeftColor: '#3b82f6',
                    }}
                  >
                    <Text style={{ fontSize: 12, color: '#0369a1', fontWeight: '500' }}>
                      Pamiętaj o zabraniu dokumentu tożsamości. Do zobaczenia!
                    </Text>
                    <Text style={{ fontSize: 12, color: '#075985', marginTop: 8, fontWeight: '600' }}>
                      {shelterName ? `Schronisko: ${shelterName}` : 'Schronisko: Brak danych'}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#075985', marginTop: 8, fontWeight: '600' }}>
                      Miejsce: {shelterAddress ?? 'Brak adresu'}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#075985', marginTop: 4 }}>
                      Telefon: {shelterPhone ?? 'Brak telefonu'}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#075985', marginTop: 2 }}>
                      E-mail: {shelterEmail ?? 'Brak e-maila'}
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};
