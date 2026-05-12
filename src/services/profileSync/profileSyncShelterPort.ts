import type { Animal, Application } from '../../domain/shelter';

/** Lokalna synchronizacja listy po zmianie danych schroniska w profilu (warstwa cache/UI). */
export interface AdminProfileLocalSyncArgs {
  userId: string;
  previousEmail: string;
  previousShelterName: string;
  previousPhone: string;
  previousCity: string;
  nextName: string;
  nextCity: string;
  shelterAddress: string;
  nextPhone: string;
  nextEmail: string;
}

/**
 * Port odwraca zależność: logika sync profilu nie zna Zustand ani kształtu store.
 * Implementacja podłączana z ekranów (adapter → store’y schroniska).
 */
export interface ProfileSyncShelterPort {
  getAnimals: () => Animal[];
  getApplications: () => Application[];
  applyAdminProfileLocalSync: (args: AdminProfileLocalSyncArgs) => void;
  applyUserApplicantNameLocalSync: (args: {
    userId: string;
    originalFullName: string;
    nextName: string;
    nextEmail: string;
    nextPhone: string;
    nextCity: string;
    nextAvatarUrl: string | null;
  }) => void;
  refreshShelterLists: () => Promise<void>;
}
