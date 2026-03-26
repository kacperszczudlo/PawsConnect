import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { ChevronLeft, Camera } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useShelterStore } from '../../store/useShelterStore';
import { useAuthStore } from '../../store/useAuthStore';

export const AddAnimalScreen = () => {
  const navigation = useNavigation();
  const { addAnimal } = useShelterStore();
  const { user } = useAuthStore();
  const adminCity = user?.user_metadata?.city || 'Nieznane';

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [breed, setBreed] = useState('');
  const [weight, setWeight] = useState('');
  const [color, setColor] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  const [type, setType] = useState('Pies');
  const [sex, setSex] = useState('Samiec');
  const [age, setAge] = useState('Młody');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handlePublish = async () => {
    if (!name) {
      Alert.alert('Brak danych', 'Proszę podać przynajmniej imię zwierzaka.');
      return;
    }

    await addAnimal({
      name: name.trim(),
      city: adminCity,
      type: type,
      sex: sex,
      age: age,
      breed: breed.trim() || 'Mieszaniec',
      weight: weight.trim() || 'Nieznana',
      color: color.trim() || 'Nieznane',
      description: description.trim(),
      image: imageUri || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
    });

    Alert.alert('Sukces!', 'Ogłoszenie zostało opublikowane.');
    navigation.goBack();
  };

  const SelectorGroup = ({ label, options, selected, onSelect }: { label: string, options: string[], selected: string, onSelect: (val: string) => void }) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginLeft: 4, marginBottom: 6 }}>{label}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {options.map(opt => (
          <TouchableOpacity
            key={opt}
            onPress={() => onSelect(opt)}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 12,
              backgroundColor: selected === opt ? '#10b981' : 'white',
              borderWidth: 1,
              borderColor: selected === opt ? '#10b981' : '#e2e8f0',
            }}
          >
            <Text style={{ color: selected === opt ? 'white' : '#64748b', fontWeight: 'bold', fontSize: 14 }}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc', paddingTop: 48 }}>
      <View style={{ paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ width: 40, height: 40, backgroundColor: 'white', borderRadius: 20, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 1, elevation: 1, borderWidth: 1, borderColor: '#f1f5f9', marginRight: 16 }}
        >
          <ChevronLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '800', color: '#1e293b' }}>Nowe ogłoszenie</Text>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 24 }} contentContainerStyle={{ paddingBottom: 40 }}>

        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginLeft: 4, marginBottom: 6 }}>Zdjęcie zwierzaka</Text>
          <TouchableOpacity
            onPress={pickImage}
            style={{ width: '100%', height: 160, backgroundColor: 'white', borderWidth: 2, borderColor: '#a7f3d0', borderStyle: 'dashed', borderRadius: 16, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
            ) : (
              <View style={{ alignItems: 'center' }}>
                <Camera size={32} color="#10b981" style={{ marginBottom: 8 }} />
                <Text style={{ color: '#059669', fontWeight: 'bold', fontSize: 14 }}>Kliknij, aby wgrać zdjęcie</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ gap: 16, marginBottom: 8 }}>
          <View>
            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginLeft: 4, marginBottom: 6 }}>Imię zwierzaka</Text>
            <TextInput value={name} onChangeText={setName} placeholder="np. Reksio" style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, fontSize: 15, color: '#1e293b' }} />
          </View>
        </View>

        <SelectorGroup label="Gatunek" options={['Pies', 'Kot', 'Inne']} selected={type} onSelect={setType} />
        <SelectorGroup label="Płeć" options={['Samiec', 'Samica']} selected={sex} onSelect={setSex} />
        <SelectorGroup label="Wiek" options={['Szczeniak/Kocię', 'Młody', 'Dorosły', 'Senior']} selected={age} onSelect={setAge} />

        <View style={{ gap: 16 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginLeft: 4, marginBottom: 6 }}>Waga</Text>
              <TextInput value={weight} onChangeText={setWeight} placeholder="np. 12 kg" style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, fontSize: 15, color: '#1e293b' }} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginLeft: 4, marginBottom: 6 }}>Umaszczenie</Text>
              <TextInput value={color} onChangeText={setColor} placeholder="np. Czarne" style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, fontSize: 15, color: '#1e293b' }} />
            </View>
          </View>

          <View>
            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginLeft: 4, marginBottom: 6 }}>Rasa</Text>
            <TextInput value={breed} onChangeText={setBreed} placeholder="np. Mieszaniec" style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, fontSize: 15, color: '#1e293b' }} />
          </View>

          <View>
            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginLeft: 4, marginBottom: 6 }}>Krótki opis</Text>
            <TextInput value={description} onChangeText={setDescription} placeholder="Napisz coś o zwierzaku..." multiline style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, fontSize: 15, color: '#1e293b', height: 100, textAlignVertical: 'top' }} />
          </View>

          <TouchableOpacity
            onPress={handlePublish}
            style={{ width: '100%', backgroundColor: '#10b981', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8, shadowColor: '#10b981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Opublikuj ogłoszenie</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
};
