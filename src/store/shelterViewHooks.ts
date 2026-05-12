import { useShallow } from 'zustand/react/shallow';
import { useShelterAnimalsStore } from './useShelterAnimalsStore';
import { useShelterApplicationsStore } from './useShelterApplicationsStore';

/** Home: lista, loader, odświeżanie. */
export const useShelterAnimalsHomeSlice = () =>
  useShelterAnimalsStore(
    useShallow((s) => ({
      animals: s.animals,
      isLoading: s.isLoading,
      fetchAnimals: s.fetchAnimals,
    })),
  );

/** Ulubione / lista na profilu: tylko katalog + fetch. */
export const useShelterAnimalsCatalogSlice = () =>
  useShelterAnimalsStore(
    useShallow((s) => ({
      animals: s.animals,
      fetchAnimals: s.fetchAnimals,
    })),
  );

/** Panel admina: lista własnych zwierząt + CRUD fetch + loader. */
export const useShelterAnimalsAdminListSlice = () =>
  useShelterAnimalsStore(
    useShallow((s) => ({
      animals: s.animals,
      isLoading: s.isLoading,
      fetchAnimals: s.fetchAnimals,
      removeAnimal: s.removeAnimal,
    })),
  );

/** Formularz dodawania / edycji zwierzęcia. */
export const useShelterAnimalsFormActionsSlice = () =>
  useShelterAnimalsStore(
    useShallow((s) => ({
      addAnimal: s.addAnimal,
      updateAnimal: s.updateAnimal,
      fetchAnimals: s.fetchAnimals,
    })),
  );

/** Lista wniosków schroniska + akcje. */
export const useShelterApplicationsAdminSlice = () =>
  useShelterApplicationsStore(
    useShallow((s) => ({
      applications: s.applications,
      fetchApplications: s.fetchApplications,
      updateApplicationStatus: s.updateApplicationStatus,
    })),
  );

/** Badge zakładki: liczba oczekujących wniosków. */
export const usePendingShelterApplicationsCount = () =>
  useShelterApplicationsStore((s) => s.applications.filter((a) => a.status === 'Oczekujące').length);
