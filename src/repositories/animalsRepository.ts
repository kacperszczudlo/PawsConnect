import type { SupabaseClient } from '@supabase/supabase-js';
import type { Animal, ShelterAnimalLink } from '../domain/shelter';
import {
  ANIMALS_FALLBACK_SELECT,
  ANIMALS_LIST_SELECT,
  isMissingShelterUserIdColumnError,
  mapRowToShelterAnimalLink,
  normalizeAnimal,
  serializeAnimal,
} from '../domain/shelter';

export interface AnimalsRepository {
  listAllOrdered(): Promise<Animal[]>;
  fetchById(id: string): Promise<Animal | null>;
  fetchShelterLinksByIds(ids: string[]): Promise<Record<string, ShelterAnimalLink>>;
  insertForShelterUser(animal: Omit<Animal, 'id'>, shelterUserId: string): Promise<{ ok: true; animal: Animal } | { ok: false }>;
  updateOwnedByShelter(
    id: string,
    animal: Omit<Animal, 'id'>,
    ctx: { userId: string; email: string | null },
  ): Promise<{ ok: true; animal: Animal } | { ok: false }>;
  deleteOwnedByShelter(id: string, ctx: { userId: string; email: string | null }): Promise<boolean>;
}

export const createAnimalsRepository = (client: SupabaseClient): AnimalsRepository => ({
  async listAllOrdered() {
    const primary = await client
      .from('animals')
      .select(ANIMALS_LIST_SELECT)
      .order('created_at', { ascending: false });

    if (isMissingShelterUserIdColumnError(primary.error)) {
      const fallback = await client
        .from('animals')
        .select(ANIMALS_FALLBACK_SELECT)
        .order('created_at', { ascending: false });

      if (!fallback.error && fallback.data) {
        return fallback.data.map(normalizeAnimal);
      }
      if (fallback.error) {
        console.warn(
          `Błąd pobierania zwierząt: code=${fallback.error?.code ?? 'unknown'} message=${fallback.error?.message ?? 'unknown'} details=${fallback.error?.details ?? '-'} hint=${fallback.error?.hint ?? '-'}`,
        );
      }
      return [];
    }

    if (!primary.error && primary.data) {
      return primary.data.map(normalizeAnimal);
    }
    if (primary.error) {
      console.warn(
        `Błąd pobierania zwierząt: code=${primary.error?.code ?? 'unknown'} message=${primary.error?.message ?? 'unknown'} details=${primary.error?.details ?? '-'} hint=${primary.error?.hint ?? '-'}`,
      );
    }
    return [];
  },

  async fetchById(id: string) {
    const primary = await client
      .from('animals')
      .select(ANIMALS_LIST_SELECT)
      .eq('id', id)
      .maybeSingle();

    if (isMissingShelterUserIdColumnError(primary.error)) {
      const fallback = await client
        .from('animals')
        .select(ANIMALS_FALLBACK_SELECT)
        .eq('id', id)
        .maybeSingle();

      if (fallback.error || !fallback.data) {
        return null;
      }
      return normalizeAnimal(fallback.data);
    }

    if (primary.error || !primary.data) {
      return null;
    }
    return normalizeAnimal(primary.data);
  },

  async fetchShelterLinksByIds(ids: string[]) {
    if (ids.length === 0) {
      return {};
    }

    const { data } = await client
      .from('animals')
      .select('id,city,shelter_name,shelter_address,shelter_phone,shelter_email')
      .in('id', ids);

    const map: Record<string, ShelterAnimalLink> = {};
    if (data) {
      for (const row of data) {
        const link = mapRowToShelterAnimalLink(row);
        map[link.id] = link;
      }
    }
    return map;
  },

  async insertForShelterUser(animalData, shelterUserId) {
    const ownedInsert = await client
      .from('animals')
      .insert([{ ...serializeAnimal(animalData), shelter_user_id: shelterUserId }])
      .select(ANIMALS_LIST_SELECT);

    let row: any = ownedInsert.data?.[0];
    let error = ownedInsert.error;

    if (isMissingShelterUserIdColumnError(error)) {
      const fallbackInsert = await client
        .from('animals')
        .insert([serializeAnimal(animalData)])
        .select(ANIMALS_FALLBACK_SELECT);

      row = fallbackInsert.data?.[0];
      error = fallbackInsert.error;
    }

    if (!error && row) {
      return { ok: true as const, animal: normalizeAnimal(row) };
    }
    console.error('Błąd dodawania zwierzaka:', error);
    return { ok: false as const };
  },

  async updateOwnedByShelter(id, animalData, { userId, email }) {
    const payload = serializeAnimal(animalData);

    const owned = await client
      .from('animals')
      .update(payload)
      .eq('id', id)
      .eq('shelter_user_id', userId)
      .select(ANIMALS_LIST_SELECT);

    let row: any = owned.data?.[0];
    let error = owned.error;

    if (isMissingShelterUserIdColumnError(error)) {
      if (!email) {
        console.error('Błąd aktualizacji zwierzaka: brak kolumny shelter_user_id — ustaw e-mail schroniska w koncie.');
        return { ok: false as const };
      }

      const withoutUserIdColumn = await client
        .from('animals')
        .update(payload)
        .eq('id', id)
        .eq('shelter_email', email)
        .select(ANIMALS_FALLBACK_SELECT);

      if (!withoutUserIdColumn.error && withoutUserIdColumn.data?.[0]) {
        return { ok: true as const, animal: normalizeAnimal(withoutUserIdColumn.data[0]) };
      }
      error = withoutUserIdColumn.error;
    } else if (!error && !row && email) {
      const legacy = await client
        .from('animals')
        .update({ ...payload, shelter_user_id: userId })
        .eq('id', id)
        .is('shelter_user_id', null)
        .eq('shelter_email', email)
        .select(ANIMALS_LIST_SELECT);

      row = legacy.data?.[0];
      error = legacy.error;

      if (isMissingShelterUserIdColumnError(error)) {
        const legacyEmailOnly = await client
          .from('animals')
          .update(payload)
          .eq('id', id)
          .eq('shelter_email', email)
          .select(ANIMALS_FALLBACK_SELECT);

        row = legacyEmailOnly.data?.[0];
        error = legacyEmailOnly.error;
      }
    }

    if (!error && row) {
      return { ok: true as const, animal: normalizeAnimal(row) };
    }
    if (error) {
      console.error('Błąd aktualizacji zwierzaka:', error?.message ?? error);
    }
    return { ok: false as const };
  },

  async deleteOwnedByShelter(id, { userId, email }) {
    const primary = await client.from('animals').delete().eq('id', id).eq('shelter_user_id', userId).select('id');

    let deleted = (primary.data?.length ?? 0) > 0;
    let error = primary.error;

    if (isMissingShelterUserIdColumnError(error)) {
      error = null;
      if (!email) {
        console.warn('Usuwanie: brak kolumny shelter_user_id i brak e-maila konta.');
        return false;
      }
      const byEmail = await client.from('animals').delete().eq('id', id).eq('shelter_email', email).select('id');
      deleted = (byEmail.data?.length ?? 0) > 0;
      error = byEmail.error;
    } else if (!error && !deleted && email) {
      const legacy = await client
        .from('animals')
        .delete()
        .eq('id', id)
        .is('shelter_user_id', null)
        .eq('shelter_email', email)
        .select('id');

      if (isMissingShelterUserIdColumnError(legacy.error)) {
        const byEmail = await client.from('animals').delete().eq('id', id).eq('shelter_email', email).select('id');
        deleted = (byEmail.data?.length ?? 0) > 0;
        error = byEmail.error;
      } else {
        deleted = (legacy.data?.length ?? 0) > 0;
        error = legacy.error;
      }
    }

    if (error) {
      console.error('Błąd usuwania zwierzaka:', error);
    }
    return !error && deleted;
  },
});
