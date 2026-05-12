import { useShelterAnimalsStore } from '../../store/useShelterAnimalsStore';
import { useShelterApplicationsStore } from '../../store/useShelterApplicationsStore';
import type { AdminProfileLocalSyncArgs, ProfileSyncShelterPort } from './profileSyncShelterPort';

export const zustandProfileSyncShelterAdapter: ProfileSyncShelterPort = {
  getAnimals: () => useShelterAnimalsStore.getState().animals,
  getApplications: () => useShelterApplicationsStore.getState().applications,

  applyAdminProfileLocalSync: ({
    userId,
    previousEmail,
    previousShelterName,
    previousPhone,
    previousCity,
    nextName,
    nextCity,
    shelterAddress,
    nextPhone,
    nextEmail,
  }: AdminProfileLocalSyncArgs) => {
    useShelterAnimalsStore.setState((state) => ({
      ...state,
      animals: state.animals.map((animal) => {
        const matches =
          (animal.shelterEmail ?? '').trim() === previousEmail ||
          (animal.shelterName ?? '').trim() === previousShelterName ||
          (animal.shelterPhone ?? '').trim() === previousPhone ||
          (animal.city ?? '').trim() === previousCity;

        if (!matches) {
          return animal;
        }

        return {
          ...animal,
          shelterName: nextName,
          city: nextCity,
          shelterAddress,
          shelterPhone: nextPhone,
          shelterEmail: nextEmail,
        };
      }),
    }));

    useShelterApplicationsStore.setState((state) => ({
      ...state,
      applications: state.applications.map((application) => {
        if (application.shelterUserId && application.shelterUserId !== userId) {
          return application;
        }

        const matches =
          (application.shelterEmail ?? '').trim() === previousEmail ||
          (application.shelterName ?? '').trim() === previousShelterName ||
          (application.shelterPhone ?? '').trim() === previousPhone;

        if (!matches) {
          return application;
        }

        return {
          ...application,
          shelterName: nextName,
          shelterAddress,
          shelterPhone: nextPhone,
          shelterEmail: nextEmail,
        };
      }),
    }));
  },

  applyUserApplicantNameLocalSync: ({
    userId,
    originalFullName,
    nextName,
    nextEmail,
    nextPhone,
    nextCity,
    nextAvatarUrl,
  }) => {
    useShelterApplicationsStore.setState((state) => ({
      ...state,
      applications: state.applications.map((application) => {
        const idMatch = application.applicantId === userId;
        const nameMatch =
          application.applicantName === originalFullName || application.applicantName === nextName;
        if (!idMatch && !nameMatch) {
          return application;
        }
        return {
          ...application,
          applicantName: nextName,
          applicantEmail: nextEmail,
          applicantPhone: nextPhone,
          applicantCity: nextCity,
        applicantAvatarUrl: nextAvatarUrl?.trim() || undefined,
        };
      }),
    }));
  },

  refreshShelterLists: async () => {
    await Promise.all([
      useShelterAnimalsStore.getState().fetchAnimals(),
      useShelterApplicationsStore.getState().fetchApplications(),
    ]);
  },
};
