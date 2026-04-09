import { create } from 'zustand';
import { supabase } from '../services/supabase';

export type AppStatus = 'Oczekujące' | 'Zaakceptowane' | 'Odrzucone';

export interface Application {
  id: string;
  type: 'Adopcja' | 'Spacer';
  animalName: string;
  animalId?: string;
  applicantName: string;
  date: string;
  status: AppStatus;
  shelterName?: string;
  shelterAddress?: string;
  shelterPhone?: string;
  shelterEmail?: string;
}

export interface Animal {
  id: string;
  name: string;
  city?: string;
  shelterName?: string;
  shelterAddress?: string;
  shelterPhone?: string;
  shelterEmail?: string;
  type: string;
  breed: string;
  age: string;
  description?: string;
  image: string;
  sex?: string;
  liked?: boolean;
  gender?: string;
  weight?: string;
  color?: string;
}

const normalizeAnimal = (row: any): Animal => ({
  id: String(row.id),
  name: row.name ?? '',
  city: row.city ?? row.shelter_city ?? undefined,
  shelterName: row.shelterName ?? row.shelter_name ?? undefined,
  shelterAddress: row.shelterAddress ?? row.shelter_address ?? undefined,
  shelterPhone: row.shelterPhone ?? row.shelter_phone ?? undefined,
  shelterEmail: row.shelterEmail ?? row.shelter_email ?? undefined,
  type: row.type ?? '',
  breed: row.breed ?? '',
  age: row.age ?? '',
  description: row.description ?? undefined,
  image: row.image ?? row.image_url ?? '',
  sex: row.sex ?? undefined,
  liked: row.liked ?? undefined,
  gender: row.gender ?? undefined,
  weight: row.weight ?? undefined,
  color: row.color ?? undefined,
});

const serializeAnimal = (animal: Omit<Animal, 'id'>) => ({
  name: animal.name,
  city: animal.city,
  shelter_name: animal.shelterName,
  shelter_address: animal.shelterAddress,
  shelter_phone: animal.shelterPhone,
  shelter_email: animal.shelterEmail,
  type: animal.type,
  breed: animal.breed,
  age: animal.age,
  description: animal.description,
  image: animal.image,
  sex: animal.sex,
  weight: animal.weight,
  color: animal.color,
});

const ANIMALS_LIST_SELECT =
  'id,name,city,shelter_name,shelter_address,shelter_phone,shelter_email,type,breed,age,description,image,sex,weight,color';

const formatError = (error: unknown) => {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
};

let animalsFetchInFlight: Promise<void> | null = null;

interface ShelterState {
  animals: Animal[];
  applications: Application[];
  isLoading: boolean;

  fetchAnimals: () => Promise<void>;
  addAnimal: (animal: Omit<Animal, 'id'>) => Promise<boolean>;
  updateAnimal: (id: string, animal: Omit<Animal, 'id'>) => Promise<boolean>;
  removeAnimal: (id: string) => Promise<void>;
  fetchApplications: () => Promise<void>;
  updateApplicationStatus: (id: string, status: AppStatus) => Promise<void>;
}

export const useShelterStore = create<ShelterState>((set, get) => ({
  animals: [],
  isLoading: false,
  applications: [],

  fetchAnimals: async () => {
    if (animalsFetchInFlight) {
      return animalsFetchInFlight;
    }

    animalsFetchInFlight = (async () => {
    set({ isLoading: true });
    try {
      const primary = await supabase
        .from('animals')
        .select(ANIMALS_LIST_SELECT)
        .order('created_at', { ascending: false });

      if (primary.error?.code === '42703') {
        const fallback = await supabase
          .from('animals')
          .select('id,name,city,type,breed,age,description,image,sex,weight,color')
          .order('created_at', { ascending: false });

        if (!fallback.error && fallback.data) {
          set({ animals: fallback.data.map(normalizeAnimal), isLoading: false });
        } else {
          console.warn(`Błąd pobierania zwierząt: code=${fallback.error?.code ?? 'unknown'} message=${fallback.error?.message ?? 'unknown'} details=${fallback.error?.details ?? '-'} hint=${fallback.error?.hint ?? '-'}`);
          set({ isLoading: false });
        }
      } else {
        if (!primary.error && primary.data) {
          set({ animals: primary.data.map(normalizeAnimal), isLoading: false });
        } else {
          console.warn(`Błąd pobierania zwierząt: code=${primary.error?.code ?? 'unknown'} message=${primary.error?.message ?? 'unknown'} details=${primary.error?.details ?? '-'} hint=${primary.error?.hint ?? '-'}`);
          set({ isLoading: false });
        }
      }
    } catch (error) {
      console.warn(`Błąd pobierania zwierząt (exception): ${formatError(error)}`);
      set({ isLoading: false });
    }
    })();

    try {
      await animalsFetchInFlight;
    } finally {
      animalsFetchInFlight = null;
    }
  },

  addAnimal: async (animalData) => {
    const { data, error } = await supabase.from('animals').insert([serializeAnimal(animalData)]).select();
    
    if (!error && data && data.length > 0) {
      set((state) => ({ animals: [normalizeAnimal(data[0]), ...state.animals] }));
      return true;
    } else {
      console.error("Błąd dodawania zwierzaka:", error);
      return false;
    }
  },

  updateAnimal: async (id, animalData) => {
    const { data, error } = await supabase
      .from('animals')
      .update(serializeAnimal(animalData))
      .eq('id', id)
      .select('id');

    if (!error && (data?.length ?? 0) > 0) {
      set((state) => ({
        animals: state.animals.map((animal) =>
          animal.id === id ? normalizeAnimal({ ...animal, ...animalData, id }) : animal,
        ),
      }));
      return true;
    } else {
      if (!error) {
        console.warn(
          `Aktualizacja zwierzaka nie zmieniła żadnego rekordu (id=${id}). Sprawdź polityki RLS lub czy rekord nadal istnieje.`,
        );
      } else {
        console.error('Błąd aktualizacji zwierzaka:', error?.message ?? error);
      }
      return false;
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
      animalId: row.animal_id ? String(row.animal_id) : undefined,
      animalName: row.animal_name ?? row.animalName ?? 'Nieznane zwierzę',
      applicantName: row.applicant_name ?? row.applicantName ?? 'Nieznany użytkownik',
      date: row.date ?? row.created_at ?? '',
      status: (row.status as AppStatus) ?? 'Oczekujące',
      shelterName: row.shelter_name ?? row.shelterName ?? undefined,
      shelterAddress: row.shelter_address ?? row.shelterAddress ?? undefined,
      shelterPhone: row.shelter_phone ?? row.shelterPhone ?? undefined,
      shelterEmail: row.shelter_email ?? row.shelterEmail ?? undefined,
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