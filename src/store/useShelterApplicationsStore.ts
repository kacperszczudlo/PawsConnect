import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { applicationsRepository } from '../repositories';
import type { AppStatus, Application, UpdateApplicationStatusResult } from '../domain/shelter';

export interface ShelterApplicationsState {
  applications: Application[];
  fetchApplications: () => Promise<void>;
  updateApplicationStatus: (id: string, status: AppStatus) => Promise<UpdateApplicationStatusResult>;
}

export const useShelterApplicationsStore = create<ShelterApplicationsState>((set, get) => ({
  applications: [],

  fetchApplications: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) {
      set({ applications: [] });
      return;
    }

    const emailTrimmed = user.email?.trim() ?? '';
    const applications = await applicationsRepository.listForShelterAccount({
      userId: user.id,
      emailTrimmed,
    });
    set({ applications });
  },

  updateApplicationStatus: async (id, status) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) {
      console.error('Błąd aktualizacji wniosku: brak zalogowanego użytkownika.');
      return { ok: false, reason: 'unauthorized' };
    }

    const emailTrimmed = user.email?.trim() ?? '';

    if (status === 'Zaakceptowane') {
      const target = get().applications.find((app) => app.id === id);

      if (target && target.type === 'Spacer' && target.animalId && target.date) {
        const conflictResult = await applicationsRepository.getAcceptedWalkConflict({
          animalId: target.animalId,
          date: target.date,
          excludeApplicationId: id,
        });

        if (!conflictResult.ok && conflictResult.reason === 'error') {
          console.error('Błąd sprawdzania kolizji spaceru:', conflictResult.message);
          return { ok: false, reason: 'error', message: conflictResult.message };
        }

        if (!conflictResult.ok && conflictResult.reason === 'conflict') {
          return {
            ok: false,
            reason: 'conflict',
            conflict: {
              applicantName: conflictResult.conflict.applicantName,
              date: conflictResult.conflict.date,
              animalName: conflictResult.conflict.animalName ?? target.animalName,
            },
          };
        }
      }
    }

    const result = await applicationsRepository.updateStatusOwnedByShelter({
      applicationId: id,
      status,
      userId: user.id,
      emailTrimmed,
    });

    if (result.ok) {
      set((state) => ({
        applications: state.applications.map((app) =>
          app.id === id ? { ...app, status, shelterUserId: app.shelterUserId ?? user.id } : app,
        ),
      }));
    } else if (result.reason === 'not_found') {
      console.warn(`Aktualizacja wniosku nie zmieniła rekordu (id=${id}). Brak uprawnień.`);
    } else if (result.reason === 'error') {
      console.error('Błąd aktualizacji statusu wniosku:', result.message);
    } else if (result.reason === 'unauthorized') {
      console.warn(
        'Brak kolumny shelter_user_id i brak e-maila konta — uruchom migrację SQL lub ustaw e-mail schroniska.',
      );
    }

    return result;
  },
}));
