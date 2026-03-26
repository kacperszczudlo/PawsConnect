import { create } from 'zustand';
import { supabase } from '../services/supabase';

interface FavoritesState {
  favorites: string[];
  fetchFavorites: (userId: string) => Promise<void>;
  toggleFavorite: (userId: string | undefined, animalId: string) => Promise<boolean>;
  isFavorite: (animalId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  fetchFavorites: async (userId) => {
    const { data, error } = await supabase
      .from('favorites')
      .select('animal_id')
      .eq('user_id', userId);

    if (error) {
      console.error('Błąd pobierania ulubionych:', error);
      return;
    }

    if (data) {
      set({ favorites: data.map((f: { animal_id: string }) => f.animal_id) });
    }
  },
  toggleFavorite: async (userId, animalId) => {
    if (!userId) {
      return false;
    }

    const isFav = get().favorites.includes(animalId);

    if (isFav) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('animal_id', animalId);

      if (error) {
        console.error('Błąd usuwania ulubionego:', error);
        return false;
      }

      set({ favorites: get().favorites.filter((id) => id !== animalId) });
      return true;
    }

    const { error } = await supabase
      .from('favorites')
      .insert([{ user_id: userId, animal_id: animalId }]);

    if (error) {
      console.error('Błąd dodawania ulubionego:', error);
      return false;
    }

    set({ favorites: [...get().favorites, animalId] });
    return true;
  },
  isFavorite: (animalId) => get().favorites.includes(animalId),
}));