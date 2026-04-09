import { create } from 'zustand';
import { supabase } from '../services/supabase';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface FavoritesState {
  favorites: string[];
  fetchFavorites: (userId: string | undefined) => Promise<void>;
  toggleFavorite: (userId: string | undefined, animalId: string) => Promise<boolean>;
  isFavorite: (animalId: string) => boolean;
}

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

const favoritesFetchInFlight = new Map<string, Promise<void>>();

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  fetchFavorites: async (userId) => {
    if (!userId || !UUID_REGEX.test(userId)) {
      set({ favorites: [] });
      return;
    }

    if (favoritesFetchInFlight.has(userId)) {
      return favoritesFetchInFlight.get(userId);
    }

    const inFlight = (async () => {
      try {
        const { data, error } = await supabase
          .from('favorites')
          .select('animal_id')
          .eq('user_id', userId);

        if (error) {
          if (error.code === '22P02' || error.code === '42501') {
            set({ favorites: [] });
            return;
          }

          console.warn(`Błąd pobierania ulubionych: code=${error.code ?? 'unknown'} message=${error.message} details=${error.details ?? '-'} hint=${error.hint ?? '-'}`);
          return;
        }

        if (data) {
          set({ favorites: data.map((f: { animal_id: string }) => f.animal_id) });
        }
      } catch (error) {
        console.warn(`Błąd pobierania ulubionych (exception): ${formatError(error)}`);
        set({ favorites: [] });
      }
    })();

    favoritesFetchInFlight.set(userId, inFlight);

    try {
      return await inFlight;
    } finally {
      favoritesFetchInFlight.delete(userId);
    }
  },
  toggleFavorite: async (userId, animalId) => {
    if (!userId) {
      return false;
    }

    const isFav = get().favorites.includes(animalId);

    try {
      if (isFav) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('animal_id', animalId);

        if (error) {
          console.warn(`Błąd usuwania ulubionego: code=${error.code ?? 'unknown'} message=${error.message} details=${error.details ?? '-'} hint=${error.hint ?? '-'}`);
          return false;
        }

        set({ favorites: get().favorites.filter((id) => id !== animalId) });
        return true;
      }

      const { error } = await supabase
        .from('favorites')
        .insert([{ user_id: userId, animal_id: animalId }]);

      if (error) {
        console.warn(`Błąd dodawania ulubionego: code=${error.code ?? 'unknown'} message=${error.message} details=${error.details ?? '-'} hint=${error.hint ?? '-'}`);
        return false;
      }

      set({ favorites: [...get().favorites, animalId] });
      return true;
    } catch (error) {
      console.warn(`Błąd zapisu ulubionego (exception): ${formatError(error)}`);
      return false;
    }
  },
  isFavorite: (animalId) => get().favorites.includes(animalId),
}));