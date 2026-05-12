import type { SupabaseClient } from '@supabase/supabase-js';
import type { AppStatus, Application, UpdateApplicationStatusResult } from '../domain/shelter';
import { normalizeApplication } from '../domain/shelter';

export interface ApplicationsRepository {
  listForShelterAccount(params: { userId: string; emailTrimmed: string }): Promise<Application[]>;
  listRowsByApplicantId(applicantId: string): Promise<any[]>;
  submitUserApplication(row: Record<string, unknown>): Promise<{ ok: true } | { ok: false; error: unknown }>;
  getAcceptedWalkConflict(params: {
    animalId: string;
    date: string;
    excludeApplicationId: string;
  }): Promise<
    | { ok: true; conflict: null }
    | {
        ok: false;
        reason: 'conflict';
        conflict: { applicantName: string; date: string; animalName: string };
      }
    | { ok: false; reason: 'error'; message: string }
  >;
  updateStatusOwnedByShelter(params: {
    applicationId: string;
    status: AppStatus;
    userId: string;
    emailTrimmed: string;
  }): Promise<UpdateApplicationStatusResult>;
}

export const createApplicationsRepository = (client: SupabaseClient): ApplicationsRepository => ({
  async listForShelterAccount({ userId, emailTrimmed }) {
    const owned = await client
      .from('applications')
      .select('*')
      .eq('shelter_user_id', userId)
      .order('created_at', { ascending: false });

    const shelterUserIdMissing = owned.error?.code === '42703';

    let rows: any[] = owned.data ?? [];

    if (owned.error && !shelterUserIdMissing) {
      console.error('Błąd pobierania wniosków:', owned.error);
      return [];
    }

    if (shelterUserIdMissing) {
      if (!emailTrimmed) {
        console.warn(
          'Brak kolumny applications.shelter_user_id i brak e-maila konta — dodaj migrację lub ustaw e-mail schroniska.',
        );
        return [];
      }

      const byEmail = await client
        .from('applications')
        .select('*')
        .eq('shelter_email', emailTrimmed)
        .order('created_at', { ascending: false });

      if (byEmail.error) {
        console.error('Błąd pobierania wniosków:', byEmail.error);
        return [];
      }

      return (byEmail.data ?? []).map(normalizeApplication);
    }

    if (emailTrimmed) {
      const legacy = await client
        .from('applications')
        .select('*')
        .is('shelter_user_id', null)
        .eq('shelter_email', emailTrimmed)
        .order('created_at', { ascending: false });

      if (!legacy.error && legacy.data?.length) {
        const seen = new Set(rows.map((r) => String(r.id)));
        for (const r of legacy.data) {
          const rid = String(r.id);
          if (!seen.has(rid)) {
            rows.push(r);
            seen.add(rid);
          }
        }
        rows.sort(
          (a, b) =>
            new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime(),
        );
      } else if (legacy.error) {
        console.warn('Błąd pobierania starszych wniosków:', legacy.error);
      }
    }

    return rows.map(normalizeApplication);
  },

  async listRowsByApplicantId(applicantId: string) {
    const { data, error } = await client
      .from('applications')
      .select('*')
      .eq('applicant_id', applicantId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }
    return data;
  },

  async submitUserApplication(row) {
    const insertRow: Record<string, unknown> = { ...row };
    let { error } = await client.from('applications').insert([insertRow]);
    if (error && (error as { code?: string }).code === '42703' && insertRow.shelter_user_id != null) {
      delete insertRow.shelter_user_id;
      ({ error } = await client.from('applications').insert([insertRow]));
    }
    if (error) {
      return { ok: false as const, error };
    }
    return { ok: true as const };
  },

  async getAcceptedWalkConflict({ animalId, date, excludeApplicationId }) {
    const { data: conflictRows, error: conflictError } = await client
      .from('applications')
      .select('id, applicant_name, date, animal_name')
      .eq('animal_id', animalId)
      .eq('date', date)
      .eq('type', 'Spacer')
      .eq('status', 'Zaakceptowane')
      .neq('id', excludeApplicationId)
      .limit(1);

    if (conflictError) {
      return { ok: false, reason: 'error' as const, message: conflictError.message };
    }

    const conflictRow = conflictRows?.[0];
    if (conflictRow) {
      return {
        ok: false,
        reason: 'conflict' as const,
        conflict: {
          applicantName: conflictRow.applicant_name ?? 'inny użytkownik',
          date: conflictRow.date ?? date,
          animalName: conflictRow.animal_name ?? 'Nieznane zwierzę',
        },
      };
    }

    return { ok: true, conflict: null };
  },

  async updateStatusOwnedByShelter({ applicationId, status, userId, emailTrimmed }) {
    const owned = await client
      .from('applications')
      .update({ status })
      .eq('id', applicationId)
      .eq('shelter_user_id', userId)
      .select('id');

    let updated = (owned.data?.length ?? 0) > 0;
    let error = owned.error;

    if (error?.code === '42703') {
      error = null;
      updated = false;
      if (!emailTrimmed) {
        return { ok: false, reason: 'unauthorized' };
      }

      const fallback = await client
        .from('applications')
        .update({ status })
        .eq('id', applicationId)
        .eq('shelter_email', emailTrimmed)
        .select('id');

      updated = (fallback.data?.length ?? 0) > 0;
      error = fallback.error;
    } else if (!error && !updated && emailTrimmed) {
      const legacy = await client
        .from('applications')
        .update({ status, shelter_user_id: userId })
        .eq('id', applicationId)
        .is('shelter_user_id', null)
        .eq('shelter_email', emailTrimmed)
        .select('id');

      if (legacy.error?.code === '42703') {
        const fallbackLegacy = await client
          .from('applications')
          .update({ status })
          .eq('id', applicationId)
          .eq('shelter_email', emailTrimmed)
          .select('id');

        updated = (fallbackLegacy.data?.length ?? 0) > 0;
        error = fallbackLegacy.error;
      } else {
        updated = (legacy.data?.length ?? 0) > 0;
        error = legacy.error;
      }
    }

    if (error) {
      return { ok: false, reason: 'error', message: error.message };
    }

    if (!updated) {
      return { ok: false, reason: 'not_found' };
    }

    return { ok: true };
  },
});
