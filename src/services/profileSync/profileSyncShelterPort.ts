import type { Animal, Application } from '../../domain/shelter';

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
