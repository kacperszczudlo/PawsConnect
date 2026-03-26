import { create } from 'zustand';
import { supabase } from '../services/supabase';

export type AppStatus = 'Oczekujące' | 'Zaakceptowane' | 'Odrzucone';

export interface Application {
  id: string;
  type: 'Adopcja' | 'Spacer';
  animalName: string;
  applicantName: string;
  date: string;
  status: AppStatus;
}

export interface Animal {
  id: string;
  name: string;
  city?: string;
  type: string;
  breed: string;
  age: string;
  description?: string;
  image: string;
  sex?: string;
  distance?: string;
  liked?: boolean;
  gender?: string;
  weight?: string;
  color?: string;
}

interface ShelterState {
  animals: Animal[];
  applications: Application[];
  isLoading: boolean;

  fetchAnimals: () => Promise<void>;
  addAnimal: (animal: Omit<Animal, 'id'>) => Promise<void>;
  removeAnimal: (id: string) => Promise<void>;
  fetchApplications: () => Promise<void>;
  updateApplicationStatus: (id: string, status: AppStatus) => Promise<void>;
}

export const useShelterStore = create<ShelterState>((set, get) => ({
  animals: [],
  isLoading: false,
  applications: [],

  // POBIERANIE Z BAZY
  fetchAnimals: async () => {
    set({ isLoading: true });
    const { data, error } = await supabase.from('animals').select('*').order('created_at', { ascending: false });
    
    if (!error && data) {
      set({ animals: data, isLoading: false });
    } else {
      console.error("Błąd pobierania zwierząt:", error);
      set({ isLoading: false });
    }
  },

  // DODAWANIE DO BAZY
  addAnimal: async (animalData) => {
    const { data, error } = await supabase.from('animals').insert([animalData]).select();
    
    if (!error && data) {
      // Aktualizujemy stan lokalny o nowo dodanego zwierzaka
      set((state) => ({ animals: [data[0], ...state.animals] }));
    } else {
      console.error("Błąd dodawania zwierzaka:", error);
    }
  },

  // USUWANIE Z BAZY
  removeAnimal: async (id) => {
    const { error } = await supabase.from('animals').delete().eq('id', id);

    if (!error) {
      set((state) => ({ animals: state.animals.filter((a) => a.id !== id) }));
    } else {
      console.error('Błąd usuwania zwierzaka:', error);
    }
  },

  // POBIERANIE WNIOSKÓW Z BAZY
  fetchApplications: async () => {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.error('Błąd pobierania wniosków:', error);
      return;
    }

    const mapped: Application[] = data.map((row: any) => ({
      id: String(row.id),
      type: row.type === 'Spacer' ? 'Spacer' : 'Adopcja',
      animalName: row.animal_name ?? row.animalName ?? 'Nieznane zwierzę',
      applicantName: row.applicant_name ?? row.applicantName ?? 'Nieznany użytkownik',
      date: row.date ?? row.created_at ?? '',
      status: (row.status as AppStatus) ?? 'Oczekujące',
    }));

    set({ applications: mapped });
  },

  // AKTUALIZACJA STATUSU WNIOSKU W BAZIE
  updateApplicationStatus: async (id, status) => {
    const { error } = await supabase.from('applications').update({ status }).eq('id', id);

    if (error) {
      console.error('Błąd aktualizacji statusu wniosku:', error);
      return;
    }

    set((state) => ({
      applications: state.applications.map((app) =>
        app.id === id ? { ...app, status } : app,
      ),
    }));
  },
}));