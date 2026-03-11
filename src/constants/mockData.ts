// src/constants/mockData.ts

export interface Animal {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: string;
  distance: string;
  image: string;
  liked: boolean;
  gender: string;
  weight: string;
  color: string;
  description: string;
}

export interface Visit {
  id: string;
  type: string;
  animalName: string;
  animalImage: string;
  date: string;
  time: string;
  status: 'Zatwierdzone' | 'Oczekujące' | 'Zakończone';
  location: string;
}

// Baza danych zwierzaków
export const ANIMALS: Animal[] = [
  {
    id: '1',
    name: 'Burek',
    type: 'Pies',
    breed: 'Kundelek',
    age: '2 lata',
    distance: '2.5 km',
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    liked: true,
    gender: 'Samiec',
    weight: '12 kg',
    color: 'Brązowy',
    description: 'Burek to bardzo wesoły i energiczny kundelek, który uwielbia długie spacery. Trafił do nas kilka miesięcy temu, znaleziony błąkający się przy lesie. Jest niesamowicie przyjazny w stosunku do ludzi, lubi się bawić i uczy się nowych komend. Idealnie odnajdzie się w aktywnej rodzinie, która poświęci mu trochę czasu na zabawę i naukę.',
  },
  {
    id: '2',
    name: 'Luna',
    type: 'Kot',
    breed: 'Europejski',
    age: '8 mies.',
    distance: '4.1 km',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    liked: false,
    gender: 'Samica',
    weight: '3 kg',
    color: 'Szary / Pręgowany',
    description: 'Luna to młoda kotka pełna ciekawości świata. Uwielbia gonić za laserem i wylegiwać się na słońcu. Jest bardzo łagodna i nadaje się do domu z dziećmi.',
  },
  {
    id: '3',
    name: 'Max',
    type: 'Pies',
    breed: 'Jack Russell',
    age: '4 lata',
    distance: '1.2 km',
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    liked: true,
    gender: 'Samiec',
    weight: '7 kg',
    color: 'Biało-brązowy',
    description: 'Max to wulkan energii! Jak przystało na teriera, potrzebuje dużo ruchu i wyzwań umysłowych. Szukamy dla niego doświadczonego opiekuna.',
  },
  {
    id: '4',
    name: 'Puszek',
    type: 'Kot',
    breed: 'Brytyjski',
    age: '3 lata',
    distance: '5.0 km',
    image: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    liked: false,
    gender: 'Samiec',
    weight: '5.5 kg',
    color: 'Niebieski',
    description: 'Puszek to prawdziwy arystokrata. Ceni sobie spokój, dobre jedzenie i pieszczoty na własnych warunkach. Idealny towarzysz na spokojne wieczory z książką.',
  },
];

// Baza danych wizyt nadchodzących
export const VISITS: Visit[] = [
  {
    id: 'v1',
    type: 'Spacer',
    animalName: 'Burek',
    animalImage: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    date: '15 Marca 2026',
    time: '14:00 - 15:30',
    status: 'Zatwierdzone',
    location: 'Schronisko "Psi Los"',
  },
  {
    id: 'v2',
    type: 'Rozmowa adopcyjna',
    animalName: 'Luna',
    animalImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    date: '18 Marca 2026',
    time: '16:30 - 17:00',
    status: 'Oczekujące',
    location: 'Biuro adopcyjne (Pokój 2)',
  }
];

// Baza danych wizyt historycznych
export const PAST_VISITS: Visit[] = [
  {
    id: 'h1',
    type: 'Spacer',
    animalName: 'Max',
    animalImage: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    date: '10 Marca 2026',
    time: '12:00 - 13:00',
    status: 'Zakończone',
    location: 'Schronisko "Psi Los"',
  },
  {
    id: 'h2',
    type: 'Spacer',
    animalName: 'Burek',
    animalImage: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    date: '02 Marca 2026',
    time: '10:00 - 11:30',
    status: 'Zakończone',
    location: 'Schronisko "Psi Los"',
  }
];

export const CATEGORIES = ['Wszystkie', 'Psy', 'Koty', 'Inne'];