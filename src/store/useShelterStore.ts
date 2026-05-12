export type { Animal, Application, AppStatus, UpdateApplicationStatusResult } from '../domain/shelter';
export { useShelterAnimalsStore } from './useShelterAnimalsStore';
export type { ShelterAnimalsState } from './useShelterAnimalsStore';
export { useShelterApplicationsStore } from './useShelterApplicationsStore';
export type { ShelterApplicationsState } from './useShelterApplicationsStore';

export {
  useShelterAnimalsHomeSlice,
  useShelterAnimalsCatalogSlice,
  useShelterAnimalsAdminListSlice,
  useShelterAnimalsFormActionsSlice,
  useShelterApplicationsAdminSlice,
  usePendingShelterApplicationsCount,
} from './shelterViewHooks';
