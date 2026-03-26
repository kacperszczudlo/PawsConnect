import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { PawPrint, Calendar, Home, Check, X } from 'lucide-react-native';
import { useShelterStore } from '../../store/useShelterStore';

export const AdminApplicationsScreen = () => {
  const { applications, fetchApplications, updateApplicationStatus } = useShelterStore();

  useEffect(() => {
    void fetchApplications();
  }, [fetchApplications]);

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc', paddingTop: 64 }}>
      <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: '800', color: '#1e293b' }}>Wnioski</Text>
        <Text style={{ fontSize: 14, fontWeight: '500', color: '#64748b', marginTop: 4 }}>
          Zarządzaj adopcjami i spacerami.
        </Text>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 24 }} contentContainerStyle={{ paddingBottom: 24 }}>
        {applications.map((app) => (
          <View key={app.id} style={{ backgroundColor: '#ffffff', borderRadius: 24, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 1, elevation: 1, borderWidth: 1, borderColor: '#f1f5f9' }}>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f8fafc' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 12, backgroundColor: app.type === 'Adopcja' ? '#fff7ed' : '#eff6ff' }}>
                  {app.type === 'Adopcja' ? <Home size={16} color="#f97316" /> : <Calendar size={16} color="#3b82f6" />}
                </View>
                <View>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1e293b' }}>{app.type}</Text>
                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#64748b', marginTop: 2 }}>{app.date}</Text>
                </View>
              </View>
              
              <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: app.status === 'Zaakceptowane' ? '#ecfdf5' : app.status === 'Odrzucone' ? '#fef2f2' : '#f1f5f9' }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', color: app.status === 'Zaakceptowane' ? '#059669' : app.status === 'Odrzucone' ? '#dc2626' : '#64748b' }}>
                  {app.status}
                </Text>
              </View>
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 12, color: '#64748b', fontWeight: '500', marginBottom: 4 }}>Zgłaszający:</Text>
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#1e293b' }}>{app.applicantName}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                <PawPrint size={14} color="#94a3b8" />
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#475569', marginLeft: 6 }}>
                  Dotyczy: <Text style={{ fontWeight: 'bold', color: '#1e293b' }}>{app.animalName}</Text>
                </Text>
              </View>
            </View>

            {app.status === 'Oczekujące' && (
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f8fafc' }}>
                <TouchableOpacity 
                  onPress={() => updateApplicationStatus(app.id, 'Odrzucone')}
                  style={{ flex: 1, backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fee2e2', paddingVertical: 12, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
                >
                  <X size={16} color="#ef4444" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#dc2626', fontWeight: 'bold', fontSize: 14 }}>Odrzuć</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => updateApplicationStatus(app.id, 'Zaakceptowane')}
                  style={{ flex: 1, backgroundColor: '#10b981', paddingVertical: 12, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 1, elevation: 1 }}
                >
                  <Check size={16} color="white" style={{ marginRight: 8 }} />
                  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>Akceptuj</Text>
                </TouchableOpacity>
              </View>
            )}
            
          </View>
        ))}
      </ScrollView>
    </View>
  );
};
