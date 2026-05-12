import type { SupabaseClient } from '@supabase/supabase-js';
import type { AppStatus, Application, UpdateApplicationStatusResult } from '../domain/shelter';
import { normalizeApplication } from '../domain/shelter';
import { APPLICANT_OPTIONAL_INSERT_KEYS, isSchemaOrMissingColumnError } from '../utils/supabaseColumnErrors';

const mergeRowWithApplicantSnapshot = async (client: SupabaseClient, row: any): Promise<any> => {
  if (!row?.id || !row?.applicant_id) {
    return row;
  }

  const { data, error } = await client.rpc('shelter_application_applicant_snapshot', {
    p_application_id: row.id,
  });

  if (error || data == null || typeof data !== 'object') {
    return row;
  }

  const s = data as Record<string, unknown>;
  const pick = (rowVal: unknown, snapVal: unknown) => {
    const a = rowVal != null && String(rowVal).trim() !== '' ? String(rowVal).trim() : '';
    const b = snapVal != null && String(snapVal).trim() !== '' ? String(snapVal).trim() : '';
    return a || b || rowVal;
  };

  return {
    ...row,
    applicant_email: pick(row.applicant_email, s.email),
    applicant_phone: pick(row.applicant_phone, s.phone),
    applicant_city: pick(row.applicant_city, s.city),
    applicant_avatar_url: pick(row.applicant_avatar_url, s.avatar_url),
    applicant_name: pick(row.applicant_name, s.full_name) || row.applicant_name,
  };
};

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
    /** Ustawiane przy akceptacji adopcji (termin spotkania). `null` czyści pole. Brak klucza = bez zmiany `date`. */
    meetingDate?: string | null;
  }): Promise<UpdateApplicationStatusResult>;
}

const stripApplicantOptionalInsertFields = (row: Record<string, unknown>) => {
  for (const k of APPLICANT_OPTIONAL_INSERT_KEYS) {
    delete row[k];
  }
};

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

      rows = byEmail.data ?? [];
    } else if (emailTrimmed) {
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

    const enriched: any[] = [];
    for (const r of rows) {
      enriched.push(await mergeRowWithApplicantSnapshot(client, r));
    }

    return enriched.map(normalizeApplication);
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
    let lastError: unknown;

    for (let attempt = 0; attempt < 8; attempt++) {
      const { error } = await client.from('applications').insert([insertRow]);
      if (!error) {
        return { ok: true as const };
      }

      lastError = error;
      const err = error as { code?: string; message?: string };
      const msg = (err.message ?? '').toLowerCase();

      if (err.code === '42703' && insertRow.shelter_user_id != null && msg.includes('shelter_user_id')) {
        delete insertRow.shelter_user_id;
        continue;
      }

      if (isSchemaOrMissingColumnError(error)) {
        let stripped = false;
        for (const k of APPLICANT_OPTIONAL_INSERT_KEYS) {
          if (k in insertRow) {
            delete insertRow[k];
            stripped = true;
          }
        }
        if (stripped) {
          continue;
        }
      }

      return { ok: false as const, error };
    }

    return { ok: false as const, error: lastError };
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

  async updateStatusOwnedByShelter({ applicationId, status, userId, emailTrimmed, meetingDate }) {
    const patch: Record<string, unknown> = { status };
    if (meetingDate !== undefined) {
      patch.date = meetingDate;
    }

    const owned = await client
      .from('applications')
      .update(patch)
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
        .update(patch)
        .eq('id', applicationId)
        .eq('shelter_email', emailTrimmed)
        .select('id');

      updated = (fallback.data?.length ?? 0) > 0;
      error = fallback.error;
    } else if (!error && !updated && emailTrimmed) {
      const legacy = await client
        .from('applications')
        .update({ ...patch, shelter_user_id: userId })
        .eq('id', applicationId)
        .is('shelter_user_id', null)
        .eq('shelter_email', emailTrimmed)
        .select('id');

      if (legacy.error?.code === '42703') {
        const fallbackLegacy = await client
          .from('applications')
          .update(patch)
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
