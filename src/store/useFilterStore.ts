import { create } from 'zustand';

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
