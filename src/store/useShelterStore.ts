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
  /** Konto schroniska (Supabase auth.users.id), które utworzyło ogłoszenie */
  shelterUserId?: string;
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
  shelterUserId:
    row.shelterUserId != null
      ? String(row.shelterUserId)
      : row.shelter_user_id != null
        ? String(row.shelter_user_id)
        : undefined,
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
  'id,name,city,shelter_user_id,shelter_name,shelter_address,shelter_phone,shelter_email,type,breed,age,description,image,sex,weight,color';

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

export const useShelterStore = create<ShelterState>((set) => ({
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
          .select(
            'id,name,city,shelter_name,shelter_address,shelter_phone,shelter_email,type,breed,age,description,image,sex,weight,color',
          )
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
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) {
      console.error('Błąd dodawania zwierzaka: brak zalogowanego użytkownika.');
      return false;
    }

    const { data, error } = await supabase
      .from('animals')
      .insert([{ ...serializeAnimal(animalData), shelter_user_id: user.id }])
      .select(ANIMALS_LIST_SELECT);

    if (!error && data && data.length > 0) {
      set((state) => ({ animals: [normalizeAnimal(data[0]), ...state.animals] }));
      return true;
    } else {
      console.error('Błąd dodawania zwierzaka:', error);
      return false;
    }
  },

  updateAnimal: async (id, animalData) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) {
      console.error('Błąd aktualizacji zwierzaka: brak zalogowanego użytkownika.');
      return false;
    }

    const payload = serializeAnimal(animalData);

    const owned = await supabase
      .from('animals')
      .update(payload)
      .eq('id', id)
      .eq('shelter_user_id', user.id)
      .select(ANIMALS_LIST_SELECT);

    let row = owned.data?.[0];
    let error = owned.error;

    if (!error && !row && user.email) {
      const legacy = await supabase
        .from('animals')
        .update({ ...payload, shelter_user_id: user.id })
        .eq('id', id)
        .is('shelter_user_id', null)
        .eq('shelter_email', user.email)
        .select(ANIMALS_LIST_SELECT);

      row = legacy.data?.[0];
      error = legacy.error;
    }

    if (!error && row) {
      set((state) => ({
        animals: state.animals.map((animal) => (animal.id === id ? normalizeAnimal(row) : animal)),
      }));
      return true;
    }

    if (!error && !row) {
      console.warn(
        `Aktualizacja zwierzaka nie zmieniła żadnego rekordu (id=${id}). Brak uprawnień lub rekord nie istnieje.`,
      );
    } else if (error) {
      console.error('Błąd aktualizacji zwierzaka:', error?.message ?? error);
    }
    return false;
  },

  // USUWANIE Z BAZY
  removeAnimal: async (id) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) {
      console.error('Błąd usuwania zwierzaka: brak zalogowanego użytkownika.');
      return;
    }

    const primary = await supabase.from('animals').delete().eq('id', id).eq('shelter_user_id', user.id).select('id');

    let deleted = (primary.data?.length ?? 0) > 0;
    let error = primary.error;

    if (!error && !deleted && user.email) {
      const legacy = await supabase
        .from('animals')
        .delete()
        .eq('id', id)
        .is('shelter_user_id', null)
        .eq('shelter_email', user.email)
        .select('id');

      deleted = (legacy.data?.length ?? 0) > 0;
      error = legacy.error;
    }

    if (!error && deleted) {
      set((state) => ({ animals: state.animals.filter((a) => a.id !== id) }));
    } else if (error) {
      console.error('Błąd usuwania zwierzaka:', error);
    } else {
      console.warn(`Usunięcie zwierzaka nie zmieniło żadnego rekordu (id=${id}). Brak uprawnień.`);
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