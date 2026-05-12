import { useShallow } from 'zustand/react/shallow';
import { useShelterAnimalsStore } from './useShelterAnimalsStore';
import { useShelterApplicationsStore } from './useShelterApplicationsStore';

export const useShelterAnimalsHomeSlice = () =>
  useShelterAnimalsStore(
    useShallow((s) => ({
      animals: s.animals,
      isLoading: s.isLoading,
      fetchAnimals: s.fetchAnimals,
    })),
  );

export const useShelterAnimalsCatalogSlice = () =>
  useShelterAnimalsStore(
    useShallow((s) => ({
      animals: s.animals,
      fetchAnimals: s.fetchAnimals,
    })),
  );

export const useShelterAnimalsAdminListSlice = () =>
  useShelterAnimalsStore(
    useShallow((s) => ({
      animals: s.animals,
      isLoading: s.isLoading,
      fetchAnimals: s.fetchAnimals,
      removeAnimal: s.removeAnimal,
    })),
  );

export const useShelterAnimalsFormActionsSlice = () =>
  useShelterAnimalsStore(
    useShallow((s) => ({
      addAnimal: s.addAnimal,
      updateAnimal: s.updateAnimal,
      fetchAnimals: s.fetchAnimals,
    })),
  );

export const useShelterApplicationsAdminSlice = () =>
  useShelterApplicationsStore(
    useShallow((s) => ({
      applications: s.applications,
      fetchApplications: s.fetchApplications,
      updateApplicationStatus: s.updateApplicationStatus,
      updateApplicationMeetingDate: s.updateApplicationMeetingDate,
    })),
  );

export const usePendingShelterApplicationsCount = () =>
  useShelterApplicationsStore((s) => s.applications.filter((a) => a.status === 'Oczekujące').length);
