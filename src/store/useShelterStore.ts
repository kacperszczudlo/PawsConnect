/**
 * Punkt wejścia dla stanu schroniska po fazie 3 (ISP / cieńsze powierzchnie API).
 * — Zwierzęta: useShelterAnimalsStore
 * — Wnioski: useShelterApplicationsStore
 * — Faza 5 (ISP): shelterViewHooks — wąskie selektory useShallow / licznik.
 */
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
