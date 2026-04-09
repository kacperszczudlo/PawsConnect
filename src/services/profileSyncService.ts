import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { useShelterStore } from '../store/useShelterStore';

export type EditableProfileRole = 'admin' | 'user';

export interface ProfileSyncDraft {
  role: EditableProfileRole;
  user: User;
  fullName: string;
  city: string;
  phone: string;
  email: string;
  avatarUrl?: string | null;
  shelterStreet?: string;
  shelterPostalCode?: string;
  newPassword?: string;
}

const joinShelterAddress = (city: string, street: string, postalCode: string) =>
  [city.trim(), street.trim(), postalCode.trim()].filter(Boolean).join(', ');

const uniqueNonEmpty = (values: Array<string | undefined | null>) =>
  Array.from(new Set(values.map((value) => value?.trim() ?? '').filter(Boolean)));

const runUpdates = async (
  queries: Array<PromiseLike<{ error: any; count?: number | null; data?: Array<any> | null }> | null>,
) => {
  const results = await Promise.all(queries.filter(Boolean));
  const errors = results.map((result) => result.error).filter(Boolean);
  const totalUpdated = results.reduce((acc, result) => {
    if (typeof result.count === 'number') {
      return acc + result.count;
    }

    if (Array.isArray(result.data)) {
      return acc + result.data.length;
    }

    return acc;
  }, 0);

  return { errors, totalUpdated };
};

