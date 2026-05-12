import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { animalsRepository } from '../repositories';
import type { Animal } from '../domain/shelter';

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

export interface ShelterAnimalsState {
  animals: Animal[];
  isLoading: boolean;
  fetchAnimals: () => Promise<void>;
  addAnimal: (animal: Omit<Animal, 'id'>) => Promise<boolean>;
  updateAnimal: (id: string, animal: Omit<Animal, 'id'>) => Promise<boolean>;
  removeAnimal: (id: string) => Promise<void>;
}

export const useShelterAnimalsStore = create<ShelterAnimalsState>((set) => ({
  animals: [],
  isLoading: false,

  fetchAnimals: async () => {
    if (animalsFetchInFlight) {
      return animalsFetchInFlight;
    }

    animalsFetchInFlight = (async () => {
      set({ isLoading: true });
      try {
        const animals = await animalsRepository.listAllOrdered();
        set({ animals, isLoading: false });
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

    const result = await animalsRepository.insertForShelterUser(animalData, user.id);

    if (result.ok) {
      set((state) => ({ animals: [result.animal, ...state.animals] }));
      return true;
    }

    return false;
  },

  updateAnimal: async (id, animalData) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) {
      console.error('Błąd aktualizacji zwierzaka: brak zalogowanego użytkownika.');
      return false;
    }

    const result = await animalsRepository.updateOwnedByShelter(id, animalData, {
      userId: user.id,
      email: user.email ?? null,
    });

    if (result.ok) {
      set((state) => ({
        animals: state.animals.map((animal) => (animal.id === id ? result.animal : animal)),
      }));
      return true;
    }

    console.warn(
      `Aktualizacja zwierzaka nie zmieniła żadnego rekordu (id=${id}). Brak uprawnień lub rekord nie istnieje.`,
    );
    return false;
  },

  removeAnimal: async (id) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) {
      console.error('Błąd usuwania zwierzaka: brak zalogowanego użytkownika.');
      return;
    }

    const deleted = await animalsRepository.deleteOwnedByShelter(id, {
      userId: user.id,
      email: user.email ?? null,
    });

    if (deleted) {
      set((state) => ({ animals: state.animals.filter((a) => a.id !== id) }));
    } else {
      console.warn(`Usunięcie zwierzaka nie zmieniło żadnego rekordu (id=${id}). Brak uprawnień.`);
    }
  },
}));
