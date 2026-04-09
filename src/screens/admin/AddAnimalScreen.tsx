import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { ChevronLeft, Camera } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Animal, useShelterStore } from '../../store/useShelterStore';
import { useAuthStore } from '../../store/useAuthStore';
import { uploadAnimalImage } from '../../services/imageService';

export const AddAnimalScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const editingAnimal = route.params?.animal as Animal | undefined;
  const { addAnimal, updateAnimal, fetchAnimals } = useShelterStore();
  const { user } = useAuthStore();
  const adminCity = user?.user_metadata?.city || 'Nieznane';
  const adminShelterName = user?.user_metadata?.shelter_name || 'Schronisko';
  const adminStreet = user?.user_metadata?.shelter_street || '';
  const adminPostalCode = user?.user_metadata?.shelter_postal_code || '';
  const adminPhone = user?.user_metadata?.phone || '';
  const adminEmail = user?.email || '';
  const adminAddress = [adminCity, adminStreet, adminPostalCode].filter(Boolean).join(', ');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [breed, setBreed] = useState('');
  const [weight, setWeight] = useState('');
  const [color, setColor] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageAsset, setImageAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [type, setType] = useState('Pies');
  const [sex, setSex] = useState('Samiec');
  const [age, setAge] = useState('Młody');

  useEffect(() => {
    if (!editingAnimal) {
      return;
    }

    setName(editingAnimal.name ?? '');
    setDescription(editingAnimal.description ?? '');
    setBreed(editingAnimal.breed ?? '');
    setWeight(editingAnimal.weight ?? '');
    setColor(editingAnimal.color ?? '');
    setImageUri(editingAnimal.image ?? null);
    setImageAsset(null);
    setType(editingAnimal.type ?? 'Pies');
    setSex(editingAnimal.sex ?? 'Samiec');
    setAge(editingAnimal.age ?? 'Młody');
  }, [editingAnimal]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setImageAsset(asset);
      setImageUri(asset.uri);
    }
  };

  const handlePublish = async () => {
    if (!name) {
      Alert.alert('Brak danych', 'Proszę podać przynajmniej imię zwierzaka.');
      return;
    }

    if (!adminShelterName.trim() || !adminAddress.trim() || !adminPhone.trim() || !adminEmail.trim()) {
      Alert.alert('Brak danych', 'Uzupełnij dane schroniska w Ustawieniach (nazwa, adres, telefon, e-mail).');
      return;
    }

    let finalImageUrl = imageUri || editingAnimal?.image || '';

    if (imageAsset) {
      setIsUploading(true);
      try {
        const uploadedUrl = await uploadAnimalImage(imageAsset, user?.id || 'unknown');
        if (!uploadedUrl) {
          Alert.alert('Błąd', 'Nie udało się wgrać zdjęcia. Spróbuj ponownie.');
          setIsUploading(false);
          return;
        }
        finalImageUrl = uploadedUrl;
      } catch (error) {
        Alert.alert('Błąd', 'Błąd podczas wgrywania zdjęcia.');
        setIsUploading(false);
        return;
      }
    }

    if (!finalImageUrl && !editingAnimal) {
      Alert.alert('Brak zdjęcia', 'Dodaj zdjęcie zwierzaka przed publikacją.');
      setIsUploading(false);
      return;
    }

    const payload = {
      name: name.trim(),
      city: adminCity,
      shelterName: adminShelterName.trim(),
      shelterAddress: adminAddress.trim(),
      shelterPhone: adminPhone.trim(),
      shelterEmail: adminEmail.trim(),
      type,
      sex,
      age,
      breed: breed.trim() || 'Mieszaniec',
      weight: weight.trim() || 'Nieznana',
      color: color.trim() || 'Nieznane',
      description: description.trim(),
      image: finalImageUrl.trim(),
    };

    try {
      const success = editingAnimal
        ? await updateAnimal(editingAnimal.id, payload)
        : await addAnimal(payload);

      if (!success) {
        Alert.alert('Błąd', editingAnimal ? 'Nie udało się zaktualizować ogłoszenia.' : 'Nie udało się opublikować ogłoszenia.');
        setIsUploading(false);
        return;
      }

      await fetchAnimals();
      Alert.alert('Sukces!', editingAnimal ? 'Ogłoszenie zostało zaktualizowane.' : 'Ogłoszenie zostało opublikowane.');
      setIsUploading(false);
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Błąd', error?.message ?? 'Wystąpił błąd podczas zapisu ogłoszenia.');
      setIsUploading(false);
    }
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
        <Text style={{ fontSize: 20, fontWeight: '800', color: '#1e293b' }}>
          {editingAnimal ? 'Edytuj ogłoszenie' : 'Nowe ogłoszenie'}
        </Text>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 24 }} contentContainerStyle={{ paddingBottom: 40 }}>

        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginLeft: 4, marginBottom: 6 }}>Zdjęcie zwierzaka</Text>
          <TouchableOpacity
            onPress={pickImage}
            style={{ width: '100%', height: 160, backgroundColor: 'white', borderWidth: 2, borderColor: '#a7f3d0', borderStyle: 'dashed', borderRadius: 16, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} resizeMode="cover" style={{ width: '100%', height: '100%' }} />
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

        <View style={{ gap: 16, marginBottom: 8 }}>
          <View>
            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginLeft: 4, marginBottom: 6 }}>Dane schroniska (z profilu)</Text>
            <View style={{ backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14 }}>
              <Text style={{ color: '#1e293b', fontSize: 14, fontWeight: '700', marginBottom: 4 }}>{adminShelterName || 'Brak nazwy schroniska'}</Text>
              <Text style={{ color: '#475569', fontSize: 13 }}>{adminAddress || 'Brak adresu schroniska'}</Text>
              <Text style={{ color: '#475569', fontSize: 13, marginTop: 3 }}>{adminPhone || 'Brak telefonu kontaktowego'}</Text>
              <Text style={{ color: '#475569', fontSize: 13, marginTop: 3 }}>{adminEmail || 'Brak e-maila kontaktowego'}</Text>
            </View>
          </View>
        </View>

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
            disabled={isUploading}
            style={{ width: '100%', backgroundColor: isUploading ? '#cbd5e1' : '#10b981', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8, shadowColor: '#10b981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 }}
          >
            {isUploading ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Wgrywanie zdjęcia...</Text>
              </View>
            ) : (
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Opublikuj ogłoszenie</Text>
            )}
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
};