export const syncProfileEverywhere = async (draft: ProfileSyncDraft): Promise<User> => {
  const originalEmail = draft.user.email ?? '';
  const originalFullName = draft.user.user_metadata?.full_name ?? '';
  const originalShelterName = draft.user.user_metadata?.shelter_name ?? '';
  const originalPhone = draft.user.user_metadata?.phone ?? '';
  const originalCity = draft.user.user_metadata?.city ?? '';
  const originalShelterStreet = draft.user.user_metadata?.shelter_street ?? '';
  const originalShelterPostalCode = draft.user.user_metadata?.shelter_postal_code ?? '';

  const nextName = draft.fullName.trim() || (draft.role === 'admin' ? originalShelterName : originalFullName);
  const nextCity = draft.city.trim();
  const nextPhone = draft.phone.trim();
  const nextEmail = draft.email.trim() || originalEmail;
  const nextAvatarUrl = draft.avatarUrl ?? null;
  const previousEmail = originalEmail.trim();
  const previousShelterName = originalShelterName.trim();
  const previousPhone = originalPhone.trim();
  const previousCity = originalCity.trim();

  const updates: Record<string, any> = {
    data:
      draft.role === 'admin'
        ? {
            role: 'admin',
            shelter_name: nextName,
            city: nextCity,
            shelter_street: draft.shelterStreet?.trim() ?? '',
            shelter_postal_code: draft.shelterPostalCode?.trim() ?? '',
            phone: nextPhone,
            avatar_url: nextAvatarUrl,
          }
        : {
            role: 'user',
            full_name: nextName,
            city: nextCity,
            phone: nextPhone,
            avatar_url: nextAvatarUrl,
          },
  };

  if (draft.newPassword) {
    updates.password = draft.newPassword;
  }

  if (nextEmail !== originalEmail) {
    updates.email = nextEmail;
  }

  const { data, error } = await supabase.auth.updateUser(updates);
  if (error || !data.user) {
    throw error ?? new Error('Nie udało się zaktualizować profilu.');
  }

  if (draft.role === 'admin') {
    const shelterAddress = joinShelterAddress(
      nextCity,
      draft.shelterStreet ?? '',
      draft.shelterPostalCode ?? '',
    );
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
      useShelterStore
        .getState()
        .animals.filter((animal) =>
          matchesOwnedRow({
            shelterEmail: animal.shelterEmail,
            shelterName: animal.shelterName,
            shelterPhone: animal.shelterPhone,
            shelterAddress: animal.shelterAddress,
            city: animal.city,
          }),
        )
        .map((animal) => animal.id),
    );
    const knownApplicationIds = uniqueNonEmpty(
      useShelterStore
        .getState()
        .applications.filter((application) =>
          matchesOwnedRow({
            shelterEmail: application.shelterEmail,
            shelterName: application.shelterName,
            shelterPhone: application.shelterPhone,
            shelterAddress: application.shelterAddress,
            city: undefined,
          }),
        )
        .map((application) => application.id),
    );

    const animalQueries: Array<PromiseLike<{ error: any; count?: number | null; data?: Array<any> | null }> | null> = [
      ...emailsToMatch.map((value) =>
        supabase.from('animals').update(animalPayload).eq('shelter_email', value).select('id', { count: 'exact' }),
      ),
      ...namesToMatch.map((value) =>
        supabase.from('animals').update(animalPayload).eq('shelter_name', value).select('id', { count: 'exact' }),
      ),
      ...phonesToMatch.map((value) =>
        supabase.from('animals').update(animalPayload).eq('shelter_phone', value).select('id', { count: 'exact' }),
      ),
      ...addressesToMatch.map((value) =>
        supabase.from('animals').update(animalPayload).eq('shelter_address', value).select('id', { count: 'exact' }),
      ),
      ...citiesToMatch.map((value) =>
        supabase.from('animals').update(animalPayload).eq('city', value).select('id', { count: 'exact' }),
      ),
      ...knownAnimalIds.map((value) =>
        supabase.from('animals').update(animalPayload).eq('id', value).select('id', { count: 'exact' }),
      ),
    ];

    const applicationQueries: Array<PromiseLike<{ error: any; count?: number | null; data?: Array<any> | null }> | null> = [
      ...emailsToMatch.map((value) =>
        supabase
          .from('applications')
          .update(applicationPayload)
          .eq('shelter_email', value)
          .select('id', { count: 'exact' }),
      ),
      ...namesToMatch.map((value) =>
        supabase
          .from('applications')
          .update(applicationPayload)
          .eq('shelter_name', value)
          .select('id', { count: 'exact' }),
      ),
      ...phonesToMatch.map((value) =>
        supabase
          .from('applications')
          .update(applicationPayload)
          .eq('shelter_phone', value)
          .select('id', { count: 'exact' }),
      ),
      ...addressesToMatch.map((value) =>
        supabase
          .from('applications')
          .update(applicationPayload)
          .eq('shelter_address', value)
          .select('id', { count: 'exact' }),
      ),
      ...knownApplicationIds.map((value) =>
        supabase
          .from('applications')
          .update(applicationPayload)
          .eq('id', value)
          .select('id', { count: 'exact' }),
      ),
    ];

    const { errors, totalUpdated } = await runUpdates([...animalQueries, ...applicationQueries]);
    if (errors.length > 0) {
      throw errors[0];
    }

    useShelterStore.setState((state) => {
      const animals = state.animals.map((animal) => {
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
      });

      const applications = state.applications.map((application) => {
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
      });

      return { ...state, animals, applications };
    });

    if (totalUpdated === 0) {
      console.warn('Synchronizacja profilu nie zaktualizowała rekordów w bazie. Widok został zaktualizowany lokalnie.');
    }
  } else {
    const { errors } = await runUpdates([
      supabase
        .from('applications')
        .update({ applicant_name: nextName })
        .eq('applicant_id', data.user.id)
        .select('id', { count: 'exact' }),
      originalFullName
        ? supabase
            .from('applications')
            .update({ applicant_name: nextName })
            .eq('applicant_name', originalFullName)
            .select('id', { count: 'exact' })
        : null,
    ]);
    if (errors.length > 0) {
      throw errors[0];
    }

    useShelterStore.setState((state) => ({
      ...state,
      applications: state.applications.map((application) =>
        application.applicantName === originalFullName || application.applicantName === nextName
          ? { ...application, applicantName: nextName }
          : application,
      ),
    }));
  }

  await Promise.all([
    useShelterStore.getState().fetchAnimals(),
    useShelterStore.getState().fetchApplications(),
  ]);

  return data.user;
};