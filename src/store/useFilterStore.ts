import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

import { ALL_POLAND_CITY_LABEL } from '../constants/cities';

export type CityRefCoords = { lat: number; lon: number };

interface FilterState {
  selectedCity: string;
  selectedCityRef: CityRefCoords | null;
  selectedType: string | null;
  setCity: (city: string, ref?: CityRefCoords | null) => void;
  setType: (type: string | null) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  selectedCity: ALL_POLAND_CITY_LABEL,
  selectedCityRef: null,
  selectedType: null,
  setCity: (city, ref) =>
    set({
      selectedCity: city,
      selectedCityRef: city === ALL_POLAND_CITY_LABEL ? null : ref === undefined ? null : ref,
    }),
  setType: (type) => set({ selectedType: type }),
  resetFilters: () =>
    set({ selectedCity: ALL_POLAND_CITY_LABEL, selectedCityRef: null, selectedType: null }),
}));

export const useFilterSelectionSlice = () =>
  useFilterStore(
    useShallow((s) => ({
      selectedCity: s.selectedCity,
      selectedCityRef: s.selectedCityRef,
      selectedType: s.selectedType,
    })),
  );

export const useFilterEditorSlice = () =>
  useFilterStore(
    useShallow((s) => ({
      selectedCity: s.selectedCity,
      selectedCityRef: s.selectedCityRef,
      selectedType: s.selectedType,
      setCity: s.setCity,
      setType: s.setType,
      resetFilters: s.resetFilters,
    })),
  );
