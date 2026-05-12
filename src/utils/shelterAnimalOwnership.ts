import type { User } from '@supabase/supabase-js';

export type AnimalOwnershipFields = {
  shelterUserId?: string;
  shelterEmail?: string;
};

/**
 * Czy zalogowane schronisko może zarządzać rekordem (ogłoszenie / wniosek).
 * Nowe rekordy: shelter_user_id === auth.uid().
 * Starsze bez owner id: dopasowanie e-maila konta do shelter_email wiersza.
 */
export const canShelterManageAnimal = (
  animal: AnimalOwnershipFields,
  user: User | null | undefined,
): boolean => {
  if (!user?.id) {
    return false;
  }

  if (animal.shelterUserId) {
    return animal.shelterUserId === user.id;
  }

  const accountEmail = user.email?.trim().toLowerCase() ?? '';
  const rowEmail = animal.shelterEmail?.trim().toLowerCase() ?? '';
  return accountEmail.length > 0 && rowEmail === accountEmail;
};

/** Alias semantyczny — ta sama logika co przy ogłoszeniach. */
export const canShelterManageApplication = canShelterManageAnimal;
