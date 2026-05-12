import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

import { ALL_POLAND_CITY_LABEL } from '../constants/cities';

interface FilterState {
  selectedCity: string;
  selectedType: string | null;
  setCity: (city: string) => void;
  setType: (type: string | null) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  selectedCity: ALL_POLAND_CITY_LABEL,
  selectedType: null,
  setCity: (city) => set({ selectedCity: city }),
  setType: (type) => set({ selectedType: type }),
  resetFilters: () => set({ selectedCity: ALL_POLAND_CITY_LABEL, selectedType: null }),
}));

export const useFilterSelectionSlice = () =>
  useFilterStore(useShallow((s) => ({ selectedCity: s.selectedCity, selectedType: s.selectedType })));

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
