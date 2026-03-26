import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Plus, Trash2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useShelterStore } from '../../store/useShelterStore';

export const AdminAnimalsScreen = () => {
  const navigation = useNavigation();
  const { animals, removeAnimal, fetchAnimals, isLoading } = useShelterStore();

  useEffect(() => {
    fetchAnimals();
  }, []);

  if (isLoading && animals.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc', paddingTop: 48 }}>
      <View style={{ paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <View>
          <Text style={{ fontSize: 24, fontWeight: '800', color: '#1e293b' }}>Podopieczni</Text>
          <Text style={{ fontSize: 14, fontWeight: '500', color: '#64748b', marginTop: 4 }}>Zarządzaj profilami zwierząt</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 24 }} contentContainerStyle={{ paddingBottom: 24 }}>
        <TouchableOpacity 
          onPress={() => navigation.navigate('AddAnimal' as never)}
          style={{ width: '100%', backgroundColor: '#ecfdf5', borderWidth: 2, borderColor: '#a7f3d0', borderStyle: 'dashed', borderRadius: 24, padding: 16, marginBottom: 24, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}
        >
          <View style={{ width: 40, height: 40, backgroundColor: '#d1fae5', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
            <Plus size={20} color="#10b981" />
          </View>
          <Text style={{ fontWeight: 'bold', color: '#059669', fontSize: 16 }}>Dodaj nowego zwierzaka</Text>
        </TouchableOpacity>

        {animals.map((animal) => (
          <View key={animal.id} style={{ backgroundColor: '#ffffff', borderRadius: 24, padding: 12, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 1, elevation: 1, borderWidth: 1, borderColor: '#e2e8f0', flexDirection: 'row', alignItems: 'center' }}>
            <Image source={{ uri: animal.image }} style={{ width: 80, height: 80, borderRadius: 16, marginRight: 16, resizeMode: 'cover' }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '800', color: '#1e293b', fontSize: 18 }}>{animal.name}</Text>
              <Text style={{ fontSize: 12, color: '#64748b', fontWeight: '500', marginBottom: 8 }}>{animal.type} • {animal.breed}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ backgroundColor: '#ecfdf5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#059669' }}>{animal.age}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity onPress={() => removeAnimal(animal.id)} style={{ padding: 12, backgroundColor: '#fee2e2', borderRadius: 12 }}>
              <Trash2 size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};