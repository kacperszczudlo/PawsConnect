import type { User } from '@supabase/supabase-js';

export type AnimalOwnershipFields = {
  shelterUserId?: string;
  shelterEmail?: string;
};

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

export const canShelterManageApplication = canShelterManageAnimal;
