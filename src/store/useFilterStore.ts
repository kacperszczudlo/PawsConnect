import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

interface FilterState {
  selectedCity: string;
  selectedType: string | null;
  setCity: (city: string) => void;
  setType: (type: string | null) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  selectedCity: 'Cała Polska',
  selectedType: null,
  setCity: (city) => set({ selectedCity: city }),
  setType: (type) => set({ selectedType: type }),
  resetFilters: () => set({ selectedCity: 'Cała Polska', selectedType: null }),
}));

/** Home: tylko wartości filtrów (bez setterów). */
export const useFilterSelectionSlice = () =>
  useFilterStore(useShallow((s) => ({ selectedCity: s.selectedCity, selectedType: s.selectedType })));

/** Ekran filtrów: stan + akcje. */
export const useFilterEditorSlice = () =>
  useFilterStore(
    useShallow((s) => ({
      selectedCity: s.selectedCity,
      selectedType: s.selectedType,
      setCity: s.setCity,
      setType: s.setType,
      resetFilters: s.resetFilters,
    })),
  );
