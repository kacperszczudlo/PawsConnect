import React, { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';
import { ANIMALS } from '../constants/mockData';

interface FavoritesContextValue {
  favoriteIds: string[];
  isFavorite: (animalId: string) => boolean;
  toggleFavorite: (animalId: string) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

const initialFavoriteIds = ANIMALS.filter((animal) => animal.liked).map((animal) => animal.id);

export const FavoritesProvider = ({ children }: PropsWithChildren) => {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(initialFavoriteIds);

  const toggleFavorite = useCallback((animalId: string) => {
    setFavoriteIds((prev) => {
      if (prev.includes(animalId)) {
        return prev.filter((id) => id !== animalId);
      }
      return [...prev, animalId];
    });
  }, []);

  const isFavorite = useCallback(
    (animalId: string) => favoriteIds.includes(animalId),
    [favoriteIds],
  );

  const value = useMemo(
    () => ({ favoriteIds, isFavorite, toggleFavorite }),
    [favoriteIds, isFavorite, toggleFavorite],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }

  return context;
};
