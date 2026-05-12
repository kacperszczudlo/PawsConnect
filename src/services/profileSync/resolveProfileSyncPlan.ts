import type { ProfileSyncDraft } from './types';

export interface ProfileSyncIdentity {
  nextName: string;
  nextCity: string;
  nextPhone: string;
  nextEmail: string;
  nextAvatarUrl: string | null;
  originalEmail: string;
  originalFullName: string;
  originalShelterName: string;
  originalPhone: string;
  originalCity: string;
  originalShelterStreet: string;
  originalShelterPostalCode: string;
  previousEmail: string;
  previousShelterName: string;
  previousPhone: string;
  previousCity: string;
}

export interface ProfileSyncPlan {
  authPayload: Record<string, any>;
  identity: ProfileSyncIdentity;
}

export const resolveProfileSyncPlan = (draft: ProfileSyncDraft): ProfileSyncPlan => {
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

  const authPayload: Record<string, any> = {
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
    authPayload.password = draft.newPassword;
  }

  if (nextEmail !== originalEmail) {
    authPayload.email = nextEmail;
  }

  return {
    authPayload,
    identity: {
      nextName,
      nextCity,
      nextPhone,
      nextEmail,
      nextAvatarUrl,
      originalEmail,
      originalFullName,
      originalShelterName,
      originalPhone,
      originalCity,
      originalShelterStreet,
      originalShelterPostalCode,
      previousEmail,
      previousShelterName,
      previousPhone,
      previousCity,
    },
  };
};
