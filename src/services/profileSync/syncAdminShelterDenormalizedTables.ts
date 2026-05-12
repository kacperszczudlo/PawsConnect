import { supabase } from '../supabase';
import type { ProfileSyncShelterPort } from './profileSyncShelterPort';
import type { ProfileSyncDraft } from './types';
import type { ProfileSyncIdentity } from './resolveProfileSyncPlan';
import { joinShelterAddress, uniqueNonEmpty } from './strings';
import { runBatchUpdates } from './runBatchUpdates';

export const syncAdminShelterDenormalizedTables = async (params: {
  draft: ProfileSyncDraft;
  identity: ProfileSyncIdentity;
  shelterPort: ProfileSyncShelterPort;
}): Promise<{ totalUpdated: number }> => {
  const { draft, identity, shelterPort } = params;
  const {
    nextName,
    nextCity,
    nextPhone,
    nextEmail,
    originalEmail,
    originalShelterName,
    originalPhone,
    originalCity,
    originalShelterStreet,
    originalShelterPostalCode,
    previousEmail,
    previousShelterName,
    previousPhone,
    previousCity,
  } = identity;

  const shelterAddress = joinShelterAddress(nextCity, draft.shelterStreet ?? '', draft.shelterPostalCode ?? '');
  const originalShelterAddress = joinShelterAddress(
    originalCity,
    originalShelterStreet,
    originalShelterPostalCode,
  );

  const animalPayload = {
    shelter_name: nextName,
    city: nextCity,
    shelter_address: shelterAddress,
    shelter_phone: nextPhone,
    shelter_email: nextEmail,
  };

  const applicationPayload = {
    shelter_name: nextName,
    shelter_address: shelterAddress,
    shelter_phone: nextPhone,
    shelter_email: nextEmail,
  };

  const emailsToMatch = uniqueNonEmpty([originalEmail, nextEmail]);
  const namesToMatch = uniqueNonEmpty([originalShelterName, nextName]);
  const phonesToMatch = uniqueNonEmpty([originalPhone, nextPhone]);
  const citiesToMatch = uniqueNonEmpty([originalCity, nextCity]);
  const addressesToMatch = uniqueNonEmpty([originalShelterAddress, shelterAddress]);

  const matchesOwnedRow = (row: {
    shelterEmail?: string;
    shelterName?: string;
    shelterPhone?: string;
    shelterAddress?: string;
    city?: string;
  }) => {
    const email = row.shelterEmail?.trim() ?? '';
    const name = row.shelterName?.trim() ?? '';
    const phone = row.shelterPhone?.trim() ?? '';
    const address = row.shelterAddress?.trim() ?? '';
    const city = row.city?.trim() ?? '';

    return (
      emailsToMatch.includes(email) ||
      namesToMatch.includes(name) ||
      phonesToMatch.includes(phone) ||
      addressesToMatch.includes(address) ||
      citiesToMatch.includes(city)
    );
  };

  const knownAnimalIds = uniqueNonEmpty(
    shelterPort
      .getAnimals()
      .filter((animal) => {
        if (animal.shelterUserId && animal.shelterUserId !== draft.user.id) {
          return false;
        }
        return matchesOwnedRow({
          shelterEmail: animal.shelterEmail,
          shelterName: animal.shelterName,
          shelterPhone: animal.shelterPhone,
          shelterAddress: animal.shelterAddress,
          city: animal.city,
        });
      })
      .map((animal) => animal.id),
  );

  const knownApplicationIds = uniqueNonEmpty(
    shelterPort
      .getApplications()
      .filter((application) => {
        if (application.shelterUserId && application.shelterUserId !== draft.user.id) {
          return false;
        }
        return matchesOwnedRow({
          shelterEmail: application.shelterEmail,
          shelterName: application.shelterName,
          shelterPhone: application.shelterPhone,
          shelterAddress: application.shelterAddress,
          city: undefined,
        });
      })
      .map((application) => application.id),
  );

  const animalQueries: Array<PromiseLike<{ error: any; count?: number | null; data?: Array<any> | null }> | null> = [
    ...emailsToMatch.map((value) =>
      supabase.from('animals').update(animalPayload).eq('shelter_email', value).select('id'),
    ),
    ...namesToMatch.map((value) =>
      supabase.from('animals').update(animalPayload).eq('shelter_name', value).select('id'),
    ),
    ...phonesToMatch.map((value) =>
      supabase.from('animals').update(animalPayload).eq('shelter_phone', value).select('id'),
    ),
    ...addressesToMatch.map((value) =>
      supabase.from('animals').update(animalPayload).eq('shelter_address', value).select('id'),
    ),
    ...citiesToMatch.map((value) =>
      supabase.from('animals').update(animalPayload).eq('city', value).select('id'),
    ),
    ...knownAnimalIds.map((value) =>
      supabase.from('animals').update(animalPayload).eq('id', value).select('id'),
    ),
  ];

  const applicationQueries: Array<PromiseLike<{ error: any; count?: number | null; data?: Array<any> | null }> | null> =
    [
      ...emailsToMatch.map((value) =>
        supabase.from('applications').update(applicationPayload).eq('shelter_email', value).select('id'),
      ),
      ...namesToMatch.map((value) =>
        supabase.from('applications').update(applicationPayload).eq('shelter_name', value).select('id'),
      ),
      ...phonesToMatch.map((value) =>
        supabase.from('applications').update(applicationPayload).eq('shelter_phone', value).select('id'),
      ),
      ...addressesToMatch.map((value) =>
        supabase.from('applications').update(applicationPayload).eq('shelter_address', value).select('id'),
      ),
      ...knownApplicationIds.map((value) =>
        supabase.from('applications').update(applicationPayload).eq('id', value).select('id'),
      ),
    ];

  const { errors, totalUpdated } = await runBatchUpdates([...animalQueries, ...applicationQueries]);
  if (errors.length > 0) {
    throw errors[0];
  }

  shelterPort.applyAdminProfileLocalSync({
    userId: draft.user.id,
    previousEmail,
    previousShelterName,
    previousPhone,
    previousCity,
    nextName,
    nextCity,
    shelterAddress,
    nextPhone,
    nextEmail,
  });

  if (totalUpdated === 0) {
    console.warn('Synchronizacja profilu nie zaktualizowała rekordów w bazie. Widok został zaktualizowany lokalnie.');
  }

  return { totalUpdated };
};
